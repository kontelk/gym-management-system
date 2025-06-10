<!DOCTYPE html>
<html lang="el">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gym Management System</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <link rel="stylesheet" href="style.css">
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="index.php">GymSystem</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="index.php">Αρχική</a></li>
        <li class="nav-item"><a class="nav-link" href="programs.php">Προγράμματα</a></li>
        
        <!-- <li class="nav-item user-link d-none"><a class="nav-link" href="booking.php">Νέα Κράτηση</a></li> -->
        <li class="nav-item user-link d-none"><a class="nav-link" href="my_bookings.php">Κρατήσεις</a></li>
        
        <li class="nav-item admin-link d-none"><a class="nav-link" href="admin_dashboard.php">Admin Dashboard</a></li>
        
        <li class="nav-item guest-link"><a class="nav-link" href="login.php">Είσοδος</a></li>
        <li class="nav-item guest-link"><a class="nav-link btn btn-primary text-white" href="register.php">Εγγραφή</a></li>
        
        <li class="nav-item auth-link d-none"><a id="logout-btn" class="nav-link" href="#">Αποσύνδεση</a></li>
      </ul>
    </div>
  </div>
</nav>

<main class="container mt-4">
