<?php
// =================================================================
// Endpoint: /events/delete.php (Protected, Admin Only)
// Method: POST
// Χρήση: Διαγράφει ένα event (προγραμματισμένη συνεδρία) και τις κρατήσεις του.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/Event.php';
include_once API_ROOT . '/models/Booking.php';
include_once API_ROOT . '/models/Program.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


// Get database connection
$database = Database::getInstance(); // <-- Χρησιμοποιούμε τη static μέθοδο getInstance()
$db = $database->getConnection();

// Αρχικοποιούμε τα αντικείμενα για τα μοντέλα Event, Booking, Program και User
$event = new Event($db);
$booking = new Booking($db);
$program = new Program($db);

// Διαβάζουμε τα posted data
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
    http_response_code(500); // Internal Server Error εάν δεν μπορεί να προσδιοριστεί ο τύπος
    echo json_encode(array("message" => "Αδυναμία προσδιορισμού τύπου προγράμματος για το event ID: " . $event->id));
    exit();
}

// Start a transaction
$db->beginTransaction();

try {
    // Αν το event έχει κρατήσεις, θα πρέπει να διαγραφούν πρώτα
    $booking->event_id = $event->id;
    if (!$booking->deleteByEvent()) {
        // Αν η διαγραφή των κρατήσεων αποτύχει, θα πρέπει να γίνει rollback
        // Κάνε rollback και στείλε μήνυμα σφάλματος
        $db->rollBack();
        http_response_code(503); // Service unavailable
        echo json_encode(array("message" => "Αδυναμία διαγραφής κρατήσεων event."));
        exit();
    }
    // Αν το event είναι ομαδικό, θα διαγραφεί και το ίδιο το event
    // Αν είναι ατομικό, θα διαγραφούν μόνο οι κρατήσεις του,
    if ($event->program_type === 'group') { // Χρήση του $event->program_type
        // εάν το event είναι ομαδικό, διαγράφουμε και το event
        if ($event->delete()) {
            // Commit the transaction
            $db->commit();
            http_response_code(200);
            // Προσθέτουμε refresh: true για να ανανεώσει ο client
            echo json_encode(array("message" => "Το ομαδικό event και οι κρατήσεις του διαγράφηκαν επιτυχώς.", "refresh" => true)); 
        } else {
            // εάν η διαγραφή του event αποτύχει, κάνε rollback και στείλε μήνυμα σφάλματος
            $db->rollBack();
            http_response_code(503); // Service unavailable
            echo json_encode(array("message" => "Αδυναμία διαγραφής ομαδικού event."));
        }
    } elseif ($event->program_type === 'individual') { // Χρήση του $event->program_type
        // Εάν το event είναι ατομικό, διαγράφουμε μόνο τις κρατήσεις
        // Commit the transaction εάν οι κρατήσεις διαγράφηκαν επιτυχώς
        $db->commit();
        http_response_code(200);
        // Δεν χρειάζεται πλήρες refresh στον client, απλά ενημερώνουμε ότι οι κρατήσεις διαγράφηκαν
        echo json_encode(array("message" => "Οι κρατήσεις για το ατομικό event διαγράφηκαν επιτυχώς.", "refresh" => false)); 
    } else {
        // Εάν ο τύπος του προγράμματος δεν είναι έγκυρος, κάνε rollback και στείλε μήνυμα σφάλματος
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