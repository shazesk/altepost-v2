<?php
/**
 * Single Event API Endpoint
 *
 * GET /api/endpoints/event.php?id=X - Get single event details
 */

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../includes/functions.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

// Validate ID parameter
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    jsonResponse(['success' => false, 'error' => 'Invalid event ID'], 400);
}

try {
    $id = (int)$_GET['id'];
    $event = getEvent($id);

    if (!$event) {
        jsonResponse(['success' => false, 'error' => 'Event not found'], 404);
    }

    jsonResponse([
        'success' => true,
        'data' => formatEventForAPI($event)
    ]);

} catch (Exception $e) {
    error_log("Event API error: " . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Internal server error'], 500);
}
