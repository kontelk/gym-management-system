-- =================================================================
-- Script Ελέγχου Λειτουργιών (Test Queries)
-- Βάση Δεδομένων: gym_management_db
-- Περιγραφή: Αυτό το script περιέχει SQL queries που ελέγχουν
-- τις βασικές λειτουργίες του συστήματος, όπως θα καλούνταν
-- από την εφαρμογή.
-- =================================================================

USE `gym_management_db`;

-- =================================================================
-- Α. ΛΕΙΤΟΥΡΓΙΕΣ ΔΙΑΧΕΙΡΙΣΤΗ (ADMIN)
-- =================================================================

-- -----------------------------------------------------------------
-- 1. Διαχείριση Αιτημάτων Εγγραφής
-- -----------------------------------------------------------------

-- -- Ο διαχειριστής βλέπει τα αιτήματα που είναι σε αναμονή.
SELECT id, username, email, first_name, last_name, created_at FROM users WHERE status = 'pending_approval';

-- -- Ο διαχειριστής εγκρίνει το αίτημα του χρήστη 'pending_user' (id=4).
UPDATE users SET status = 'active', role_id = 2 WHERE id = 4;

-- -- Επιβεβαίωση της αλλαγής: ο χρήστης είναι πλέον ενεργός και έχει ρόλο 'registered_user'.
SELECT username, status, role_id FROM users WHERE id = 4;


-- -----------------------------------------------------------------
-- 2. Διαχείριση Χρηστών
-- -----------------------------------------------------------------

-- -- Ο διαχειριστής βλέπει μια λίστα με όλους τους χρήστες και τους ρόλους τους.
SELECT u.id, u.username, u.email, u.first_name, u.last_name, r.role_name, u.status
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.id;


-- -----------------------------------------------------------------
-- 3. Διαχείριση Δομικών Στοιχείων
-- -----------------------------------------------------------------

-- -- Προβολή λίστας όλων των προγραμμάτων.
SELECT * FROM programs;

-- -- Προβολή λίστας όλων των γυμναστών.
SELECT * FROM trainers;

-- -- Προβολή του προγράμματος (events) για μια συγκεκριμένη ημέρα.
SELECT e.id, p.name AS program_name, CONCAT(t.first_name, ' ', t.last_name) AS trainer_name, e.start_time, e.max_capacity
FROM events e
JOIN programs p ON e.program_id = p.id
LEFT JOIN trainers t ON e.trainer_id = t.id
WHERE DATE(e.start_time) = '2025-07-09'
ORDER BY e.start_time;


-- -----------------------------------------------------------------
-- 4. Διαχείριση Ανακοινώσεων
-- -----------------------------------------------------------------

-- -- Προβολή όλων των ανακοινώσεων με το όνομα του διαχειριστή που την έγραψε.
SELECT a.title, a.content, u.username as author, a.created_at
FROM announcements a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC;


-- =================================================================
-- Β. ΛΕΙΤΟΥΡΓΙΕΣ ΧΡΗΣΤΗ (REGISTERED USER / GUEST)
-- =================================================================

-- -----------------------------------------------------------------
-- 1. Περιήγηση στις Υπηρεσίες (Guest User)
-- -----------------------------------------------------------------

-- -- Ένας μη συνδεδεμένος χρήστης βλέπει τις διαθέσιμες υπηρεσίες (αλλά όχι το ωρολόγιο πρόγραμμα).
SELECT name, description, type FROM programs WHERE is_active = TRUE;


-- -----------------------------------------------------------------
-- 2. Κράτηση Υπηρεσίας (Registered User)
-- -----------------------------------------------------------------

-- -- Ένας χρήστης (π.χ. η Μαρία, user_id=3) αναζητά διαθεσιμότητα για 'Pilates' την επόμενη Δευτέρα.
-- -- Το query υπολογίζει τις ελεύθερες θέσεις (χωρητικότητα - επιβεβαιωμένες κρατήσεις).
SELECT
    e.id AS event_id,
    p.name AS program_name,
    e.start_time,
    e.max_capacity,
    COUNT(b.id) AS confirmed_bookings,
    (e.max_capacity - COUNT(b.id)) AS available_slots
FROM events e
JOIN programs p ON e.program_id = p.id
LEFT JOIN bookings b ON e.id = b.event_id AND b.status = 'confirmed'
WHERE p.name = 'Pilates' AND DATE(e.start_time) = '2025-07-09'
GROUP BY e.id
HAVING available_slots > 0;

-- -- Προσομοίωση κράτησης: Η Μαρία (user_id=3) κλείνει το Pilates (event_id=1).
-- -- Σημείωση: Στα dummy data μας, ο Γιώργος (user_id=2) έχει ήδη κλείσει αυτή τη θέση.
-- -- Ας υποθέσουμε ότι ο Γιώργος ακυρώνει πρώτα την κράτησή του.
UPDATE bookings SET status = 'cancelled_by_user' WHERE user_id = 2 AND event_id = 1;
-- -- Τώρα η Μαρία κάνει την κράτησή της.
INSERT INTO bookings(user_id, event_id, status) VALUES (3, 1, 'confirmed');

-- -- Ας δούμε ξανά τη διαθεσιμότητα. Οι θέσεις θα πρέπει να είναι μειωμένες κατά 1.
SELECT
    e.id AS event_id,
    e.max_capacity,
    COUNT(b.id) AS confirmed_bookings,
    (e.max_capacity - COUNT(b.id)) AS available_slots
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id AND b.status = 'confirmed'
WHERE e.id = 1
GROUP BY e.id;


-- -- Έλεγχος του κανόνα ακύρωσης: Έλεγχος πόσες ακυρώσεις έχει κάνει ο χρήστης 2 (Γιώργος)
-- -- μέσα στην τρέχουσα εβδομάδα (Mon-Sun).
-- -- Η συνάρτηση WEEK(date, 1) ορίζει την εβδομάδα να ξεκινά από Δευτέρα.
-- -- Αυτή τη στιγμή έχει 1 ακύρωση.
SELECT COUNT(b.id) as weekly_cancellations
FROM bookings b
JOIN events e on b.event_id = e.id
WHERE b.user_id = 2
  AND b.status = 'cancelled_by_user'
  AND YEAR(e.start_time) = YEAR('2025-07-09')
  AND WEEK(e.start_time, 1) = WEEK('2025-07-09', 1);


-- -----------------------------------------------------------------
-- 3. Ιστορικό Κρατήσεων (Registered User)
-- -----------------------------------------------------------------

-- -- Ο χρήστης Γιώργος (user_id=2) βλέπει το ιστορικό όλων των κρατήσεών του.
SELECT p.name, e.start_time, b.status, b.created_at AS booking_date
FROM bookings b
JOIN events e ON b.event_id = e.id
JOIN programs p ON e.program_id = p.id
WHERE b.user_id = 2
ORDER BY e.start_time DESC;


-- -----------------------------------------------------------------
-- 4. Νέα/Ανακοινώσεις (Registered User)
-- -----------------------------------------------------------------

-- -- Ο χρήστης βλέπει τις ανακοινώσεις (ίδιο query με του admin).
SELECT title, content, created_at
FROM announcements
ORDER BY created_at DESC;