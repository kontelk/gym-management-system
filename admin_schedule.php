<?php include 'templates/header.php'; ?>
<div id="admin-schedule-page-identifier" class="d-none"></div>

<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Διαχείριση Ωρολογίου Προγράμματος</h2>
        <button id="add-event-btn" class="btn btn-success">Προσθήκη Event</button>
    </div>
    
    <div class="row mb-3">
        <div class="col-md-4">
             <label for="week-picker" class="form-label">Επιλογή Εβδομάδας</label>
             <input type="week" class="form-control" id="week-picker">
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
                <h5 class="modal-title">Προσθήκη Event</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="event-form">
                    <div class="mb-3">
                        <label for="event-program" class="form-label">Πρόγραμμα</label>
                        <select class="form-select" id="event-program" required></select>
                    </div>
                    <div class="mb-3">
                        <label for="event-trainer" class="form-label">Γυμναστής (Προαιρετικά)</label>
                        <select class="form-select" id="event-trainer"></select>
                    </div>
                     <div class="mb-3">
                        <label for="event-date" class="form-label">Ημερομηνία</label>
                        <input type="date" class="form-control" id="event-date" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="event-start-time" class="form-label">Ώρα Έναρξης</label>
                            <input type="time" class="form-control" id="event-start-time" step="1800" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="event-end-time" class="form-label">Ώρα Λήξης</label>
                            <input type="time" class="form-control" id="event-end-time" step="1800" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="event-capacity" class="form-label">Μέγιστη Χωρητικότητα</label>
                        <input type="number" class="form-control" id="event-capacity" min="1" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Αποθήκευση</button>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include 'templates/footer.php'; ?>