-- SQL Database Script for GoTek Feedback Website
-- You can import this script directly into phpMyAdmin or run it via command line.

CREATE DATABASE IF NOT EXISTS `gotek_feedback` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gotek_feedback`;

-- Table structure for table `feedback`
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `organization_type` VARCHAR(100) NOT NULL,
  `rating` TINYINT NOT NULL,
  `feedback_message` TEXT NOT NULL,
  `recommend` VARCHAR(10) NOT NULL,
  `referral_name` VARCHAR(255) NULL,
  `referral_contact` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
