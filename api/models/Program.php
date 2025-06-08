<?php
// =================================================================
// Model για την οντότητα Program
// =================================================================

class Program {
    // Σύνδεση με τη βάση δεδομένων και όνομα του πίνακα
    private $conn;
    private $table_name = "programs";

    // Ιδιότητες του αντικειμένου
    public $id;
    public $name;
    public $description;
    public $type;
    public $is_active;

    /**
     * Constructor που δέχεται το αντικείμενο της σύνδεσης με τη βάση.
     * @param PDO $db Το αντικείμενο σύνδεσης PDO.
     */
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Μέθοδος για την ανάγνωση όλων των ενεργών προγραμμάτων.
     * @return PDOStatement Το αποτέλεσμα του query για επεξεργασία.
     */
    public function readAllActive() {
        // Το query για την επιλογή όλων των ενεργών προγραμμάτων
        $query = "SELECT
                    id, name, description, type
                  FROM
                    " . $this->table_name . "
                  WHERE
                    is_active = TRUE
                  ORDER BY
                    name ASC";

        // Προετοιμασία του query statement
        $stmt = $this->conn->prepare($query);

        // Εκτέλεση του query
        $stmt->execute();

        return $stmt;
    }
}