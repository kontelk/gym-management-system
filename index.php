<?php
// Συμπερίληψη του header
include 'templates/header.php';
?>

<!-- Background Carousel -->
<div id="backgroundCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel">
    <div class="carousel-inner">
        <?php for ($i = 1; $i <= 8; $i++): ?>
            <div class="carousel-item <?php echo ($i === 1) ? 'active' : ''; ?>">
                <img src="images/image<?php echo $i; ?>.jpg" class="d-block w-100 h-100" alt="Background Image <?php echo $i; ?>">
            </div>
        <?php endfor; ?>
    </div>
</div>
<div id="carousel-overlay"></div>

<!-- Το div "page-content-wrapper" αφαιρείται. Το περιεχόμενο τοποθετείται μέσα στο .container.mt-4 του header.php -->
<!-- <div class="page-content-wrapper" style="position: relative; z-index: 1;"> -->
    <div class="jumbotron text-center">
        <h1 class="display-4 text-white">Καλωσήρθατε στο Olympus Gym!</h1>
        <hr class="my-4">
        <p class="lead text-white">Δείτε τα διαθέσιμα προγράμματά μας ή κάντε εγγραφή για να ξεκινήσετε τις κρατήσεις σας.</p>
        <a class="btn btn-primary btn-lg" href="programs.php" role="button">Προβολή Προγραμμάτων</a>
        <a class="btn btn-success btn-lg guest-link" href="register.php" role="button">Κάνε Εγγραφή</a>
    </div>

    <div class="container mt-5">
        <h3 class="text-center mb-4 text-white">Τελευταία Νέα & Ανακοινώσεις</h3>
        <div id="announcements-container" class="list-group">
        </div>
    </div>
<!-- </div> -->

<?php
// Συμπερίληψη του footer
include 'templates/footer.php';
?>
