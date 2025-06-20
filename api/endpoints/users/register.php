<?php
// =================================================================
// Endpoint: /users/register.php (Επισκέπτες)
// Method: POST
// Περιγραφή: Επιτρέπει σε έναν επισκέπτη να υποβάλει αίτημα εγγραφής.
// =================================================================

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Συμπερίληψη αρχείων
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/User.php';

// Αρχικοποίηση αντικειμένων
$database = Database::getInstance();
$db = $database->getConnection();
$user = new User($db);

// Λήψη των δεδομένων που στάλθηκαν
$data = json_decode(file_get_contents("php://input"));

// Έλεγχos ότι τα απαραίτητα δεδομένα υπάρχουν
if (
    !empty($data->username) &&
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->country) &&
    !empty($data->city)
) {
    // Ορισμός των ιδιοτήτων του user object
    $user->username = $data->username;
    $user->email = $data->email;
    $user->password = $data->password;
    $user->first_name = $data->first_name;
    $user->last_name = $data->last_name;
    $user->country = $data->country;
    $user->city = $data->city;
    $user->address = $data->address ?? ''; // Το address είναι προαιρετικό

    // Προσπάθεια δημιουργίας του χρήστη
    $result = $user->register();
    
    if ($result === true) {
        // Επιτυχία
        http_response_code(201);
        echo json_encode(["message" => "Το αίτημα εγγραφής υποβλήθηκε με επιτυχία. Αναμένεται έγκριση από τον διαχειριστή."]);
    } else if (is_array($result)) {
        // Βρέθηκαν σφάλματα validation
        // 422 Unprocessable Entity: Η σύνταξη του request ήταν σωστή, αλλά δεν μπόρεσε να επεξεργαστεί λόγω σημασιολογικών σφαλμάτων.
        http_response_code(422);
        echo json_encode([
            "message" => "Η εγγραφή απέτυχε λόγω σφαλμάτων επικύρωσης.",
            "errors" => $result
        ]);
    } else {
        // Άλλο σφάλμα (π.χ. βάσης)
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία δημιουργίας χρήστη."]);
    }

}

