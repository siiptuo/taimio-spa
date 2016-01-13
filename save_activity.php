<?php

$activity = [];
$activity['id'] = $_POST['id'];
$activity['title'] = $_POST['title'];
$activity['started_at'] = $_POST['started_at'];

if ((isset($_POST['ongoing']) && $_POST['ongoing'] == 'on') || empty($_POST['finished_at'])) {
    $activity['finished_at'] = null;
} else {
    $activity['finished_at'] = $_POST['finished_at'];
}

require 'database.php';

$sth = $pdo->prepare('UPDATE activity SET title = ?, started_at = ?, finished_at = ? WHERE id = ?');
$sth->execute([
    $activity['title'],
    $activity['started_at'],
    $activity['finished_at'],
    $activity['id'],
]);

header('Location: index.php');
