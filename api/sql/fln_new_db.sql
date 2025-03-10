-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 10, 2025 at 04:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fln_new_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `assigned_job_orders`
--

CREATE TABLE `assigned_job_orders` (
  `id` int(11) NOT NULL,
  `job_order_id` int(11) NOT NULL,
  `liaison_id` int(11) NOT NULL,
  `assigned_date` datetime DEFAULT current_timestamp(),
  `status` enum('In Progress','Completed','On Hold') DEFAULT 'In Progress',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assigned_job_orders`
--

INSERT INTO `assigned_job_orders` (`id`, `job_order_id`, `liaison_id`, `assigned_date`, `status`, `notes`) VALUES
(1, 4, 7, '2025-03-08 21:16:42', '', 'Assigned from job orders page'),
(2, 5, 7, '2025-03-09 21:17:37', '', 'Assigned from job orders page');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `client_id` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `address2` text DEFAULT NULL,
  `tax_type` varchar(50) DEFAULT NULL,
  `account_for` varchar(255) DEFAULT NULL,
  `rdo` varchar(100) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `client_type_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`client_id`, `client_name`, `company`, `branch`, `address`, `address2`, `tax_type`, `account_for`, `rdo`, `email_address`, `description`, `created_at`, `updated_at`, `client_type_id`, `status`) VALUES
