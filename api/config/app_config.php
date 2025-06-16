<?php
// =================================================================
//  1.0.0
//  Gym Management System - Configuration File
//  Created by: Konstantinos Telkis
// =================================================================


// --- Σταθερές (constants) για τα στοιχεία σύνδεσης με τη βάση δεδομένων ---

// Ο host του server της βάσης δεδομένων.
define('DB_HOST', 'localhost');

// Το όνομα της βάσης δεδομένων που δημιουργήσαμε.
define('DB_NAME', 'gym_management_db');

// Ο χρήστης της βάσης δεδομένων.
define('DB_USER', 'developer');

// Ο κωδικός του χρήστη της βάσης δεδομένων.
define('DB_PASS', 'Qwerty!2345');

// Η πόρτα του MySQL server (η προεπιλογή είναι 3306).
define('DB_PORT', '3306');


// --- Ρυθμίσεις για το JSON Web Token (JWT) ---

// Μυστικό κλειδί για την υπογραφή του token (64+ characters with uppercase, lowercase, numbers, and symbols)
define('JWT_SECRET_KEY', 's83fJkL!29dm^PoaUq4vXw7ZbN9qMeRcT1yHG5vLa6BdXn@z0WcE#rYpLtMvN3xQ');

// Ο εκδότης του token.
define('JWT_ISSUER', 'http://localhost');

// Το κοινό του token.
define('JWT_AUDIENCE', 'http://localhost');

// Διάρκεια ζωής του token σε δευτερόλεπτα (10 λεπτά)
define('JWT_EXP_SECONDS', 600);

