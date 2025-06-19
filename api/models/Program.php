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
    public $max_capacity;

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





    /**
     * Διαβάζει τις πληροφορίες ενός μόνο προγράμματος με βάση το ID.
     */
    public function readOne() {
        // Προσθέτουμε το πεδίο is_active στο SELECT
        $query = "SELECT id, name, description, type, is_active FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->name = $row['name'];
            $this->description = $row['description'];
            $this->type = $row['type'];
            $this->is_active = $row['is_active'];
        }
    }






    /**
     * Δημιουργεί ένα νέο πρόγραμμα.
     * @return bool True αν η δημιουργία ήταν επιτυχής, αλλιώς false.
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET name=:name, description=:description, 
                      type=:type, is_active=:is_active,
                      max_capacity=:max_capacity";
        $stmt = $this->conn->prepare($query);

        // Απολύμανση
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->is_active = $this->is_active ? 1 : 0;  // Μετατρέπουμε σε 1 ή 0 για αποθήκευση
        $this->max_capacity = isset($this->max_capacity) ? (int)$this->max_capacity : 20; // Default if not set

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":is_active", $this->is_active);
        $stmt->bindParam(":max_capacity", $this->max_capacity);

        return $stmt->execute();
    }

    /**
     * Ενημερώνει ένα υπάρχον πρόγραμμα.
     * @return bool True αν η ενημέρωση ήταν επιτυχής, αλλιώς false.
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET name = :name, description = :description, 
                      type = :type, is_active = :is_active,
                      max_capacity = :max_capacity
                  WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        // Απολύμανση
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->is_active = $this->is_active ? 1 : 0;  // Μετατρέπουμε σε 1 ή 0 για αποθήκευση
        $this->max_capacity = isset($this->max_capacity) ? (int)$this->max_capacity : 20; // Default if not set
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':type', $this->type);
        $stmt->bindParam(':is_active', $this->is_active); 
        $stmt->bindParam(':max_capacity', $this->max_capacity);
        $stmt->bindParam(':id', $this->id);

        return $stmt->execute();
    }

    /**
     * Απενεργοποιεί ένα πρόγραμμα (soft delete).
     * @return bool True αν η απενεργοποίηση ήταν επιτυχής, αλλιώς false.
     */
    public function disable() {
        // Χρησιμοποιούμε soft delete για να μην χαθούν οι συνδέσεις με παλιές κρατήσεις.
        // Απλά θέτουμε το is_active σε FALSE.
        $query = "UPDATE " . $this->table_name . " SET is_active = FALSE WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $this->id=htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(':id', $this->id);
        
        return $stmt->execute();
    }

    /**
     * Διαβάζει όλα τα προγράμματα (ενεργά και ανενεργά) για τον διαχειριστή.
     * @return PDOStatement
     */
    public function readAllForAdmin() {
        $query = "SELECT id, name, description, type, max_capacity, is_active FROM " . $this->table_name . " ORDER BY id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }


}