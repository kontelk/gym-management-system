<?php
// =================================================================
// Endpoint: /users/read_one.php (Protected)
// Method: GET
// Περιγραφή: Επιστρέφει τα στοιχεία του προφίλ του συνδεδεμένου χρήστη.
// Απαιτεί: Έγκυρο JWT στο Authorization header.
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
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


// --- Έλεγχos Αυθεντικοποίησης ---
// Καλεί τον validator. Αν το token δεν είναι έγκυρο, η εκτέλεση θα σταματήσει εκεί.
$user_data_from_token = TokenValidator::validate();
// ---------------------------------


// Αρχικοποίηση αντικειμένων
$database = Database::getInstance();
$db = $database->getConnection();
$user = new User($db);

// Ορισμός του ID του χρήστη από τα δεδομένα του token
$user->id = $user_data_from_token['id'];

// Ανάκτηση των στοιχείων του χρήστη
$user->readOne();

if ($user->username != null) {
    // Δημιουργία του πίνακα απάντησης
    $user_arr = array(
        "id" =>  $user->id,
        "username" => $user->username,
        "email" => $user->email,
        "first_name" => $user->first_name,
        "last_name" => $user->last_name,
        "country" => $user->country,
        "city" => $user->city,
        "address" => $user->address
    );
    
    http_response_code(200); // 200 OK
    echo json_encode($user_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(404); // Not Found
    echo json_encode(array("message" => "Ο χρήστης δεν βρέθηκε."));
}