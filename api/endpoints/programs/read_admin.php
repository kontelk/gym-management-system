<?php 
// =================================================================
// Endpoint: /programs/read_admin.php (Protected, Admin Only)
// Method: GET
// Χρήση: Επιστρέφει όλα τα προγράμματα για τον admin, συμπεριλαμβανομένων των ανενεργών.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/Program.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");


$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);

$database = Database::getInstance();
$db = $database->getConnection();
$program = new Program($db);
$stmt = $program->readAllForAdmin();
$programs_arr = [];
// Έλεγχος αν υπάρχουν αποτελέσματα
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    array_push($programs_arr, $row);
}
http_response_code(200);
echo json_encode($programs_arr, JSON_UNESCAPED_UNICODE);