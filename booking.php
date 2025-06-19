<?php
// Συμπερίληψη του header
include 'templates/header.php';
?>

<div id="booking-page-identifier" class="d-none"></div>

<div class="container">
    <h2 id="program-title" class="text-center mb-4">Φόρτωση προγράμματος...</h2>
    
    <div class="row justify-content-center">
        <div class="col-md-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title text-center">1. Επιλέξτε Ημερομηνία</h5>
                    <div class="mb-3">
                        <input type="date" class="form-control" id="date-picker">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="mt-4">
        <h5 class="text-center">2. Διαθέσιμα Ραντεβού</h5>
        <div id="message-area" class="mt-3"></div>
        <div id="availability-results" class="list-group">
            <p class="text-center text-muted">Παρακαλώ επιλέξτε ημερομηνία για να δείτε τη διαθεσιμότητα.</p>
        </div>
    </div>
</div>

<?php
// Συμπερίληψη του footer
include 'templates/footer.php';
?>