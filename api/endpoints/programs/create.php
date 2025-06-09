<?php // Endpoint για δημιουργία νέου προγράμματος
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Program.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);

$database = Database::getInstance();
$db = $database->getConnection();
$program = new Program($db);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->type)) {
    $program->name = $data->name;
    $program->description = $data->description ?? '';
    $program->type = $data->type;
    if ($program->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Το πρόγραμμα δημιουργήθηκε."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία δημιουργίας προγράμματος."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Τα δεδομένα είναι ελλιπή."]);
}