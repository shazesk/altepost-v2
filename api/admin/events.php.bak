<?php
/**
 * Events Management Page
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAuth();

$action = $_GET['action'] ?? 'list';
$showArchived = isset($_GET['archived']) && $_GET['archived'] == '1';
$message = '';
$messageType = '';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF token
    if (!validateCSRFToken($_POST['csrf_token'] ?? '')) {
        $message = 'Ungültige Sitzung. Bitte versuchen Sie es erneut.';
        $messageType = 'error';
    } else {
        $postAction = $_POST['action'] ?? '';

        switch ($postAction) {
            case 'create':
            case 'update':
                $data = [
                    'title' => sanitize($_POST['title'] ?? ''),
                    'artist' => sanitize($_POST['artist'] ?? ''),
                    'date' => $_POST['date'] ?? '',
                    'time' => $_POST['time'] ?? '',
                    'price' => floatval($_POST['price'] ?? 0),
                    'genre' => sanitize($_POST['genre'] ?? ''),
                    'availability' => $_POST['availability'] ?? 'available',
                    'description' => sanitize($_POST['description'] ?? ''),
                    'is_archived' => isset($_POST['is_archived']) ? 1 : 0,
                    'image' => null
                ];

                // Handle image upload
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $uploadedImage = uploadImage($_FILES['image']);
                    if ($uploadedImage) {
                        $data['image'] = $uploadedImage;
                    } else {
                        $message = 'Bildupload fehlgeschlagen. Nur JPG, PNG, GIF und WebP bis 5MB erlaubt.';
                        $messageType = 'error';
                        break;
                    }
                } elseif ($postAction === 'update' && !empty($_POST['existing_image'])) {
                    $data['image'] = $_POST['existing_image'];
                }

                // Validate required fields
                if (empty($data['title']) || empty($data['artist']) || empty($data['date']) || empty($data['time'])) {
                    $message = 'Bitte füllen Sie alle Pflichtfelder aus.';
                    $messageType = 'error';
                    break;
                }

                if ($postAction === 'create') {
                    $eventId = createEvent($data);
                    if ($eventId) {
                        $message = 'Veranstaltung erfolgreich erstellt.';
                        $messageType = 'success';
                        header('Location: events.php?message=' . urlencode($message) . '&type=success');
                        exit;
                    } else {
                        $message = 'Fehler beim Erstellen der Veranstaltung.';
                        $messageType = 'error';
                    }
                } else {
                    $eventId = (int)($_POST['id'] ?? 0);
                    if (updateEvent($eventId, $data)) {
                        $message = 'Veranstaltung erfolgreich aktualisiert.';
                        $messageType = 'success';
                        header('Location: events.php?message=' . urlencode($message) . '&type=success');
                        exit;
                    } else {
                        $message = 'Fehler beim Aktualisieren der Veranstaltung.';
                        $messageType = 'error';
                    }
                }
                break;

            case 'delete':
                $eventId = (int)($_POST['id'] ?? 0);
                if (deleteEvent($eventId)) {
                    $message = 'Veranstaltung erfolgreich gelöscht.';
                    $messageType = 'success';
                } else {
                    $message = 'Fehler beim Löschen der Veranstaltung.';
                    $messageType = 'error';
                }
                break;

            case 'toggle_archive':
                $eventId = (int)($_POST['id'] ?? 0);
                if (toggleArchive($eventId)) {
                    $message = 'Archivstatus geändert.';
                    $messageType = 'success';
                } else {
                    $message = 'Fehler beim Ändern des Archivstatus.';
                    $messageType = 'error';
                }
                break;
        }
        regenerateCSRFToken();
    }
}

// Handle message from redirect
if (isset($_GET['message'])) {
    $message = $_GET['message'];
    $messageType = $_GET['type'] ?? 'success';
}

// Get event for editing
$editEvent = null;
if ($action === 'edit' && isset($_GET['id'])) {
    $editEvent = getEvent((int)$_GET['id']);
    if (!$editEvent) {
        header('Location: events.php');
        exit;
    }
}

// Get events list
$events = getEvents($showArchived);
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Veranstaltungen - Admin - Alte Post</title>
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
                <a href="index.php" class="nav-item">
                    <span class="nav-icon">&#9632;</span>
                    Dashboard
                </a>
                <a href="events.php" class="nav-item <?= !$showArchived ? 'active' : '' ?>">
                    <span class="nav-icon">&#9733;</span>
                    Veranstaltungen
                </a>
                <a href="events.php?archived=1" class="nav-item <?= $showArchived ? 'active' : '' ?>">
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
            <?php if ($message): ?>
                <div class="alert alert-<?= $messageType ?>">
                    <?= htmlspecialchars($message) ?>
                </div>
            <?php endif; ?>

            <?php if ($action === 'new' || $action === 'edit'): ?>
                <!-- Event Form -->
                <header class="content-header">
                    <h1><?= $action === 'new' ? 'Neue Veranstaltung' : 'Veranstaltung bearbeiten' ?></h1>
                    <a href="events.php<?= $showArchived ? '?archived=1' : '' ?>" class="btn">Abbrechen</a>
                </header>

                <form method="POST" action="events.php" enctype="multipart/form-data" class="event-form">
                    <?= csrfField() ?>
                    <input type="hidden" name="action" value="<?= $action === 'new' ? 'create' : 'update' ?>">
                    <?php if ($editEvent): ?>
                        <input type="hidden" name="id" value="<?= $editEvent['id'] ?>">
                        <input type="hidden" name="existing_image" value="<?= htmlspecialchars($editEvent['image'] ?? '') ?>">
                    <?php endif; ?>

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="title">Titel *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value="<?= htmlspecialchars($editEvent['title'] ?? '') ?>"
                            >
                        </div>

                        <div class="form-group">
                            <label for="artist">Künstler *</label>
                            <input
                                type="text"
                                id="artist"
                                name="artist"
                                required
                                value="<?= htmlspecialchars($editEvent['artist'] ?? '') ?>"
                            >
                        </div>

                        <div class="form-group">
                            <label for="date">Datum *</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                required
                                value="<?= htmlspecialchars($editEvent['date'] ?? '') ?>"
                            >
                        </div>

                        <div class="form-group">
                            <label for="time">Uhrzeit *</label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                required
                                value="<?= htmlspecialchars(substr($editEvent['time'] ?? '', 0, 5)) ?>"
                            >
                        </div>

                        <div class="form-group">
                            <label for="price">Preis (EUR)</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                step="0.01"
                                min="0"
                                value="<?= htmlspecialchars($editEvent['price'] ?? '0') ?>"
                            >
                        </div>

                        <div class="form-group">
                            <label for="genre">Genre *</label>
                            <input
                                type="text"
                                id="genre"
                                name="genre"
                                required
                                list="genre-list"
                                value="<?= htmlspecialchars($editEvent['genre'] ?? '') ?>"
                            >
                            <datalist id="genre-list">
                                <option value="Jazz">
                                <option value="Kabarett">
                                <option value="Theater">
                                <option value="Liedermacher">
                                <option value="Folk">
                                <option value="Klassik">
                                <option value="Blues">
                                <option value="Literatur">
                                <option value="Mixed">
                            </datalist>
                        </div>

                        <div class="form-group">
                            <label for="availability">Verfügbarkeit</label>
                            <select id="availability" name="availability">
                                <option value="available" <?= ($editEvent['availability'] ?? '') === 'available' ? 'selected' : '' ?>>Verfügbar</option>
                                <option value="few-left" <?= ($editEvent['availability'] ?? '') === 'few-left' ? 'selected' : '' ?>>Wenige Tickets</option>
                                <option value="sold-out" <?= ($editEvent['availability'] ?? '') === 'sold-out' ? 'selected' : '' ?>>Ausverkauft</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="image">Bild</label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                            >
                            <?php if ($editEvent && $editEvent['image']): ?>
                                <small>Aktuell: <?= htmlspecialchars($editEvent['image']) ?></small>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="description">Beschreibung</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                        ><?= htmlspecialchars($editEvent['description'] ?? '') ?></textarea>
                    </div>

                    <div class="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="is_archived"
                                value="1"
                                <?= ($editEvent['is_archived'] ?? 0) ? 'checked' : '' ?>
                            >
                            Archiviert
                        </label>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <?= $action === 'new' ? 'Erstellen' : 'Speichern' ?>
                        </button>
                        <a href="events.php<?= $showArchived ? '?archived=1' : '' ?>" class="btn">Abbrechen</a>
                    </div>
                </form>

            <?php else: ?>
                <!-- Events List -->
                <header class="content-header">
                    <h1><?= $showArchived ? 'Archiv' : 'Veranstaltungen' ?></h1>
                    <a href="events.php?action=new" class="btn btn-primary">+ Neue Veranstaltung</a>
                </header>

                <!-- Tabs -->
                <div class="tabs">
                    <a href="events.php" class="tab <?= !$showArchived ? 'active' : '' ?>">Kommende</a>
                    <a href="events.php?archived=1" class="tab <?= $showArchived ? 'active' : '' ?>">Archiv</a>
                </div>

                <?php if (empty($events)): ?>
                    <p class="empty-message">Keine Veranstaltungen vorhanden.</p>
                <?php else: ?>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Veranstaltung</th>
                                <th>Künstler</th>
                                <th>Datum</th>
                                <th>Preis</th>
                                <th>Status</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($events as $event): ?>
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
                                    <td><?= formatPrice((float)$event['price']) ?></td>
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
                                    <td class="actions-cell">
                                        <a href="events.php?action=edit&id=<?= $event['id'] ?>" class="btn btn-sm">Bearbeiten</a>

                                        <form method="POST" action="events.php" class="inline-form">
                                            <?= csrfField() ?>
                                            <input type="hidden" name="action" value="toggle_archive">
                                            <input type="hidden" name="id" value="<?= $event['id'] ?>">
                                            <button type="submit" class="btn btn-sm">
                                                <?= $event['is_archived'] ? 'Wiederherstellen' : 'Archivieren' ?>
                                            </button>
                                        </form>

                                        <form method="POST" action="events.php" class="inline-form" onsubmit="return confirm('Wirklich löschen?');">
                                            <?= csrfField() ?>
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?= $event['id'] ?>">
                                            <button type="submit" class="btn btn-sm btn-danger">Löschen</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            <?php endif; ?>
        </main>
    </div>
</body>
</html>
