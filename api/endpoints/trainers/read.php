<?php
// =================================================================
// Endpoint: /trainers/read.php (Public)
// Method: GET
// Χρήση: Επιστρέφει τη λίστα των εκπαιδευτών.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once __DIR__ . '/../../core/Database.php';

$database = Database::getInstance();
$db = $database->getConnection();
$query = "SELECT id, first_name, last_name FROM trainers ORDER BY last_name ASC";
$stmt = $db->prepare($query);
$stmt->execute();
$trainers_arr = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    array_push($trainers_arr, $row);
}
http_response_code(200);
echo json_encode($trainers_arr, JSON_UNESCAPED_UNICODE);