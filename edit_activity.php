<?php

require 'vendor/autoload.php';
require 'database.php';

$sth = $pdo->prepare('SELECT activity.*, json_agg(tag.title) AS tags FROM activity LEFT JOIN activity_tag ON activity_tag.activity_id = activity.id LEFT JOIN tag ON tag.id = activity_tag.tag_id WHERE activity.id = ? GROUP BY activity.id');
$sth->execute([$_GET['id']]);
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

require 'twig.php';

echo $twig->render('edit-activity.html.twig', [
    'activity' => $activity,
]);
