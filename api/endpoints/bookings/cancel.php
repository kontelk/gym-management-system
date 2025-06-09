<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Booking.php';
include_once __DIR__ . '/../../services/TokenValidator.php';

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