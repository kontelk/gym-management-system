<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Event.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);
$database = Database::getInstance();
$db = $database->getConnection();
$event = new Event($db);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->program_id) && !empty($data->start_time) && !empty($data->end_time) && !empty($data->max_capacity)) {
    $event->program_id = $data->program_id;
    $event->trainer_id = $data->trainer_id;
    $event->start_time = $data->start_time;
    $event->end_time = $data->end_time;
    $event->max_capacity = $data->max_capacity;
    if ($event->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Το event δημιουργήθηκε."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία δημιουργίας του event."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Τα δεδομένα είναι ελλιπή."]);
}