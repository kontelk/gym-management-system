<?php
// =================================================================================
// api/bootstrap.php
// Αυτό το αρχείο θα φορτώνεται σε κάθε αίτημα API για να ρυθμίζει το περιβάλλον
// Ορίζουμε τη ρίζα του API για εύκολη αναφορά
// =================================================================================

// Ορίζουμε μια σταθερά για τη ρίζα του API για εύκολη χρήση
if (!defined('API_ROOT')) {
    define('API_ROOT', __DIR__);
}

// Φορτώνουμε το κεντρικό αρχείο ρυθμίσεων
require_once API_ROOT . '/config/config.php';

// κοινά includes
include_once API_ROOT . '/core/Database.php';
include_once API_ROOT . '/services/TokenValidator.php';
include_once API_ROOT . '/services/RoleValidator.php';







?>
