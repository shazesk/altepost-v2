<?php
/**
 * Admin Dashboard
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAuth();

$stats = getEventStats();
$recentEvents = getEvents(false);
$recentEvents = array_slice($recentEvents, 0, 5);
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Admin - Alte Post</title>
    <link rel="stylesheet" href="assets/admin.css">
</head>
<body>
    <div class="admin-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Alte Post</h2>
                <span>Admin</span>
            </div>
            <nav class="sidebar-nav">
                <a href="index.php" class="nav-item active">
                    <span class="nav-icon">&#9632;</span>
                    Dashboard
                </a>
                <a href="events.php" class="nav-item">
                    <span class="nav-icon">&#9733;</span>
                    Veranstaltungen
                </a>
                <a href="events.php?archived=1" class="nav-item">
                    <span class="nav-icon">&#9776;</span>
                    Archiv
                </a>
            </nav>
            <div class="sidebar-footer">
                <span>Eingeloggt als: <?= htmlspecialchars($_SESSION['admin_username']) ?></span>
                <a href="logout.php" class="logout-link">Abmelden</a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="content-header">
                <h1>Dashboard</h1>
                <a href="events.php?action=new" class="btn btn-primary">+ Neue Veranstaltung</a>
            </header>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number"><?= $stats['upcoming'] ?></div>
                    <div class="stat-label">Kommende Veranstaltungen</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><?= $stats['archived'] ?></div>
                    <div class="stat-label">Archivierte Veranstaltungen</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><?= $stats['total'] ?></div>
                    <div class="stat-label">Gesamt</div>
                </div>
            </div>

            <!-- Recent Events -->
            <section class="content-section">
                <h2>Kommende Veranstaltungen</h2>
                <?php if (empty($recentEvents)): ?>
                    <p class="empty-message">Keine kommenden Veranstaltungen vorhanden.</p>
                <?php else: ?>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Veranstaltung</th>
                                <th>Künstler</th>
                                <th>Datum</th>
                                <th>Status</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recentEvents as $event): ?>
                                <tr>
                                    <td>
                                        <strong><?= htmlspecialchars($event['title']) ?></strong>
                                        <br>
                                        <small class="text-muted"><?= htmlspecialchars($event['genre']) ?></small>
                                    </td>
                                    <td><?= htmlspecialchars($event['artist']) ?></td>
                                    <td>
                                        <?= formatDateGerman($event['date']) ?>
                                        <br>
                                        <small class="text-muted"><?= formatTime($event['time']) ?></small>
                                    </td>
                                    <td>
                                        <span class="badge badge-<?= $event['availability'] ?>">
                                            <?php
                                            $statusLabels = [
                                                'available' => 'Verfügbar',
                                                'few-left' => 'Wenige',
                                                'sold-out' => 'Ausverkauft'
                                            ];
                                            echo $statusLabels[$event['availability']] ?? $event['availability'];
                                            ?>
                                        </span>
                                    </td>
                                    <td>
                                        <a href="events.php?action=edit&id=<?= $event['id'] ?>" class="btn btn-sm">Bearbeiten</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    <p><a href="events.php">Alle Veranstaltungen anzeigen &rarr;</a></p>
                <?php endif; ?>
            </section>
        </main>
    </div>
</body>
</html>
