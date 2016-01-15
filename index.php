<?php

require 'vendor/autoload.php';
require 'database.php';

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

$currentActivity = null;
$activities = [];
foreach ($pdo->query('SELECT activity.*, json_agg(activity_tag.tag_id) AS tags FROM activity LEFT JOIN activity_tag ON activity_tag.activity_id = activity.id GROUP BY activity.id ORDER BY started_at DESC') as $row) {
    if ($row['tags'] === '[null]') {
        $row['tags'] = [];
    } else {
        $tagIds = json_decode($row['tags']);
        $row['tags'] = [];
        foreach ($tagIds as $tagId) {
            $row['tags'] = array_unique(array_merge($row['tags'], getTags($pdo, $tagId)));
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

require 'twig.php';

echo $twig->render('index.html.twig', [
    'current_activity' => $currentActivity,
    'activities' => $activities,
]);
