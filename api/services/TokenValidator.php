<?php
// =================================================================
// Service για την επικύρωση του JSON Web Token
// =================================================================

// Απαιτείται ο autoloader του Composer για να βρει την κλάση JWT
require_once __DIR__ . '/../../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class TokenValidator {
    
    /**
     * Επικυρώνει το JWT που παρέχεται στα headers του request.
     *
     * @return array|null Επιστρέφει τα δεδομένα του χρήστη από το token αν είναι έγκυρο, αλλιώς null.
     */
    public static function validate() {
        // Συμπερίληψη των ρυθμίσεων για το JWT
        include_once __DIR__ . '/../config/app_config.php';

        // Λήψη του JWT από το Authorization header
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!$authHeader) {
            http_response_code(401); // Unauthorized
            echo json_encode(array("message" => "Δεν παρασχέθηκε διακριτικό πρόσβασης (token)."));
            exit();
        }

        // Το header είναι συνήθως "Bearer <token>". Χρειαζόμαστε μόνο το <token>.
        list($jwt) = sscanf($authHeader, 'Bearer %s');

        if (!$jwt) {
            http_response_code(401); // Unauthorized
            echo json_encode(array("message" => "Το διακριτικό πρόσβασης (token) έχει λανθασμένη μορφή."));
            exit();
        }

        try {
            // Αποκωδικοποίηση του token
            $decoded = JWT::decode($jwt, new Key(JWT_SECRET_KEY, 'HS256'));
            
            // Το token είναι έγκυρο, επιστρέφουμε τα δεδομένα του χρήστη
            return (array) $decoded->data;

        } catch (Exception $e) {
            // Αν το token είναι άκυρο (π.χ. έχει λήξει, λάθος υπογραφή)
            http_response_code(401); // Unauthorized
            echo json_encode(array(
                "message" => "Η πρόσβαση απαγορεύεται. Το διακριτικό είναι άκυρο.",
                "error" => $e->getMessage()
            ));
            exit();
        }
    }
}