<?php // Endpoint για τον admin να βλέπει ΟΛΑ τα προγράμματα (και τα ανενεργά)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Program.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);

$database = Database::getInstance();
$db = $database->getConnection();
$program = new Program($db);
$stmt = $program->readAllForAdmin();
$programs_arr = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    array_push($programs_arr, $row);
}
http_response_code(200);
echo json_encode($programs_arr, JSON_UNESCAPED_UNICODE);