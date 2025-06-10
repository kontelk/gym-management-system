<?php
// =================================================================
// Endpoint: /users/read_one_admin.php (Protected, Admin Only)
// Method: GET
// Περιγραφή: Επιστρέφει τα στοιχεία ενός χρήστη βάσει ID για χρήση από τον admin.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/User.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data_from_token = TokenValidator::validate();
RoleValidator::validate($user_data_from_token['role_id'], 1); // 1 = Admin Role ID

$user_id_to_fetch = $_GET['id'] ?? null;

if (!$user_id_to_fetch) {
    http_response_code(400); // Bad Request
    echo json_encode(['message' => 'Δεν παρασχέθηκε το ID του χρήστη.']);
    exit();
}

$database = Database::getInstance();
$db = $database->getConnection();
$user = new User($db);

// Ορισμός του ID του χρήστη που θέλουμε να φέρουμε
$user->id = $user_id_to_fetch;
$user->readOne(); // Χρησιμοποιούμε την υπάρχουσα μέθοδο readOne()

if ($user->username != null) {
    // Χρειαζόμαστε και το role_id & status, τα οποία δεν είναι public ιδιότητες στο User model.
    // Ας τα πάρουμε με ένα επιπλέον query για πληρότητα.
    $stmt = $db->prepare("SELECT role_id, status FROM users WHERE id = ?");
    $stmt->execute([$user_id_to_fetch]);
    $extra_details = $stmt->fetch(PDO::FETCH_ASSOC);

    // Δημιουργία του πίνακα απάντησης
    $user_arr = array(
        "id" =>  $user->id,
        "username" => $user->username,
        "email" => $user->email,
        "first_name" => $user->first_name,
        "last_name" => $user->last_name,
        "country" => $user->country,
        "city" => $user->city,
        "address" => $user->address,
        "role_id" => $extra_details['role_id'],
        "status" => $extra_details['status']
    );
    
    http_response_code(200); // 200 OK
    echo json_encode($user_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(404); // Not Found
    echo json_encode(array("message" => "Ο χρήστης δεν βρέθηκε."));
}