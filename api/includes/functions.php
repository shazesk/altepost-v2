<?php
/**
 * Helper Functions
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Sanitize input string
 *
 * @param string $input
 * @return string
 */
function sanitize(string $input): string {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Format date for display (German format)
 *
 * @param string $date MySQL date format
 * @return string
 */
function formatDateGerman(string $date): string {
    $months = [
        '01' => 'Januar', '02' => 'Februar', '03' => 'März',
        '04' => 'April', '05' => 'Mai', '06' => 'Juni',
        '07' => 'Juli', '08' => 'August', '09' => 'September',
        '10' => 'Oktober', '11' => 'November', '12' => 'Dezember'
    ];

    $dateObj = DateTime::createFromFormat('Y-m-d', $date);
    if (!$dateObj) {
        return $date;
    }

    $day = $dateObj->format('j');
    $month = $months[$dateObj->format('m')];
    $year = $dateObj->format('Y');

    return "{$day}. {$month} {$year}";
}

/**
 * Format time for display
 *
 * @param string $time MySQL time format
 * @return string
 */
function formatTime(string $time): string {
    $timeObj = DateTime::createFromFormat('H:i:s', $time);
    if (!$timeObj) {
        return $time;
    }
    return $timeObj->format('H:i') . ' Uhr';
}

/**
 * Format price for display (German format)
 *
 * @param float $price
 * @return string
 */
function formatPrice(float $price): string {
    return number_format($price, 2, ',', '.') . ' EUR';
}

/**
 * Get month name with year from date
 *
 * @param string $date
 * @return string
 */
function getMonthYear(string $date): string {
    $months = [
        '01' => 'Januar', '02' => 'Februar', '03' => 'März',
        '04' => 'April', '05' => 'Mai', '06' => 'Juni',
        '07' => 'Juli', '08' => 'August', '09' => 'September',
        '10' => 'Oktober', '11' => 'November', '12' => 'Dezember'
    ];

    $dateObj = DateTime::createFromFormat('Y-m-d', $date);
    if (!$dateObj) {
        return '';
    }

    return $months[$dateObj->format('m')] . ' ' . $dateObj->format('Y');
}

/**
 * Get all events
 *
 * @param bool $archived Get archived events
 * @return array
 */
function getEvents(bool $archived = false): array {
    $pdo = getDBConnection();
    if (!$pdo) {
        return [];
    }

    $stmt = $pdo->prepare("
        SELECT * FROM events
        WHERE is_archived = ?
        ORDER BY date " . ($archived ? "DESC" : "ASC") . ", time ASC
    ");
    $stmt->execute([$archived ? 1 : 0]);

    return $stmt->fetchAll();
}

/**
 * Get single event by ID
 *
 * @param int $id
 * @return array|null
 */
function getEvent(int $id): ?array {
    $pdo = getDBConnection();
    if (!$pdo) {
        return null;
    }

    $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
    $stmt->execute([$id]);

    $event = $stmt->fetch();
    return $event ?: null;
}

/**
 * Create new event
 *
 * @param array $data
 * @return int|false Event ID or false on failure
 */
function createEvent(array $data) {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }

    $stmt = $pdo->prepare("
        INSERT INTO events (title, artist, date, time, price, genre, month, availability, description, image, is_archived)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $month = getMonthYear($data['date']);

    $success = $stmt->execute([
        $data['title'],
        $data['artist'],
        $data['date'],
        $data['time'],
        $data['price'],
        $data['genre'],
        $month,
        $data['availability'] ?? 'available',
        $data['description'] ?? '',
        $data['image'] ?? null,
        $data['is_archived'] ?? 0
    ]);

    return $success ? (int)$pdo->lastInsertId() : false;
}

/**
 * Update event
 *
 * @param int $id
 * @param array $data
 * @return bool
 */
function updateEvent(int $id, array $data): bool {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }

    $month = getMonthYear($data['date']);

    $stmt = $pdo->prepare("
        UPDATE events SET
            title = ?,
            artist = ?,
            date = ?,
            time = ?,
            price = ?,
            genre = ?,
            month = ?,
            availability = ?,
            description = ?,
            image = ?,
            is_archived = ?
        WHERE id = ?
    ");

    return $stmt->execute([
        $data['title'],
        $data['artist'],
        $data['date'],
        $data['time'],
        $data['price'],
        $data['genre'],
        $month,
        $data['availability'] ?? 'available',
        $data['description'] ?? '',
        $data['image'] ?? null,
        $data['is_archived'] ?? 0,
        $id
    ]);
}

/**
 * Delete event
 *
 * @param int $id
 * @return bool
 */
function deleteEvent(int $id): bool {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }

    // Get event to delete image if exists
    $event = getEvent($id);
    if ($event && $event['image']) {
        $imagePath = __DIR__ . '/../uploads/' . $event['image'];
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }

    $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
    return $stmt->execute([$id]);
}

/**
 * Toggle event archive status
 *
 * @param int $id
 * @return bool
 */
function toggleArchive(int $id): bool {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }

    $stmt = $pdo->prepare("UPDATE events SET is_archived = NOT is_archived WHERE id = ?");
    return $stmt->execute([$id]);
}

/**
 * Handle image upload
 *
 * @param array $file $_FILES array element
 * @return string|null Filename or null on failure
 */
function uploadImage(array $file): ?string {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    if (!in_array($file['type'], $allowedTypes)) {
        return null;
    }

    if ($file['size'] > $maxSize) {
        return null;
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('event_') . '.' . strtolower($extension);
    $uploadPath = __DIR__ . '/../uploads/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        return $filename;
    }

    return null;
}

/**
 * Get event statistics
 *
 * @return array
 */
function getEventStats(): array {
    $pdo = getDBConnection();
    if (!$pdo) {
        return ['upcoming' => 0, 'archived' => 0, 'total' => 0];
    }

    $stmt = $pdo->query("
        SELECT
            SUM(CASE WHEN is_archived = 0 THEN 1 ELSE 0 END) as upcoming,
            SUM(CASE WHEN is_archived = 1 THEN 1 ELSE 0 END) as archived,
            COUNT(*) as total
        FROM events
    ");

    return $stmt->fetch() ?: ['upcoming' => 0, 'archived' => 0, 'total' => 0];
}

/**
 * Send JSON response
 *
 * @param mixed $data
 * @param int $statusCode
 */
function jsonResponse($data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Format event for API response
 *
 * @param array $event
 * @return array
 */
function formatEventForAPI(array $event): array {
    return [
        'id' => (string)$event['id'],
        'title' => $event['title'],
        'artist' => $event['artist'],
        'date' => formatDateGerman($event['date']),
        'time' => formatTime($event['time']),
        'price' => formatPrice((float)$event['price']),
        'genre' => $event['genre'],
        'month' => $event['month'],
        'availability' => $event['availability'],
        'description' => $event['description'],
        'image' => $event['image'] ? '/api/uploads/' . $event['image'] : null,
    ];
}
