<?php
// Endpoint για ενημέρωση χρήστη από τον admin
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

if (!empty($data->id) /* && ... άλλοι έλεγχοι ... */ ) {
    // Ορισμός όλων των ιδιοτήτων του user object από τα data
    $user->id = $data->id;
    $user->username = $data->username;
    $user->email = $data->email;
    $user->first_name = $data->first_name;
    $user->last_name = $data->last_name;
    // $user->country = $data->country;
    // $user->city = $data->city;
    // $user->address = $data->address;
    $user->role_id = $data->role_id;
    $user->status = $data->status;
    // Αν δόθηκε νέος κωδικός
    if (!empty($data->password)) {
        $user->password = $data->password;
    }

    if ($user->update()) {
        http_response_code(200);
        echo json_encode(["message" => "Τα στοιχεία του χρήστη ενημερώθηκαν."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία ενημέρωσης του χρήστη."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Τα δεδομένα είναι ελλιπή."]);
}