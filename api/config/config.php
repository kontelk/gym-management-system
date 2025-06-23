<?php
// Config Loader

// Ορίζουμε μια σταθερά για το περιβάλλον. ('development' ή 'production')
define('ENVIRONMENT', 'production'); 

if (ENVIRONMENT == 'development') {
    require_once 'config.dev.php';
} else if (ENVIRONMENT == 'production') {
    require_once 'config.prod.php';
}