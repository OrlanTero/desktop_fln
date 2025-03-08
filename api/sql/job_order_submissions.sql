-- Table for job order submissions
CREATE TABLE IF NOT EXISTS `job_order_submissions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `job_order_id` INT(11) NOT NULL,
  `liaison_id` INT(11) NOT NULL,
  `notes` TEXT,
  `total_expenses` DECIMAL(10,2) DEFAULT 0.00,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `job_order_id` (`job_order_id`),
  KEY `liaison_id` (`liaison_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table for job order submission expenses
CREATE TABLE IF NOT EXISTS `job_order_submission_expenses` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `submission_id` INT(11) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table for job order submission attachments
CREATE TABLE IF NOT EXISTS `job_order_submission_attachments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `submission_id` INT(11) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL,
  `file_size` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add foreign key constraints
ALTER TABLE `job_order_submissions`
  ADD CONSTRAINT `fk_submissions_job_order` FOREIGN KEY (`job_order_id`) REFERENCES `job_orders` (`job_order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_submissions_liaison` FOREIGN KEY (`liaison_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `job_order_submission_expenses`
  ADD CONSTRAINT `fk_expenses_submission` FOREIGN KEY (`submission_id`) REFERENCES `job_order_submissions` (`id`) ON DELETE CASCADE;

ALTER TABLE `job_order_submission_attachments`
  ADD CONSTRAINT `fk_attachments_submission` FOREIGN KEY (`submission_id`) REFERENCES `job_order_submissions` (`id`) ON DELETE CASCADE; 