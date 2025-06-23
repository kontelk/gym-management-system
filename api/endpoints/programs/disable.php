<?php
// =================================================================
// Endpoint: /programs/disable.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Απενεργοποιεί (soft delete) ένα πρόγραμμα.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/Program.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");


// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1); // 1 = Admin Role ID

// Αρχικοποίηση αντικειμένων
$database = Database::getInstance();
$db = $database->getConnection();
$program = new Program($db);

// Λήψη των δεδομένων
$data = json_decode(file_get_contents("php://input"));

// Έλεγχος ότι δόθηκε το ID
if (!empty($data->id)) {
    $program->id = $data->id;

    // Προσπάθεια διαγραφής (απενεργοποίησης)
    if ($program->disable()) {
        http_response_code(200); // 200 OK
        echo json_encode(["message" => "Το πρόγραμμα απενεργοποιήθηκε."]);
    } else {
        http_response_code(503); // 503 Service Unavailable
        echo json_encode(["message" => "Αδυναμία απενεργοποίησης του προγράμματος."]);
    }
} else {
    http_response_code(400); // 400 Bad Request
    echo json_encode(["message" => "Αδυναμία απενεργοποίησης. Δεν παρασχέθηκε το ID του προγράμματος."]);
}