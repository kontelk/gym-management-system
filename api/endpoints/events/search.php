<?php
// =================================================================
// Endpoint: /events/search.php (Public)
// Method: GET
// Χρήση: Αναζητά events (προγραμματισμένες συνεδρίες) σε συγκεκριμένη χρονική περίοδο.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φακελο api/
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/Event.php';
include_once API_ROOT . '/models/Program.php'; // Θα χρειαστούμε και το Program model

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");


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
        array_push($events_arr, $row);
    }
    http_response_code(200);
    echo json_encode($events_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(200);
    echo json_encode(['message' => 'Δεν βρέθηκαν διαθέσιμα τμήματα για αυτή την επιλογή.']);
}