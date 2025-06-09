<?php
// Συμπερίληψη του header
include 'templates/header.php';
?>

<div class="row justify-content-center">
    <div class="col-md-8">
        <h2 class="text-center mb-4">Φόρμα Εγγραφής Νέου Μέλους</h2>
        <p class="text-center text-muted">Μετά την υποβολή, το αίτημά σας θα ελεγχθεί από τον διαχειριστή.</p>
        
        <form id="register-form">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="first_name" class="form-label">Όνομα</label>
                    <input type="text" class="form-control" id="first_name" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="last_name" class="form-label">Επώνυμο</label>
                    <input type="text" class="form-control" id="last_name" required>
                </div>
            </div>
            <div class="mb-3">
                <label for="username" class="form-label">Όνομα Χρήστη (Username)</label>
                <input type="text" class="form-control" id="username" required>
            </div>
             <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Κωδικός Πρόσβασης</label>
                <input type="password" class="form-control" id="password" required>
            </div>
            <div class="row">
                 <div class="col-md-6 mb-3">
                    <label for="country-select" class="form-label">Χώρα</label>
                    <select class="form-select" id="country-select" required>
                        <option selected disabled value="">Φόρτωση χωρών...</option>
                    </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="city-select" class="form-label">Πόλη</label>
                    <select class="form-select" id="city-select" required disabled>
                        <option selected disabled value="">Επιλέξτε πρώτα χώρα</option>
                    </select>
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