<?php
// =================================================================
// Endpoint: /announcements/update.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Ενημερώνει μια υπάρχουσα ανακοίνωση.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Announcement.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);

$database = Database::getInstance();
$db = $database->getConnection();
$announcement = new Announcement($db);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->title) && !empty($data->content)) {
    $announcement->id = $data->id;
    $announcement->title = $data->title;
    $announcement->content = $data->content;
    
    if ($announcement->update()) {
        http_response_code(200);
        echo json_encode(["message" => "Η ανακοίνωση ενημερώθηκε."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία ενημέρωσης της ανακοίνωσης."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Τα δεδομένα είναι ελλιπή."]);
}