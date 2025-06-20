<?php
// =================================================================
// Endpoint: /events/delete.php (Protected, Admin Only)
// Method: POST
// Χρήση: Διαγράφει ένα event (προγραμματισμένη συνεδρία) και τις κρατήσεις του.
// =================================================================

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// // Include database and object files
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../config/app_config.php'; // Για JWT
include_once __DIR__ . '/../../models/Event.php';
include_once __DIR__ . '/../../models/Booking.php'; // Χρειαζόμαστε το Booking object για διαγραφή κρατήσεων
include_once __DIR__ . '/../../models/Program.php'; // Χρειαζόμαστε το Program object για να βρούμε τον τύπο
include_once __DIR__ . '/../../models/User.php'; // Για έλεγχο ρόλου

include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

// Συμπερίληψη του autoloader του Composer
require_once __DIR__ . '/../../../vendor/autoload.php';

// Χρήση της κλάσης JWT από τη βιβλιοθήκη
use Firebase\JWT\JWT;
use Firebase\JWT\Key;


// Get database connection
// $database = new Database(); // <-- Αυτή η γραμμή προκαλεί το σφάλμα
$database = Database::getInstance(); // <-- Χρησιμοποιούμε τη static μέθοδο getInstance()
$db = $database->getConnection();

// Instantiate event, booking, program, and user objects
$event = new Event($db);
$booking = new Booking($db);
$program = new Program($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));


// Check if event ID is set
if (!isset($data->id) || empty($data->id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Δεν βρέθηκε ID event για διαγραφή."));
    exit();
}

// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
// Χρησιμοποιούμε τους validators. Αν το token είναι άκυρο ή ο χρήστης δεν είναι admin, η εκτέλεση θα σταματήσει εδώ.
$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1); // 1 = Admin Role ID


$event->id = $data->id;

// Διάβασμα του event από τη βάση δεδομένων
if (!$event->readOne()) { // Καλείς τη readOne εδώ, η οποία θα γεμίσει και το program_type
    http_response_code(404);
    echo json_encode(array("message" => "Το event δεν βρέθηκε."));
    exit();
}

// Έλεγχος αν το event έχει program_type
if (empty($event->program_type)) { // Έλεγχος αν το program_type είναι κενό
    http_response_code(500); // Internal Server Error if program type cannot be determined
    //echo json_encode(array("message" => "Αδυναμία προσδιορισμού τύπου προγράμματος."));
    echo json_encode(array("message" => "Αδυναμία προσδιορισμού τύπου προγράμματος για το event ID: " . $event->id));
    exit();
}

// Start a transaction
$db->beginTransaction();

try {
    // 1. Delete all bookings associated with this event
    $booking->event_id = $event->id;
    if (!$booking->deleteByEvent()) {
        // If deleteByEvent fails, it should ideally throw an exception or return false
        // Rollback and throw an error
        $db->rollBack();
        http_response_code(503); // Service unavailable
        echo json_encode(array("message" => "Αδυναμία διαγραφής κρατήσεων event."));
        exit();
    }

    // 2. Check program type (τώρα από το $event->program_type) and decide whether to delete the event
    if ($event->program_type === 'group') { // Χρήση του $event->program_type
        // If it's a group program, delete the event itself
        if ($event->delete()) {
            // Commit the transaction
            $db->commit();
            http_response_code(200);
            // Προσθέτουμε refresh: true για να ανανεώσει ο client
            echo json_encode(array("message" => "Το ομαδικό event και οι κρατήσεις του διαγράφηκαν επιτυχώς.", "refresh" => true)); 
        } else {
            // If event deletion fails, rollback
            $db->rollBack();
            http_response_code(503); // Service unavailable
            echo json_encode(array("message" => "Αδυναμία διαγραφής ομαδικού event."));
        }
    } elseif ($event->program_type === 'individual') { // Χρήση του $event->program_type
        // If it's an individual program, only bookings are deleted. The event remains.
        // Commit the transaction as bookings deletion was successful
        $db->commit();
        http_response_code(200);
        // Δεν χρειάζεται πλήρες refresh, μόνο επανασχεδιασμός
        echo json_encode(array("message" => "Οι κρατήσεις για το ατομικό event διαγράφηκαν επιτυχώς.", "refresh" => false)); 
    } else {
        // Should not happen if program type check above is correct, but as a fallback
        $db->rollBack();
        http_response_code(500);
        // Εμφάνιση του τύπου για debugging
        echo json_encode(array("message" => "Άγνωστος τύπος προγράμματος: " . $event->program_type)); 
    }

} catch (Exception $e) {
    // Catch any other exceptions during the transaction
    $db->rollBack();
    http_response_code(500);
    echo json_encode(array("message" => "Προέκυψε σφάλμα κατά τη διαγραφή.", "error" => $e->getMessage()));
}
?>