<?php include 'templates/header.php'; ?>
<div id="admin-announcements-page-identifier" class="d-none"></div>
<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Διαχείριση Ανακοινώσεων</h2>
        <button id="add-announcement-btn" class="btn btn-success">Προσθήκη Νέας Ανακοίνωσης</button>
    </div>
    <div id="message-area" class="mt-3"></div>
    <div class="table-responsive">
        <table class="table table-striped">
            <thead><tr><th>Τίτλος</th><th>Δημιουργός</th><th>Ημ/νία</th><th>Ενέργειες</th></tr></thead>
            <tbody id="announcements-tbody"></tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="announcement-modal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content bg-light">
            <div class="modal-header"><h5 class="modal-title" id="modal-title">Προσθήκη Ανακοίνωσης</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
                <form id="announcement-form">
                    <input type="hidden" id="announcement-id">
                    <div class="mb-3">
                        <label for="announcement-title" class="form-label">Τίτλος (*)</label>
                        <input type="text" class="form-control" id="announcement-title" required>
                    </div>
                    <div class="mb-3">
                        <label for="announcement-content" class="form-label">Περιεχόμενο (*)</label>
                        <textarea class="form-control" id="announcement-content" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Αποθήκευση</button>
                </form>
            </div>
        </div>
    </div>
</div>
<?php include 'templates/footer.php'; ?>