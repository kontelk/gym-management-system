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
     * Δημιουργεί μια νέα εγγραφή χρήστη με status 'pending_approval'.
     * @return bool True αν η εγγραφή ήταν επιτυχής, αλλιώς false.
     */
    public function register() {
        // Query για την εισαγωγή νέου χρήστη.
        // Ο ρόλος είναι NULL και το status είναι 'pending_approval' εξ ορισμού.
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

        return false;
    }
    
}