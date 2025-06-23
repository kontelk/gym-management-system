<?php
// =================================================================
// Endpoint: /users/read_pending.php (Protected, Admin Only)
// Method: GET
// Περιγραφή: Επιστρέφει λίστα με χρήστες που αναμένουν έγκριση.
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


// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data_from_token = TokenValidator::validate();
RoleValidator::validate($user_data_from_token['role_id'], 1); // 1 = Admin Role ID
// ------------------------------------------------

$database = Database::getInstance();
$db = $database->getConnection();
$user = new User($db);

$stmt = $user->readPending();
$num = $stmt->rowCount();

if ($num > 0) {
    $pending_users_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $user_item = array(
            "id" => $id,
            "username" => $username,
            "email" => $email,
            "first_name" => $first_name,
            "last_name" => $last_name,
            "country" => $country,
            "city" => $city,
            "request_date" => $created_at
        );
        array_push($pending_users_arr, $user_item);
    }
    http_response_code(200);
    echo json_encode($pending_users_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(200); // 200 OK είναι ΟΚ, απλά δεν υπάρχουν αποτελέσματα
    echo json_encode(array("message" => "Δεν υπάρχουν αιτήματα εγγραφής σε αναμονή."));
}