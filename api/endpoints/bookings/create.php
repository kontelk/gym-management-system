<?php
// =================================================================
// Endpoint: /bookings/create.php (Protected)
// Method: POST
// Περιγραφή: Δημιουργεί μια νέα κράτηση για τον συνδεδεμένο χρήστη.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/ 
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/Booking.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");


// --- Έλεγχος Αυθεντικοποίησης ---
$user_data_from_token = TokenValidator::validate();

$database = Database::getInstance();
$db = $database->getConnection();
$booking = new Booking($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->event_id)) {
    $booking->user_id = $user_data_from_token['id'];
    $booking->event_id = $data->event_id;
    
    $result = $booking->create();

    if ($result['success']) {
        http_response_code(201); // 201 Created
        echo json_encode(['message' => $result['message']]);
    } else {
        http_response_code(409); // 409 Conflict (για επιχειρησιακά σφάλματα)
        echo json_encode(['message' => $result['message']]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Δεν παρασχέθηκε το ID του τμήματος (event_id).']);
}