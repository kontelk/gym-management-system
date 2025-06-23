<?php
// =================================================================
// Endpoint: /bookings/read_by_user.php (Private)
// Method: GET
// Περιγραφή: Επιστρέφει όλες τις κρατήσεις του συνδεδεμένου χρήστη.
// Απαιτεί: Έγκυρο JWT στο Authorization header.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται φάκελο στο api/
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/Booking.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");


$user_data_from_token = TokenValidator::validate();

$database = Database::getInstance();
$db = $database->getConnection();
$booking = new Booking($db);

$booking->user_id = $user_data_from_token['id'];
$stmt = $booking->readByUserId();
$num = $stmt->rowCount();

if ($num > 0) {
    $bookings_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($bookings_arr, $row);
    }
    http_response_code(200);
    echo json_encode($bookings_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(200);
    echo json_encode(['message' => 'Δεν έχετε πραγματοποιήσει καμία κράτηση.']);
}