<?php
// =================================================================
// Endpoint: /trainers/read_one.php (Protected, Admin Only)
// Method: GET
// Περιγραφή: Επιστρέφει τα στοιχεία ενός γυμναστή βάσει ID.
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


// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);

$trainer_id = $_GET['id'] ?? null;
if (!$trainer_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Απαιτείται το ID του γυμναστή.']);
    exit();
}

$database = Database::getInstance();
$db = $database->getConnection();
$trainer = new Trainer($db);
$trainer->id = $trainer_id;
$trainer->readOne();

if ($trainer->first_name != null) {
    $trainer_arr = [
        "id" => $trainer->id,
        "first_name" => $trainer->first_name,
        "last_name" => $trainer->last_name,
        "bio" => $trainer->bio
    ];
    http_response_code(200);
    echo json_encode($trainer_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(404);
    echo json_encode(["message" => "Ο γυμναστής δεν βρέθηκε."]);
}