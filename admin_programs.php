<?php
include 'templates/header.php';
?>
<div id="admin-programs-page-identifier" class="d-none"></div>

<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Διαχείριση Προγραμμάτων</h2>
        <button id="add-program-btn" class="btn btn-success">Προσθήκη Νέου Προγράμματος</button>
    </div>
    <div id="message-area" class="mt-3"></div>
    <div class="table-responsive">
        <table class="table table-striped">
            <thead><tr><th>Όνομα</th><th>Τύπος</th><th>Χωρητικότητα</th><th>Κατάσταση</th><th>Ενέργειες</th></tr></thead>
            <tbody id="programs-tbody"></tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="program-modal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content bg-light">
            <div class="modal-header">
                <h5 class="modal-title" id="modal-title">Προσθήκη Προγράμματος</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div id="modal-message-area" class="mb-3"></div> <!-- ΝΕΟ: Χώρος μηνυμάτων μέσα στο modal -->
                <form id="program-form" class="needs-validation" novalidate>
                    <input type="hidden" id="program-id">
                    <div class="mb-3">
                        <label for="program-name" class="form-label">Όνομα (*)</label>
                        <input type="text" class="form-control" id="program-name" required>
                        <div class="invalid-feedback"></div>
                        <div class="form-text">Συμπληρώστε όνομα προγράμματος</div>
                    </div>
                    <div class="mb-3">
                        <label for="program-description" class="form-label">Περιγραφή (*)</label>
                        <textarea class="form-control" id="program-description" rows="3" required></textarea>
                        <div class="invalid-feedback"></div>
                        <div class="form-text">Συμπληρώστε περιγραφή του προγράμματος</div>
                    </div>
                    <div class="mb-3">
                        <label for="program-type" class="form-label">Τύπος (*)</label>
                        <select class="form-select" id="program-type" required>
                            <option value="individual">Ατομικό</option>
                            <option value="group">Ομαδικό</option>
                        </select>
                        <div class="invalid-feedback"></div>
                        <div class="form-text">Επιλέξτε τον τύπο του προγράμματος</div>
                    </div>
                    <div class="mb-3">
                        <label for="program-max-capacity" class="form-label">Μέγιστη Χωρητικότητα (*)</label>
                        <input type="number" class="form-control" id="program-max-capacity" min="1" value="20" required>
                        <div class="invalid-feedback"></div>
                        <div class="form-text">Ορίστε τη μέγιστη χωρητικότητα του προγράμματος</div>
                    </div>
                    <div class="mb-3 form-check" id="status-wrapper">
                        <input type="checkbox" class="form-check-input" id="program-is-active">
                        <label class="form-check-label" for="program-is-active">Ενεργό</label>
                    </div>
                    <button type="submit" class="btn btn-primary">Αποθήκευση</button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php
include 'templates/footer.php';
?>