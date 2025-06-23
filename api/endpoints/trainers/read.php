<?php
// =================================================================
// Endpoint: /trainers/read.php (Public)
// Method: GET
// Χρήση: Επιστρέφει τη λίστα των εκπαιδευτών.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/
require_once __DIR__ . '/../../bootstrap.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");


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