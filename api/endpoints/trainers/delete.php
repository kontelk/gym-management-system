<?php
// =================================================================
// Endpoint: /trainers/delete.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Διαγράφει έναν γυμναστή.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Trainer.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

// --- Έλεγχos Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);

$database = Database::getInstance();
$db = $database->getConnection();
$trainer = new Trainer($db);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $trainer->id = $data->id;
    
    if ($trainer->delete()) {
        http_response_code(200);
        echo json_encode(["message" => "Ο γυμναστής διαγράφηκε."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Αδυναμία διαγραφής του γυμναστή."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Δεν παρασχέθηκε το ID του γυμναστή."]);
}