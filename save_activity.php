<?php

$activity = [];
$activity['id'] = $_POST['id'];
$activity['title'] = $_POST['title'];
$activity['started_at'] = $_POST['started_at'];
$activity['tags'] = [];
if (($tagStart = strpos($activity['title'], '#')) !== false) {
    $activity['tags'] = preg_split('/\s*#/', substr($activity['title'], $tagStart + 1));
    $activity['title'] = trim(substr($activity['title'], 0, $tagStart));
}

if ((isset($_POST['ongoing']) && $_POST['ongoing'] == 'on') || empty($_POST['finished_at'])) {
    $activity['finished_at'] = null;
} else {
    $activity['finished_at'] = $_POST['finished_at'];
}

require 'database.php';

try {
    $pdo->beginTransaction();

    $sth = $pdo->prepare('UPDATE activity SET title = ?, started_at = ?, finished_at = ? WHERE id = ?');
    $sth->execute([
        $activity['title'],
        $activity['started_at'],
        $activity['finished_at'],
        $activity['id'],
    ]);

    $sth = $pdo->prepare('DELETE FROM activity_tag WHERE activity_id = ?');
    $sth->execute([$activity['id']]);

    if (count($activity['tags']) > 0) {
        $tags = [];
        foreach ($activity['tags'] as $tag) {
            $sth = $pdo->prepare('INSERT INTO tag (title) VALUES (?) ON CONFLICT DO NOTHING RETURNING id');
            $sth->execute([$tag]);
            $id = $sth->fetchColumn();
            if ($id === false) {
                $sth = $pdo->prepare('SELECT id FROM tag WHERE LOWER(title) = LOWER(?)');
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
        $sth = $pdo->prepare("INSERT INTO activity_tag (activity_id, tag_id) VALUES $placeholders");
        $params = [];
        foreach ($activity['tags'] as $tag) {
            array_push($params, $activity['id'], $tag['id']);
        }
        $sth->execute($params);
    }

    $pdo->commit();

    header('Location: index.php');
} catch (PDOException $e) {
    $pdo->rollBack();
    echo 'Database error: '.$e->getMessage();
}
