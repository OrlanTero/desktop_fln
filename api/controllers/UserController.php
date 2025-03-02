<?php
// Include the User model
require_once 'models/User.php';

class UserController {
    private $db;
    private $user;
    
    public function __construct($db) {
        $this->db = $db;
        $this->user = new User($db);
    }
    
    // Get all users
    public function getAll() {
        $stmt = $this->user->getAll();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            "status" => "success",
            "users" => $users
        ];
    }
    
    // Get user by ID
    public function getById($id) {
        $this->user->id = $id;
        
        if($this->user->getById()) {
            return [
                "status" => "success",
                "user" => [
                    "id" => $this->user->id,
                    "name" => $this->user->name,
                    "email" => $this->user->email,
                    "role" => $this->user->role,
                    "photo_url" => $this->user->photo_url,
                    "created_at" => $this->user->created_at,
                    "updated_at" => $this->user->updated_at
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "User not found"
            ];
        }
    }
    
    // Create user
    public function create($data) {
        // Check if email already exists
        $this->user->email = $data['email'];
        
        if($this->user->emailExists()) {
            return [
                "status" => "error",
                "message" => "Email already exists"
            ];
        }
        
        // Set user properties
        $this->user->name = $data['name'];
        $this->user->password = $data['password'];
        $this->user->role = isset($data['role']) ? $data['role'] : 'user';
        $this->user->photo_url = isset($data['photo_url']) ? $data['photo_url'] : null;
        
        // Create the user
        if($this->user->create()) {
            return [
                "status" => "success",
                "message" => "User created successfully",
                "user" => [
                    "id" => $this->user->id,
                    "name" => $this->user->name,
                    "email" => $this->user->email,
                    "role" => $this->user->role
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Unable to create user"
            ];
        }
    }
    
    // Update user
    public function update($id, $data) {
        // Check if user exists
        $this->user->id = $id;
        
        if(!$this->user->getById()) {
            return [
                "status" => "error",
                "message" => "User not found"
            ];
        }
        
        // Check if email is being changed and if it already exists
        if(isset($data['email']) && $data['email'] !== $this->user->email) {
            $checkUser = new User($this->db);
            $checkUser->email = $data['email'];
            
            if($checkUser->emailExists()) {
                return [
                    "status" => "error",
                    "message" => "Email already exists"
                ];
            }
        }
        
        // Set user properties
        $this->user->name = isset($data['name']) ? $data['name'] : $this->user->name;
        $this->user->email = isset($data['email']) ? $data['email'] : $this->user->email;
        $this->user->role = isset($data['role']) ? $data['role'] : $this->user->role;
        $this->user->photo_url = isset($data['photo_url']) ? $data['photo_url'] : $this->user->photo_url;
        
        // Update the user
        if($this->user->update()) {
            return [
                "status" => "success",
                "message" => "User updated successfully",
                "user" => [
                    "id" => $this->user->id,
                    "name" => $this->user->name,
                    "email" => $this->user->email,
                    "role" => $this->user->role,
                    "photo_url" => $this->user->photo_url
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Unable to update user"
            ];
        }
    }
    
    // Update password
    public function updatePassword($id, $data) {
        // Check if user exists
        $this->user->id = $id;
        
        if(!$this->user->getById()) {
            return [
                "status" => "error",
                "message" => "User not found"
            ];
        }
        
        // Set new password
        $this->user->password = $data['password'];
        
        // Update the password
        if($this->user->updatePassword()) {
            return [
                "status" => "success",
                "message" => "Password updated successfully"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Unable to update password"
            ];
        }
    }
    
    // Delete user
    public function delete($id) {
        // Check if user exists
        $this->user->id = $id;
        
        if(!$this->user->getById()) {
            return [
                "status" => "error",
                "message" => "User not found"
            ];
        }
        
        // Delete the user
        if($this->user->delete()) {
            return [
                "status" => "success",
                "message" => "User deleted successfully"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Unable to delete user"
            ];
        }
    }
    
    // Login user
    public function login($data) {
        // Check if email exists
        $this->user->email = $data['email'];
        
        if(!$this->user->emailExists()) {
            return [
                "status" => "error",
                "message" => "Invalid email or password"
            ];
        }
        
        // Verify password
        if(!$this->user->verifyPassword($data['password'])) {
            return [
                "status" => "error",
                "message" => "Invalid email or password"
            ];
        }
        
        // Return user data
        return [
            "status" => "success",
            "message" => "Login successful",
            "user" => [
                "id" => $this->user->id,
                "name" => $this->user->name,
                "email" => $this->user->email,
                "role" => $this->user->role
            ]
        ];
    }
} 