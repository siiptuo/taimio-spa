<?php

require 'database.php';

$sth = $pdo->prepare('UPDATE activity SET finished_at = CURRENT_TIMESTAMP WHERE id = ?');
$sth->execute([$_POST['id']]);

header('Location: index.php');
