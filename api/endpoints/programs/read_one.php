<?php
// =================================================================
// Endpoint: /programs/read_one.php (Public)
// Method: GET
// Description: Retrieve a program by its ID
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


$program_id = $_GET['id'] ?? null;
if (!$program_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Απαιτείται το ID του προγράμματος.']);
    exit();
}

$database = Database::getInstance();
$db = $database->getConnection();
$program = new Program($db);
$program->id = $program_id;
$program->readOne();

// Ελέγχουμε αν το πρόγραμμα υπάρχει
if ($program->name != null) {
    // Προσθέτουμε το is_active στον πίνακα που επιστρέφουμε
    $program_arr = [
        "id" => $program->id,
        "name" => $program->name,
        "description" => $program->description,
        "type" => $program->type,
        "max_capacity" => $program->max_capacity,
        "is_active" => $program->is_active
    ];
    http_response_code(200);
    echo json_encode($program_arr, JSON_UNESCAPED_UNICODE);
} else {    
    http_response_code(404);
    echo json_encode(["message" => "Το πρόγραμμα δεν βρέθηκε."]);
}