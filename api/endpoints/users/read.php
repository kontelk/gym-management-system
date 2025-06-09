<?php
// =================================================================
// Endpoint: /users/read.php (Protected, Admin Only)
// Method: GET
// Περιγραφή: Επιστρέφει λίστα με όλους τους χρήστες του συστήματος.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/User.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

$user_data_from_token = TokenValidator::validate();
RoleValidator::validate($user_data_from_token['role_id'], 1); // 1 = Admin Role ID

$database = Database::getInstance();
$db = $database->getConnection();
$user = new User($db);

$stmt = $user->readAll();
$num = $stmt->rowCount();

if ($num > 0) {
    $users_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($users_arr, $row);
    }
    http_response_code(200);
    echo json_encode($users_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(200);
    echo json_encode(['message' => 'Δεν βρέθηκαν χρήστες.']);
}