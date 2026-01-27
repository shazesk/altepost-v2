<?php
/**
 * Events API Endpoint
 *
 * GET /api/endpoints/events.php - List upcoming events
 * GET /api/endpoints/events.php?archived=1 - List archived events
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

try {
    // Check if archived events requested
    $archived = isset($_GET['archived']) && $_GET['archived'] == '1';

    // Get events
    $events = getEvents($archived);

    // Format events for API response
    $formattedEvents = array_map('formatEventForAPI', $events);

    // Group by year for archived events
    if ($archived) {
        $groupedEvents = [];
        foreach ($events as $event) {
            $year = date('Y', strtotime($event['date']));
            if (!isset($groupedEvents[$year])) {
                $groupedEvents[$year] = [];
            }
            $groupedEvents[$year][] = formatEventForAPI($event);
        }
        // Sort years descending
        krsort($groupedEvents);

        jsonResponse([
            'success' => true,
            'data' => $groupedEvents,
            'count' => count($events)
        ]);
    }

    jsonResponse([
        'success' => true,
        'data' => $formattedEvents,
        'count' => count($formattedEvents)
    ]);

} catch (Exception $e) {
    error_log("Events API error: " . $e->getMessage());
    jsonResponse(['success' => false, 'error' => 'Internal server error'], 500);
}
