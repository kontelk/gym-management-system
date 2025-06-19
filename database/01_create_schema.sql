-- =================================================================
-- Script για τη δημιουργία της Βάσης Δεδομένων και των Πινάκων
-- Βάση Δεδομένων: gym_management_db
-- Έκδοση MySQL: 8.0
-- =================================================================

-- Διαγραφή της βάσης δεδομένων αν υπάρχει ήδη για να ξεκινήσουμε από καθαρή κατάσταση
DROP DATABASE IF EXISTS `gym_management_db`;

-- Δημιουργία της βάσης δεδομένων με το σωστό character set για υποστήριξη Ελληνικών
CREATE DATABASE `gym_management_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Επιλογή της βάσης δεδομένων για τις επόμενες εντολές
USE `gym_management_db`;

-- -----------------------------------------------------------------
-- Πίνακας: roles
-- Περιγραφή: Αποθηκεύει τους διαθέσιμους ρόλους χρηστών.
-- -----------------------------------------------------------------
CREATE TABLE `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------
-- Πίνακας: users
-- Περιγραφή: Αποθηκεύει τα στοιχεία των χρηστών του συστήματος.
-- -----------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `country` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) NULL,
  `role_id` INT NULL,
  `status` ENUM('pending_approval', 'active', 'rejected', 'inactive') NOT NULL DEFAULT 'pending_approval',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `fk_users_role_id` (`role_id`),
  CONSTRAINT `fk_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------
-- Πίνακας: trainers
-- Περιγραφή: Αποθηκεύει τους γυμναστές του γυμναστηρίου.
-- -----------------------------------------------------------------
CREATE TABLE `trainers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `bio` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------
-- Πίνακας: programs
-- Περιγραφή: Οι διαθέσιμες υπηρεσίες/προγράμματα του γυμναστηρίου.
-- -----------------------------------------------------------------
CREATE TABLE `programs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `type` ENUM('individual', 'group') NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `max_capacity` INT UNSIGNED NOT NULL DEFAULT 20,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_program_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------
-- Πίνακας: events
-- Περιγραφή: Κάθε εγγραφή είναι ένα συγκεκριμένο χρονικό slot διαθέσιμο για κράτηση.
-- -----------------------------------------------------------------
CREATE TABLE `events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `program_id` INT NOT NULL,
  `trainer_id` INT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `max_capacity` INT UNSIGNED NOT NULL DEFAULT 20,
  PRIMARY KEY (`id`),
  KEY `fk_events_program_id` (`program_id`),
  KEY `fk_events_trainer_id` (`trainer_id`),
  UNIQUE KEY `uk_event_slot` (`program_id`, `start_time`, `trainer_id`),
  CONSTRAINT `fk_events_program_id` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_events_trainer_id` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------
-- Πίνακας: bookings
-- Περιγραφή: Οι κρατήσεις των χρηστών για τα events.
-- -----------------------------------------------------------------
CREATE TABLE `bookings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `event_id` INT NOT NULL,
  `status` ENUM('confirmed', 'cancelled_by_user', 'cancelled_by_system') NOT NULL DEFAULT 'confirmed',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_bookings_user_id` (`user_id`),
  KEY `fk_bookings_event_id` (`event_id`),
  UNIQUE KEY `uk_user_event` (`user_id`, `event_id`),
  CONSTRAINT `fk_bookings_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_event_id` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------------------
-- Πίνακας: announcements
-- Περιγραφή: Ανακοινώσεις και προσφορές που δημιουργούν οι διαχειριστές.
-- -----------------------------------------------------------------
CREATE TABLE `announcements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `user_id` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_announcements_user_id` (`user_id`),
  CONSTRAINT `fk_announcements_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;