<?php
class Message {
    // Database connection and table name
    private $conn;
    private $table_name = "messages";
    private $attachment_table = "message_attachments";
    private $user_status_table = "user_chat_status";
    
    // Object properties
    public $id;
    public $sender_id;
    public $receiver_id;
    public $message;
    public $is_read;
    public $created_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all messages between two users
    public function getConversation($user1_id, $user2_id) {
        // Query to get messages between two users
        $query = "SELECT m.*, 
                    s.name as sender_name, s.photo_url as sender_photo, s.role as sender_role,
                    r.name as receiver_name, r.photo_url as receiver_photo, r.role as receiver_role
                  FROM " . $this->table_name . " m
                  LEFT JOIN users s ON m.sender_id = s.id
                  LEFT JOIN users r ON m.receiver_id = r.id
                  WHERE (m.sender_id = ? AND m.receiver_id = ?) 
                     OR (m.sender_id = ? AND m.receiver_id = ?)
                  ORDER BY m.created_at ASC";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        $stmt->bindParam(1, $user1_id);
        $stmt->bindParam(2, $user2_id);
        $stmt->bindParam(3, $user2_id);
        $stmt->bindParam(4, $user1_id);
        
        // Execute query
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get all recent conversations for a user
    public function getRecentConversations($user_id) {
        // Query to get the most recent message from each conversation
        $query = "SELECT m.*, 
                    s.name as sender_name, s.photo_url as sender_photo, s.role as sender_role,
                    r.name as receiver_name, r.photo_url as receiver_photo, r.role as receiver_role,
                    (SELECT COUNT(*) FROM " . $this->table_name . " 
                     WHERE receiver_id = ? AND sender_id = IF(m.sender_id = ?, m.receiver_id, m.sender_id) 
                     AND is_read = 0) as unread_count,
                    ucs.is_online,
                    ucs.last_active
                  FROM " . $this->table_name . " m
                  LEFT JOIN users s ON m.sender_id = s.id
                  LEFT JOIN users r ON m.receiver_id = r.id
                  LEFT JOIN " . $this->user_status_table . " ucs ON 
                    (m.sender_id = ? AND ucs.user_id = m.receiver_id) OR 
                    (m.receiver_id = ? AND ucs.user_id = m.sender_id)
                  WHERE m.id IN (
                    SELECT MAX(id) FROM " . $this->table_name . "
                    WHERE sender_id = ? OR receiver_id = ?
                    GROUP BY 
                      CASE 
                        WHEN sender_id = ? THEN receiver_id 
                        ELSE sender_id 
                      END
                  )
                  ORDER BY m.created_at DESC";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        $stmt->bindParam(1, $user_id);
        $stmt->bindParam(2, $user_id);
        $stmt->bindParam(3, $user_id);
        $stmt->bindParam(4, $user_id);
        $stmt->bindParam(5, $user_id);
        $stmt->bindParam(6, $user_id);
        $stmt->bindParam(7, $user_id);
        
        // Execute query
        $stmt->execute();
        
        return $stmt;
    }
    
    // Create a new message
    public function create() {
        // Query to insert a new message
        $query = "INSERT INTO " . $this->table_name . "
                  SET sender_id = :sender_id,
                      receiver_id = :receiver_id,
                      message = :message,
                      is_read = :is_read";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind data
        $this->sender_id = htmlspecialchars(strip_tags($this->sender_id));
        $this->receiver_id = htmlspecialchars(strip_tags($this->receiver_id));
        $this->message = htmlspecialchars(strip_tags($this->message));
        $this->is_read = isset($this->is_read) ? $this->is_read : 0;
        
        $stmt->bindParam(':sender_id', $this->sender_id);
        $stmt->bindParam(':receiver_id', $this->receiver_id);
        $stmt->bindParam(':message', $this->message);
        $stmt->bindParam(':is_read', $this->is_read);
        
        // Execute query
        if($stmt->execute()) {
            // Get the ID of the inserted message
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Mark messages as read
    public function markAsRead($sender_id, $receiver_id) {
        // Query to update messages as read
        $query = "UPDATE " . $this->table_name . "
                  SET is_read = 1
                  WHERE sender_id = ? AND receiver_id = ? AND is_read = 0";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        $stmt->bindParam(1, $sender_id);
        $stmt->bindParam(2, $receiver_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Get unread message count for a user
    public function getUnreadCount($user_id) {
        // Query to count unread messages
        $query = "SELECT COUNT(*) as unread_count
                  FROM " . $this->table_name . "
                  WHERE receiver_id = ? AND is_read = 0";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        $stmt->bindParam(1, $user_id);
        
        // Execute query
        $stmt->execute();
        
        // Get row
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['unread_count'];
    }
    
    // Add attachment to a message
    public function addAttachment($message_id, $file_name, $file_path, $file_type, $file_size) {
        // Query to insert a new attachment
        $query = "INSERT INTO " . $this->attachment_table . "
                  SET message_id = :message_id,
                      file_name = :file_name,
                      file_path = :file_path,
                      file_type = :file_type,
                      file_size = :file_size";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind data
        $message_id = htmlspecialchars(strip_tags($message_id));
        $file_name = htmlspecialchars(strip_tags($file_name));
        $file_path = htmlspecialchars(strip_tags($file_path));
        $file_type = htmlspecialchars(strip_tags($file_type));
        $file_size = htmlspecialchars(strip_tags($file_size));
        
        $stmt->bindParam(':message_id', $message_id);
        $stmt->bindParam(':file_name', $file_name);
        $stmt->bindParam(':file_path', $file_path);
        $stmt->bindParam(':file_type', $file_type);
        $stmt->bindParam(':file_size', $file_size);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Get attachments for a message
    public function getAttachments($message_id) {
        // Query to get attachments for a message
        $query = "SELECT *
                  FROM " . $this->attachment_table . "
                  WHERE message_id = ?";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        $stmt->bindParam(1, $message_id);
        
        // Execute query
        $stmt->execute();
        
        return $stmt;
    }
    
    // Update user online status
    public function updateUserStatus($user_id, $is_online) {
        // Check if user status exists
        $check_query = "SELECT user_id FROM " . $this->user_status_table . " WHERE user_id = ?";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $user_id);
        $check_stmt->execute();
        
        if($check_stmt->rowCount() > 0) {
            // Update existing status
            $query = "UPDATE " . $this->user_status_table . "
                      SET is_online = :is_online
                      WHERE user_id = :user_id";
        } else {
            // Insert new status
            $query = "INSERT INTO " . $this->user_status_table . "
                      SET user_id = :user_id,
                          is_online = :is_online";
        }
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind data
        $user_id = htmlspecialchars(strip_tags($user_id));
        $is_online = htmlspecialchars(strip_tags($is_online));
        
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':is_online', $is_online);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Get user online status
    public function getUserStatus($user_id) {
        // Query to get user status
        $query = "SELECT is_online, last_active
                  FROM " . $this->user_status_table . "
                  WHERE user_id = ?";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        $stmt->bindParam(1, $user_id);
        
        // Execute query
        $stmt->execute();
        
        // Get row
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            return $row;
        } else {
            return ['is_online' => 0, 'last_active' => null];
        }
    }
}
?> 