<?php
include 'templates/header.php';
?>
<div id="admin-dashboard-page-identifier" class="d-none"></div>

<div class="container">
    <h2 class="text-center mb-4">Πίνακας Ελέγχou Διαχειριστή</h2>
    <div class="row">

        <div class="col-md-4 mb-3">
            <div class="card bg-primary-subtle">
                <div class="card-body">
                    <h5 class="card-title"><em>Διαχείριση Χρηστών</em></h5>
                    <p class="card-text">Προβολή όλων των χρηστών και έγκριση νέων αιτημάτων εγγραφής.</p>
                    <a href="admin_users.php" class="btn btn-primary">Μετάβαση</a>
                </div>
            </div>
        </div>

        <div class="col-md-4 mb-3">
            <div class="card bg-primary-subtle">
                <div class="card-body">
                    <h5 class="card-title"><em>Διαχείριση Προγραμμάτων</em></h5>
                    <p class="card-text">Προβολή όλων των προγραμμάτων για την διαχείρισή τους.</p>
                    <a href="admin_programs.php" class="btn btn-primary">Μετάβαση</a>
                </div>
            </div>
        </div>

        <div class="col-md-4 mb-3">
            <div class="card bg-primary-subtle">
                <div class="card-body">
                    <h5 class="card-title"><em>Χρονοπρογραμματισμός</em></h5>
                    <p class="card-text">Προβολή και διαχείριση των των κρατήσεων των χρηστών.</p>

                    <a href="admin_schedule.php" class="btn btn-primary">Μετάβαση</a>
                </div>
            </div>
        </div>

        <div class="col-md-4 mb-3">
            <div class="card bg-primary-subtle">
                <div class="card-body">
                    <h5 class="card-title"><em>Διαχείριση Ανακοινώσεων</em></h5>
                    <p class="card-text">Δημιουργία, επεξεργασία και διαγραφή νέων και προσφορών για τους χρήστες.</p>
                    <a href="admin_announcements.php" class="btn btn-primary">Μετάβαση</a>
                </div>
            </div>
        </div>

    </div>
</div>

<?php
include 'templates/footer.php';
?>