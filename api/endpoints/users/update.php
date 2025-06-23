<?php
// =================================================================
// Endpoint: /users/update.php (Protected, Admin Only)
// Method: POST
// Χρήση: Ενημερώνει τα στοιχεία ενός υπάρχοντος χρήστη από τον admin.
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

if (!empty($data->id) /* && ... άλλοι έλεγχοι ... */ ) {
    // Ορισμός όλων των ιδιοτήτων του user object από τα data
    $user->id = $data->id;
    $user->username = $data->username;
    $user->email = $data->email;
    $user->first_name = $data->first_name;
    $user->last_name = $data->last_name;
    $user->country = $data->country ?? null; // Χρήση null coalescing για προαιρετικά πεδία
    $user->city = $data->city ?? null;       // Χρήση null coalescing για προαιρετικά πεδία
    $user->address = $data->address ?? null; // Χρήση null coalescing για προαιρετικά πεδία
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