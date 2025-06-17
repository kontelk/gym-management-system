<?php
// Συμπερίληψη του header
include 'templates/header.php';
?>


<!-- <div class="row justify-content-center">
    <div class="col-md-6">
        <h2 class="text-center mb-4">Είσοδος</h2>
        
        <form id="login-form">
            <div class="mb-3">
                <label for="username" class="form-label">Όνομα Χρήστη</label>
                <input type="text" class="form-control" id="username" name="username" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Κωδικός Πρόσβασης</label>
                <input type="password" class="form-control" id="password" name="password" required>
            </div>

            



            <div class="d-grid">
                <button type="submit" class="btn btn-primary">Είσοδος</button>
            </div>
        </form>
        
        <div id="message-area" class="mt-3"></div>
        
    </div>
</div> -->




<!-- Wrapper div για κατακόρυφη και οριζόντια στοίχιση στο κέντρο -->
<div class="d-flex flex-grow-1 align-items-center justify-content-center py-4">
    <!-- Column div για τον καθορισμό του πλάτους του card -->
    <div class="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
        <div class="card shadow-sm">
            <div class="card-body p-4 p-lg-5">
                <h2 class="text-center mb-4">Είσοδος Χρήστη</h2>
                <form id="login-form" method="POST" novalidate>
                    <div class="mb-3">
                        <label for="username" class="form-label">Όνομα Χρήστη</label>
                        <input type="text" class="form-control" id="username" name="username" required autocomplete="off">
                        <div class="invalid-feedback">Το όνομα χρήστη είναι υποχρεωτικό.</div>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Κωδικός Πρόσβασης</label>
                        <input type="password" class="form-control" id="password" name="password" required autocomplete="off">
                        <div class="invalid-feedback">Ο κωδικός πρόσβασης είναι υποχρεωτικός.</div>
                    </div>
                    <div class="d-grid mb-3">
                        <button type="submit" class="btn btn-primary">Είσοδος</button>
                    </div>
                </form>
                <div id="message-area" class="mt-3">
                    <!-- Τα μηνύματα σφάλματος/επιτυχίας θα εμφανιστούν εδώ -->
                </div>
                <p class="mt-4 text-center mb-0">Δεν έχετε λογαριασμό; <a href="register.php">Εγγραφείτε εδώ</a></p>
            </div>
        </div>
    </div>
</div>


<?php
// Συμπερίληψη του footer
include 'templates/footer.php';
?>