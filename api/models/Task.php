<?php
class Task {
    private $conn;
    private $table_name = "tasks";

    // Properties matching the database columns
    public $id;
    public $liaison_id;
    public $service_id;
    public $description;
    public $status;
    public $due_date;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create task
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                (liaison_id, service_id, description, status, due_date)
                VALUES
                (:liaison_id, :service_id, :description, :status, :due_date)";

        $stmt = $this->conn->prepare($query);

        // Clean and bind data
        $this->liaison_id = htmlspecialchars(strip_tags($this->liaison_id));
        $this->service_id = $this->service_id ? htmlspecialchars(strip_tags($this->service_id)) : null;
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->due_date = $this->due_date ? htmlspecialchars(strip_tags($this->due_date)) : null;

        $stmt->bindParam(':liaison_id', $this->liaison_id);
        $stmt->bindParam(':service_id', $this->service_id);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':due_date', $this->due_date);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    // Get all tasks
    public function getAll() {
        $query = "SELECT t.*, u.name as liaison_name, s.service_name, sc.service_category_name
                  FROM " . $this->table_name . " t
                  LEFT JOIN users u ON t.liaison_id = u.id
                  LEFT JOIN services s ON t.service_id = s.service_id
                  LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
                  ORDER BY t.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Get tasks by liaison
    public function getByLiaison($liaison_id) {
        $query = "SELECT t.*, u.name as liaison_name, s.service_name, sc.service_category_name
                  FROM " . $this->table_name . " t
                  LEFT JOIN users u ON t.liaison_id = u.id
                  LEFT JOIN services s ON t.service_id = s.service_id
                  LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
                  WHERE t.liaison_id = :liaison_id
                  ORDER BY t.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':liaison_id', $liaison_id);
        $stmt->execute();

        return $stmt;
    }

    // Get task by ID
    public function getById() {
        $query = "SELECT t.*, u.name as liaison_name, s.service_name, sc.service_category_name
                  FROM " . $this->table_name . " t
                  LEFT JOIN users u ON t.liaison_id = u.id
                  LEFT JOIN services s ON t.service_id = s.service_id
                  LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
                  WHERE t.id = :id
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            $this->id = $row['id'];
            $this->liaison_id = $row['liaison_id'];
            $this->service_id = $row['service_id'];
            $this->description = $row['description'];
            $this->status = $row['status'];
            $this->due_date = $row['due_date'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }

        return false;
    }

    // Update task
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET liaison_id = :liaison_id,
                    service_id = :service_id,
                    description = :description,
                    status = :status,
                    due_date = :due_date,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Clean and bind data
        $this->liaison_id = htmlspecialchars(strip_tags($this->liaison_id));
        $this->service_id = $this->service_id ? htmlspecialchars(strip_tags($this->service_id)) : null;
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->due_date = $this->due_date ? htmlspecialchars(strip_tags($this->due_date)) : null;
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':liaison_id', $this->liaison_id);
        $stmt->bindParam(':service_id', $this->service_id);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':due_date', $this->due_date);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Update task status
    public function updateStatus() {
        $query = "UPDATE " . $this->table_name . "
                SET status = :status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Clean and bind data
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Delete task
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Clean and bind data
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?> 