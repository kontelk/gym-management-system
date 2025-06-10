<?php
// Συμπερίληψη του header
include 'templates/header.php';
?>

<div class="row justify-content-center">
    <div class="col-md-8">
        <h2 class="text-center mb-4">Φόρμα Εγγραφής Νέου Μέλους</h2>
        <p class="text-center text-muted">Μετά την υποβολή, το αίτημά σας θα ελεγχθεί από τον διαχειριστή.</p>

        <form id="register-form" novalidate>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="first_name" class="form-label">Όνομα(*)</label>
                    <input type="text" class="form-control" id="first_name" name="first_name" required autocomplete="off">
                    <div class="invalid-feedback">Το όνομα είναι υποχρεωτικό.</div>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="last_name" class="form-label">Επώνυμο(*)</label>
                    <input type="text" class="form-control" id="last_name" name="last_name" required autocomplete="off">
                    <div class="invalid-feedback">Το επώνυμο είναι υποχρεωτικό.</div>
                </div>
            </div>
            <div class="mb-3">
                <label for="username" class="form-label">Username(*)</label>
                <input type="text" class="form-control" id="username" name="username" required minlength="5" autocomplete="off">
                <div class="invalid-feedback">Απαιτείται όνομα χρήστη με τουλάχιστον 5 χαρακτήρες.</div>
            </div>
             <div class="mb-3">
                <label for="email" class="form-label">Email(*)</label>
                <input type="email" class="form-control" id="email" required autocomplete="off">
                <div class="invalid-feedback">Το email είναι υποχρεωτικό και πρέπει να είναι έγκυρο.</div>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Κωδικός Πρόσβασης(*)</label>
                <input type="password" class="form-control" id="password" required minlength="8">
                <div class="invalid-feedback">Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 8 χαρακτήρες.</div>
            </div>
            <div class="row">
                 <div class="col-md-6 mb-3">
                    <label for="country-select" class="form-label">Χώρα(*)</label>
                    <select class="form-select" id="country-select" required>
                        <option selected disabled value="">Φόρτωση χωρών...</option>
                    </select>
                    <div class="invalid-feedback">Παρακαλώ επιλέξτε χώρα.</div>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="city-select" class="form-label">Πόλη(*)</label>
                    <select class="form-select" id="city-select" required disabled>
                        <option selected disabled value="">Επιλέξτε πρώτα χώρα</option>
                    </select>
                    <div class="invalid-feedback">Παρακαλώ επιλέξτε πόλη.</div>
                </div>
            </div>
            <div class="mb-3">
                <label for="address" class="form-label">Διεύθυνση (Προαιρετικά)</label>
                <input type="text" class="form-control" id="address">
            </div>
            
            <div class="d-grid">
                <button type="submit" class="btn btn-primary">Υποβολή Αιτήματος Εγγραφής</button>
            </div>

        </form>
        
        <div id="message-area" class="mt-3"></div>
        
    </div>
</div>

<?php
// Συμπερίληψη του footer
include 'templates/footer.php';
?>