<?php
include 'templates/header.php';
?>
<div id="admin-users-page-identifier" class="d-none"></div>

<div class="container">
    <h2 class="text-center mb-4">Διαχείριση Χρηστών</h2>
    <div id="message-area" class="mt-3"></div>

    <ul class="nav nav-tabs" id="userTabs" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active" id="all-users-tab" data-bs-toggle="tab" data-bs-target="#all-users" type="button" role="tab">Όλοι οι Χρήστες</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="pending-tab" data-bs-toggle="tab" data-bs-target="#pending" type="button" role="tab">Αιτήματα Εγγραφής σε Αναμονή <span id="pending-count" class="badge bg-danger ms-1"></span></button>
        </li>
    </ul>

    <div class="tab-content" id="userTabsContent">
        <div class="tab-pane fade" id="pending" role="tabpanel">
            <div class="table-responsive mt-3">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Username</th><th>Ονοματεπώνυμο</th><th>Email</th><th>Ημ/νία Αιτήματος</th><th>Ενέργεια</th>
                        </tr>
                    </thead>
                    <tbody id="pending-users-tbody"></tbody>
                </table>
            </div>
        </div>
        <div class="tab-pane fade show active" id="all-users" role="tabpanel">

             <!-- <div class="table-responsive mt-3">
                <table class="table table-striped">
                    <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Ρόλος</th><th>Κατάσταση</th></tr></thead>
                    <tbody id="all-users-tbody"></tbody>
                </table>
            </div> -->

            
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Username</th><th>Ονοματεπώνυμο</th><th>Email</th><th>Ρόλος</th><th>Κατάσταση</th><th>Ενέργειες</th>
                    </tr>
                </thead>
                <tbody id="all-users-tbody"></tbody>
            </table>

            
            <div class="modal fade" id="user-modal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content bg-light">
                        <div class="modal-header">
                            <h5 class="modal-title"><em>Επεξεργασία Στοιχείων Χρήστη</em></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">

                            <form id="user-form">
                                
                                <input type="hidden" id="user-id">

                                 <div class="mb-3">
                                    <label for="user-firstname" class="form-label">Όνομα (*)</label>
                                    <input type="text" class="form-control" id="user-firstname" name="user-firstname" required autocomplete="off">
                                    <div class="invalid-feedback">Το όνομα είναι υποχρεωτικό.</div>
                                </div>

                                <div class="mb-3">
                                    <label for="user-lastname" class="form-label">Επώνυμο (*)</label>
                                    <input type="text" class="form-control" id="user-lastname" name="user-lastname" required autocomplete="off">
                                    <div class="invalid-feedback">Το επώνυμο είναι υποχρεωτικό.</div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="user-username" class="form-label">Username (*)</label>
                                    <input type="text" class="form-control" id="user-username" name="user-username" required minlength="5" autocomplete="off">
                                    <div class="invalid-feedback">Απαιτείται όνομα χρήστη με τουλάχιστον 5 χαρακτήρες.</div>
                                </div>

                                <div class="mb-3">
                                    <label for="user-password" class="form-label">Νέος Κωδικός (προαιρετικά)</label>
                                    <input type="password" class="form-control" id="user-password">
                                </div>

                                <div class="mb-3">
                                    <label for="user-email" class="form-label">Email (*)</label>
                                    <input type="email" class="form-control" id="user-email" name="user-email" required autocomplete="off">
                                    <div class="invalid-feedback">Το email είναι υποχρεωτικό και πρέπει να είναι έγκυρο.</div>
                                </div>

                                <!-- Προσθήκη πεδίων χώρας και πόλης -->
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="user-country-select" class="form-label">Χώρα (*)</label>
                                        <select class="form-select" id="user-country-select" name="country" required autocomplete="country-name">
                                            <option selected disabled value="">Φόρτωση χωρών...</option>
                                        </select>
                                        <div class="invalid-feedback">Παρακαλώ επιλέξτε χώρα.</div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="user-city-select" class="form-label">Πόλη (*)</label>
                                        <select class="form-select" id="user-city-select" name="city" required disabled autocomplete="address-level2">
                                            <option selected disabled value="">Επιλέξτε πρώτα χώρα</option>
                                        </select>
                                        <div class="invalid-feedback">Παρακαλώ επιλέξτε πόλη.</div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label for="user-role" class="form-label">Ρόλος (*)</label>
                                    <select class="form-select" id="user-role" required>
                                        <option value="1">Admin</option>
                                        <option value="2">Registered User</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="user-status" class="form-label">Κατάσταση(*)</label>
                                    <select class="form-select" id="user-status" required>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <button type="submit" class="btn btn-primary">Αποθήκευση Αλλαγών</button>
                            </form>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

<?php
include 'templates/footer.php';
?>