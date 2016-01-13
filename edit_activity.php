<?php

require 'database.php';

$sth = $pdo->prepare('SELECT * FROM activity WHERE id = ?');
$sth->execute([$_GET['id']]);
$activity = $sth->fetch();

$activity['started_at'] = new DateTime($activity['started_at']);
if (isset($activity['finished_at'])) {
    $activity['finished_at'] = new DateTime($activity['finished_at']);
}

?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Tiima</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="style.css">
        <link rel="shortcut icon" href="tiima.ico">
    </head>
    <body>
        <form method="POST" action="save_activity.php">
        <input type="hidden" name="id" value="<?= $activity['id'] ?>">
            <label>
                Start time:
                <input type="datetime-local" name="started_at" value="<?= $activity['started_at']->format(DateTime::ISO8601) ?>">
            </label>
            <label>
                End time:
                <input type="datetime-local" name="finished_at" value="<?php if (isset($activity['finished_at'])): ?><?= $activity['finished_at']->format(DateTime::ISO8601) ?><?php endif; ?>">
            </label>
            <label>
            <input type="checkbox" name="ongoing"<?php if (!isset($activity['finished_at'])): ?> checked<?php endif; ?>>
                Ongoing
            </label>
            <label>
                Title:
                <input type="text" name="title" value="<?= $activity['title'] ?>">
            </label>
            <button type="submit">Save</button>
        </form>
        <script>
            var finishedAtInput = document.getElementsByName('finished_at')[0];
            finishedAtInput.disabled = <?= isset($activity['finished_at']) ? 'false' : 'true' ?>;
            document.getElementsByName('ongoing')[0].addEventListener('change', function() {
                finishedAtInput.disabled = this.checked;
            });
        </script>
    </body>
</html>
