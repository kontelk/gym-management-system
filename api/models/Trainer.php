<?php
// =================================================================
// Model για την οντότητα Trainer
// Χρήση: Διαχείριση γυμναστών για το σύστημα.
// =================================================================

class Trainer {
    private $conn;
    private $table_name = "trainers";

    public $id;
    public $first_name;
    public $last_name;
    public $bio;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Διαβάζει όλους τους γυμναστές
    public function readAll() {
        $query = "SELECT id, first_name, last_name, bio FROM " . $this->table_name . " ORDER BY last_name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
    
    // Διαβάζει έναν γυμναστή
    public function readOne() {
        $query = "SELECT first_name, last_name, bio FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->bio = $row['bio'];
        }
    }

    // Δημιουργεί έναν νέο γυμναστή
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " SET first_name=:first_name, last_name=:last_name, bio=:bio";
        $stmt = $this->conn->prepare($query);
        // Sanitize
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->bio = htmlspecialchars(strip_tags($this->bio));
        // Bind
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":bio", $this->bio);
        return $stmt->execute();
    }

    // Ενημερώνει έναν γυμναστή
    public function update() {
        $query = "UPDATE " . $this->table_name . " SET first_name = :first_name, last_name = :last_name, bio = :bio WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        // Sanitize & Bind
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->bio = htmlspecialchars(strip_tags($this->bio));
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(':first_name', $this->first_name);
        $stmt->bindParam(':last_name', $this->last_name);
        $stmt->bindParam(':bio', $this->bio);
        $stmt->bindParam(':id', $this->id);
        return $stmt->execute();
    }

    // Διαγράφει έναν γυμναστή
    public function delete() {
        // Η βάση είναι ρυθμισμένη ώστε όταν διαγραφεί ένας γυμναστής, το trainer_id στα events να γίνεται NULL.
        // Αυτή η συμπεριφορά είναι ασφαλής.
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);
        return $stmt->execute();
    }
    
}