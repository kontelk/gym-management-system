<?php
// =================================================================
// Model για την οντότητα Booking
// =================================================================

class Booking {
    private $conn;
    private $table_name = "bookings";

    public $id;
    public $user_id;
    public $event_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Δημιουργεί μια νέα κράτηση, αφού εκτελέσει όλους τους απαραίτητους ελέγχους.
     * @return array Ένα array με 'success' (true/false) και 'message' (το μήνυμα προς τον χρήστη).
     */
    public function create() {
        // Ξεκινάμε μια συναλλαγή (transaction) για να διασφαλίσουμε την ακεραιότητα των δεδομένων.
        // Αν οποιοσδήποτε έλεγχος αποτύχει, όλες οι αλλαγές θα αναιρεθούν (rollback).
        $this->conn->beginTransaction();

        try {
            // Έλεγχος 1: Υπάρχει το event και είναι γεμάτο; (Κλειδώνουμε τη γραμμή με FOR UPDATE)
            $query = "SELECT max_capacity FROM events WHERE id = :event_id FOR UPDATE";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':event_id', $this->event_id);
            $stmt->execute();
            $event = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$event) {
                throw new Exception("Το επιλεγμένο ραντεβού δεν υπάρχει.");
            }

            $query = "SELECT COUNT(*) as confirmed_bookings FROM bookings WHERE event_id = :event_id AND status = 'confirmed'";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':event_id', $this->event_id);
            $stmt->execute();
            $booking_count = $stmt->fetch(PDO::FETCH_ASSOC)['confirmed_bookings'];

            // if ($booking_count >= $event['max_capacity']) {         // εγινε refactoring για να μην ελέγχεται το max_capacity αν είναι NULL
            //     throw new Exception("Το τμήμα είναι ήδη γεμάτο.");
            // }
            
            // Έλεγχος χωρητικότητας μόνο αν το max_capacity ΔΕΝ είναι NULL
            if ($event['max_capacity'] !== null && $booking_count >= $event['max_capacity']) {
                throw new Exception("Το τμήμα είναι ήδη γεμάτο.");
            }

            // Έλεγχος 2: Έχει ο χρήστης ξεπεράσει το όριο ακυρώσεων;
            if ($this->hasExceededWeeklyCancellationLimit()) {
                throw new Exception("Έχετε υπερβεί το επιτρεπόμενο όριο ακυρώσεων για αυτή την εβδομάδα.");
            }
            
            // Αν όλοι οι έλεγχοι είναι εντάξει, προχωράμε στην εισαγωγή.
            $insert_query = "INSERT INTO " . $this->table_name . " SET user_id=:user_id, event_id=:event_id";
            $stmt = $this->conn->prepare($insert_query);

            // Απολύμανση
            $this->user_id = htmlspecialchars(strip_tags($this->user_id));
            $this->event_id = htmlspecialchars(strip_tags($this->event_id));

            $stmt->bindParam(':user_id', $this->user_id);
            $stmt->bindParam(':event_id', $this->event_id);

            $stmt->execute();
            
            // Ολοκλήρωση της συναλλαγής
            $this->conn->commit();
            return ['success' => true, 'message' => 'Η κράτηση ολοκληρώθηκε με επιτυχία.'];

        } catch (PDOException $e) {
            // Αν η εισαγωγή αποτύχει λόγω περιορισμού (π.χ. ο χρήστης έχει ήδη κλείσει αυτό το ραντεβού)
            $this->conn->rollBack();
            if ($e->errorInfo[1] == 1062) { // 1062 είναι ο κωδικός για duplicate entry
                return ['success' => false, 'message' => 'Έχετε ήδη κλείσει αυτό το ραντεβού.'];
            }
            return ['success' => false, 'message' => 'Προέκυψε ένα σφάλμα στη βάση δεδομένων.'];
        } catch (Exception $e) {
            // Αν αποτύχει κάποιος από τους δικούς μας ελέγχους
            $this->conn->rollBack();
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Ελέγχει αν ο χρήστης έχει κάνει 2 ή περισσότερες ακυρώσεις την τρέχουσα εβδομάδα (Δευτέρα-Κυριακή).
     * @return bool
     */
    private function hasExceededWeeklyCancellationLimit() {
        $query = "SELECT COUNT(b.id) as weekly_cancellations
                  FROM bookings b
                  JOIN events e on b.event_id = e.id
                  WHERE b.user_id = :user_id
                    AND b.status = 'cancelled_by_user'
                    AND YEARWEEK(e.start_time, 1) = YEARWEEK(CURDATE(), 1)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();

        $cancellations = $stmt->fetch(PDO::FETCH_ASSOC)['weekly_cancellations'];

        return $cancellations >= 2;
    }


    /**
     * Διαβάζει όλες τις κρατήσεις για έναν συγκεκριμένο χρήστη.
     * @return PDOStatement
     */
    public function readByUserId() {
        $query = "SELECT
                    b.id AS booking_id,
                    p.name AS program_name,
                    e.start_time,
                    b.status
                  FROM
                    " . $this->table_name . " b
                  JOIN
                    events e ON b.event_id = e.id
                  JOIN
                    programs p ON e.program_id = p.id
                  WHERE
                    b.user_id = :user_id
                  ORDER BY
                    e.start_time DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();
        
        return $stmt;
    }

    /**
     * Ακυρώνει μια κράτηση, αν πληρούνται οι προϋποθέσεις (π.χ. >2 ώρες πριν).
     * @return array Ένα array με 'success' (true/false) και 'message'.
     */
    public function cancel() {
        // Έλεγχος αν ο χρήστης μπορεί να ακυρώσει
        $query = "SELECT e.start_time 
                  FROM " . $this->table_name . " b
                  JOIN events e ON b.event_id = e.id
                  WHERE b.id = :booking_id AND b.user_id = :user_id AND b.status = 'confirmed'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':booking_id', $this->id);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();
        
        $booking_to_cancel = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$booking_to_cancel) {
            return ['success' => false, 'message' => 'Η κράτηση δεν βρέθηκε ή δεν μπορείτε να την ακυρώσετε.'];
        }

        // Έλεγχος του κανόνα των 2 ωρών
        $event_time = new DateTime($booking_to_cancel['start_time']);
        $now = new DateTime();
        $interval = $now->diff($event_time);
        $hours_diff = $interval->h + ($interval->days * 24);

        if ($now > $event_time || $hours_diff < 2) {
             return ['success' => false, 'message' => 'Η ακύρωση δεν επιτρέπεται λιγότερο από 2 ώρες πριν την έναρξη του ραντεβού.'];
        }

        // Αν όλα είναι ΟΚ, προχωράμε στην ακύρωση
        $update_query = "UPDATE " . $this->table_name . " SET status = 'cancelled_by_user' WHERE id = :booking_id";
        $stmt = $this->conn->prepare($update_query);
        $stmt->bindParam(':booking_id', $this->id);

        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Η κράτηση ακυρώθηκε με επιτυχία.'];
        }
        
        return ['success' => false, 'message' => 'Προέκυψε σφάλμα κατά την ακύρωση.'];
    }


}