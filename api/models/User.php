<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $username;
    public $password;
    public $password_hash;
    public $role_id;
    public $status;
    public $email;
    public $first_name;
    public $last_name;
    public $country;
    public $city;
    public $address;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Βρίσκει έναν χρήστη με βάση το username του.
     * Επιστρέφει μόνο ενεργούς χρήστες που μπορούν να συνδεθούν.
     * @return array|false Τα δεδομένα του χρήστη ή false αν δεν βρεθεί.
     */
    public function findByUsername() {
        $query = "SELECT id, username, password_hash, role_id, status
                  FROM " . $this->table_name . "
                  WHERE username = :username AND status = 'active'
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        
        // Απολύμανση (sanitize) του username
        $this->username = htmlspecialchars(strip_tags($this->username));
        
        // Σύνδεση της παραμέτρου
        $stmt->bindParam(':username', $this->username);
        
        $stmt->execute();
        
        $user_data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $user_data;
    }

        /**
     * Βρίσκει έναν χρήστη με βάση το ID του.
     * @return void
     */
    public function readOne() {
        $query = "SELECT id, username, email, first_name, last_name, country, city, address
                  FROM " . $this->table_name . "
                  WHERE id = :id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            // Ορισμός των ιδιοτήτων του αντικειμένου
            $this->username = $row['username'];
            $this->email = $row['email'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->country = $row['country'];
            $this->city = $row['city'];
            $this->address = $row['address'];
        }
    }    

    /**
     * Ελέγχει και δημιουργεί μια νέα εγγραφή χρήστη.
     * @return bool|array True σε επιτυχία, ή ένα array με τα σφάλματα validation.
     */
    public function register() {
        $errors = [];

        // --- Έλεγχοι Εγκυρότητας ---
        if (strlen(trim($this->username)) < 5) {
            $errors['username'] = 'Το όνομα χρήστη πρέπει να έχει τουλάχιστον 5 χαρακτήρες.';
        }
        if ($this->isUsernameTaken()) {
            $errors['username'] = 'Αυτό το όνομα χρήστη χρησιμοποιείται ήδη.';
        }
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Η διεύθυνση email δεν είναι έγκυρη.';
        }
        if ($this->isEmailTaken()) {
            $errors['email'] = 'Αυτή η διεύθυνση email χρησιμοποιείται ήδη.';
        }
        if (strlen($this->password) < 8) {
            $errors['password'] = 'Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες.';
        }

        // Αν υπάρχουν σφάλματα, τα επιστρέφουμε και σταματάμε
        if (!empty($errors)) {
            return $errors;
        }

        // Αν δεν υπάρχουν σφάλματα, συνεχίζουμε με την εισαγωγή στη βάση
        $query = "INSERT INTO " . $this->table_name . "
                  SET
                    username=:username, email=:email, password_hash=:password_hash,
                    first_name=:first_name, last_name=:last_name, country=:country,
                    city=:city, address=:address";

        $stmt = $this->conn->prepare($query);

        // Απολύμανση (Sanitize) των δεδομένων
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->country = htmlspecialchars(strip_tags($this->country));
        $this->city = htmlspecialchars(strip_tags($this->city));
        $this->address = htmlspecialchars(strip_tags($this->address));
        
        // Hashing του κωδικού πριν την αποθήκευση
        $this->password_hash = password_hash($this->password, PASSWORD_BCRYPT);

        // Σύνδεση των παραμέτρων
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password_hash", $this->password_hash);
        $stmt->bindParam(":first_name", $this->first_name);
        $stmt->bindParam(":last_name", $this->last_name);
        $stmt->bindParam(":country", $this->country);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":address", $this->address);

        // Εκτέλεση του query
        if ($stmt->execute()) {
            return true;
        }

        return ['database' => 'Προέκυψε ένα σφάλμα κατά την εγγραφή στη βάση δεδομένων.'];
    }

    /**
     * Ελέγχει αν ένα username υπάρχει ήδη.
     * @return bool
     */
    private function isUsernameTaken() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE username = :username LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $this->username);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    /**
     * Ελέγχει αν ένα email υπάρχει ήδη.
     * @return bool
     */
    private function isEmailTaken() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    /**
     * Διαβάζει όλους τους χρήστες που έχουν status 'pending_approval'.
     * @return PDOStatement Το αποτέλεσμα του query.
     */
    public function readPending() {
        $query = "SELECT id, username, email, first_name, last_name, country, city, created_at
                  FROM " . $this->table_name . "
                  WHERE status = 'pending_approval'
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }

    /**
     * Εγκρίνει έναν χρήστη, αλλάζοντας το status του σε 'active' και ορίζοντας τον ρόλο του.
     * @return bool True αν η ενημέρωση ήταν επιτυχής, αλλιώς false.
     */
    public function approve() {
        $query = "UPDATE " . $this->table_name . "
                  SET status = 'active', role_id = :role_id
                  WHERE id = :id AND status = 'pending_approval'";

        $stmt = $this->conn->prepare($query);

        // Απολύμανση
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->role_id = htmlspecialchars(strip_tags($this->role_id));

        // Σύνδεση παραμέτρων
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':role_id', $this->role_id);

        if ($stmt->execute()) {
            // Ελέγχουμε αν όντως έγινε η αλλαγή (αν υπήρχε χρήστης με αυτό το id και status)
            if ($stmt->rowCount() > 0) {
                return true;
            }
        }

        return false;
    }
    

    /**
     * Διαβάζει όλους τους χρήστες από τη βάση δεδομένων.
     * @return PDOStatement Το αποτέλεσμα του query.
     */
    public function readAll() {
        $query = "SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.status, r.role_name
                  FROM " . $this->table_name . " u
                  LEFT JOIN roles r ON u.role_id = r.id
                  ORDER BY u.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }


    
}