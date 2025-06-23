<?php
// =================================================================
// Endpoint: /trainers/delete.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Διαγράφει έναν γυμναστή.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/Trainer.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");


// --- Έλεγχos Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);

$database = Database::getInstance();
$db = $database->getConnection();
$trainer = new Trainer($db);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $trainer->id = $data->id;
    
    if ($trainer->delete()) {
        http_response_code(200);
        echo json_encode(["message" => "Ο γυμναστής διαγράφηκε."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία διαγραφής του γυμναστή."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Δεν παρασχέθηκε το ID του γυμναστή."]);
}