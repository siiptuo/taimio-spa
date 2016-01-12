<?php

require 'database.php';

$sth = $pdo->prepare('SELECT * FROM activity WHERE finished_at IS NULL LIMIT 1');
$sth->execute();
$currentActivity = $sth->fetch();

if ($currentActivity !== false) {
    $sth = $pdo->prepare('UPDATE activity SET finished_at = CURRENT_TIMESTAMP WHERE id = ?');
    $sth->execute([$currentActivity['id']]);
}

$sth = $pdo->prepare('INSERT INTO activity (title) VALUES (?)');
$sth->execute([$_POST['title']]);

header('Location: index.php');
