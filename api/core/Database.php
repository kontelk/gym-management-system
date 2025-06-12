<?php
// =================================================================
// Κλάση Singleton για τη διαχείριση της σύνδεσης με τη Βάση Δεδομένων
// =================================================================

class Database {
    // Αποθηκεύει το μοναδικό instance της κλάσης.
    private static $instance = null;
    
    // Αποθηκεύει το αντικείμενο της σύνδεσης PDO.
    private $conn;

    /**
     * Ο constructor είναι private για να μην μπορεί να δημιουργηθεί νέο instance
     * με το 'new'. Η δημιουργία γίνεται μόνο μέσω της μεθόδου getInstance().
     */
    private function __construct() {
        // Συμπεριλαμβάνουμε το αρχείο ρυθμίσεων.
        require_once __DIR__ . '/../config/app_config.php';

        // DSN (Data Source Name) string για τη σύνδεση.
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';

        // Επιλογές για τη σύνδεση PDO.
        $options = [
            // Ρίχνει exceptions σε περίπτωση σφάλματος για καλύτερο error handling.
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            // Επιστρέφει τα αποτελέσματα ως associative arrays by default.
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Απενεργοποιεί την εξομοίωση των prepared statements για μεγαλύτερη ασφάλεια.
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            // Δημιουργία του αντικειμένου PDO.
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Σε περίπτωση σφάλματος σύνδεσης, διακόπτουμε την εκτέλεση και εμφανίζουμε μήνυμα.
            // Σε παραγωγικό περιβάλλον (production), θα καταγράφαμε το σφάλμα σε log file αντί να το εμφανίζουμε.
            die('Σφάλμα Σύνδεσης με τη Βάση Δεδομένων: ' . $e->getMessage());
        }
    }

    /**
     * Η στατική μέθοδος που ελέγχει αν υπάρχει ήδη ένα instance.
     * Αν όχι, το δημιουργεί. Στη συνέχεια, το επιστρέφει.
     *
     * @return Database Το μοναδικό instance της κλάσης Database.
     */
    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /**
     * Επιστρέφει το αντικείμενο της σύνδεσης PDO.
     *
     * @return PDO Το αντικείμενο της σύνδεσης.
     */
    public function getConnection() {
        return $this->conn;
    }
}