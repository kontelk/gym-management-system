<?php 
// =================================================================
// Endpoint: /programs/create.php (Protected, Admin Only)
// Method: POST
// Χρήση: Δημιουργεί ένα νέο πρόγραμμα.
// =================================================================

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

if (
    // !empty($data->name) && 
    // !empty($data->type
    isset($data->name, $data->description, $data->type, $data->max_capacity) &&
    trim($data->name) !== '' &&
    trim($data->description) !== '' &&
    in_array($data->type, ['individual', 'group']) &&
    filter_var($data->max_capacity, FILTER_VALIDATE_INT) !== false &&
    (int)$data->max_capacity >= 1
) {
    $program->name = trim($data->name);
    $program->description = trim($data->description);
    $program->type = $data->type;
    $program->is_active = isset($data->is_active) ? (bool)$data->is_active : true; // Default to active for new programs
    $program->max_capacity = (int)$data->max_capacity;
    
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