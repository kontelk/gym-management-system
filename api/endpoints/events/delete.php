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

if (!empty($data->id)) {
    $event->id = $data->id;
    if ($event->delete()) {
        http_response_code(200);
        echo json_encode(["message" => "Το event διαγράφηκε."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία διαγραφής του event."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Δεν δόθηκε ID."]);
}