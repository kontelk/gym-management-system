<?php include 'templates/header.php'; ?>
<div id="admin-trainers-page-identifier" class="d-none"></div>
<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Διαχείριση Γυμναστών</h2>
        <button id="add-trainer-btn" class="btn btn-success">Προσθήκη Νέου Γυμναστή</button>
    </div>

    <div id="message-area" class="mt-3"></div>
    
    <div class="table-responsive">
        <table class="table table-striped">
            <thead>
                <tr>
                    <!-- <th>ID</th> -->
                    <th>Επώνυμο</th>
                    <th>Όνομα</th>
                    <th>Ενέργειες</th>
                </tr>
            </thead>
            <tbody id="trainers-tbody"></tbody>
        </table>
    </div>
    
</div>

<div class="modal fade" id="trainer-modal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content bg-light">
            <div class="modal-header">
                <h5 class="modal-title" id="modal-title">Προσθήκη Γυμναστή</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="trainer-form">

                    <input type="hidden" id="trainer-id">

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="trainer-first-name" class="form-label">Όνομα (*)</label>
                            <input type="text" class="form-control" id="trainer-first-name" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="trainer-last-name" class="form-label">Επώνυμο (*)</label>
                            <input type="text" class="form-control" id="trainer-last-name" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="trainer-bio" class="form-label">Βιογραφικό (Προαιρετικά)</label>
                        <textarea class="form-control" id="trainer-bio" rows="4"></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary">Αποθήκευση</button>

                </form>
            </div>
        </div>
    </div>
</div>
<?php include 'templates/footer.php'; ?>