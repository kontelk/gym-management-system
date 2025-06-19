<?php include 'templates/header.php'; ?>
<div id="admin-schedule-page-identifier" class="d-none"></div>

<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Διαχείριση Ωρολογίου Προγράμματος</h2>
        <button id="add-event-btn" class="btn btn-success">Προσθήκη Event</button>
    </div>



    <div class="row mb-3 align-items-end">
        <div class="col-md-4">
            <label for="week-picker" class="form-label">Επιλογή Εβδομάδας</label>
            <input type="week" class="form-control" id="week-picker">
        </div>
        <div class="col-md-6">
            <div class="form-check form-switch mb-2">
            <input class="form-check-input" type="checkbox" role="switch" id="toggle-individual-programs" checked>
            <label class="form-check-label" for="toggle-individual-programs">Εμφάνιση Ατομικών Προγραμμάτων</label>
            </div>
        </div>
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


    
    <div id="message-area" class="mt-3"></div>
    <div id="schedule-container">
        </div>
</div>

<div class="modal fade" id="event-modal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal-title">Προσθήκη Event</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="event-form" class="needs-validation" novalidate>
                    <div class="modal-message-area mb-3"></div> <!-- Για γενικά μηνύματα μέσα στο modal -->
                    <div class="mb-3">
                        <label for="event-program" class="form-label">Ομαδικό Πρόγραμμα (*)</label>
                        <select class="form-select" id="event-program" required></select>
                        <div class="invalid-feedback">Επιλέξτε πρόγραμμα.</div>
                    </div>
                    <div class="mb-3">
                        <label for="event-trainer" class="form-label">Γυμναστής (*)</label>
                        <select class="form-select" id="event-trainer" required></select>
                        <div class="invalid-feedback">Επιλέξτε γυμναστή.</div>
                    </div>
                     <div class="mb-3">
                        <label for="event-date" class="form-label">Ημερομηνία (*)</label>
                        <input type="date" class="form-control" id="event-date" required>
                        <div class="invalid-feedback">Επιλέξτε μια έγκυρη ημερομηνία.</div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="event-start-time" class="form-label">Ώρα Έναρξης (*)</label>
                            <input type="time" class="form-control" id="event-start-time" step="3600" required>
                            <div class="invalid-feedback">Επιλέξτε μια έγκυρη ώρα έναρξης (μόνο ακέραιες ώρες, π.χ. 10:00).</div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="event-end-time" class="form-label">Ώρα Λήξης (*)</label>
                            <input type="time" class="form-control" id="event-end-time" step="3600" required>
                            <div class="invalid-feedback">Επιλέξτε μια έγκυρη ώρα λήξης (μόνο ακέραιες ώρες, π.χ. 11:00).</div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="event-capacity" class="form-label">Μέγιστη Χωρητικότητα (*)</label>
                        <input type="number" class="form-control" id="event-capacity" min="1" value="20" required>
                        <div class="invalid-feedback">Παρακαλώ εισάγετε μια έγκυρη μέγιστη χωρητικότητα (π.χ. 1 ή μεγαλύτερο).</div>
                    </div>
                    <button type="submit" class="btn btn-primary">Αποθήκευση</button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include 'templates/footer.php'; ?>