<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $username;
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
    
}