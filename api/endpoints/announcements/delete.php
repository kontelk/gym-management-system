<?php
// =================================================================
// Endpoint: /announcements/delete.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Διαγράφει μια ανακοίνωση.
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

if (!empty($data->id)) {
    $announcement->id = $data->id;
    if ($announcement->delete()) {
        http_response_code(200);
        echo json_encode(["message" => "Η ανακοίνωση διαγράφηκε."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία διαγραφής της ανακοίνωσης."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Δεν παρασχέθηκε το ID."]);
}