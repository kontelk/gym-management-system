<?php
// =================================================================
// Endpoint: /programs/update.php (Protected, Admin Only)
// Method: POST
// Περιγραφή: Ενημερώνει ένα υπάρχον πρόγραμμα.
// =================================================================

// Απαιτούμενες κεφαλίδες
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// Συμπερίληψη αρχείων
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Program.php';
include_once __DIR__ . '/../../services/TokenValidator.php';
include_once __DIR__ . '/../../services/RoleValidator.php';

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
    // !empty($data->id) &&
    // !empty($data->name) &&
    // !empty($data->type) &&
    // isset($data->is_active) // Το is_active μπορεί να είναι false, οπότε ελέγχουμε με isset

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