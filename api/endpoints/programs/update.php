<?php
// =================================================================
// Endpoint: /programs/update.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Ενημερώνει ένα υπάρχον πρόγραμμα.
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
header("Access-Control-Allow-Methods: POST");


// --- Έλεγχος Αυθεντικοποίησης & Δικαιωμάτων ---
$user_data = TokenValidator::validate();
RoleValidator::validate($user_data['role_id'], 1); // 1 = Admin Role ID

// Αρχικοποίηση αντικειμένων
$database = Database::getInstance();
$db = $database->getConnection();
$program = new Program($db);

// Λήψη των δεδομένων
$data = json_decode(file_get_contents("php://input"));

// Έλεγχος ότι τα δεδομένα είναι πλήρη
if (
    isset($data->id, $data->name, $data->description, $data->type, $data->is_active, $data->max_capacity) &&
    filter_var($data->id, FILTER_VALIDATE_INT) !== false &&
    trim($data->name) !== '' &&
    trim($data->description) !== '' &&
    in_array($data->type, ['individual', 'group']) &&
    is_bool($data->is_active) &&
    filter_var($data->max_capacity, FILTER_VALIDATE_INT) !== false &&
    (int)$data->max_capacity >= 1
) {
    // Ορισμός των ιδιοτήτων του program object
    $program->id = $data->id;
    $program->name = $data->name;
    $program->description = $data->description;
    $program->type = $data->type;
    $program->is_active = $data->is_active;
    $program->max_capacity = (int)$data->max_capacity;

    // Προσπάθεια ενημέρωσης
    if ($program->update()) {
        http_response_code(200); // 200 OK
        echo json_encode(["message" => "Το πρόγραμμα ενημερώθηκε με επιτυχία."]);
    } else {
        http_response_code(503); // 503 Service Unavailable
        echo json_encode(["message" => "Αδυναμία ενημέρωσης του προγράμματος."]);
    }
} else {
    http_response_code(400); // 400 Bad Request
    echo json_encode(["message" => "Αδυναμία ενημέρωσης. Τα δεδομένα είναι ελλιπή."]);
}