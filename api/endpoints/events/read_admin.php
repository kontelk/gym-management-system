<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Event.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);

$start_date = $_GET['start'] ?? null;
$end_date = $_GET['end'] ?? null;
if (!$start_date || !$end_date) {
    http_response_code(400);
    echo json_encode(['message' => 'Απαιτούνται οι παράμετροι start και end.']);
    exit();
}

$database = Database::getInstance();
$db = $database->getConnection();
$event = new Event($db);
$events_arr = $event->readByDateRange($start_date, $end_date);
http_response_code(200);
echo json_encode($events_arr, JSON_UNESCAPED_UNICODE);