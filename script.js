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



    // =================================================================
    // 4. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ ΠΡΟΓΡΑΜΜΑΤΩΝ
    // =================================================================
    const programsContainer = document.getElementById('programs-container');

    if (programsContainer) {
        const messageArea = document.getElementById('message-area');

        fetch(`${apiBaseUrl}/programs/read.php`)
            .then(response => response.json())
            .then(data => {
                // Ελέγχουμε αν η απάντηση περιέχει μήνυμα (π.χ. σφάλμα ή "δεν βρέθηκαν")
                if (data.message) {
                    messageArea.innerHTML = `<div class="alert alert-warning">${data.message}</div>`;
                    return;
                }

                // Αν έχουμε δεδομένα, καθαρίζουμε το container
                programsContainer.innerHTML = '';
                
                data.forEach(program => {
                    const card = `
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card h-100">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title">${program.name}</h5>
                                    <p class="card-text">${program.description}</p>
                                    <p class="card-text"><small class="text-muted">Τύπος: ${program.type === 'group' ? 'Ομαδικό' : 'Ατομικό'}</small></p>
                                    
                                    <a href="booking.php?program_id=${program.id}" class="btn btn-primary mt-auto">Κάνε Κράτηση</a>
                                </div>
                            </div>
                        </div>
                    `;
                    programsContainer.innerHTML += card;
                });
            })
            .catch(error => {
                console.error('Error fetching programs:', error);
                messageArea.innerHTML = `<div class="alert alert-danger">Αδυναμία φόρτωσης των προγραμμάτων.</div>`;
            });
    }


    // =================================================================
    // 5. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ ΚΡΑΤΗΣΗΣ (BOOKING)
    // =================================================================
    if (document.getElementById('booking-page-identifier')) {
        const token = localStorage.getItem('jwt');
        const messageArea = document.getElementById('message-area');

        // --- Προστασία Σελίδας ---
        if (!token) {
            window.location.href = 'login.php';
            return; // Σταματάμε την εκτέλεση του υπόλοιπου κώδικα
        }

        // --- Αρχικοποίηση Σελίδας ---
        const urlParams = new URLSearchParams(window.location.search);
        const programId = urlParams.get('program_id');
        const programTitleEl = document.getElementById('program-title');
        const datePicker = document.getElementById('date-picker');
        const availabilityResults = document.getElementById('availability-results');
        
        // Ορισμός της ελάχιστης ημερομηνίας στο σήμερα
        datePicker.min = new Date().toISOString().split("T")[0];

        if (!programId) {
            programTitleEl.textContent = 'Σφάλμα: Δεν επιλέχθηκε πρόγραμμα.';
            datePicker.disabled = true;
        } else {
            // Φόρτωση του ονόματος του προγράμματος
            fetch(`${apiBaseUrl}/programs/read_one.php?id=${programId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.name) {
                        programTitleEl.textContent = `Κράτηση για: ${data.name}`;
                    } else {
                        programTitleEl.textContent = 'Το πρόγραμμα δεν βρέθηκε.';
                    }
                });
        }
        
        // --- Event Listener για αλλαγή ημερομηνίας ---
        datePicker.addEventListener('change', function() {
            const selectedDate = this.value;
            if (programId && selectedDate) {
                fetchAvailability(programId, selectedDate);
            }
        });

        // --- Συνάρτηση για φόρτωση διαθεσιμότητας ---
        function fetchAvailability(pId, date) {
            availabilityResults.innerHTML = `<p class="text-center">Αναζήτηση διαθεσιμότητας...</p>`;
            fetch(`${apiBaseUrl}/events/search.php?program_id=${pId}&date=${date}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                availabilityResults.innerHTML = ''; // Καθαρισμός
                if (data.message) {
                    availabilityResults.innerHTML = `<p class="text-center text-warning">${data.message}</p>`;
                } else {
                    data.forEach(slot => {
                        const startTime = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const item = `
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Ώρα:</strong> ${startTime} | 
                                    <strong>Διαθέσιμες Θέσεις:</strong> ${slot.available_slots}
                                </div>
                                <button class="btn btn-success book-btn" data-event-id="${slot.event_id}">Κράτηση</button>
                            </div>
                        `;
                        availabilityResults.innerHTML += item;
                    });
                }
            })
            .catch(err => {
                console.error(err);
                availabilityResults.innerHTML = `<p class="text-center text-danger">Σφάλμα φόρτωσης διαθεσιμότητας.</p>`;
            });
        }
        
        // --- Event Listener για κλικ στο κουμπί κράτησης (Event Delegation) ---
        availabilityResults.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('book-btn')) {
                const eventId = e.target.getAttribute('data-event-id');
                if (confirm('Είστε σίγουροι ότι θέλετε να κάνετε κράτηση για αυτό το τμήμα;')) {
                    createBooking(eventId);
                }
            }
        });
        
        // --- Συνάρτηση για δημιουργία κράτησης ---
        function createBooking(eId) {
            fetch(`${apiBaseUrl}/bookings/create.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ event_id: eId })
            })
            .then(res => res.json().then(data => ({ status: res.status, body: data })))
            .then(({ status, body }) => {
                if (status === 201) {
                    messageArea.innerHTML = `<div class="alert alert-success">${body.message}</div>`;
                    // Ανανέωση της λίστας διαθεσιμότητας
                    fetchAvailability(programId, datePicker.value);
                } else {
                    messageArea.innerHTML = `<div class="alert alert-danger">${body.message}</div>`;
                }
                // Σβήσιμο του μηνύματος μετά από 5 δευτερόλεπτα
                setTimeout(() => { messageArea.innerHTML = ''; }, 5000);
            })
            .catch(err => console.error(err));
        }
    }



    // =================================================================
    // 6. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ "ΟΙ ΚΡΑΤΗΣΕΙΣ ΜΟΥ"
    // =================================================================
    if (document.getElementById('my-bookings-page-identifier')) {
        const token = localStorage.getItem('jwt');
        if (!token) {
            window.location.href = 'login.php';
            return;
        }

        const bookingsContainer = document.getElementById('my-bookings-container');
        const messageArea = document.getElementById('message-area');

        function fetchMyBookings() {
            bookingsContainer.innerHTML = '<tr><td colspan="4" class="text-center">Φόρτωση κρατήσεων...</td></tr>';

            fetch(`${apiBaseUrl}/bookings/read_by_user.php`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                bookingsContainer.innerHTML = '';
                if (data.message) {
                    bookingsContainer.innerHTML = `<tr><td colspan="4" class="text-center">${data.message}</td></tr>`;
                    return;
                }
                
                const now = new Date();
                
                data.forEach(booking => {
                    const eventDate = new Date(booking.start_time);
                    const hoursDiff = (eventDate - now) / 1000 / 3600;

                    let statusBadge = '';
                    switch(booking.status) {
                        case 'confirmed': statusBadge = '<span class="badge bg-success">Επιβεβαιωμένη</span>'; break;
                        case 'cancelled_by_user': statusBadge = '<span class="badge bg-warning text-dark">Ακυρωμένη</span>'; break;
                        default: statusBadge = `<span class="badge bg-secondary">${booking.status}</span>`;
                    }

                    // Το κουμπί ακύρωσης εμφανίζεται μόνο για μελλοντικές, επιβεβαιωμένες κρατήσεις > 2 ώρες πριν
                    const cancelButton = (booking.status === 'confirmed' && hoursDiff > 2)
                        ? `<button class="btn btn-danger btn-sm cancel-btn" data-booking-id="${booking.booking_id}">Ακύρωση</button>`
                        : '';
                    
                    const row = `
                        <tr>
                            <td>${booking.program_name}</td>
                            <td>${eventDate.toLocaleString('el-GR')}</td>
                            <td>${statusBadge}</td>
                            <td>${cancelButton}</td>
                        </tr>
                    `;
                    bookingsContainer.innerHTML += row;
                });
            });
        }
        
        // --- Event Listener για κλικ στην ακύρωση (Event Delegation) ---
        bookingsContainer.addEventListener('click', function(e){
            if(e.target && e.target.classList.contains('cancel-btn')){
                const bookingId = e.target.getAttribute('data-booking-id');
                if(confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε αυτή την κράτηση;')){
                    cancelBooking(bookingId);
                }
            }
        });

        // --- Συνάρτηση για ακύρωση κράτησης ---
        function cancelBooking(bookingId) {
            fetch(`${apiBaseUrl}/bookings/cancel.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ booking_id: bookingId })
            })
            .then(res => res.json().then(data => ({ status: res.status, body: data })))
            .then(({ status, body }) => {
                messageArea.innerHTML = `<div class="alert ${status === 200 ? 'alert-success' : 'alert-danger'}">${body.message}</div>`;
                fetchMyBookings(); // Ανανέωση της λίστας
                setTimeout(() => { messageArea.innerHTML = ''; }, 5000);
            });
        }

        // Αρχική φόρτωση των δεδομένων
        fetchMyBookings();
    }



    // =================================================================
    // 7. ΛΟΓΙΚΗ ΣΕΛΙΔΩΝ ΔΙΑΧΕΙΡΙΣΤΗ (ADMIN)
    // =================================================================
    if (document.getElementById('admin-users-page-identifier') || document.getElementById('admin-dashboard-page-identifier')) {
        const token = localStorage.getItem('jwt');
        const decodedToken = token ? parseJwt(token) : null;

        // --- Προστασία Σελίδας Admin ---
        if (!token || !decodedToken || decodedToken.data.role_id !== 1) {
            // Αν δεν υπάρχει token ή ο ρόλος δεν είναι admin, ανακατεύθυνση
            window.location.href = 'index.php'; 
            return;
        }

        // Λογική μόνο για τη σελίδα διαχείρισης χρηστών
        if (document.getElementById('admin-users-page-identifier')) {
            const pendingUsersTbody = document.getElementById('pending-users-tbody');
            const allUsersTbody = document.getElementById('all-users-tbody');
            const pendingCountBadge = document.getElementById('pending-count');
            const messageArea = document.getElementById('message-area');

            // --- Φόρτωση χρηστών σε αναμονή ---
            function fetchPendingUsers() {
                fetch(`${apiBaseUrl}/users/read_pending.php`, { headers: { 'Authorization': `Bearer ${token}` } })
                    .then(res => res.json())
                    .then(data => {
                        pendingUsersTbody.innerHTML = '';
                        if (data.message) {
                            pendingCountBadge.textContent = '0';
                            pendingUsersTbody.innerHTML = `<tr><td colspan="5" class="text-center">${data.message}</td></tr>`;
                        } else {
                            pendingCountBadge.textContent = data.length;
                            data.forEach(user => {
                                const row = `<tr>
                                    <td>${user.username}</td>
                                    <td>${user.first_name} ${user.last_name}</td>
                                    <td>${user.email}</td>
                                    <td>${new Date(user.request_date).toLocaleDateString('el-GR')}</td>
                                    <td><button class="btn btn-success btn-sm approve-btn" data-user-id="${user.id}">Έγκριση</button></td>
                                </tr>`;
                                pendingUsersTbody.innerHTML += row;
                            });
                        }
                    });
            }

            // --- Φόρτωση όλων των χρηστών ---
            function fetchAllUsers() {
                 fetch(`${apiBaseUrl}/users/read.php`, { headers: { 'Authorization': `Bearer ${token}` } })
                    .then(res => res.json())
                    .then(data => {
                        allUsersTbody.innerHTML = '';
                        if (data.message) {
                             allUsersTbody.innerHTML = `<tr><td colspan="5" class="text-center">${data.message}</td></tr>`;
                        } else {
                            data.forEach(user => {
                                const roleBadge = user.role_name ? `<span class="badge bg-info">${user.role_name}</span>` : '';
                                const row = `<tr>
                                    <td>${user.id}</td>
                                    <td>${user.username}</td>
                                    <td>${user.email}</td>
                                    <td>${roleBadge}</td>
                                    <td>${user.status}</td>
                                </tr>`;
                                allUsersTbody.innerHTML += row;
                            });
                        }
                    });
            }

            // --- Event Listener για έγκριση ---
            pendingUsersTbody.addEventListener('click', function(e){
                if(e.target && e.target.classList.contains('approve-btn')){
                    const userId = e.target.getAttribute('data-user-id');
                    if(confirm(`Είστε σίγουροι ότι θέλετε να εγκρίνετε τον χρήστη με ID: ${userId};`)){
                        approveUser(userId);
                    }
                }
            });

            // --- Συνάρτηση για έγκριση χρήστη ---
            function approveUser(userId) {
                fetch(`${apiBaseUrl}/users/approve.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ user_id: userId, role_id: 2 }) // Εγκρίνουμε πάντα ως registered_user (ID=2)
                })
                .then(res => res.json().then(data => ({ status: res.status, body: data })))
                .then(({ status, body }) => {
                    messageArea.innerHTML = `<div class="alert ${status === 200 ? 'alert-success' : 'alert-danger'}">${body.message}</div>`;
                    // Ανανέωση και των δύο λιστών
                    fetchPendingUsers();
                    fetchAllUsers();
                    setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                });
            }

            // Αρχική φόρτωση όλων των δεδομένων
            fetchPendingUsers();
            fetchAllUsers();
        }
    }



    // =================================================================
    // 8. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ ΔΙΑΧΕΙΡΙΣΗΣ ΠΡΟΓΡΑΜΜΑΤΩΝ (ADMIN)
    // =================================================================
    if (document.getElementById('admin-programs-page-identifier')) {
        const token = localStorage.getItem('jwt');
        // Έλεγχος δικαιωμάτων πρόσβασης
        if (!token || parseJwt(token).data.role_id !== 1) {
            window.location.href = 'index.php';
            return;
        }

        const programsTbody = document.getElementById('programs-tbody');
        const messageArea = document.getElementById('message-area');
        const programModal = new bootstrap.Modal(document.getElementById('program-modal'));
        const programForm = document.getElementById('program-form');

        // Φόρτωση των προγραμμάτων
        function fetchAdminPrograms() {
            fetch(`${apiBaseUrl}/programs/read_admin.php`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    programsTbody.innerHTML = '';
                    data.forEach(p => {
                        const statusBadge = p.is_active ? '<span class="badge bg-success">Ενεργό</span>' : '<span class="badge bg-secondary">Ανενεργό</span>';
                        const row = `<tr>
                            <td>${p.id}</td>
                            <td>${p.name}</td>
                            <td>${p.type === 'group' ? 'Ομαδικό' : 'Ατομικό'}</td>
                            <td>${statusBadge}</td>
                            <td>
                                <button class="btn btn-primary btn-sm edit-btn" data-id="${p.id}">Επεξεργασία</button>
                                ${p.is_active ? `<button class="btn btn-danger btn-sm delete-btn" data-id="${p.id}">Απενεργοποίηση</button>` : ''}
                            </td>
                        </tr>`;
                        programsTbody.innerHTML += row;
                    });
                });
        }
        
        // Άνοιγμα modal για νέο πρόγραμμα
        document.getElementById('add-program-btn').addEventListener('click', () => {
            programForm.reset();
            document.getElementById('program-id').value = '';
            document.getElementById('modal-title').textContent = 'Προσθήκη Νέου Προγράμματος';
            document.getElementById('status-wrapper').style.display = 'none'; // Κρύβουμε το status για νέα
            programModal.show();
        });

        // Event listener για επεξεργασία και διαγραφή
        programsTbody.addEventListener('click', e => {
            const target = e.target;
            const id = target.getAttribute('data-id');

            if (target.classList.contains('edit-btn')) {
                // Φόρτωση δεδομένων για επεξεργασία
                fetch(`${apiBaseUrl}/programs/read_one.php?id=${id}`)
                    .then(res => res.json())
                    .then(p => {
                        document.getElementById('program-id').value = p.id;
                        document.getElementById('program-name').value = p.name;
                        document.getElementById('program-description').value = p.description;
                        document.getElementById('program-type').value = p.type;
                        document.getElementById('program-is-active').checked = p.is_active == 1; // == 1 για σωστή απόδοση του boolean
                        document.getElementById('status-wrapper').style.display = 'block';
                        document.getElementById('modal-title').textContent = 'Επεξεργασία Προγράμματος';
                        programModal.show();
                    });
            } else if (target.classList.contains('delete-btn')) {
                // Επιβεβαίωση διαγραφής
                if (confirm('Είστε σίγουροι ότι θέλετε να απενεργοποιήσετε αυτό το πρόγραμμα;')) {
                    fetch(`${apiBaseUrl}/programs/delete.php`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ id: id })
                    })
                    .then(res => res.json().then(data => ({ status: res.status, body: data })))
                    .then(({ status, body }) => {
                         messageArea.innerHTML = `<div class="alert ${status === 200 ? 'alert-success' : 'alert-danger'}">${body.message}</div>`;
                         fetchAdminPrograms(); // Ανανέωση της λίστας
                         setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                    });
                }
            }
        });

        // Υποβολή φόρμας
        programForm.addEventListener('submit', e => {
            e.preventDefault();
            const id = document.getElementById('program-id').value;
            const url = id ? `${apiBaseUrl}/programs/update.php` : `${apiBaseUrl}/programs/create.php`;
            
            const formData = {
                id: id || undefined,
                name: document.getElementById('program-name').value,
                description: document.getElementById('program-description').value,
                type: document.getElementById('program-type').value,
                is_active: document.getElementById('program-is-active').checked
            };

            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            })
            .then(res => res.json())
            .then(data => {
                messageArea.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                programModal.hide();
                fetchAdminPrograms();
                setTimeout(() => messageArea.innerHTML = '', 4000);
            });
        });

        // Αρχική φόρτωση
        fetchAdminPrograms();
    }



});