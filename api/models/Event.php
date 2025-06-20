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
    public $date;
    
    

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
                    (available_slots > 0 or e.max_capacity IS NULL) -- Ελέγχουμε αν υπάρχουν διαθέσιμες θέσεις ή αν η μέγιστη χωρητικότητα είναι NULL (π.χ. για ατομικά προγράμματα)
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

    // /**
    //  * Διαβάζει όλα τα events για μια συγκεκριμένη χρονική περίοδο (π.χ. εβδομάδα).
    //  * @param string $start_date
    //  * @param string $end_date
    //  * @return PDOStatement
    //  */
    // public function readByDateRange($start_date, $end_date) {
    //     // $query = "SELECT
    //     //             e.id, p.name AS program_name, CONCAT(t.first_name, ' ', t.last_name) AS trainer_name,
    //     //             e.start_time, e.end_time, e.max_capacity, COUNT(b.id) AS current_bookings
    //     //           FROM " . $this->table_name . " e
    //     //           JOIN programs p ON e.program_id = p.id
    //     //           LEFT JOIN trainers t ON e.trainer_id = t.id
    //     //           LEFT JOIN bookings b ON e.id = b.event_id AND b.status = 'confirmed'
    //     //           WHERE DATE(e.start_time) BETWEEN :start_date AND :end_date
    //     //           GROUP BY e.id
    //     //           ORDER BY e.start_time ASC";
    //     // $query = "SELECT
    //     //             e.id, p.name AS program_name, p.type AS program_type, 
    //     //             CONCAT(t.first_name, ' ', t.last_name) AS trainer_name,
    //     //             e.start_time, e.end_time, e.max_capacity, COUNT(b.id) AS current_bookings
    //     //           FROM " . $this->table_name . " e
    //     //           JOIN programs p ON e.program_id = p.id
    //     //           LEFT JOIN trainers t ON e.trainer_id = t.id
    //     //           LEFT JOIN bookings b ON e.id = b.event_id AND b.status = 'confirmed'
    //     //           WHERE DATE(e.start_time) BETWEEN :start_date AND :end_date
    //     //           GROUP BY e.id
    //     //           ORDER BY e.start_time ASC";
    //     $query = "SELECT
    //                 e.id, p.name AS program_name, p.type AS program_type, CONCAT(t.first_name, ' ', t.last_name) AS trainer_name,
    //                 e.start_time, e.end_time, e.max_capacity, COUNT(b.id) AS current_bookings
    //               FROM
    //                 " . $this->table_name . " e
    //               JOIN
    //                 programs p ON e.program_id = p.id
    //               LEFT JOIN
    //                 trainers t ON e.trainer_id = t.id
    //               LEFT JOIN
    //                 bookings b ON e.id = b.event_id AND b.status = 'confirmed'
    //               WHERE
    //                 DATE(e.start_time) BETWEEN :start_date AND :end_date
    //               GROUP BY
    //                 e.id
    //               HAVING
    //                 (p.type = 'group') OR (COUNT(b.id) > 0)
    //               ORDER BY
    //                 e.start_time ASC";
    //     $stmt = $this->conn->prepare($query);
    //     $stmt->bindParam(':start_date', $start_date);
    //     $stmt->bindParam(':end_date', $end_date);
    //     $stmt->execute();
    //     return $stmt;
    // }




    /**
     * Διαβάζει όλα τα events για μια συγκεκριμένη χρονική περίοδο,
     * συμπεριλαμβάνοντας και τη λίστα των χρηστών που έχουν κάνει κράτηση.
     * @param string $start_date
     * @param string $end_date
     * @return array
     */
    public function readByDateRange($start_date, $end_date) {
        // Βήμα 1: Παίρνουμε όλα τα events της περιόδου
        $query = "SELECT
                    e.id, p.name AS program_name, p.type AS program_type, CONCAT(t.first_name, ' ', t.last_name) AS trainer_name,
                    e.start_time, e.end_time, e.max_capacity
                  FROM " . $this->table_name . " e
                  JOIN programs p ON e.program_id = p.id
                  LEFT JOIN trainers t ON e.trainer_id = t.id
                  WHERE DATE(e.start_time) BETWEEN :start_date AND :end_date
                  ORDER BY e.start_time ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':start_date', $start_date);
        $stmt->bindParam(':end_date', $end_date);
        $stmt->execute();
        
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($events) === 0) {
            return [];
        }

        // Βήμα 2: Παίρνουμε τα IDs όλων των events που βρήκαμε
        $event_ids = array_column($events, 'id');
        $placeholders = implode(',', array_fill(0, count($event_ids), '?'));

        // Βήμα 3: Παίρνουμε όλες τις κρατήσεις για αυτά τα events με μία κλήση στη βάση
        $booking_query = "SELECT
                            b.event_id, u.first_name, u.last_name
                          FROM bookings b
                          JOIN users u ON b.user_id = u.id
                          WHERE b.event_id IN (" . $placeholders . ") AND b.status = 'confirmed'";
                          
        $stmt_bookings = $this->conn->prepare($booking_query);
        $stmt_bookings->execute($event_ids);
        
        $bookings = $stmt_bookings->fetchAll(PDO::FETCH_ASSOC);

        // Βήμα 4: Ομαδοποιούμε τις κρατήσεις ανά event_id για εύκολη πρόσβαση
        $bookings_by_event = [];
        foreach ($bookings as $booking) {
            $bookings_by_event[$booking['event_id']][] = $booking;
        }

        // Βήμα 5: Ενσωματώνουμε τις κρατήσεις και το πλήθος τους σε κάθε event
        foreach ($events as &$event) { // Ο τελεστής & επιτρέπει την τροποποίηση του πίνακα "in-place"
            $event_bookings = $bookings_by_event[$event['id']] ?? [];
            $event['bookings'] = $event_bookings;
            $event['current_bookings'] = count($event_bookings);
        }

        // Βήμα 6 (Τελικό Φιλτράρισμα): Εφαρμόζουμε τον κανόνα που θέσαμε προηγουμένως
        $filtered_events = array_filter($events, function($event) {
            return ($event['program_type'] === 'group' || $event['current_bookings'] > 0);
        });

        // Επιστρέφουμε τα φιλτραρισμένα events
        return array_values($filtered_events); // array_values για να μην έχουμε "κενά" στα keys
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




    /**
     * Διασφαλίζει ότι υπάρχουν ωριαία slots για ένα ατομικό πρόγραμμα σε μια ημερομηνία,
     * δημιουργώντας τα αν δεν υπάρχουν.
     * @param int $program_id
     * @param string $date
     * @return void
     */
    public function ensureIndividualSlotsExist($program_id, $date) {
        // Έλεγχος αν υπάρχουν ήδη slots για αυτό το πρόγραμμα και αυτή την ημερομηνία
        $check_query = "SELECT COUNT(id) as count FROM " . $this->table_name . " WHERE program_id = :program_id AND DATE(start_time) = :search_date";
        $stmt_check = $this->conn->prepare($check_query);
        $stmt_check->bindParam(':program_id', $program_id);
        $stmt_check->bindParam(':search_date', $date);
        $stmt_check->execute();
        
        $count = $stmt_check->fetch(PDO::FETCH_ASSOC)['count'];

        // Αν δεν υπάρχουν (count == 0), τα δημιουργούμε
        if ($count == 0) {
            $this->conn->beginTransaction();
            try {
                $insert_query = "INSERT INTO " . $this->table_name . " (program_id, start_time, end_time, max_capacity) VALUES (:program_id, :start_time, :end_time, 20)";
                $stmt_insert = $this->conn->prepare($insert_query);
                
                // Δημιουργία ωριαίων slots από τις 08:00 έως τις 22:00
                for ($hour = 8; $hour <= 21; $hour++) {
                    $start_hour = str_pad($hour, 2, '0', STR_PAD_LEFT);
                    $end_hour = str_pad($hour + 1, 2, '0', STR_PAD_LEFT);
                    
                    $start_time = $date . ' ' . $start_hour . ':00:00';
                    $end_time = $date . ' ' . $end_hour . ':00:00';
                    
                    $stmt_insert->bindParam(':program_id', $program_id);
                    $stmt_insert->bindParam(':start_time', $start_time);
                    $stmt_insert->bindParam(':end_time', $end_time);
                    $stmt_insert->execute();
                }
                $this->conn->commit();
            } catch (Exception $e) {
                $this->conn->rollBack();
                // Μπορούμε να χειριστούμε το σφάλμα, π.χ. με logging
            }
        }
    }


    
}