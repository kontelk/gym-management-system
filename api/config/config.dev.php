<?php
// Development Settings (VS Code Live Server)

// Database
define('DB_HOST', 'localhost');
define('DB_NAME', 'gym_management_db');
define('DB_USER', 'developer');
define('DB_PASS', 'Qwerty!2345');
define('DB_PORT', '3306'); // Προαιρετικό, αν χρησιμοποιείς την προεπιλεγμένη πόρτα 3306

// Paths
// Στο live server, το project τρέχει στη ρίζα.
define('APP_BASE_HREF', '/'); 
// Το API τρέχει σε άλλο port, άρα χρειαζόμαστε το πλήρες URL για τις κλήσεις fetch.
define('API_BASE_PATH', 'http://localhost:3000/api/endpoints'); // Υποθέτοντας ότι το PHP τρέχει στο port 3000

// Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// JWT Settings
define('JWT_SECRET_KEY', 'your_super_secret_key_for_dev');
define('JWT_ISSUER', 'http://localhost:3000');
define('JWT_AUDIENCE', 'http://localhost:3000');
define('JWT_EXP_SECONDS', (60 * 20)); // 20 λεπτά