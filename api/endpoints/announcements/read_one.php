<?php
// =================================================================
// Endpoint: /announcements/read_one.php (Protected, Admin Only)
// Method: GET
// Περιγραφή: Επιστρέφει μία μόνο ανακοίνωση βάσει ID.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/Announcement.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");


// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1);

$announcement_id = $_GET['id'] ?? null;
if (!$announcement_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Απαιτείται το ID της ανακοίνωσης.']);
    exit();
}

$database = Database::getInstance();
$db = $database->getConnection();
$announcement = new Announcement($db);
$announcement->id = $announcement_id;
$announcement->readOne();

if ($announcement->title != null) {
    $announcement_arr = [
        "id" => $announcement->id,
        "title" => $announcement->title,
        "content" => $announcement->content
    ];
    http_response_code(200);
    echo json_encode($announcement_arr, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(404);
    echo json_encode(["message" => "Η ανακοίνωση δεν βρέθηκε."]);
}