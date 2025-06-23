<?php
// ==========================================================================
// Cancel Booking Endpoint: /bookings/cancel.php (Protected)
// Method: POST
// Description: Cancel a booking for the authenticated user.
// ==========================================================================


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


$user_data_from_token = TokenValidator::validate();

$database = Database::getInstance();
$db = $database->getConnection();
$booking = new Booking($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->booking_id)) {
    $booking->id = $data->booking_id;
    $booking->user_id = $user_data_from_token['id']; // Ασφάλεια: Ο χρήστης μπορεί να ακυρώσει μόνο τις δικές του κρατήσεις
    
    $result = $booking->cancel();

    if ($result['success']) {
        http_response_code(200);
        echo json_encode(['message' => $result['message']]);
    } else {
        http_response_code(409); // Conflict
        echo json_encode(['message' => $result['message']]);
    }
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Δεν παρασχέθηκε το ID της κράτησης (booking_id).']);
}