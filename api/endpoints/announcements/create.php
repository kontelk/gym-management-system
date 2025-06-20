<?php

// =================================================================
// Endpoint: /announcements/create.php (Protected, Admin Only)
// Method: POST
// Χρήση: Δημιουργεί μια νέα ανακοίνωση.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Announcement.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);
$database = Database::getInstance();
$db = $database->getConnection();
$announcement = new Announcement($db);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->title) && !empty($data->content)) {
    $announcement->title = $data->title;
    $announcement->content = $data->content;
    $announcement->user_id = $user_data['id']; // Ο δημιουργός είναι ο συνδεδεμένος admin
    if ($announcement->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Η ανακοίνωση δημιουργήθηκε."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία δημιουργίας της ανακοίνωσης."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Τα δεδομένα είναι ελλιπή (τίτλος και περιεχόμενο)."]);
}