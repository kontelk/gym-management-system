<?php
// =================================================================
// Endpoint: /users/login.php (Επισκέπτες)
// Method: POST
// Χρήση: Επιτρέπει στους χρήστες να συνδεθούν και να λάβουν ένα JWT.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/User.php';
// Απαιτείται ο autoloader του Composer για να βρει την κλάση JWT
require_once API_ROOT . '/../vendor/autoload.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


// Χρήση της κλάσης JWT από τη βιβλιοθήκη
use Firebase\JWT\JWT;

// Αρχικοποίηση αντικειμένων
$database = Database::getInstance();
$db = $database->getConnection();
$user = new User($db);

// Λήψη των δεδομένων που στάλθηκαν (posted data)
// Η file_get_contents("php://input") διαβάζει το raw body του request
$data = json_decode(file_get_contents("php://input"));

// Έλεγχος ότι τα δεδομένα δεν είναι κενά
if (empty($data->username) || empty($data->password)) {
    http_response_code(400); // 400 Bad Request
    echo json_encode(array("message" => "Η είσοδος απέτυχε. Username και password απαιτούνται."));
    exit();
}

// Ορισμός των ιδιοτήτων του user object
$user->username = $data->username;
$user_data = $user->findByUsername();

// Έλεγχος αν ο χρήστης υπάρχει και αν ο κωδικός είναι σωστός
if ($user_data && password_verify($data->password, $user_data['password_hash'])) {
    
    // Δημιουργία του payload για το token
    $token_payload = array(
        "iss" => JWT_ISSUER,
        "aud" => JWT_AUDIENCE,
        "iat" => time(), // Issued at: τρέχον timestamp
        "exp" => time() + JWT_EXP_SECONDS, // Expiration: τρέχον timestamp + διάρκεια ζωής
        "data" => array( // Δεδομένα που θέλουμε να αποθηκεύσουμε στο token
            "id" => $user_data['id'],
            "username" => $user_data['username'],
            "role_id" => $user_data['role_id']
        )
    );

    // Δημιουργία του JWT
    $jwt = JWT::encode($token_payload, JWT_SECRET_KEY, 'HS256');

    http_response_code(200); // 200 OK
    echo json_encode(
        array(
            "message" => "Η είσοδος ήταν επιτυχής.",
            "jwt" => $jwt
        )
    );

} else {
    // Αν η είσοδος απέτυχε
    http_response_code(401); // 401 Unauthorized
    echo json_encode(array("message" => "Η είσοδος απέτυχε. Λάθος όνομα χρήστη ή κωδικός."));
}