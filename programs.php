<?php
// Συμπερίληψη του header
include 'templates/header.php';
?>

<div class="container">
    <h2 class="text-center mb-4">Τα Προγράμματά Μας</h2>

    <div class="row mb-3 align-items-end">
        <div class="col-md-10"></div>
        <div class="col-md-2">
            <div class="border p-2 rounded">
                <div class="d-flex align-items-center mb-1">
                    <span class="me-2" style="display: inline-block; width: 15px; height: 15px; background-color: var(--bs-success-bg-subtle); border: 1px solid var(--bs-success-border-subtle);"></span>
                    <span class="small">Ατομικά Προγράμματα</span>
                </div>
                <div class="d-flex align-items-center">
                    <span class="me-2" style="display: inline-block; width: 15px; height: 15px; background-color: var(--bs-primary-bg-subtle); border: 1px solid var(--bs-primary-border-subtle);"></span>
                    <span class="small">Ομαδικά Προγράμματα</span>
                </div>
            </div>
        </div>
    </div>
    
    <div id="message-area"></div>
    
    <div id="programs-container" class="row">
        </div>
</div>

<?php
// Συμπερίληψη του footer
include 'templates/footer.php';
?>