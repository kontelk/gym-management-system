<?php
// =================================================================
// Endpoint: /events/create.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Δημιουργεί ένα νέο event (προγραμματισμένη συνεδρία).
// Η χωρητικότητα (capacity) ορίζεται σε 20 εξ ορισμού αν δεν δοθεί ή είναι άκυρη.
// =================================================================

// Φορτώνουμε το bootstrap αρχείο για να ρυθμίσουμε το περιβάλλον
// Αυτό θα φορτώσει τις ρυθμίσεις, τη βάση δεδομένων και τα μοντέλα
// Το bootstrap.php πρέπει να βρίσκεται στο φάκελο api/ 
require_once __DIR__ . '/../../bootstrap.php';
// Συμπερίληψη άλλων απαραίτητων αρχείων
include_once API_ROOT . '/models/Event.php';

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1); // Μόνο Admin (role_id 1)

$database = Database::getInstance();
$db = $database->getConnection();
$event = new Event($db);
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->program_id) &&
    !empty($data->date) &&
    !empty($data->start_time) &&
    !empty($data->end_time)
) {
    $event->program_id = $data->program_id;
    $event->date = $data->date;
    $event->start_time = $data->start_time;
    $event->end_time = $data->end_time;
    $event->trainer_id = !empty($data->trainer_id) ? $data->trainer_id : null;

    // Ορισμός χωρητικότητας: προεπιλογή 20 αν δεν δοθεί ή είναι άκυρη (π.χ. <=0)
    $event->max_capacity = (!empty($data->max_capacity) && filter_var($data->max_capacity, FILTER_VALIDATE_INT) && (int)$data->max_capacity > 0)
                       ? (int)$data->max_capacity : 20;

    if ($event->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Το event δημιουργήθηκε με χωρητικότητα " . $event->max_capacity . "."]);
    } else {
        http_response_code(503); // Service Unavailable
        echo json_encode(["message" => "Αδυναμία δημιουργίας του event."]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "Τα δεδομένα είναι ελλιπή. Απαιτούνται τουλάχιστον πρόγραμμα, ημερομηνία και ώρες."]);
}
?>