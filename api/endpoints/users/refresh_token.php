<?php
// =================================================================
// Endpoint: /users/refresh_token.php (Protected)
// Method: GET
// Περιγραφή: Επιστρέφει ένα νέο JWT με νέα ημερομηνία λήξης.
// =================================================================

// header("Access-Control-Allow-Origin: *");
// header("Content-Type: application/json; charset=UTF-8");
// header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Συμπερίληψη των απαραίτητων αρχείων
include_once __DIR__ . '/../../config/app_config.php'; // Υποθέτοντας ότι μετονομάσατε το database.php
include_once __DIR__ . '/../../services/TokenValidator.php';
require_once __DIR__ . '/../../../vendor/autoload.php';

use Firebase\JWT\JWT;

// --- Έλεγχος Αυθεντικοποίησης ---
// Χρησιμοποιούμε τον TokenValidator. Αν το token που στάλθηκε είναι άκυρο ή έχει ήδη λήξει,
// η εκτέλεση θα σταματήσει εδώ και θα επιστραφεί σφάλμα 401.
$user_data_from_token = TokenValidator::validate();

// Αν φτάσουμε εδώ, το παλιό token ήταν έγκυρο. Δημιουργούμε ένα νέο.
try {
    $token_payload = array(
        "iss" => JWT_ISSUER,
        "aud" => JWT_AUDIENCE,
        "iat" => time(),
        "exp" => time() + JWT_EXP_SECONDS, // Νέα ώρα λήξης (1 ώρα από τώρα)
        "data" => $user_data_from_token // Χρησιμοποιούμε τα ίδια δεδομένα χρήστη
    );

    // Δημιουργία του νέου JWT
    $new_jwt = JWT::encode($token_payload, JWT_SECRET_KEY, 'HS256');

    http_response_code(200);
    echo json_encode(
        array(
            "message" => "Το Token ανανεώθηκε με επιτυχία.",
            "jwt" => $new_jwt
        )
    );

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Αδυναμία δημιουργίας του token.", "error" => $e->getMessage()));
}