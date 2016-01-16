<?php

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

require 'vendor/autoload.php';

function formatDuration($start, $end) {
    $diff = $end->diff($start);
    if ($diff->h === 0) {
        return $diff->i === 0 ? "{$diff->s}s" : "{$diff->i}min";
    } else {
        return "{$diff->h}h {$diff->i}min";
    }
}

function getTags($pdo, $tagId) {
    $sth = $pdo->prepare('SELECT array_to_json(array_agg(tag2.title) || tag1.title) FROM tag tag1 LEFT JOIN related_tag ON related_tag.tag_id = tag1.id LEFT JOIN tag AS tag2 ON tag2.id = related_tag.related_tag_id WHERE tag1.id = ? GROUP BY tag1.id');
    $sth->execute([$tagId]);
    return array_filter(json_decode($sth->fetchColumn()));
}


$container = new Slim\Container([
    'settings' => [
        'displayErrorDetails' => true,
    ]
]);

$container['db'] = function () {
    return new PDO('pgsql:dbname=tiima', 'tuomas', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
};

$container['view'] = function ($container) {
    $view = new Slim\Views\Twig('templates', [
        'cache' => 'cache',
    ]);
    $view->addExtension(new Slim\Views\TwigExtension(
        $container['router'],
        $container['request']->getUri()
    ));

    return $view;
};

$app = new Slim\App($container);

$app->get('/', function (Request $request, Response $response) {
    $currentActivity = null;
    $activities = [];
    foreach ($this->db->query('SELECT activity.*, json_agg(activity_tag.tag_id) AS tags FROM activity LEFT JOIN activity_tag ON activity_tag.activity_id = activity.id GROUP BY activity.id ORDER BY started_at DESC') as $row) {
        if ($row['tags'] === '[null]') {
            $row['tags'] = [];
        } else {
            $tagIds = json_decode($row['tags']);
            $row['tags'] = [];
            foreach ($tagIds as $tagId) {
                $row['tags'] = array_unique(array_merge($row['tags'], getTags($this->db, $tagId)));
            }
        }
        $row['started_at'] = new DateTime($row['started_at']);
        if (!isset($row['finished_at'])) {
            $row['duration'] = formatDuration($row['started_at'], new DateTime());
            $currentActivity = $row;
        } else {
            $row['finished_at'] = new DateTime($row['finished_at']);
            $row['duration'] = formatDuration($row['started_at'], $row['finished_at']);
        }
        $activities[] = $row;
    }

    return $this->view->render($response, 'index.html.twig', [
        'current_activity' => $currentActivity,
        'activities' => $activities,
    ]);
})->setName('index');

$app->get('/activity/{id:\d+}', function (Request $request, Response $response, array $args) {
    $sth = $this->db->prepare('SELECT activity.*, json_agg(tag.title) AS tags FROM activity LEFT JOIN activity_tag ON activity_tag.activity_id = activity.id LEFT JOIN tag ON tag.id = activity_tag.tag_id WHERE activity.id = ? GROUP BY activity.id');
    $sth->execute([$args['id']]);
    $activity = $sth->fetch();

    if ($activity['tags'] === '[null]') {
        $activity['tags'] = [];
    } else {
        $activity['tags'] = json_decode($activity['tags']);
    }
    $activity['started_at'] = new DateTime($activity['started_at']);
    if (isset($activity['finished_at'])) {
        $activity['finished_at'] = new DateTime($activity['finished_at']);
    }

    return $this->view->render($response, 'edit-activity.html.twig', [
        'activity' => $activity,
    ]);
})->setName('edit-activity');

$app->post('/activity', function (Request $request, Response $response) {
    try {
        $this->db->beginTransaction();

        $sth = $this->db->prepare('SELECT * FROM activity WHERE finished_at IS NULL LIMIT 1');
        $sth->execute();
        $currentActivity = $sth->fetch();

        if ($currentActivity !== false) {
            $sth = $this->db->prepare('UPDATE activity SET finished_at = CURRENT_TIMESTAMP WHERE id = ?');
            $sth->execute([$currentActivity['id']]);
        }

        $activity = [];
        $activity['title'] = $_POST['title'];
        $activity['tags'] = [];
        if (($tagStart = strpos($activity['title'], '#')) !== false) {
            $activity['tags'] = preg_split('/\s*#/', substr($activity['title'], $tagStart + 1));
            $activity['title'] = trim(substr($activity['title'], 0, $tagStart));
        }

        $sth = $this->db->prepare('INSERT INTO activity (title) VALUES (?) RETURNING id');
        $sth->execute([$activity['title']]);
        $activity['id'] = $sth->fetchColumn();

        if (count($activity['tags']) > 0) {
            $tags = [];
            foreach ($activity['tags'] as $tag) {
                $sth = $this->db->prepare('INSERT INTO tag (title) VALUES (?) ON CONFLICT DO NOTHING RETURNING id');
                $sth->execute([$tag]);
                $id = $sth->fetchColumn();
                if ($id === false) {
                    $sth = $this->db->prepare('SELECT id FROM tag WHERE LOWER(title) = LOWER(?)');
                    $sth->execute([$tag]);
                    $id = $sth->fetchColumn();
                }
                $tags[] = [
                    'id' => $id,
                    'title' => $tag,
                ];
            }
            $activity['tags'] = $tags;

            $placeholders = substr(str_repeat('(?, ?), ', count($activity['tags'])), 0, -2);
            $sth = $this->db->prepare("INSERT INTO activity_tag (activity_id, tag_id) VALUES $placeholders ON CONFLICT DO NOTHING");
            $params = [];
            foreach ($activity['tags'] as $tag) {
                array_push($params, $activity['id'], $tag['id']);
            }
            $sth->execute($params);
        }

        $this->db->commit();

        return $response->withRedirect($this->router->pathFor('index'));
    } catch (PDOException $e) {
        $this->db->rollBack();

        return $response->withStatus(500)->write('Database error: '.$e->getMessage());
    }
})->setName('start-activity');

$app->post('/activity/{id:\d+}', function (Request $request, Response $response, array $args) {
    $data = $request->getParsedBody();

    $activity = [];
    $activity['id'] = $args['id'];
    $activity['title'] = $data['title'];
    $activity['started_at'] = $data['started_at'];
    $activity['tags'] = [];
    if (($tagStart = strpos($activity['title'], '#')) !== false) {
        $activity['tags'] = preg_split('/\s*#/', substr($activity['title'], $tagStart + 1));
        $activity['title'] = trim(substr($activity['title'], 0, $tagStart));
    }

    if ((isset($data['ongoing']) && $data['ongoing'] == 'on') || empty($data['finished_at'])) {
        $activity['finished_at'] = null;
    } else {
        $activity['finished_at'] = $data['finished_at'];
    }

    try {
        $this->db->beginTransaction();

        $sth = $this->db->prepare('UPDATE activity SET title = ?, started_at = ?, finished_at = ? WHERE id = ?');
        $sth->execute([
            $activity['title'],
            $activity['started_at'],
            $activity['finished_at'],
            $activity['id'],
        ]);

        $sth = $this->db->prepare('DELETE FROM activity_tag WHERE activity_id = ?');
        $sth->execute([$activity['id']]);

        if (count($activity['tags']) > 0) {
            $tags = [];
            foreach ($activity['tags'] as $tag) {
                $sth = $this->db->prepare('INSERT INTO tag (title) VALUES (?) ON CONFLICT DO NOTHING RETURNING id');
                $sth->execute([$tag]);
                $id = $sth->fetchColumn();
                if ($id === false) {
                    $sth = $this->db->prepare('SELECT id FROM tag WHERE LOWER(title) = LOWER(?)');
                    $sth->execute([$tag]);
                    $id = $sth->fetchColumn();
                }
                $tags[] = [
                    'id' => $id,
                    'title' => $tag,
                ];
            }
            $activity['tags'] = $tags;

            $placeholders = substr(str_repeat('(?, ?), ', count($activity['tags'])), 0, -2);
            $sth = $this->db->prepare("INSERT INTO activity_tag (activity_id, tag_id) VALUES $placeholders");
            $params = [];
            foreach ($activity['tags'] as $tag) {
                array_push($params, $activity['id'], $tag['id']);
            }
            $sth->execute($params);
        }

        $this->db->commit();

        return $response->withRedirect($this->router->pathFor('index'));
    } catch (PDOException $e) {
        $this->db->rollBack();

        return $response->withStatus(500)->write('Database error: '.$e->getMessage());
    }
})->setName('save-activity');

$app->post('/activity/{id:\d+}/stop', function (Request $request, Response $response, array $args) {
    $sth = $this->db->prepare('UPDATE activity SET finished_at = CURRENT_TIMESTAMP WHERE id = ?');
    $sth->execute([$args['id']]);

    return $response->withRedirect($this->router->pathFor('index'));
})->setName('stop-activity');

$app->run();
