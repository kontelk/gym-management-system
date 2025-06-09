<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Booking.php';
include_once __DIR__ . '/../../services/TokenValidator.php';

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