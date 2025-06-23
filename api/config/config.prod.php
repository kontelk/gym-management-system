<?php
// Production Settings (Apache in htdocs)

// Database (πιθανόν να είναι τα ίδια για το τοπικό XAMPP/WAMP)
define('DB_HOST', 'localhost');
define('DB_NAME', 'gym_management_db');
define('DB_USER', 'developer');
define('DB_PASS', 'Qwerty!2345');
define('DB_PORT', '3306'); // Προαιρετικό, αν χρησιμοποιείς την προεπιλεγμένη πόρτα 3306

// Paths
// Το project τρέχει μέσα σε υποφάκελο.
define('APP_BASE_HREF', '/gym-management-system/');
// Το API είναι πλέον σχετικό με τη ρίζα του server.
define('API_BASE_PATH', '/gym-management-system/api/endpoints');

// Error Reporting (πιο ασφαλές για production)
error_reporting(0);
ini_set('display_errors', 0);

// error_reporting(E_ALL);
// ini_set('display_errors', 1);


// JWT Settings
define('JWT_SECRET_KEY', 'your_super_secret_key_for_dev');
define('JWT_ISSUER', 'http://localhost:3000');
define('JWT_AUDIENCE', 'http://localhost:3000');
define('JWT_EXP_SECONDS', (60 * 20)); // 20 λεπτά