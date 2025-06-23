<?php
// =================================================================
// Endpoint: /events/read_admin.php (Protected, Admin Only)
// Method: GET
// Χρήση: Διαβάζει όλα τα events (προγραμματισμένες συνεδρίες) για διαχείριση από τον admin.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/Event.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");


$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);

$start_date = $_GET['start'] ?? null;
$end_date = $_GET['end'] ?? null;
if (!$start_date || !$end_date) {
    http_response_code(400);
    echo json_encode(['message' => 'Απαιτούνται οι παράμετροι start και end.']);
    exit();
}

$database = Database::getInstance();
$db = $database->getConnection();
$event = new Event($db);
$events_arr = $event->readByDateRange($start_date, $end_date);
http_response_code(200);
echo json_encode($events_arr, JSON_UNESCAPED_UNICODE);