<?php
// =================================================================
// Model για την οντότητα Announcement
// Χρήση: Διαχείριση ανακοινώσεων για το σύστημα.
// =================================================================

class Announcement {
    private $conn;
    private $table_name = "announcements";

    // Ιδιότητες
    public $id;
    public $title;
    public $content;
    public $user_id; // Ο διαχειριστής που την δημιούργησε
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Διαβάζει όλες τις ανακοινώσεις.
     * @return PDOStatement
     */
    public function readAll() {
        $query = "SELECT a.id, a.title, a.content, u.username as author, a.created_at
                  FROM " . $this->table_name . " a
                  LEFT JOIN users u ON a.user_id = u.id
                  ORDER BY a.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
    
    /**
     * Διαβάζει μία ανακοίνωση.
     * @return void
     */
    public function readOne() {
        $query = "SELECT title, content FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $this->title = $row['title'];
            $this->content = $row['content'];
        }
    }

    /**
     * Δημιουργεί μια νέα ανακοίνωση.
     * @return bool
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " SET title=:title, content=:content, user_id=:user_id";
        $stmt = $this->conn->prepare($query);
        // Sanitize
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->content = htmlspecialchars(strip_tags($this->content));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        // Bind
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":content", $this->content);
        $stmt->bindParam(":user_id", $this->user_id);
        return $stmt->execute();
    }

    /**
     * Ενημερώνει μια ανακοίνωση.
     * @return bool
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " SET title = :title, content = :content WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        // Sanitize
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->content = htmlspecialchars(strip_tags($this->content));
        $this->id = htmlspecialchars(strip_tags($this->id));
        // Bind
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':content', $this->content);
        $stmt->bindParam(':id', $this->id);
        return $stmt->execute();
    }

    /**
     * Διαγράφει μια ανακοίνωση.
     * @return bool
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);
        return $stmt->execute();
    }
}