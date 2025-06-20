<?php
// =================================================================
// Endpoint: /events/update.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Ενημερώνει ένα υπάρχον event.
// Η χωρητικότητα (max_capacity) είναι υποχρεωτική και πρέπει να είναι θετικός ακέραιος.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST"); // Ή PUT, ανάλογα με τη σύμβαση του API
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Event.php'; // Υποθέτουμε ότι υπάρχει αυτό το μοντέλο
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1); // Μόνο Admin (role_id 1)

$database = Database::getInstance();
$db = $database->getConnection();
$event = new Event($db);
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->id) &&
    !empty($data->program_id) &&
    !empty($data->date) &&
    !empty($data->start_time) &&
    !empty($data->end_time) &&
    isset($data->max_capacity) && filter_var($data->max_capacity, FILTER_VALIDATE_INT) && (int)$data->max_capacity > 0
) {
    $event->id = $data->id;
    $event->program_id = $data->program_id;
    $event->date = $data->date;
    $event->start_time = $data->start_time;
    $event->end_time = $data->end_time;
    $event->trainer_id = !empty($data->trainer_id) ? $data->trainer_id : null;
    $event->max_capacity = (int)$data->max_capacity;

    if ($event->update()) { // Υποθέτουμε ότι υπάρχει η μέθοδος update() στο μοντέλο Event
        http_response_code(200);
        echo json_encode(["message" => "Το event ενημερώθηκε."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία ενημέρωσης του event."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Τα δεδομένα είναι ελλιπή ή μη έγκυρα. Η χωρητικότητα είναι υποχρεωτική και πρέπει να είναι θετικός ακέραιος."]);
}
?>