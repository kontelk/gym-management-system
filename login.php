<?php
// Συμπερίληψη του header
include 'templates/header.php';
?>

<div class="row justify-content-center">
    <div class="col-md-6">
        <h2 class="text-center mb-4">Είσοδος στο Σύστημα</h2>
        
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
</div>

<?php
// Συμπερίληψη του footer
include 'templates/footer.php';
?>