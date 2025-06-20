<?php
// =================================================================
// Endpoint: /programs/read.php (Public)
// Method: GET
// Περιγραφή: Επιστρέφει μια λίστα με όλα τα ενεργά προγράμματα.
// =================================================================

// Απαιτούμενες κεφαλίδες (headers) για τη σωστή λειτουργία του API
header("Access-Control-Allow-Origin: *"); // Επιτρέπει την πρόσβαση από οποιαδήποτε πηγή
header("Content-Type: application/json; charset=UTF-8"); // Ορίζει τον τύπο της απάντησης σε JSON

// Συμπερίληψη των αρχείων για τη βάση δεδομένων και το model
include_once __DIR__ . '/../../core/Database.php';
include_once __DIR__ . '/../../models/Program.php';

// Δημιουργία instance της βάσης δεδομένων και λήψη της σύνδεσης
$database = Database::getInstance();
$db = $database->getConnection();

// Δημιουργία instance του Program model
$program = new Program($db);

// Κλήση της μεθόδου για την ανάγνωση των προγραμμάτων
$stmt = $program->readAllActive();
$num = $stmt->rowCount();

// Έλεγχος αν βρέθηκαν αποτελέσματα
if ($num > 0) {
    // Δημιουργία ενός πίνακα για τα προγράμματα
    $programs_arr = array();

    // Ανάκτηση των περιεχομένων του πίνακα
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Η extract($row) μετατρέπει το $row['name'] σε $name
        extract($row);

        $program_item = array(
            "id" => $id,
            "name" => $name,
            "description" => $description,
            "type" => $type
        );

        array_push($programs_arr, $program_item);
    }

    // Ορισμός του κωδικού απόκρισης - 200 OK
    http_response_code(200);

    // Εμφάνιση των δεδομένων σε μορφή JSON
    // Η επιλογή JSON_UNESCAPED_UNICODE είναι σημαντική για τη σωστή εμφάνιση των Ελληνικών
    echo json_encode($programs_arr, JSON_UNESCAPED_UNICODE);
} else {
    // Αν δεν βρεθούν προγράμματα
    // Ορισμός του κωδικού απόκρισης - 404 Not Found
    http_response_code(404);

    // Ενημέρωση του χρήστη
    echo json_encode(
        array("message" => "Δεν βρέθηκαν ενεργά προγράμματα.")
    );
}