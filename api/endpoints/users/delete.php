<?php
// Endpoint για διαγραφή χρήστη από τον admin
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/User.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);
$database = Database::getInstance();
$db = $database->getConnection();
$user = new User($db);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $user->id = $data->id;
    $result = $user->delete();
    
    if ($result['success']) {
        http_response_code(200);
        echo json_encode(["message" => $result['message']]);
    } else {
        http_response_code(409); // Conflict: Ο πόρος δεν μπορεί να διαγραφεί
        echo json_encode(["message" => $result['message']]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Δεν παρασχέθηκε το ID του χρήστη."]);
}