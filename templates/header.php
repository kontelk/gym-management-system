<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Olympus Gym</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/png" href="favicon.ico">
</head>

<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="index.php">
      <img src="icons/olympus.png" alt="Olympus Gym Logo" height="35">&nbsp;<strong>Olympus Gym</strong>
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav w-100">
        <li class="nav-item"><a class="nav-link" href="index.php">Αρχική</a></li>
        <li class="nav-item"><a class="nav-link" href="programs.php">Προγράμματα</a></li>
        
        <li class="nav-item user-link d-none"><a class="nav-link" href="my_bookings.php">Οι Κρατήσεις μου</a></li>
        
        <li class="nav-item admin-link d-none"><a class="nav-link" href="admin_dashboard.php">Admin Dashboard</a></li>
      </ul>
      
      <ul class="navbar-nav ms-auto">
        <li class="nav-item guest-link"><a class="nav-link" href="login.php">Είσοδος</a></li>
        <li class="nav-item guest-link"><a class="nav-link btn btn-primary text-white" href="register.php">Εγγραφή</a></li>
        
        <li class="nav-item dropdown auth-link d-none">
          <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="icons/user.png" alt="User Icon" width="24" height="24" class="me-2">
            <span id="username-display-dropdown"></span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarUserDropdown">
            <li><a class="dropdown-item" id="logout-btn" href="#">Αποσύνδεση</a></li>
            </ul>
        </li>

        <li class="nav-item auth-link d-none ms-3">
            <div id="jwt-timer" data-bs-toggle="tooltip" data-bs-title="Ανανέωση Χρόνου Συνεδρίας">
                <div id="jwt-timer-text"></div>
            </div>
        </li>
        
      </ul>
    </div>
  </div>
</nav>

<main class="container mt-4">
