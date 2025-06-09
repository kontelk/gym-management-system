// Custom JavaScript functionality will go here
console.log("JavaScript file loaded.");

// Περιμένουμε να φορτωθεί πλήρως το HTML για να εκτελέσουμε τον κώδικα
document.addEventListener('DOMContentLoaded', function() {

    const apiBaseUrl = '/api/endpoints'; // Βασικό URL του API μας

    // =================================================================
    // 1. ΛΟΓΙΚΗ ΠΛΟΗΓΗΣΗΣ ΚΑΙ ΚΑΤΑΣΤΑΣΗΣ ΧΡΗΣΤΗ
    // =================================================================

    // Συνάρτηση για την αποκωδικοποίηση του JWT payload
    function parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    // Συνάρτηση που ενημερώνει το Navbar ανάλογα με την κατάσταση σύνδεσης
    function updateNavbar() {
        const token = localStorage.getItem('jwt');
        const guestLinks = document.querySelectorAll('.guest-link');
        const userLinks = document.querySelectorAll('.user-link');
        const adminLinks = document.querySelectorAll('.admin-link');
        const authLinks = document.querySelectorAll('.auth-link'); // Logout button

        if (token) {
            const decodedToken = parseJwt(token);
            if (decodedToken) {
                // Ο χρήστης είναι συνδεδεμένος
                guestLinks.forEach(link => link.classList.add('d-none'));
                authLinks.forEach(link => link.classList.remove('d-none'));

                // Έλεγχος ρόλου (1 = admin, 2 = registered_user)
                if (decodedToken.data.role_id === 1) {
                    adminLinks.forEach(link => link.classList.remove('d-none'));
                } else if (decodedToken.data.role_id === 2) {
                    userLinks.forEach(link => link.classList.remove('d-none'));
                }
            }
        } else {
            // Ο χρήστης είναι επισκέπτης
            guestLinks.forEach(link => link.classList.remove('d-none'));
            authLinks.forEach(link => link.classList.add('d-none'));
            userLinks.forEach(link => link.classList.add('d-none'));
            adminLinks.forEach(link => link.classList.add('d-none'));
        }
    }

    // Λειτουργία Αποσύνδεσης
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('jwt');
            window.location.href = 'login.php'; // Ανακατεύθυνση στη σελίδα εισόδου
        });
    }

    // Κλήση της updateNavbar() σε κάθε φόρτωση σελίδας
    updateNavbar();


    // =================================================================
    // 2. ΛΟΓΙΚΗ ΦΟΡΜΑΣ ΕΙΣΟΔΟΥ
    // =================================================================

    const loginForm = document.getElementById('login-form');
    const messageArea = document.getElementById('message-area');

    // Αυτός ο κώδικας θα εκτελεστεί μόνο αν υπάρχει η φόρμα εισόδου στη σελίδα
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Αποτρέπουμε την προεπιλεγμένη συμπεριφορά της φόρμας

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Δεδομένα που θα στείλουμε στο API
            const loginData = {
                username: username,
                password: password
            };

            // Κλήση στο API με τη μέθοδο fetch
            fetch(`${apiBaseUrl}/users/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.jwt) {
                    // Επιτυχής είσοδος
                    messageArea.innerHTML = `<div class="alert alert-success">Η είσοδος ήταν επιτυχής. Ανακατεύθυνση...</div>`;
                    localStorage.setItem('jwt', data.jwt); // Αποθήκευση του token

                    // Ανακατεύθυνση ανάλογα με τον ρόλο
                    const decodedToken = parseJwt(data.jwt);
                    setTimeout(() => {
                        if (decodedToken.data.role_id === 1) {
                            window.location.href = 'admin_dashboard.php';
                        } else {
                            window.location.href = 'dashboard.php';
                        }
                    }, 1000); // Μικρή καθυστέρηση για να δει ο χρήστης το μήνυμα

                } else {
                    // Αποτυχημένη είσοδος
                    messageArea.innerHTML = `<div class="alert alert-danger">${data.message || 'Προέκυψε κάποιο σφάλμα.'}</div>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα επικοινωνίας με τον server.</div>`;
            });
        });
    }



    // =================================================================
    // 3. ΛΟΓΙΚΗ ΦΟΡΜΑΣ ΕΓΓΡΑΦΗΣ
    // =================================================================
    
    const registerForm = document.getElementById('register-form');

    // Εκτέλεση μόνο αν είμαστε στη σελίδα εγγραφής
    if (registerForm) {
        const countrySelect = document.getElementById('country-select');
        const citySelect = document.getElementById('city-select');
        const messageArea = document.getElementById('message-area');

        // --- Φόρτωση Χωρών από εξωτερικό API ---
        fetch('https://countriesnow.space/api/v0.1/countries/positions')
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    countrySelect.innerHTML = '<option selected disabled value="">Επιλέξτε χώρα</option>'; // Καθαρισμός των αρχικών options
                    data.data.forEach(country => {
                        const option = document.createElement('option');
                        option.value = country.name;
                        option.textContent = country.name;
                        countrySelect.appendChild(option);
                    });
                } else {
                     countrySelect.innerHTML = '<option selected disabled value="">Σφάλμα φόρτωσης</option>';
                }
            })
            .catch(error => console.error('Error fetching countries:', error));

        // --- Event Listener για αλλαγή χώρας ---
        countrySelect.addEventListener('change', function() {
            const selectedCountry = this.value;
            citySelect.innerHTML = '<option selected disabled value="">Φόρτωση πόλεων...</option>';
            citySelect.disabled = true;

            if (selectedCountry) {
                // Κλήση στο API για τις πόλεις της επιλεγμένης χώρας
                fetch('https://countriesnow.space/api/v0.1/countries/cities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: selectedCountry })
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.error && data.data.length > 0) {
                        citySelect.innerHTML = '<option selected disabled value="">Επιλέξτε πόλη</option>';
                        data.data.forEach(city => {
                            const option = document.createElement('option');
                            option.value = city;
                            option.textContent = city;
                            citySelect.appendChild(option);
                        });
                        citySelect.disabled = false;
                    } else {
                        citySelect.innerHTML = '<option selected disabled value="">Δεν βρέθηκαν πόλεις</option>';
                    }
                })
                .catch(error => console.error('Error fetching cities:', error));
            }
        });

        // --- Event Listener για την υποβολή της φόρμας ---
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Αποτροπή της default συμπεριφοράς

            // Συλλογή δεδομένων από τη φόρμα
            const registerData = {
                first_name: document.getElementById('first_name').value,
                last_name: document.getElementById('last_name').value,
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                country: countrySelect.value,
                city: citySelect.value,
                address: document.getElementById('address').value
            };

            // Κλήση στο δικό μας API για την εγγραφή
            fetch(`${apiBaseUrl}/users/register.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            })
            .then(response => {
                // Η απάντηση από το API περιέχει το τελικό μήνυμα
                return response.json().then(data => ({ status: response.status, body: data }));
            })
            .then(({ status, body }) => {
                if (status === 201) { // 201 Created
                    messageArea.innerHTML = `<div class="alert alert-success">${body.message}</div>`;
                    registerForm.reset(); // Καθαρισμός της φόρμας
                    citySelect.disabled = true;
                } else {
                    messageArea.innerHTML = `<div class="alert alert-danger">${body.message || 'Προέκυψε κάποιο σφάλμα.'}</div>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα επικοινωνίας με τον server.</div>`;
            });
        });
    }




});