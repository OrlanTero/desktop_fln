<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and models
include_once '../config/database.php';
include_once '../models/UserProfile.php';
include_once '../models/User.php';

class UserProfileController {
    private $db;
    private $userProfile;
    private $user;
    
    public function __construct() {
        // Get database connection
        $database = new Database();
        $this->db = $database->getConnection();
        
        // Initialize models
        $this->userProfile = new UserProfile($this->db);
        $this->user = new User($this->db);
    }
    
    // Get user profile by user ID
    public function getProfile($userId) {
        try {
            // Set user ID
            $this->userProfile->user_id = $userId;
            
            // Get user profile
            $profileExists = $this->userProfile->getByUserId();
            
            // Get user data
            $this->user->id = $userId;
            $userExists = $this->user->getById();
            
            if($userExists) {
                // Create response array
                $response = array(
                    "success" => true,
                    "data" => array(
                        "user" => array(
                            "id" => $this->user->id,
                            "name" => $this->user->name,
                            "email" => $this->user->email,
                            "role" => $this->user->role,
                            "photo_url" => $this->user->photo_url,
                            "created_at" => $this->user->created_at,
                            "updated_at" => $this->user->updated_at
                        )
                    )
                );
                
                // Add profile data if exists
                if($profileExists) {
                    $response["data"]["profile"] = array(
                        "id" => $this->userProfile->id,
                        "phone" => $this->userProfile->phone,
                        "address" => $this->userProfile->address,
                        "bio" => $this->userProfile->bio,
                        "position" => $this->userProfile->position,
                        "department" => $this->userProfile->department,
                        "skills" => $this->userProfile->skills,
                        "social_links" => $this->userProfile->social_links,
                        "preferences" => $this->userProfile->preferences,
                        "created_at" => $this->userProfile->created_at,
                        "updated_at" => $this->userProfile->updated_at
                    );
                } else {
                    $response["data"]["profile"] = null;
                }
                
                return $response;
            } else {
                return array(
                    "success" => false,
                    "message" => "User not found"
                );
            }
        } catch (Exception $e) {
            error_log("Error in getProfile: " . $e->getMessage());
            return array(
                "success" => false,
                "message" => "Error retrieving profile: " . $e->getMessage()
            );
        }
    }
    
    // Update user profile
    public function updateProfile($userId, $data) {
        // Set user ID
        $this->userProfile->user_id = $userId;
        
        // Check if user exists
        $this->user->id = $userId;
        if(!$this->user->getById()) {
            return array(
                "success" => false,
                "message" => "User not found"
            );
        }
        
        // Set user profile properties from request data
        if(isset($data->phone)) $this->userProfile->phone = $data->phone;
        if(isset($data->address)) $this->userProfile->address = $data->address;
        if(isset($data->bio)) $this->userProfile->bio = $data->bio;
        if(isset($data->position)) $this->userProfile->position = $data->position;
        if(isset($data->department)) $this->userProfile->department = $data->department;
        if(isset($data->skills)) $this->userProfile->skills = $data->skills;
        if(isset($data->social_links)) $this->userProfile->social_links = $data->social_links;
        if(isset($data->preferences)) $this->userProfile->preferences = $data->preferences;
        
        // Update user data if provided
        $userUpdated = true;
        $userUpdateError = "";
        if(isset($data->name) || isset($data->email) || isset($data->role) || isset($data->photo_url)) {
            if(isset($data->name)) $this->user->name = $data->name;
            if(isset($data->email)) $this->user->email = $data->email;
            if(isset($data->role)) $this->user->role = $data->role;
            if(isset($data->photo_url)) $this->user->photo_url = $data->photo_url;
            
            $userUpdated = $this->user->update();
            if(!$userUpdated) {
                $userUpdateError = "Failed to update user information";
            }
        }
        
        // Create or update profile
        $profileUpdated = $this->userProfile->createOrUpdate();
        $profileUpdateError = "";
        if(!$profileUpdated) {
            $profileUpdateError = "Failed to update profile information";
        }
        
        if($profileUpdated && $userUpdated) {
            return array(
                "success" => true,
                "message" => "Profile updated successfully"
            );
        } else {
            return array(
                "success" => false,
                "message" => $userUpdateError ? $userUpdateError : ($profileUpdateError ? $profileUpdateError : "Failed to update profile")
            );
        }
    }
    
