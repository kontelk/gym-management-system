<?php
// =================================================================
// Endpoint: /trainers/create.php (Protected, Admin Only)
// Method: POST
// Χρήση: Δημιουργεί έναν νέο γυμναστή.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Trainer.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);
$database = Database::getInstance();
$db = $database->getConnection();
$trainer = new Trainer($db);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->first_name) && !empty($data->last_name)) {
    $trainer->first_name = $data->first_name;
    $trainer->last_name = $data->last_name;
    $trainer->bio = $data->bio ?? '';
    if ($trainer->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Ο γυμναστής δημιουργήθηκε."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία δημιουργίας του γυμναστή."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Τα δεδομένα είναι ελλιπή (όνομα και επώνυμο)."]);
}