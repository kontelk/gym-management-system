<?php
// =================================================================
// Model για την οντότητα Event
// =================================================================

class Event {
    private $conn;
    private $table_name = "events";

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
}