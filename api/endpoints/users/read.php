<?php
// =================================================================
// Endpoint: /users/read.php (Protected, Admin Only)
// Method: GET
// Περιγραφή: Επιστρέφει λίστα με όλους τους χρήστες του συστήματος.
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