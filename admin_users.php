<?php
include 'templates/header.php';
?>
<div id="admin-users-page-identifier" class="d-none"></div>

<div class="container">
    <h2 class="text-center mb-4">Διαχείριση Χρηστών</h2>
    <div id="message-area" class="mt-3"></div>

    <ul class="nav nav-tabs" id="userTabs" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active" id="pending-tab" data-bs-toggle="tab" data-bs-target="#pending" type="button" role="tab">Αιτήματα σε Αναμονή <span id="pending-count" class="badge bg-danger ms-1"></span></button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="all-users-tab" data-bs-toggle="tab" data-bs-target="#all-users" type="button" role="tab">Όλοι οι Χρήστες</button>
        </li>
    </ul>

    <div class="tab-content" id="userTabsContent">
        <div class="tab-pane fade show active" id="pending" role="tabpanel">
            <div class="table-responsive mt-3">
                <table class="table table-striped">
                    <thead><tr><th>Username</th><th>Όνομα</th><th>Email</th><th>Ημ/νία Αιτήματος</th><th>Ενέργεια</th></tr></thead>
                    <tbody id="pending-users-tbody"></tbody>
                </table>
            </div>
        </div>
        <div class="tab-pane fade" id="all-users" role="tabpanel">
             <div class="table-responsive mt-3">
                <table class="table table-striped">
                    <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Ρόλος</th><th>Κατάσταση</th></tr></thead>
                    <tbody id="all-users-tbody"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php
include 'templates/footer.php';
?>