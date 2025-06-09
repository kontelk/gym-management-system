<?php
// =================================================================
// Service για την επικύρωση του Ρόλου του Χρήστη
// =================================================================

class RoleValidator {
    
    /**
     * Ελέγχει αν ο χρήστης έχει τον απαιτούμενο ρόλο.
     *
     * @param int $user_role_id Το ID του ρόλου του συνδεδεμένου χρήστη (από το token).
     * @param int $required_role_id Το ID του ρόλου που απαιτείται για την πρόσβαση. (1=admin, 2=registered_user)
     * @return void Αν ο έλεγχος αποτύχει, διακόπτει την εκτέλεση με σφάλμα 403.
     */
    public static function validate($user_role_id, $required_role_id) {
        if ($user_role_id != $required_role_id) {
            http_response_code(403); // 403 Forbidden
            echo json_encode(array("message" => "Η πρόσβαση απαγορεύεται. Δεν έχετε τα απαραίτητα δικαιώματα."));
            exit();
        }
    }
}