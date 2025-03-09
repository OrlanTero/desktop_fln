<?php
class TaskController {
    private $db;
    private $task;
    
    public function __construct($db) {
        $this->db = $db;
        $this->task = new Task($db);
    }
    
    // Get all tasks
    public function getAllTasks() {
        $stmt = $this->task->getAll();
        $num = $stmt->rowCount();
        
        if($num > 0) {
            $tasks_arr = array();
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $task_item = array(
                    "id" => $row['id'],
                    "liaison_id" => $row['liaison_id'],
                    "liaison_name" => $row['liaison_name'],
                    "service_id" => $row['service_id'],
                    "service_name" => $row['service_name'],
                    "service_category_name" => $row['service_category_name'],
                    "description" => $row['description'],
                    "status" => $row['status'],
                    "due_date" => $row['due_date'],
                    "created_at" => $row['created_at'],
                    "updated_at" => $row['updated_at']
                );
                
                array_push($tasks_arr, $task_item);
            }
            
            return [
                "status" => "success",
                "data" => $tasks_arr
            ];
        } else {
            return [
                "status" => "error",
                "message" => "No tasks found"
            ];
        }
    }
    
    // Get tasks by liaison
    public function getTasksByLiaison($liaison_id) {
        $stmt = $this->task->getByLiaison($liaison_id);
        $num = $stmt->rowCount();
        
        if($num > 0) {
            $tasks_arr = array();
            $tasks_arr["records"] = array();
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $task_item = array(
                    "id" => $id,
                    "liaison_id" => $liaison_id,
                    "liaison_name" => $liaison_name,
                    "service_id" => $service_id,
                    "service_name" => $service_name,
                    "service_category_name" => $service_category_name,
                    "description" => $description,
                    "status" => $status,
                    "due_date" => $due_date,
                    "created_at" => $created_at,
                    "updated_at" => $updated_at
                );
                
                array_push($tasks_arr["records"], $task_item);
            }
            
            http_response_code(200);
            return json_encode($tasks_arr);
        } else {
            http_response_code(200);
            return json_encode(array("records" => array()));
        }
    }
    
    // Create task
    public function createTask($data) {
        // Set task properties
        $this->task->liaison_id = $data->liaison_id;
        $this->task->service_id = isset($data->service_id) ? $data->service_id : null;
        $this->task->description = $data->description;
        $this->task->status = isset($data->status) ? $data->status : 'PENDING';
        $this->task->due_date = isset($data->due_date) ? $data->due_date : null;
        
        // Create task
        if($this->task->create()) {
            http_response_code(201);
            return array(
                "status" => "success",
                "message" => "Task was created successfully.",
                "id" => $this->task->id
            );
        } else {
            http_response_code(503);
            return array(
                "status" => "error",
                "message" => "Unable to create task."
            );
        }
    }
    
    // Update task
    public function updateTask($id, $data) {
        // Set task properties
        $this->task->id = $id;
        
        // Check if task exists
        if(!$this->task->getById()) {
            http_response_code(404);
            return json_encode(array("message" => "Task not found."));
        }
        
        $this->task->liaison_id = $data->liaison_id;
        $this->task->service_id = isset($data->service_id) ? $data->service_id : null;
        $this->task->description = $data->description;
        $this->task->status = $data->status;
        $this->task->due_date = isset($data->due_date) ? $data->due_date : null;
        
        // Update task
        if($this->task->update()) {
            http_response_code(200);
            return json_encode(array("message" => "Task was updated successfully."));
        } else {
            http_response_code(503);
            return json_encode(array("message" => "Unable to update task."));
        }
    }
    
    // Update task status
    public function updateTaskStatus($id, $data) {
        // Set task properties
        $this->task->id = $id;
        
        // Check if task exists
        if(!$this->task->getById()) {
            http_response_code(404);
            return array(
                "status" => "error",
                "message" => "Task not found."
            );
        }
        
        $this->task->status = $data->status;
        
        // Update task status
        if($this->task->updateStatus()) {
            http_response_code(200);
            return array(
                "status" => "success",
                "message" => "Task status was updated successfully."
            );
        } else {
            http_response_code(503);
            return array(
                "status" => "error",
                "message" => "Unable to update task status."
            );
        }
    }
    
    // Delete task
    public function deleteTask($id) {
        // Set task ID
        $this->task->id = $id;
        
        // Check if task exists
        if(!$this->task->getById()) {
            http_response_code(404);
            return json_encode(array("message" => "Task not found."));
        }
        
        // Delete task
        if($this->task->delete()) {
            http_response_code(200);
            return json_encode(array("message" => "Task was deleted successfully."));
        } else {
            http_response_code(503);
            return json_encode(array("message" => "Unable to delete task."));
        }
    }
}
?> 