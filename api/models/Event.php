<?php
// =================================================================
// Model για την οντότητα Event
// =================================================================

class Event {
    private $conn;
    private $table_name = "events";

    // Ιδιότητες του αντικειμένου
    public $id;
    public $program_id;
    public $trainer_id;
    public $start_time;
    public $end_time;
    public $max_capacity;
    
    

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Αναζητά διαθέσιμα events για ένα συγκεκριμένο πρόγραμμα και ημερομηνία.
     * Υπολογίζει δυναμικά τις ελεύθερες θέσεις.
     * @param int $program_id Το ID του προγράμματος.
     * @param string $date Η ημερομηνία σε μορφή 'YYYY-MM-DD'.
     * @return PDOStatement Το αποτέλεσμα του query.
     */
    public function searchAvailable($program_id, $date) {
        // Αυτό το query βρίσκει τα events και υπολογίζει τις διαθέσιμες θέσεις
        // αφαιρώντας τις επιβεβαιωμένες κρατήσεις (confirmed bookings) από τη μέγιστη χωρητικότητα.
        $query = "SELECT
                    e.id AS event_id,
                    p.name AS program_name,
                    e.start_time,
                    e.end_time,
                    e.max_capacity,
                    (e.max_capacity - COUNT(b.id)) AS available_slots
                  FROM
                    " . $this->table_name . " e
                  JOIN
                    programs p ON e.program_id = p.id
                  LEFT JOIN
                    bookings b ON e.id = b.event_id AND b.status = 'confirmed'
                  WHERE
                    e.program_id = :program_id
                    AND DATE(e.start_time) = :search_date
                  GROUP BY
                    e.id
                  HAVING
                    available_slots > 0
                  ORDER BY
                    e.start_time ASC";

        $stmt = $this->conn->prepare($query);

        // Απολύμανση
        $program_id = htmlspecialchars(strip_tags($program_id));
        $date = htmlspecialchars(strip_tags($date));

        // Σύνδεση παραμέτρων
        $stmt->bindParam(':program_id', $program_id);
        $stmt->bindParam(':search_date', $date);
        
        $stmt->execute();
        
        return $stmt;
    }
    

    /**
     * Δημιουργεί ένα νέο event.
     * @return bool
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET program_id=:program_id, trainer_id=:trainer_id, start_time=:start_time, end_time=:end_time, max_capacity=:max_capacity";
        $stmt = $this->conn->prepare($query);
        // Απολύμανση
        $this->program_id = htmlspecialchars(strip_tags($this->program_id));
        $this->trainer_id = htmlspecialchars(strip_tags($this->trainer_id));
        $this->start_time = htmlspecialchars(strip_tags($this->start_time));
        $this->end_time = htmlspecialchars(strip_tags($this->end_time));
        $this->max_capacity = htmlspecialchars(strip_tags($this->max_capacity));
        // Αν το trainer_id είναι κενό, το θέτουμε σε NULL
        if (empty($this->trainer_id)) $this->trainer_id = null;
        // Σύνδεση παραμέτρων
        $stmt->bindParam(":program_id", $this->program_id);
        $stmt->bindParam(":trainer_id", $this->trainer_id);
        $stmt->bindParam(":start_time", $this->start_time);
        $stmt->bindParam(":end_time", $this->end_time);
        $stmt->bindParam(":max_capacity", $this->max_capacity);
        return $stmt->execute();
    }

    /**
     * Διαβάζει όλα τα events για μια συγκεκριμένη χρονική περίοδο (π.χ. εβδομάδα).
     * @param string $start_date
     * @param string $end_date
     * @return PDOStatement
     */
    public function readByDateRange($start_date, $end_date) {
        $query = "SELECT
                    e.id, p.name AS program_name, CONCAT(t.first_name, ' ', t.last_name) AS trainer_name,
                    e.start_time, e.end_time, e.max_capacity, COUNT(b.id) AS current_bookings
                  FROM " . $this->table_name . " e
                  JOIN programs p ON e.program_id = p.id
                  LEFT JOIN trainers t ON e.trainer_id = t.id
                  LEFT JOIN bookings b ON e.id = b.event_id AND b.status = 'confirmed'
                  WHERE DATE(e.start_time) BETWEEN :start_date AND :end_date
                  GROUP BY e.id
                  ORDER BY e.start_time ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':start_date', $start_date);
        $stmt->bindParam(':end_date', $end_date);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Διαγράφει ένα event.
     * @return bool
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(':id', $this->id);
        // Προσοχή: Η διαγραφή ενός event θα διαγράψει και τις κρατήσεις του (ON DELETE CASCADE).
        // Ενημερώνουμε τον διαχειριστή για αυτό στο UI.
        return $stmt->execute();
    }





}