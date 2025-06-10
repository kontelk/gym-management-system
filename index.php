<?php
// Συμπερίληψη του header
include 'templates/header.php';
?>

<div class="jumbotron text-center">
    <h1 class="display-4">Καλωσήρθατε στα Γυμναστήριό μας!</h1>
    <!-- <p class="lead">Το σύγχρονο σύστημα διαχείρισης για τις κρατήσεις και τα μέλη του γυμναστηρίου σας.</p> -->
    <p class="lead">Διαχειριστείτε εύκολα τις κρατήσεις σας και μείνετε ενημερωμένοι για τα νέα μας.</p>
    <hr class="my-4">
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