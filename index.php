<?php
// Συμπερίληψη του header
include 'templates/header.php';
?>

<div class="jumbotron text-center">
    <h1 class="display-4">Καλωσήρθατε στο Olympus Gym!</h1>
    <hr class="my-4">
    &nbsp;
    <p>Δείτε τα διαθέσιμα προγράμματά μας ή κάντε εγγραφή για να ξεκινήσετε τις κρατήσεις σας.</p>
    <a class="btn btn-primary btn-lg" href="programs.php" role="button">Προβολή Προγραμμάτων</a>
    <a class="btn btn-success btn-lg guest-link" href="register.php" role="button">Κάνε Εγγραφή</a>
    
</div>

<div class="container mt-5">
    <h3 class="text-center mb-4">Τελευταία Νέα & Ανακοινώσεις</h3>
    <div id="announcements-container" class="list-group">
        </div>
</div>

<?php
// Συμπερίληψη του footer
include 'templates/footer.php';
?>