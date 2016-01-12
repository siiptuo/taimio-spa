<?php

require 'database.php';

$currentActivity = null;
$activities = [];
foreach ($pdo->query('SELECT * FROM activity ORDER BY started_at DESC') as $row) {
    $row['started_at'] = new DateTime($row['started_at']);
    if (!isset($row['finished_at'])) {
        $currentActivity = $row;
    } else {
        $row['finished_at'] = new DateTime($row['finished_at']);
    }
    $activities[] = $row;
}

?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Tiima</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <h1>Tiima</h1>
<?php if (isset($currentActivity)): ?>
    <form method="POST" action="stop_activity.php">
        <input type="hidden" name="id" value="<?= $currentActivity['id'] ?>">
        <span>Current activity: <?= htmlspecialchars($currentActivity['title']) ?></span>
        <button type="submit">Stop</button>
    </form>
<?php else: ?>
    <div>No activity</div>
<?php endif; ?>
<form method="POST" action="start_activity.php">
    <label>Activity: <input type="text" name="title"></label>
    <button type="submit">Start activity</button>
</form>
<h2>Previous activities</h2>
<?php foreach ($activities as $activity): ?>
    <?php $currentDay = $activity['started_at']->format('z'); ?>
    <?php if (!isset($lastDay) || $lastDay !== $currentDay): ?>
        <?php if (isset($lastDay)): ?>
                </tbody>
            </table>
        <?php endif; ?>
        <h3><?= $activity['started_at']->format('Y-m-d') ?></h3>
        <table>
            <tbody>
    <?php endif; ?>
    <?php $lastDay = $currentDay; ?>
    <tr>
        <td><?= $activity['started_at']->format('H:i') ?></td>
        <td>-</td>
        <td><?php if ($activity['finished_at']): ?><?= $activity['finished_at']->format('H:i') ?><?php endif; ?></td>
        <td><?= htmlspecialchars($activity['title']) ?></td>
    </tr>
<?php endforeach; ?>
<?php if (count($activities) > 0): ?>
            </tbody>
        </table>
<?php endif; ?>
    </body>
</html>
