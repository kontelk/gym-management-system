<?php
include 'templates/header.php';
?>

<div id="my-bookings-page-identifier" class="d-none"></div>

<div class="container">
    <h2 class="text-center mb-4">Οι Κρατήσεις μου</h2>

    <div id="message-area" class="mt-3"></div>

    <div class="table-responsive">
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th>Πρόγραμμα</th>
                    <th>Ημερομηνία & Ώρα</th>
                    <th>Κατάσταση</th>
                    <th>Ενέργεια</th>
                </tr>
            </thead>
            <tbody id="my-bookings-container">
                </tbody>
        </table>
    </div>
</div>

<?php
include 'templates/footer.php';
?>