<?php
// Include database configuration
require_once __DIR__ . '/../config/database.php';

// Get database connection
$database = new Database();
$conn = $database->getConnection();

// SQL to create the notifications table
$sql = "
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'The recipient user ID',
  `sender_id` int(11) NULL COMMENT 'The user who triggered the notification (if applicable)',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'general' COMMENT 'notification type: general, system, message, task, etc.',
  `reference_type` varchar(50) NULL COMMENT 'Related entity type: project, task, message, etc.',
  `reference_id` int(11) NULL COMMENT 'Related entity ID',
  `is_read` tinyint(1) DEFAULT 0,
  `severity` varchar(20) DEFAULT 'info' COMMENT 'info, success, warning, error',
  `icon` varchar(100) NULL,
  `source_device` varchar(20) NULL COMMENT 'desktop, mobile, system',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `sender_id` (`sender_id`),
  KEY `is_read` (`is_read`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

try {
    // Execute SQL
    $conn->exec($sql);
    echo "Table 'notifications' created successfully." . PHP_EOL;
} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . PHP_EOL;
}

$conn = null;
?>