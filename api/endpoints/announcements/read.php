<?php
// =================================================================
// Endpoint: /announcements/read.php (Public)
// Method: GET
// Περιγραφή: Επιστρέφει μια λίστα με όλες τις ανακοινώσεις.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Announcement.php';

$database = Database::getInstance();
$db = $database->getConnection();
$announcement = new Announcement($db);

$stmt = $announcement->readAll();
$num = $stmt->rowCount();

if ($num > 0) {
    $announcements_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($announcements_arr, $row);
    }
    http_response_code(200);
    echo json_encode($announcements_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(200); // OK, απλά δεν υπάρχουν δεδομένα
    echo json_encode(['message' => 'Δεν υπάρχουν τρέχουσες ανακοινώσεις.']);
}