    // Upload profile photo
    public function uploadPhoto($userId, $file) {
        // Check if user exists
        $this->user->id = $userId;
        if(!$this->user->getById()) {
            return array(
                "success" => false,
                "message" => "User not found"
            );
        }
        
        // Check if file was uploaded
        if(!isset($file) || !is_array($file)) {
            return array(
                "success" => false,
                "message" => "No file uploaded or invalid file data"
            );
        }
        
        // Check if file was uploaded without errors
        if(isset($file["error"]) && $file["error"] !== 0) {
            $errorMessage = "Error uploading file";
            switch($file["error"]) {
                case UPLOAD_ERR_INI_SIZE:
                    $errorMessage = "The uploaded file exceeds the upload_max_filesize directive in php.ini";
                    break;
                case UPLOAD_ERR_FORM_SIZE:
                    $errorMessage = "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form";
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errorMessage = "The uploaded file was only partially uploaded";
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $errorMessage = "No file was uploaded";
                    break;
                case UPLOAD_ERR_NO_TMP_DIR:
                    $errorMessage = "Missing a temporary folder";
                    break;
                case UPLOAD_ERR_CANT_WRITE:
                    $errorMessage = "Failed to write file to disk";
                    break;
                case UPLOAD_ERR_EXTENSION:
                    $errorMessage = "A PHP extension stopped the file upload";
                    break;
                default:
                    $errorMessage = "Unknown upload error: " . $file["error"];
            }
            return array(
                "success" => false,
                "message" => $errorMessage
            );
        }
        
        // Check if file has a name and tmp_name
        if(!isset($file["name"]) || !isset($file["tmp_name"]) || empty($file["name"]) || empty($file["tmp_name"])) {
            return array(
                "success" => false,
                "message" => "Invalid file data"
            );
        }
        
        $uploadDir = "../uploads/profile_photos/";
        
        // Create directory if it doesn't exist
        if(!file_exists($uploadDir)) {
            if(!mkdir($uploadDir, 0777, true)) {
                return array(
                    "success" => false,
                    "message" => "Failed to create upload directory"
                );
            }
        }
        
        // Generate unique filename
        $fileExtension = pathinfo($file["name"], PATHINFO_EXTENSION);
        $newFilename = "user_" . $userId . "_" . time() . "." . $fileExtension;
        $targetFile = $uploadDir . $newFilename;
        
        // Check file type
        $allowedTypes = array("jpg", "jpeg", "png", "gif");
        if(!in_array(strtolower($fileExtension), $allowedTypes)) {
            return array(
                "success" => false,
                "message" => "Only JPG, JPEG, PNG & GIF files are allowed"
            );
        }
        
        // Check file size (max 5MB)
        if($file["size"] > 5000000) {
            return array(
                "success" => false,
                "message" => "File is too large. Maximum size is 5MB"
            );
        }
        
        // Upload file
        if(move_uploaded_file($file["tmp_name"], $targetFile)) {
            // Update user photo_url
            $this->user->photo_url = "/uploads/profile_photos/" . $newFilename;
            
            if($this->user->update()) {
                return array(
                    "success" => true,
                    "message" => "Photo uploaded successfully",
                    "data" => array(
                        "photo_url" => $this->user->photo_url
                    )
                );
            } else {
                // If we can't update the user record, delete the uploaded file
                if(file_exists($targetFile)) {
                    unlink($targetFile);
                }
                
                return array(
                    "success" => false,
                    "message" => "Failed to update user photo URL"
                );
            }
        } else {
            return array(
                "success" => false,
                "message" => "Failed to upload file. Check file permissions."
            );
        }
    }
} 