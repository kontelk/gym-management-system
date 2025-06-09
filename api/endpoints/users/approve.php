<?php
// =================================================================
// Endpoint: /users/approve.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Εγκρίνει έναν χρήστη, αλλάζοντας το status και τον ρόλο του.
// =================================================================

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// Συμπερίληψη αρχείων
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/User.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data_from_token = TokenValidator::validate();
RoleValidator::validate($user_data_from_token['role_id'], 1); // 1 = Admin Role ID
// ------------------------------------------------

$database = Database::getInstance();
$db = $database->getConnection();
$user = new User($db);

// Λήψη των δεδομένων
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->role_id)) {
    $user->id = $data->user_id;
    $user->role_id = $data->role_id;

    if ($user->approve()) {
        http_response_code(200);
        echo json_encode(array("message" => "Ο χρήστης εγκρίθηκε με επιτυχία."));
    } else {
        http_response_code(404); // Not Found ή δεν έγινε αλλαγή
        echo json_encode(array("message" => "Δεν ήταν δυνατή η έγκριση του χρήστη. Ο χρήστης μπορεί να έχει ήδη εγκριθεί ή να μην υπάρχει."));
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(array("message" => "Δεν ήταν δυνατή η έγκριση του χρήστη. Τα δεδομένα είναι ελλιπή (απαιτείται user_id και role_id)."));
}