(1, 'Jolibee', 'Jolibe.Inc', 'Valenzuela', 'Valuenzuela', '', 'Tax 1', '', '', 'jhonorlantero@gmail.com', '', '2025-03-05 18:13:20', '2025-03-05 18:13:20', 2, 'active'),
(2, 'McDo', 'MCDO.INC', 'Navotas', '', '', 'TAX 2', '', '', 'jhonorlantero@gmail.com', '', '2025-03-05 18:13:48', '2025-03-05 18:13:48', 3, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `client_types`
--

CREATE TABLE `client_types` (
  `type_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `client_types`
--

INSERT INTO `client_types` (`type_id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Individual', '', '2025-03-05 18:11:35', '2025-03-05 18:11:35'),
(2, 'Corporate ', '', '2025-03-05 18:11:42', '2025-03-05 18:11:42'),
(3, 'Government', '', '2025-03-05 18:11:48', '2025-03-05 18:11:48'),
(4, 'Non-profit ', '', '2025-03-05 18:11:56', '2025-03-05 18:11:56'),
(5, 'VIP/High-Value', '', '2025-03-05 18:12:03', '2025-03-05 18:12:03'),
(6, 'Internal ', '', '2025-03-05 18:12:08', '2025-03-05 18:12:20'),
(7, 'International ', '', '2025-03-05 18:12:14', '2025-03-05 18:12:14');

-- --------------------------------------------------------

--
-- Table structure for table `company_info`
--

CREATE TABLE `company_info` (
  `company_id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_info`
--

INSERT INTO `company_info` (`company_id`, `company_name`, `address`, `phone`, `email`, `website`, `tax_id`, `logo_url`, `updated_at`) VALUES
(1, 'FLN Services Corporation', 'Company Address', '+1234567890', 'info@yourcompany.com', 'www.yourcompany.com', NULL, NULL, '2025-03-01 10:49:02');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `document_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`document_id`, `proposal_id`, `file_path`, `file_name`, `file_type`, `created_at`, `updated_at`) VALUES
(1, 1, 'documents/67c89b4a27619_PRO-2025-0001.pdf', 'PRO-2025-0001.pdf', 'pdf', '2025-03-05 18:43:22', '2025-03-05 18:43:22'),
(2, 2, 'documents/67c89d01a3971_PRO-2025-0002.pdf', 'PRO-2025-0002.pdf', 'pdf', '2025-03-05 18:50:41', '2025-03-05 18:50:41');

-- --------------------------------------------------------

--
-- Table structure for table `job_orders`
--

CREATE TABLE `job_orders` (
  `job_order_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `proposal_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `estimated_fee` decimal(10,2) DEFAULT 0.00,
  `is_assigned` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_orders`
--

INSERT INTO `job_orders` (`job_order_id`, `service_id`, `proposal_id`, `project_id`, `description`, `estimated_fee`, `is_assigned`, `created_at`, `updated_at`, `status`) VALUES
(1, 10, 2, 0, 'Deliver', 5000.00, 0, '2025-03-05 18:51:12', '2025-03-09 12:42:32', 'PENDING'),
(2, 10, 2, 0, 'Sign In', 1200.00, 0, '2025-03-05 18:51:12', '2025-03-09 12:42:30', 'PENDING'),
(3, 8, 2, 0, 'Eat', 1000.00, 0, '2025-03-05 18:51:13', '2025-03-09 12:42:27', 'PENDING'),
(4, 3, 2, 1, '', 0.00, 1, '2025-03-05 18:52:41', '2025-03-09 13:13:00', 'COMPLETED'),
(5, 3, 2, 1, 'Sign In', 1200.00, 1, '2025-03-05 18:52:41', '2025-03-09 13:19:24', 'SUBMITTED'),
(6, 4, 2, 1, 'Eat', 1000.00, 0, '2025-03-05 18:52:41', '2025-03-09 12:42:33', 'PENDING');

-- --------------------------------------------------------

--
-- Table structure for table `job_order_submissions`
--

CREATE TABLE `job_order_submissions` (
  `id` int(11) NOT NULL,
  `job_order_id` int(11) NOT NULL,
  `liaison_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `total_expenses` decimal(10,2) DEFAULT 0.00,
  `status` enum('PENDING','SUBMITTED','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_order_submissions`
--

INSERT INTO `job_order_submissions` (`id`, `job_order_id`, `liaison_id`, `notes`, `total_expenses`, `status`, `created_at`, `updated_at`) VALUES
(1, 4, 7, '', 520.00, 'SUBMITTED', '2025-03-08 15:42:00', '2025-03-08 17:48:10'),
(2, 5, 7, 'Yow ', 300.00, 'SUBMITTED', '2025-03-09 13:18:28', '2025-03-09 13:18:28');

-- --------------------------------------------------------

--
-- Table structure for table `job_order_submission_attachments`
--

CREATE TABLE `job_order_submission_attachments` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_order_submission_attachments`
--

INSERT INTO `job_order_submission_attachments` (`id`, `submission_id`, `file_name`, `file_path`, `file_type`, `file_size`, `created_at`) VALUES
(1, 1, 'image_1741448512312.jpg', 'uploads/job_orders/67cc65484795d_1741448520.jpg', 'image/jpeg', 158614, '2025-03-08 15:42:00'),
(2, 1, 'Gatdog', 'manual_attachment', 'text/plain', 0, '2025-03-08 17:48:10'),
(3, 2, 'image_1741526298845.jpg', 'uploads/job_orders/67cd952404618_1741526308.jpg', 'image/jpeg', 2969799, '2025-03-09 13:18:28');

-- --------------------------------------------------------

--
-- Table structure for table `job_order_submission_expenses`
--

CREATE TABLE `job_order_submission_expenses` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_order_submission_expenses`
--

INSERT INTO `job_order_submission_expenses` (`id`, `submission_id`, `description`, `amount`, `created_at`) VALUES
(6, 1, 'Expense', 500.00, '2025-03-08 17:48:10'),
(7, 1, 'Shet', 20.00, '2025-03-08 17:48:10'),
(8, 2, 'Hahaha', 300.00, '2025-03-09 13:18:28');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES
(1, 7, 6, 'Hayo', 0, '2025-03-09 17:15:14'),
(2, 7, 6, 'Hala', 0, '2025-03-09 17:15:25'),
(3, 7, 6, '????', 0, '2025-03-09 17:15:29'),
(4, 7, 5, 'shh', 0, '2025-03-09 17:16:09'),
(5, 7, 5, '????', 0, '2025-03-09 17:19:49'),
(6, 7, 5, '????', 0, '2025-03-09 17:22:26'),
(7, 3, 7, 'luh', 1, '2025-03-09 17:56:22'),
(8, 7, 3, 'Yey', 1, '2025-03-09 18:01:23'),
(9, 3, 7, 'lets go', 1, '2025-03-09 18:01:33'),
(10, 3, 7, 'shet', 1, '2025-03-09 18:01:39'),
(11, 7, 3, 'Galing mo Naman be', 1, '2025-03-09 18:01:44');

-- --------------------------------------------------------

--
-- Table structure for table `message_attachments`
--

CREATE TABLE `message_attachments` (
  `id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `file_size` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `project_id` int(11) NOT NULL,
  `proposal_id` int(11) DEFAULT NULL,
  `client_id` int(11) NOT NULL,
  `project_name` varchar(255) NOT NULL,
  `project_start` date NOT NULL,
  `project_end` date NOT NULL,
  `attn_to` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') DEFAULT 'MEDIUM',
  `status` enum('PENDING','ON HOLD','IN PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`project_id`, `proposal_id`, `client_id`, `project_name`, `project_start`, `project_end`, `attn_to`, `start_date`, `end_date`, `description`, `priority`, `status`, `created_by`, `created_at`, `updated_at`, `total_amount`, `paid_amount`, `notes`) VALUES
(1, 2, 1, 'Project Jolibee', '0000-00-00', '0000-00-00', 'Daisy', '2025-03-07', '2025-03-22', '', 'MEDIUM', 'IN PROGRESS', NULL, '2025-03-05 18:52:40', '2025-03-08 06:23:56', 7500.00, 0.00, 'Accepted');

-- --------------------------------------------------------

--
-- Table structure for table `proposals`
--

CREATE TABLE `proposals` (
  `proposal_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `proposal_reference` varchar(20) NOT NULL,
  `proposal_name` varchar(255) NOT NULL,
  `project_name` varchar(255) NOT NULL,
  `project_start` date DEFAULT NULL,
  `project_end` date DEFAULT NULL,
  `attn_to` varchar(255) NOT NULL,
  `has_downpayment` tinyint(1) DEFAULT 0,
  `downpayment_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('DRAFT','SENT','ACCEPTED','REJECTED','CONVERTED') DEFAULT 'DRAFT',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `response_date` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `valid_until` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proposals`
--

INSERT INTO `proposals` (`proposal_id`, `client_id`, `proposal_reference`, `proposal_name`, `project_name`, `project_start`, `project_end`, `attn_to`, `has_downpayment`, `downpayment_amount`, `status`, `created_by`, `created_at`, `updated_at`, `response_date`, `total_amount`, `valid_until`, `notes`, `description`) VALUES
(1, 1, 'PRO-2025-0001', '', '', NULL, NULL, '', 0, 0.00, 'ACCEPTED', NULL, '2025-03-05 18:43:20', '2025-03-05 18:47:35', '2025-03-05 19:47:35', 7500.00, NULL, 'Proposal Is Accepted', NULL),
(2, 1, 'PRO-2025-0002', 'Proposal 2', 'Project Jolibee', '2025-03-07', '2025-03-22', 'Daisy', 0, 0.00, 'CONVERTED', NULL, '2025-03-05 18:50:40', '2025-03-05 18:52:41', '2025-03-05 19:51:51', 7500.00, NULL, 'Accepted', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pro_services`
--

CREATE TABLE `pro_services` (
  `pro_service_id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `unit_price` decimal(10,2) DEFAULT NULL,
  `pro_type` enum('Proposal','Project','','') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pro_services`
--

INSERT INTO `pro_services` (`pro_service_id`, `proposal_id`, `project_id`, `service_id`, `quantity`, `price`, `discount_percentage`, `created_at`, `updated_at`, `unit_price`, `pro_type`) VALUES
(1, 2, 0, 10, 1, 2500.00, 0.00, '2025-03-05 18:51:12', '2025-03-05 18:51:12', 2500.00, 'Proposal'),
(2, 2, 0, 8, 1, 5000.00, 0.00, '2025-03-05 18:51:13', '2025-03-05 18:51:13', 5000.00, 'Proposal'),
(3, 0, 1, 10, 1, 2500.00, 0.00, '2025-03-05 18:52:41', '2025-03-05 18:52:41', 2500.00, 'Project'),
(4, 0, 1, 8, 1, 5000.00, 0.00, '2025-03-05 18:52:41', '2025-03-05 18:52:41', 5000.00, 'Project');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(11) NOT NULL,
  `service_category_id` int(11) DEFAULT NULL,
  `service_name` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `timeline` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `service_category_id`, `service_name`, `price`, `remarks`, `timeline`, `created_at`, `updated_at`) VALUES
(1, 1, 'Securing SEC / DTI registration - ( includes preparation and submission of GIS, appointment forms for OPC)', 1000.00, '', '', '2025-03-05 18:32:42', '2025-03-05 18:32:42'),
(2, 1, 'BIR Registration - Securing COR-Form 2303 , Authority to Print Invoices and manual books of Account', 1000.00, '', '', '2025-03-05 18:33:02', '2025-03-05 18:33:02'),
(3, 1, 'Securing Business/Mayor&#039;s Permit', 1000.00, '', '', '2025-03-05 18:33:18', '2025-03-05 18:33:18'),
(4, 1, 'Securing gov&#039;t mandatory : SSS , PHIC, HDMF (Pag-ibig) - Employer&#039;s Registration and online access', 0.00, '', '', '2025-03-05 18:33:30', '2025-03-05 18:33:30'),
(5, 4, 'Securing SEC Registration for Corporation, partnership, OPC, non profit organization', 1200.00, '', '', '2025-03-05 18:33:59', '2025-03-05 18:36:21'),
(6, 4, 'Preparation and submission of appointment forms (OPC)', 2000.00, '', '', '2025-03-05 18:34:17', '2025-03-05 18:35:59'),
(7, 4, 'SEC Amendment of Articles of Incorporation - changes except for capital increase', 3400.00, '', '', '2025-03-05 18:34:39', '2025-03-05 18:36:44'),
(8, 4, 'SEC Amendment of By-Laws', 320.00, '', '', '2025-03-05 18:34:52', '2025-03-05 18:36:28'),
(9, 4, 'SEC Amendment of Articles of Incorporation - Increase of Capital ', 2200.00, '', '', '2025-03-05 18:35:07', '2025-03-05 18:36:36'),
(10, 4, 'SEC Amendment -More than 40% foreign share', 200.00, '', '', '2025-03-05 18:35:21', '2025-03-05 18:36:10'),
(11, 2, 'BUSINESS CHANGE OF ADDRESS / AMENDMENT (NAME/AOI)', 2000.00, '', '', '2025-03-05 18:37:03', '2025-03-05 18:37:03'),
(12, 3, 'BUSINESS CLOSURE', 5000.00, '', '', '2025-03-05 18:37:19', '2025-03-05 18:37:19'),
(13, 5, 'Securing DTI certificate', 5000.00, '', '', '2025-03-05 18:37:49', '2025-03-05 18:37:49'),
(14, 6, 'BIR Registration - Securing COR-Form 2303 Securing Authority to Print Invoices (ATP) and securing manual books registration  Registration of Facility /Securing COR', 5000.00, '', '', '2025-03-05 18:38:30', '2025-03-05 18:38:30'),
(15, 6, 'Printing of Primary Receipt: Sales Invoice and Official Receipt Collection Receipt, Billing Invoice, Delivery Receipt', 2332.00, '', '', '2025-03-05 18:38:47', '2025-03-05 18:38:47'),
(16, 6, 'Updating of Records, such as additional activity, amendment of information, books registration, etc.', 2222.00, '', '', '2025-03-05 18:39:03', '2025-03-05 18:39:03'),
(17, 6, 'NON VAT to VAT registration', 0.00, '', '', '2025-03-05 18:39:15', '2025-03-05 18:39:15'),
(18, 6, 'Efps Registration', 5000.00, '', '', '2025-03-05 18:39:41', '2025-03-05 18:39:41'),
(19, 6, 'Securing ATP only', 2500.00, '', '', '2025-03-05 18:40:01', '2025-03-05 18:40:01'),
(20, 6, 'Securing Manual stamped books', 2500.00, '', '', '2025-03-05 18:40:17', '2025-03-05 18:40:17'),
(21, 7, 'Business Permits', 2000.00, '', '', '2025-03-05 18:40:47', '2025-03-05 18:40:47'),
(22, 7, 'Securing Building Permit', 20000.00, '', '', '2025-03-05 18:41:05', '2025-03-05 18:41:05');

-- --------------------------------------------------------

--
-- Table structure for table `service_categories`
--

CREATE TABLE `service_categories` (
  `service_category_id` int(11) NOT NULL,
  `service_category_name` varchar(255) NOT NULL,
  `priority_number` int(11) DEFAULT NULL,
  `added_by_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_categories`
--

INSERT INTO `service_categories` (`service_category_id`, `service_category_name`, `priority_number`, `added_by_id`, `description`, `created_at`, `updated_at`) VALUES
(1, 'BUSINESS REGISTRATION', 1, 3, '', '2025-03-05 18:22:43', '2025-03-05 18:23:21'),
(2, 'BUSINESS CHANGE OF ADDRESS / AMENDMENT (NAME/AOI)', 2, 3, '', '2025-03-05 18:23:36', '2025-03-05 18:23:36'),
(3, 'BUSINESS CLOSURE', 3, 3, '', '2025-03-05 18:23:51', '2025-03-05 18:23:51'),
(4, 'SECURITIES AND EXCHANGE COMMISSION (SEC)', 4, 3, '', '2025-03-05 18:28:57', '2025-03-05 18:28:57'),
(5, 'DEPARTMENT OF TRADE AND INDUSTRY - (DTI)', 5, 3, '', '2025-03-05 18:29:21', '2025-03-05 18:29:21'),
(6, 'BUREAU OF INTERNAL REVENUE - BIR', 6, 3, '', '2025-03-05 18:29:33', '2025-03-05 18:29:33'),
(7, 'BUSINESS / MAYOR&#039;S PERMIT REGISTRATION', 7, 3, '', '2025-03-05 18:30:00', '2025-03-05 18:30:00'),
(8, 'GOV&#039;T MANDATORIES', 8, 3, '', '2025-03-05 18:30:25', '2025-03-05 18:30:25'),
(9, 'OTHER ACCREDITATION / CERTIFICATION', 9, 3, '', '2025-03-05 18:30:48', '2025-03-05 18:30:48'),
(10, 'TITLE TRANSFER', 10, 3, '', '2025-03-05 18:31:08', '2025-03-05 18:31:08'),
(11, 'Accounting Runner', 11, 3, '', '2025-03-05 18:31:22', '2025-03-05 18:31:22');

-- --------------------------------------------------------

--
-- Table structure for table `service_requirements`
--

CREATE TABLE `service_requirements` (
  `requirement_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `requirement` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `liaison_id` int(11) NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `service_category_id` int(11) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('PENDING','IN_PROGRESS','SUBMITTED','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `liaison_id`, `service_id`, `service_category_id`, `due_date`, `priority`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(1, '', 'awdawwa', 7, 1, NULL, NULL, 'medium', 'PENDING', 0, '2025-03-09 03:10:27', '2025-03-09 03:10:27'),
(2, '', 'aww', 7, NULL, NULL, NULL, 'medium', 'PENDING', 0, '2025-03-09 03:12:20', '2025-03-09 03:12:20'),
(3, '', 'awdwadwa', 7, 6, NULL, '2025-03-27', 'medium', 'PENDING', 0, '2025-03-09 03:13:49', '2025-03-09 10:26:24'),
(4, '', 'awdwadwa 2', 7, 6, NULL, '2025-03-27', 'medium', 'COMPLETED', 0, '2025-03-09 03:16:24', '2025-03-09 12:31:49');

-- --------------------------------------------------------

--
-- Table structure for table `task_submissions`
--

CREATE TABLE `task_submissions` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `liaison_id` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `expenses_data` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_submissions`
--

INSERT INTO `task_submissions` (`id`, `task_id`, `liaison_id`, `notes`, `expenses_data`, `status`, `created_at`, `updated_at`) VALUES
(1, 4, 7, 'Haha', NULL, 'PENDING', '2025-03-09 10:28:29', '2025-03-09 10:44:08');

-- --------------------------------------------------------

--
-- Table structure for table `task_submission_attachments`
--

CREATE TABLE `task_submission_attachments` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_submission_attachments`
--

INSERT INTO `task_submission_attachments` (`id`, `submission_id`, `filename`, `file_path`, `file_type`, `file_size`, `created_at`) VALUES
(1, 1, '67cd6d4d49a28_image_1741516102466.jpg', 'uploads/job_orders/67cc65484795d_1741448520.jpg', 'image/jpeg', 154135, '2025-03-09 10:28:29');

-- --------------------------------------------------------

--
-- Table structure for table `task_submission_expenses`
--

CREATE TABLE `task_submission_expenses` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_submission_expenses`
--

INSERT INTO `task_submission_expenses` (`id`, `submission_id`, `description`, `amount`, `created_at`, `updated_at`) VALUES
(2, 1, 'Hatdog', 100.00, '2025-03-09 10:44:08', '2025-03-09 10:44:08'),
(3, 1, 'Another', 300.00, '2025-03-09 10:44:08', '2025-03-09 10:44:08');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `photo_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `photo_url`, `created_at`, `updated_at`) VALUES
(3, 'Orlan', 'admin@gmail.com', '$2b$10$dSqJy/jEuNUrkWscVGJd0eGwE5ZH.LliCJxkre1x.oX9Tc7pgJyJi', 'Admin', NULL, '2025-02-28 18:18:41', '2025-03-10 03:13:27'),
(5, 'Staff', 'staff@gmail.com', '$2b$10$a/QnceDlWnj6cQdWqj014e.mcnJHErp4avdWqU/lIRS2x.OnNfecm', 'Employee', NULL, '2025-03-01 05:57:43', '2025-03-01 05:57:43'),
(6, 'bababa', 'ab@gmail.com', '$2y$10$f8Sf0zduFyipYRQ3mfgeUeTP2VClZJJkPvVR1kSSUHKGsfUIU5Kmm', 'Employee', '', '2025-03-02 02:28:26', '2025-03-02 02:28:26'),
(7, 'Orlan', 'orlan@gmail.com', '$2b$10$dSqJy/jEuNUrkWscVGJd0eGwE5ZH.LliCJxkre1x.oX9Tc7pgJyJi', 'liaison', NULL, '2025-03-05 19:19:09', '2025-03-08 05:13:37');

-- --------------------------------------------------------

--
-- Table structure for table `user_chat_status`
--

CREATE TABLE `user_chat_status` (
  `user_id` int(11) NOT NULL,
  `is_online` tinyint(1) NOT NULL DEFAULT 0,
  `last_active` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_chat_status`
--

INSERT INTO `user_chat_status` (`user_id`, `is_online`, `last_active`) VALUES
(3, 0, '2025-03-10 02:35:52'),
(7, 0, '2025-03-09 17:30:13');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `phone`, `address`, `bio`, `position`, `department`, `skills`, `social_links`, `preferences`, `created_at`, `updated_at`) VALUES
(1, 3, '097515706123', NULL, 'Hatdog', 'Developer', NULL, NULL, NULL, NULL, '2025-03-10 03:13:27', '2025-03-10 03:25:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assigned_job_orders`
--
ALTER TABLE `assigned_job_orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`client_id`),
  ADD KEY `client_type_id` (`client_type_id`),
  ADD KEY `idx_client_name` (`client_name`),
  ADD KEY `idx_company` (`company`),
  ADD KEY `idx_email` (`email_address`);

--
-- Indexes for table `client_types`
--
ALTER TABLE `client_types`
  ADD PRIMARY KEY (`type_id`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `company_info`
--
ALTER TABLE `company_info`
  ADD PRIMARY KEY (`company_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `proposal_id` (`proposal_id`);

--
-- Indexes for table `job_orders`
--
ALTER TABLE `job_orders`
  ADD PRIMARY KEY (`job_order_id`),
  ADD KEY `fk_service` (`service_id`),
  ADD KEY `fk_proposals` (`proposal_id`);

--
-- Indexes for table `job_order_submissions`
--
ALTER TABLE `job_order_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_order_id` (`job_order_id`),
  ADD KEY `liaison_id` (`liaison_id`);

--
-- Indexes for table `job_order_submission_attachments`
--
ALTER TABLE `job_order_submission_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`);

--
-- Indexes for table `job_order_submission_expenses`
--
ALTER TABLE `job_order_submission_expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indexes for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_id` (`message_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`project_id`),
  ADD KEY `proposal_id` (`proposal_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `proposals`
--
ALTER TABLE `proposals`
  ADD PRIMARY KEY (`proposal_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `pro_services`
--
ALTER TABLE `pro_services`
  ADD PRIMARY KEY (`pro_service_id`),
  ADD KEY `proposal_id` (`proposal_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `idx_service_name` (`service_name`),
  ADD KEY `idx_service_category` (`service_category_id`);

--
-- Indexes for table `service_categories`
--
ALTER TABLE `service_categories`
  ADD PRIMARY KEY (`service_category_id`),
  ADD KEY `added_by_id` (`added_by_id`),
  ADD KEY `idx_category_name` (`service_category_name`);

--
-- Indexes for table `service_requirements`
--
ALTER TABLE `service_requirements`
  ADD PRIMARY KEY (`requirement_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `liaison_id` (`liaison_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `service_category_id` (`service_category_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `task_submissions`
--
ALTER TABLE `task_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `liaison_id` (`liaison_id`);

--
-- Indexes for table `task_submission_attachments`
--
ALTER TABLE `task_submission_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`);

--
-- Indexes for table `task_submission_expenses`
--
ALTER TABLE `task_submission_expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_chat_status`
--
ALTER TABLE `user_chat_status`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assigned_job_orders`
--
ALTER TABLE `assigned_job_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `client_types`
--
ALTER TABLE `client_types`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `company_info`
--
ALTER TABLE `company_info`
  MODIFY `company_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `job_orders`
--
ALTER TABLE `job_orders`
  MODIFY `job_order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `job_order_submissions`
--
ALTER TABLE `job_order_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `job_order_submission_attachments`
--
ALTER TABLE `job_order_submission_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `job_order_submission_expenses`
--
ALTER TABLE `job_order_submission_expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `message_attachments`
--
ALTER TABLE `message_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `project_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `proposals`
--
ALTER TABLE `proposals`
  MODIFY `proposal_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pro_services`
--
ALTER TABLE `pro_services`
  MODIFY `pro_service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `service_categories`
--
ALTER TABLE `service_categories`
  MODIFY `service_category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `service_requirements`
--
ALTER TABLE `service_requirements`
  MODIFY `requirement_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `task_submissions`
--
ALTER TABLE `task_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `task_submission_attachments`
--
ALTER TABLE `task_submission_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `task_submission_expenses`
--
ALTER TABLE `task_submission_expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`client_type_id`) REFERENCES `client_types` (`type_id`);

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `proposals` (`proposal_id`) ON DELETE CASCADE;

--
-- Constraints for table `job_order_submissions`
--
ALTER TABLE `job_order_submissions`
  ADD CONSTRAINT `fk_submissions_job_order` FOREIGN KEY (`job_order_id`) REFERENCES `job_orders` (`job_order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_submissions_liaison` FOREIGN KEY (`liaison_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `job_order_submission_attachments`
--
ALTER TABLE `job_order_submission_attachments`
  ADD CONSTRAINT `fk_attachments_submission` FOREIGN KEY (`submission_id`) REFERENCES `job_order_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `job_order_submission_expenses`
--
ALTER TABLE `job_order_submission_expenses`
  ADD CONSTRAINT `fk_expenses_submission` FOREIGN KEY (`submission_id`) REFERENCES `job_order_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD CONSTRAINT `message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `proposals` (`proposal_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`) ON DELETE CASCADE;

--
-- Constraints for table `proposals`
--
ALTER TABLE `proposals`
  ADD CONSTRAINT `proposals_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`) ON DELETE CASCADE;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`service_category_id`) REFERENCES `service_categories` (`service_category_id`);

--
-- Constraints for table `service_categories`
--
ALTER TABLE `service_categories`
  ADD CONSTRAINT `service_categories_ibfk_1` FOREIGN KEY (`added_by_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `service_requirements`
--
ALTER TABLE `service_requirements`
  ADD CONSTRAINT `service_requirements_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `task_submissions`
--
ALTER TABLE `task_submissions`
  ADD CONSTRAINT `task_submissions_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_submissions_ibfk_2` FOREIGN KEY (`liaison_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_submission_attachments`
--
ALTER TABLE `task_submission_attachments`
  ADD CONSTRAINT `task_submission_attachments_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `task_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_submission_expenses`
--
ALTER TABLE `task_submission_expenses`
  ADD CONSTRAINT `task_submission_expenses_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `task_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_chat_status`
--
ALTER TABLE `user_chat_status`
  ADD CONSTRAINT `user_chat_status_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `fk_user_profiles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
