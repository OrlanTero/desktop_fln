<?php
class Notification
{
    // Database connection and table name
    private $conn;
    private $table_name = "notifications";

    // Object properties
    public $id;
    public $user_id;
    public $sender_id;
    public $title;
    public $message;
    public $type;
    public $reference_type;
    public $reference_id;
    public $is_read;
    public $severity;
    public $icon;
    public $source_device;
    public $created_at;
    public $updated_at;

    // Constructor with database connection
    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Get all notifications for a user
    public function getAllForUser($userId, $limit = 100, $offset = 0, $onlyUnread = false)
    {
        $query = "SELECT n.*, s.name as sender_name, s.photo_url as sender_photo_url, s.role as sender_role
                  FROM " . $this->table_name . " n
                  LEFT JOIN users s ON n.sender_id = s.id
                  WHERE n.user_id = :user_id " .
            ($onlyUnread ? " AND n.is_read = 0" : "") . "
                  ORDER BY n.created_at DESC
                  LIMIT :offset, :limit";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $userId = htmlspecialchars(strip_tags($userId));
        $limit = (int) $limit;
        $offset = (int) $offset;

        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);

        $stmt->execute();

        return $stmt;
    }

    // Get notification by ID
    public function getById()
    {
        $query = "SELECT n.*, s.name as sender_name, s.photo_url as sender_photo_url, s.role as sender_role
                  FROM " . $this->table_name . " n
                  LEFT JOIN users s ON n.sender_id = s.id
                  WHERE n.id = :id 
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);

        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->user_id = $row['user_id'];
            $this->sender_id = $row['sender_id'];
            $this->title = $row['title'];
            $this->message = $row['message'];
            $this->type = $row['type'];
            $this->reference_type = $row['reference_type'];
            $this->reference_id = $row['reference_id'];
            $this->is_read = $row['is_read'];
            $this->severity = $row['severity'];
            $this->icon = $row['icon'];
            $this->source_device = $row['source_device'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    // Create notification
    public function create()
    {
        $query = "INSERT INTO " . $this->table_name . " 
                  (user_id, sender_id, title, message, type, reference_type, reference_id, 
                   is_read, severity, icon, source_device) 
                  VALUES 
                  (:user_id, :sender_id, :title, :message, :type, :reference_type, :reference_id, 
                   :is_read, :severity, :icon, :source_device)";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->sender_id = $this->sender_id ? htmlspecialchars(strip_tags($this->sender_id)) : null;
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->message = htmlspecialchars(strip_tags($this->message));
        $this->type = $this->type ? htmlspecialchars(strip_tags($this->type)) : 'general';
        $this->reference_type = $this->reference_type ? htmlspecialchars(strip_tags($this->reference_type)) : null;
        $this->reference_id = $this->reference_id ? htmlspecialchars(strip_tags($this->reference_id)) : null;
        $this->is_read = isset($this->is_read) ? (int) $this->is_read : 0;
        $this->severity = $this->severity ? htmlspecialchars(strip_tags($this->severity)) : 'info';
        $this->icon = $this->icon ? htmlspecialchars(strip_tags($this->icon)) : null;
        $this->source_device = $this->source_device ? htmlspecialchars(strip_tags($this->source_device)) : null;

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":sender_id", $this->sender_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":message", $this->message);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":reference_type", $this->reference_type);
        $stmt->bindParam(":reference_id", $this->reference_id);
        $stmt->bindParam(":is_read", $this->is_read);
        $stmt->bindParam(":severity", $this->severity);
        $stmt->bindParam(":icon", $this->icon);
        $stmt->bindParam(":source_device", $this->source_device);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Mark notification as read
    public function markAsRead()
    {
        $query = "UPDATE " . $this->table_name . " 
                  SET is_read = 1 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Mark all notifications as read for a user
    public function markAllAsRead($userId)
    {
        $query = "UPDATE " . $this->table_name . " 
                  SET is_read = 1 
                  WHERE user_id = :user_id AND is_read = 0";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $userId = htmlspecialchars(strip_tags($userId));
        $stmt->bindParam(":user_id", $userId);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Delete notification
    public function delete()
    {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Delete all notifications for a user
    public function deleteAllForUser($userId)
    {
        $query = "DELETE FROM " . $this->table_name . " WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $userId = htmlspecialchars(strip_tags($userId));
        $stmt->bindParam(":user_id", $userId);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Get unread count for a user
    public function getUnreadCount($userId)
    {
        $query = "SELECT COUNT(*) as count
                  FROM " . $this->table_name . " 
                  WHERE user_id = :user_id AND is_read = 0";

        $stmt = $this->conn->prepare($query);

        // Sanitize and bind
        $userId = htmlspecialchars(strip_tags($userId));
        $stmt->bindParam(":user_id", $userId);

        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return (int) $row['count'];
    }
}