<?php

require 'database.php';

function formatDuration($start, $end) {
    $diff = $end->diff($start);
    if ($diff->h === 0) {
        return $diff->i === 0 ? "{$diff->s}s" : "{$diff->i}min";
    } else {
        return "{$diff->h}h {$diff->i}min";
    }
}

$currentActivity = null;
$activities = [];
foreach ($pdo->query('SELECT * FROM activity ORDER BY started_at DESC') as $row) {
    if (($tagStart = strpos($row['title'], '#')) !== false) {
        $row['tags'] = preg_split('/\s*#/', substr($row['title'], $tagStart + 1));
        $row['title'] = trim(substr($row['title'], 0, $tagStart));
    } else {
        $row['tags'] = [];
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

?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Tiima</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
<?php if (isset($currentActivity)): ?>
    <form method="POST" action="stop_activity.php" class="current-activity-display">
        <h1>
            <?= htmlspecialchars($currentActivity['title']) ?>
            <?php if (!empty($currentActivity['tags'])): ?>
                <ul class="tag-list">
                    <?php foreach ($currentActivity['tags'] as $tag): ?>
                        <li><?= $tag ?></li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
            <span data-start-time="<?= $currentActivity['started_at']->format(DateTime::ISO8601) ?>">
                <?= $currentActivity['duration'] ?>
            </span>
        </h1>
        <input type="hidden" name="id" value="<?= $currentActivity['id'] ?>">
        <button type="submit">Stop</button>
    </form>
<?php else: ?>
    <div class="current-activity-display">
        <h1>No activity</h1>
        <button type="submit" disabled>Stop</button>
    </div>
<?php endif; ?>
<form method="POST" action="start_activity.php" class="start-activity-form">
    <input type="text" name="title" placeholder="New activity...">
    <button type="submit">Start</button>
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
        <table class="activity-list">
            <tbody>
    <?php endif; ?>
    <?php $lastDay = $currentDay; ?>
    <tr>
        <td><?= $activity['started_at']->format('H:i') ?></td>
        <td>-</td>
        <td><?php if ($activity['finished_at']): ?><?= $activity['finished_at']->format('H:i') ?><?php endif; ?></td>
        <td class="activity-list-title-column">
            <a href="edit_activity.php?id=<?= $activity['id'] ?>"><?= htmlspecialchars($activity['title']) ?></a>
            <?php if (!empty($activity['tags'])): ?>
                <ul class="tag-list">
                    <?php foreach ($activity['tags'] as $tag): ?>
                        <li><?= $tag ?></li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
        </td>
        <td class="activity-list-duration-column"<?php if ($activity === $currentActivity): ?> data-start-time="<?= $activity['started_at']->format(DateTime::ISO8601) ?>"<?php endif; ?>><?= $activity['duration'] ?></td>
    </tr>
<?php endforeach; ?>
<?php if (count($activities) > 0): ?>
            </tbody>
        </table>
<?php endif; ?>
        <script>
            function formatDuration(start, end) {
                var secs = Math.floor((end - start) / 1000);
                var hours = Math.floor(secs / (60 * 60));
                var mins = Math.floor(secs / 60) - hours * 60;
                secs %= 60;
                if (hours === 0) {
                    return mins === 0 ? secs + 's' : mins + 'min';
                } else {
                    return hours + 'h ' + mins + 'min';
                }
            }
            var durationElems = document.querySelectorAll('[data-start-time]');
            setInterval(function() {
                for (var i = 0, l = durationElems.length; i < l; i++) {
                    durationElems[i].textContent = formatDuration(Date.parse(durationElems[i].dataset.startTime), Date.now());
                }
            }, 1000);
        </script>
    </body>
</html>
