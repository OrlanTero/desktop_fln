<?php
// Migration: Create user_profiles table
// This table will store additional user profile information

// Database connection
require_once __DIR__ . '/../config/database.php';

try {
    // Create the user_profiles table
    $sql = "CREATE TABLE IF NOT EXISTS `user_profiles` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `user_id` int(11) NOT NULL,
        `phone` varchar(20) DEFAULT NULL,
        `address` text DEFAULT NULL,
        `bio` text DEFAULT NULL,
        `position` varchar(100) DEFAULT NULL,
        `department` varchar(100) DEFAULT NULL,
        `skills` text DEFAULT NULL,
        `social_links` text DEFAULT NULL,
        `preferences` text DEFAULT NULL,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
        `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`id`),
        UNIQUE KEY `user_id` (`user_id`),
        CONSTRAINT `fk_user_profiles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    // Execute the query
    $conn->exec($sql);
    
    echo "Table 'user_profiles' created successfully.\n";
    
} catch(PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
} 