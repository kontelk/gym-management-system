<?php
// =================================================================
// Endpoint: /events/search.php (Protected)
// Method: GET
// Περιγραφή: Αναζητά διαθέσιμα τμήματα. Απαιτεί παραμέτρους 'program_id' και 'date'.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Event.php';
include_once __DIR__ . '/../../services/TokenValidator.php';

// --- Έλεγχος Αυθεντικοποίησης ---
TokenValidator::validate();

// Έλεγχος αν δόθηκαν οι απαραίτητες παράμετροι στο URL
$program_id = $_GET['program_id'] ?? null;
$date = $_GET['date'] ?? null;

if (!$program_id || !$date) {
    http_response_code(400);
    echo json_encode(['message' => 'Απαιτούνται οι παράμετροι program_id και date.']);
    exit();
}

$database = Database::getInstance();
$db = $database->getConnection();
$event = new Event($db);

$stmt = $event->searchAvailable($program_id, $date);
$num = $stmt->rowCount();

if ($num > 0) {
    $events_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($events_arr, $row);
    }
    http_response_code(200);
    echo json_encode($events_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(200); // Είναι ΟΚ, απλά δεν βρέθηκαν αποτελέσματα
    echo json_encode(['message' => 'Δεν βρέθηκαν διαθέσιμα τμήματα για αυτή την επιλογή.']);
}