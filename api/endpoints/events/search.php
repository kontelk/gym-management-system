<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Event.php';
include_once __DIR__ . '/../../models/Program.php'; // Θα χρειαστούμε και το Program model
include_once __DIR__ . '/../../services/TokenValidator.php';

// --- Έλεγχος Αυθεντικοποίησης ---
TokenValidator::validate();

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
$program = new Program($db);

// Βρίσκουμε τον τύπο του προγράμματος
$program->id = $program_id;
$program->readOne();

if ($program->name == null) {
    http_response_code(404);
    echo json_encode(['message' => 'Το πρόγραμμα δεν βρέθηκε.']);
    exit();
}

// --- ΝΕΑ ΛΟΓΙΚΗ REFACTORING ---
// Αν το πρόγραμμα είναι ατομικό, διασφαλίζουμε ότι τα slots υπάρχουν
if ($program->type === 'individual') {
    $event->ensureIndividualSlotsExist($program_id, $date);
}

// Τώρα, ανεξάρτητα από τον τύπο, εκτελούμε την αναζήτηση
$stmt = $event->searchAvailable($program_id, $date);
$num = $stmt->rowCount();

if ($num > 0) {
    $events_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Για τα ατομικά, το available_slots θα είναι πάντα null, το αλλάζουμε για το UI
        // if ($row['available_slots'] === null) {
        //     $row['available_slots'] = 'Απεριόριστες';
        // }
        array_push($events_arr, $row);
    }
    http_response_code(200);
    echo json_encode($events_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(200);
    echo json_encode(['message' => 'Δεν βρέθηκαν διαθέσιμα τμήματα για αυτή την επιλογή.']);
}