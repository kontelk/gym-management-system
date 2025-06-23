<?php
// =================================================================
// Endpoint: /trainers/update.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Ενημερώνει έναν υπάρχοντα γυμναστή.
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
// ---------------------------------------------

// Αρχικοποίηση αντικειμένων
$database = Database::getInstance();
$db = $database->getConnection();
$trainer = new Trainer($db);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->first_name) && !empty($data->last_name)) {
    $trainer->id = $data->id;
    $trainer->first_name = $data->first_name;
    $trainer->last_name = $data->last_name;
    $trainer->bio = $data->bio ?? '';
    
    if ($trainer->update()) {
        http_response_code(200);
        echo json_encode(["message" => "Τα στοιχεία του γυμναστή ενημερώθηκαν."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία ενημέρωσης του γυμναστή."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Τα δεδομένα είναι ελλιπή (id, όνομα, επώνυμο)."]);
}