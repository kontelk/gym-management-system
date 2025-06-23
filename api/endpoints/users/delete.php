<?php
// =================================================================
// Endpoint: /users/delete.php (Protected, Admin Only)
// Method: POST
// Χρήση: Διαγράφει έναν χρήστη από τον admin.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/User.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");


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