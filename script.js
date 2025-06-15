// Περιμένουμε να φορτωθεί πλήρως το HTML για να εκτελέσουμε τον κώδικα
document.addEventListener('DOMContentLoaded', function() {

    const apiBaseUrl = '/api/endpoints'; // Βασικό URL του API μας



    
    ////////////////////////////////////////////////////////////////////
    // --- (Α) ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ ΓΙΑ ΓΕΝΙΚΗ ΧΡΗΣΗ ---
    //////////////////////////////////////////////////////////////////// 



    // =================================================================
    // ΚΕΝΤΡΙΚΟΣ ΧΕΙΡΙΣΤΗΣ API REQUESTS (FETCH WRAPPER)
    // =================================================================
    
    async function apiFetch(url, options = {}) {
        const token = localStorage.getItem('jwt');

        // Προετοιμασία των headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers, // Συμπεριλαμβάνουμε τυχόν custom headers
        };

        // Αυτόματη προσθήκη του Authorization header αν υπάρχει token
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Ενημέρωση των options με τα νέα headers
        const newOptions = { ...options, headers };

        try {
            const response = await fetch(url, newOptions);

            // ΚΕΝΤΡΙΚΟΣ ΕΛΕΓΧΟΣ ΓΙΑ TIMEOUT/UNAUTHORIZED
            if (response.status === 401) {
                // Το token είναι άκυρο ή έχει λήξει
                localStorage.removeItem('jwt'); // Καθαρισμός του άκυρου token
                alert('Η συνεδρία σας έχει λήξει. Παρακαλώ συνδεθείτε ξανά.');
                window.location.href = 'login.php'; // Ανακατεύθυνση στη σελίδα εισόδου
                // "Παγώνουμε" την εκτέλεση για να μην συνεχίσει ο υπόλοιπος κώδικας
                return Promise.reject(new Error('Unauthorized')); 
            }

            if (!response.ok) {
                // Χειρισμός άλλων HTTP σφαλμάτων (π.χ. 404, 500)
                const errorData = await response.json().catch(() => ({ message: 'Άγνωστο σφάλμα server.' }));
                return Promise.reject(errorData);
            }
            
            // Για 204 No Content (π.χ. σε επιτυχημένη διαγραφή χωρίς σώμα απάντησης)
            if (response.status === 204) {
                return Promise.resolve();
            }

            return response.json(); // Επιστροφή των δεδομένων JSON

        } catch (error) {
            console.error('Fetch Error:', error);
            return Promise.reject(error);
        }
    }



    ////////////////////////////////////////////////////////////////////
    // --- (Β) ΛΕΙΤΟΥΡΓΙΚΟΤΗΤΑ ΤΩΝ ΣΕΛΙΔΩΝ ---
    ////////////////////////////////////////////////////////////////////
    


    
    // =================================================================
    // 1. ΛΟΓΙΚΗ ΓΙΑ ΤΟ NAVBAR ΚΑΙ ΤΗΝ ΑΠΟΣΥΝΔΕΣΗ
    // =================================================================

    // Συνάρτηση για την αποκωδικοποίηση του JWT payload
    function parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    // Συνάρτηση που ενημερώνει το Navbar ανάλογα με την κατάσταση σύνδεσης (ΤΕΛΙΚΗ ΕΚΔΟΣΗ)
    function updateNavbar() {
        const token = localStorage.getItem('jwt');
        // Selectors για τα links
        const guestLinks = document.querySelectorAll('.guest-link');
        const userLinks = document.querySelectorAll('.user-link');
        const adminLinks = document.querySelectorAll('.admin-link');
        // Πλέον το auth-link είναι ολόκληρο το dropdown menu του χρήστη
        const authLinks = document.querySelectorAll('.auth-link'); 
        
        // Selector για την περιοχή εμφάνισης ονόματος μέσα στο dropdown
        const usernameDisplayDropdown = document.getElementById('username-display-dropdown');

        if (token) {
            const decodedToken = parseJwt(token);
            if (decodedToken && usernameDisplayDropdown) {
                // --- Ο χρήστης είναι συνδεδεμένος ---
                // Εμφάνιση του ονόματος χρήστη, χωρίς το "Καλώς ήρθες"
                usernameDisplayDropdown.textContent = decodedToken.data.username;
                
                // Εμφάνιση/Απόκρυψη links
                guestLinks.forEach(link => link.classList.add('d-none'));
                authLinks.forEach(link => link.classList.remove('d-none'));

                // Έλεγχος ρόλου
                if (decodedToken.data.role_id === 1) { // Admin
                    adminLinks.forEach(link => link.classList.remove('d-none'));
                } else if (decodedToken.data.role_id === 2) { // Registered User
                    userLinks.forEach(link => link.classList.remove('d-none'));
                }
            }
        } else {
            // --- Ο χρήστης είναι επισκέπτης ---
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



    // // =================================================================
    // // 2. ΛΟΓΙΚΗ ΦΟΡΜΑΣ ΕΙΣΟΔΟΥ
    // // =================================================================

    // const loginForm = document.getElementById('login-form');
    // const messageArea = document.getElementById('message-area');

    // // Αυτός ο κώδικας θα εκτελεστεί μόνο αν υπάρχει η φόρμα εισόδου στη σελίδα
    // if (loginForm) {
    //     loginForm.addEventListener('submit', function(e) {
    //         e.preventDefault(); // Αποτρέπουμε την προεπιλεγμένη συμπεριφορά της φόρμας

    //         const username = document.getElementById('username').value;
    //         const password = document.getElementById('password').value;

    //         // Δεδομένα που θα στείλουμε στο API
    //         const loginData = {
    //             username: username,
    //             password: password
    //         };

    //         // Κλήση στο API με τη μέθοδο fetch
    //         fetch(`${apiBaseUrl}/users/login.php`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(loginData)
    //         })
    //         .then(response => response.json())
    //         .then(data => {
    //             if (data.jwt) {
    //                 // Επιτυχής είσοδος
    //                 messageArea.innerHTML = `<div class="alert alert-success">Η είσοδος ήταν επιτυχής.</div>`;
    //                 localStorage.setItem('jwt', data.jwt); // Αποθήκευση του token

    //                 // Ανακατεύθυνση ανάλογα με τον ρόλο
    //                 const decodedToken = parseJwt(data.jwt);
    //                 setTimeout(() => {
    //                     if (decodedToken.data.role_id === 1) {
    //                         window.location.href = 'admin_dashboard.php';
    //                     } else {
    //                         window.location.href = 'index.php';
    //                     }
    //                 }, 1000); // Μικρή καθυστέρηση για να δει ο χρήστης το μήνυμα

    //             } else {
    //                 // Αποτυχημένη είσοδος
    //                 messageArea.innerHTML = `<div class="alert alert-danger">${data.message || 'Προέκυψε κάποιο σφάλμα.'}</div>`;
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error:', error);
    //             messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα επικοινωνίας με τον server.</div>`;
    //         });
    //     });
    // }














    // =================================================================
    // 2. ΛΟΓΙΚΗ ΦΟΡΜΑΣ ΕΙΣΟΔΟΥ ΚΑΙ ΧΡΟΝΟΜΕΤΡΟΥ ΛΗΞΗΣ JWT
    // =================================================================

    let jwtTimerInterval; // Μεταβλητή που θα κρατάει το ID του interval

    // Συνάρτηση που ξεκινά ή επανεκκινεί το χρονόμετρο
    function startJwtTimer(token) {
        // Καθαρίζουμε τυχόν προηγούμενο timer
        clearInterval(jwtTimerInterval);

        const decodedToken = parseJwt(token);
        if (!decodedToken || !decodedToken.exp) return;

        const timerElement = document.getElementById('jwt-timer');
        const timerText = document.getElementById('jwt-timer-text');
        if (!timerElement || !timerText) return;

        // Εμφανίζουμε το timer μόνο για συνδεδεμένους χρήστες
        timerElement.parentElement.classList.remove('d-none');
        
        // Η ώρα λήξης του token σε milliseconds
        const tokenExpMs = decodedToken.exp * 1000;

        const updateTimerDisplay = () => {
            const remainingMs = tokenExpMs - Date.now();
            if (remainingMs <= 0) {
                clearInterval(jwtTimerInterval);
                localStorage.removeItem('jwt');
                alert('Η σύνδεσή σας έληξε. Παρακαλώ συνδεθείτε ξανά.');
                window.location.href = 'login.php';
                return;
            }
            const remainingSeconds = Math.round(remainingMs / 1000);
            const minutes = Math.floor(remainingSeconds / 60);
            // Ελέγχουμε αν τα λεπτά είναι μονοψήφια και προσθέτουμε μηδέν μπροστά
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            
            // Εμφάνιση λεπτών και δευτερολέπτων
            const seconds = remainingSeconds % 60;
            const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
            timerText.textContent = `${formattedMinutes}:${formattedSeconds}`;

            // Ενημέρωση του κυκλικού progress bar
            const totalDuration = decodedToken.exp - decodedToken.iat;
            const elapsed = totalDuration - remainingSeconds;
            const percentage = Math.round((elapsed / totalDuration) * 100);
            
            // Το conic-gradient λειτουργεί αντίστροφα, οπότε αφαιρούμε από 100
            timerElement.style.setProperty('--p', 100 - percentage);
        };
        
        updateTimerDisplay(); // Αρχική εμφάνιση
        jwtTimerInterval = setInterval(updateTimerDisplay, 1000); // Ενημέρωση κάθε 1 δευτερόλεπτο
    }

    // Event listener για την ανανέωση του token
    document.getElementById('jwt-timer')?.addEventListener('click', () => {
        // if (!confirm('Θέλετε να ανανεώσετε τον χρόνο της συνδεσής σας;')) return;
        apiFetch(`${apiBaseUrl}/users/refresh_token.php`)
            .then(data => {
                if (data.jwt) {
                    localStorage.setItem('jwt', data.jwt); // Αποθήκευση του νέου token
                    startJwtTimer(data.jwt); // Επανεκκίνηση του timer με το νέο token
                }
            })
            .catch(error => console.error('Token refresh failed:', error));
    });

    // --- Τροποποίηση της Λογικής του Login ---
    // Μέσα στο event listener του loginForm, στο σημείο της επιτυχίας:
    if (document.getElementById('login-form')) {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // ... (κώδικας για συλλογή username/password)

            const username = document.getElementById('username').value;
            console.log(username);
            const password = document.getElementById('password').value;
            console.log(password);

            // Δεδομένα που θα στείλουμε στο API
            const loginData = {
                username: username,
                password: password
            };

            // Κλήση στο API για login
            apiFetch(`${apiBaseUrl}/users/login.php`, {
                method: 'POST',
                body: JSON.stringify({username: e.target.username.value, password: e.target.password.value})
            })
            .then(data => {
                if (data.jwt) {
                    localStorage.setItem('jwt', data.jwt);
                    startJwtTimer(data.jwt); // **ΝΕΟ: ΚΑΛΕΣΜΑ ΤΟΥ TIMER ΜΕΤΑ ΤΟ LOGIN**
                    updateNavbar(); // Ενημέρωση του navbar
                    
                    const decodedToken = parseJwt(data.jwt);
                    setTimeout(() => {
                        window.location.href = (decodedToken.data.role_id === 1) ? 'admin_dashboard.php' : 'index.php';
                    }, 500);
                }
            })
            .catch(error => {
                const messageArea = document.getElementById('message-area');
                messageArea.innerHTML = `<div class="alert alert-danger">${error.message || 'Προέκυψε κάποιο σφάλμα.'}</div>`;
            });
        });
    }

    // --- Έλεγχος κατά τη φόρτωση της σελίδας ---
    // Αυτό διασφαλίζει ότι το timer ξεκινά όταν ανανεώνουμε μια σελίδα ή πλοηγούμαστε
    const initialToken = localStorage.getItem('jwt');
    if(initialToken) {
        startJwtTimer(initialToken);
    }
    


    // =================================================================
    // 3. ΛΟΓΙΚΗ ΦΟΡΜΑΣ ΕΓΓΡΑΦΗΣ ΧΡΗΣΤΗ
    // =================================================================
    
    const registerForm = document.getElementById('register-form');

    // Εκτέλεση μόνο αν είμαστε στη σελίδα εγγραφής
    if (registerForm) {
        const countrySelect = document.getElementById('country-select');
        const citySelect = document.getElementById('city-select');
        const messageArea = document.getElementById('message-area');

        // --- Συνάρτηση για τον έλεγχο εγκυρότητας της φόρμας ---
        function validateRegisterForm() {
            let isValid = true;
            const inputs = registerForm.querySelectorAll('input[required], select[required]');

            inputs.forEach(input => {
                // Αρχικά, καθαρίζουμε τυχόν προηγούμενα σφάλματα
                input.classList.remove('is-invalid');
                input.classList.remove('is-valid');

                let condition = false;
                // Έλεγχος ανάλογα με τον τύπο του input
                if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    condition = !emailRegex.test(input.value.trim());
                } else if (input.minLength > 0) {
                    condition = input.value.trim().length < input.minLength;
                } else {
                    condition = input.value.trim() === '';
                }

                if (condition) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.add('is-valid');
                }
            });
            
            return isValid;
        }

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

            // Πρώτα εκτελούμε το validation
            if (!validateRegisterForm()) {
                // Αν δεν είναι έγκυρη, εμφανίζουμε ένα γενικό μήνυμα και σταματάμε
                messageArea.innerHTML = `<div class="alert alert-warning">Παρακαλώ διορθώστε τα σφάλματα στη φόρμα.</div>`;
                return;
            }

            // Αν η φόρμα είναι έγκυρη, καθαρίζουμε το μήνυμα και συνεχίζουμε
            messageArea.innerHTML = '';

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
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                // Πρώτα, καθαρίζουμε όλα τα προηγούμενα σφάλματα
                registerForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
                
                if (status === 201) { // Επιτυχία
                    messageArea.innerHTML = `<div class="alert alert-success">${body.message}</div>`;
                    registerForm.reset();
                    registerForm.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
                    citySelect.disabled = true;
                } else if (status === 422) { // Σφάλματα Validation από τον Server
                    messageArea.innerHTML = `<div class="alert alert-danger">${body.message}</div>`;
                    // Εμφάνιση συγκεκριμένων σφαλμάτων κάτω από κάθε πεδίο
                    for (const field in body.errors) {
                        const input = document.getElementById(field);
                        if (input) {
                            input.classList.add('is-invalid');
                            // Βρίσκουμε το div για το feedback που είναι "αδερφός" του input
                            const feedbackDiv = input.nextElementSibling;
                            if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
                                feedbackDiv.textContent = body.errors[field];
                            }
                        }
                    }
                } else { // Άλλα σφάλματα
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
    // 4. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ ΔΙΑΧΕΙΡΙΣΗΣ ΠΡΟΓΡΑΜΜΑΤΩΝ (PROGRAMS)
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
                                <div class="card-body d-flex flex-column ${program.type === 'group' ? 'bg-danger-subtle' : 'bg-success-subtle'}">
                                    <h5 class="card-title"><em>${program.name}</em></h5>
                                    <p class="card-text">${program.description}</p>
                                    <p class="card-text"><small class="text-muted">Τύπος: <strong>${program.type === 'group' ? 'Ομαδικό' : 'Ατομικό'}</strong></small></p>
                                    
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
    // 5. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ ΚΡΑΤΗΣΗΣ ΠΡΟΓΡΑΜΜΑΤΟΣ (BOOKING)
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

            apiFetch(`${apiBaseUrl}/bookings/read_by_user.php`)
            .then(data => {
                bookingsContainer.innerHTML = '';
                // Ελέγχουμε αν η απάντηση περιέχει μήνυμα (π.χ. σφάλμα ή "δεν βρέθηκαν")
                // ή αν είναι ένας κενός πίνακας.
                if (data && data.message && !Array.isArray(data)) {
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
            })
            .catch(error => {
                console.error('Error fetching my bookings:', error);
                bookingsContainer.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Σφάλμα φόρτωσης κρατήσεων: ${error.message || 'Προέκυψε σφάλμα'}</td></tr>`;
                // Εμφάνιση του σφάλματος και στο messageArea για συνέπεια
                messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα φόρτωσης κρατήσεων: ${error.message || 'Προέκυψε σφάλμα'}</div>`;
                setTimeout(() => { messageArea.innerHTML = ''; }, 5000);
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
            apiFetch(`${apiBaseUrl}/bookings/cancel.php`, {
                method: 'POST',
                body: JSON.stringify({ booking_id: bookingId })
            })
            // Η apiFetch επιστρέφει ήδη το body.message σε περίπτωση σφάλματος,
            // και τα δεδομένα σε περίπτωση επιτυχίας.
            .then(data => {
                messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Η κράτηση ακυρώθηκε επιτυχώς.'}</div>`;
                fetchMyBookings(); // Ανανέωση της λίστας
                setTimeout(() => { messageArea.innerHTML = ''; }, 5000);
            })
            .catch(error => {
                console.error('Error cancelling booking:', error);
                messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα ακύρωσης κράτησης: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
                setTimeout(() => { messageArea.innerHTML = ''; }, 5000);
            });
        }

        // Αρχική φόρτωση των δεδομένων
        fetchMyBookings();
    }



    // =================================================================
    // 7. ΛΟΓΙΚΗ ΣΕΛΙΔΩΝ ΔΙΑΧΕΙΡΙΡΙΣΗΣ ΧΡΗΣΤΩΝ (ADMIN)
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
            const userModal = new bootstrap.Modal(document.getElementById('user-modal'));
            const userForm = document.getElementById('user-form');

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
                                    <td>${user.last_name} ${user.first_name}</td>
                                    <td>${user.email}</td>
                                    <td>${new Date(user.request_date).toLocaleDateString('el-GR')}</td>
                                    <td><button class="btn btn-success btn-sm approve-btn" data-user-id="${user.id}">Έγκριση</button></td>
                                </tr>`;
                                pendingUsersTbody.innerHTML += row;
                            });
                        }
                    });
            }

            // --- Φόρτωση όλων των χρηστών (ΕΝΗΜΕΡΩΜΕΝΗ) ---
            function fetchAllUsers() {
                 fetch(`${apiBaseUrl}/users/read.php`, { headers: { 'Authorization': `Bearer ${token}` } })
                    .then(res => res.json())
                    .then(data => {
                        allUsersTbody.innerHTML = '';
                        if (data.message) {
                             allUsersTbody.innerHTML = `<tr><td colspan="6" class="text-center">${data.message}</td></tr>`;
                        } else {
                            data.forEach(user => {
                                const roleBadge = user.role_name ? `<span class="badge bg-info">${user.role_name}</span>` : '<span class="badge bg-secondary">unregistered_user</span>';
                                // const statusBadge = user.status === 'active' ? '<span class="badge bg-success">Ενεργός</span>' : '<span class="badge bg-secondary">Ανενεργός</span>';
                                let badgeClass;
                                switch (user.status) {
                                case 'active':
                                    badgeClass = 'bg-success';
                                    break;
                                case 'inactive':
                                    badgeClass = 'bg-secondary';
                                    break;
                                case 'rejected':
                                    badgeClass = 'bg-danger';
                                    break;
                                case 'pending_approval':
                                    badgeClass = 'bg-warning';
                                    break;
                                default:
                                    badgeClass = 'bg-light text-dark'; // προεπιλογή
                                }
                                const statusBadge = `<span class="badge ${badgeClass}">${user.status}</span>`;

                                const row = `<tr>
                                    <td>${user.username}</td>
                                    <td>${user.last_name} ${user.first_name}</td>
                                    <td>${user.email}</td>
                                    <td>${roleBadge}</td>
                                    <td>${statusBadge}</td>
                                    <td>
                                        <a href="#" class="edit-btn me-2" data-id="${user.id}" data-bs-toggle="tooltip" data-bs-title="Επεξεργασία"><img src="icons/pen.png" alt="Επεξεργασία" width="18"></a>
                                        <a href="#" class="delete-btn" data-id="${user.id}" data-bs-toggle="tooltip" data-bs-title="Διαγραφή"><img src="icons/bin.png" alt="Διαγραφή" width="18"></a>
                                    </td>
                                </tr>`;
                                allUsersTbody.innerHTML += row;
                            });
                            // Αρχικοποίηση των tooltips
                            const tooltipTriggerList = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')];
                            tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
                        }
                    });
            }

            // Event Listeners για επεξεργασία και διαγραφή χρηστών
            allUsersTbody.addEventListener('click', e => {
                const targetLink = e.target.closest('a');
                if (!targetLink) return;
                const userId = targetLink.getAttribute('data-id');
                console.log(`User ID: ${userId}`); // Για debugging
                if (!userId) return; // Αν δεν υπάρχει ID, σταματάμε την εκτέλεση
                if (targetLink.classList.contains('edit-btn')) {

                    // Κλήση στο νέο endpoint για να πάρουμε τα τρέχοντα δεδομένα του χρήστη
                    fetch(`${apiBaseUrl}/users/read_one_admin.php?id=${userId}`, {
                         headers: { 'Authorization': `Bearer ${token}` }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if(data.id) {
                            // Γέμισμα της φόρμας του modal
                            document.getElementById('user-id').value = data.id;
                            document.getElementById('user-username').value = data.username;

                            // (Προσθέστε εδώ τα id και για τα υπόλοιπα πεδία της φόρμας: email, first_name, κλπ)
                            document.getElementById('user-email').value = data.email;
                            document.getElementById('user-firstname').value = data.first_name;
                            document.getElementById('user-lastname').value = data.last_name;
                            
                            document.getElementById('user-id').disabled = true; // Απενεργοποιούμε το πεδίο ID για επεξεργασία
                            // document.getElementById('modal-title').textContent = 'Επεξεργασία Χρήστη';

                            document.getElementById('user-role').value = data.role_id;
                            document.getElementById('user-status').value = data.status;
                            document.getElementById('user-password').value = ''; // Πάντα κενό για ασφάλεια
                            userModal.show();
                        }
                    });
                } else if (targetLink.classList.contains('delete-btn')) {
                    if(confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον χρήστη; Η ενέργεια είναι μη αναστρέψιμη.')){
                        deleteUser(userId);
                    }
                }
            });

            // Συνάρτηση για έγκριση χρήστη
            function approveUser(userId) {
                fetch(`${apiBaseUrl}/users/approve.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ user_id: userId, role_id: 2 }) // Εγκρίνουμε πάντα ως registered_user (ID=2)
                })
                .then(res => res.json().then(data => ({ status: res.status, body: data })))
                .then(({ status, body }) => {
                    messageArea.innerHTML = `<div class="alert ${status === 200 ? 'alert-success' : 'alert-danger'}">${body.message}</div>`;
                    fetchAllUsers();
                    fetchPendingUsers();
                    setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                });
            }
            
            function deleteUser(id) {
                fetch(`${apiBaseUrl}/users/delete.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ id: id })
                })
                .then(res => res.json().then(data => ({status: res.status, body: data})))
                .then(({status, body}) => {
                    messageArea.innerHTML = `<div class="alert ${status === 200 ? 'alert-success' : 'alert-danger'}">${body.message}</div>`;
                    fetchAllUsers();
                });
            }

            // Event Listener για έγκριση
            pendingUsersTbody.addEventListener('click', function(e){
                if(e.target && e.target.classList.contains('approve-btn')){
                    const userId = e.target.getAttribute('data-user-id');
                    if(confirm(`Είστε σίγουροι ότι θέλετε να εγκρίνετε τον χρήστη με ID: ${userId};`)){
                        approveUser(userId);
                    }
                }
            });
            
            // Άνοιγμα modal για νέο χρήστη
            userForm.addEventListener('submit', e => {
                e.preventDefault();
                const formData = {
                    id: document.getElementById('user-id').value,
                    username: document.getElementById('user-username').value,

                    // (Συλλέξτε εδώ και τις υπόλοιπες τιμές από τη φόρμα)
                    email: document.getElementById('user-email').value,
                    first_name: document.getElementById('user-firstname').value,
                    last_name: document.getElementById('user-lastname').value,

                    role_id: document.getElementById('user-role').value,
                    status: document.getElementById('user-status').value,
                    password: document.getElementById('user-password').value // Θα είναι κενό αν δεν αλλάζει ο κωδικός
                };

                // Ελέγχουμε αν το ID υπάρχει για να αποφασίσουμε αν είναι ενημέρωση ή δημιουργία
                fetch(`${apiBaseUrl}/users/update.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(formData)
                })
                .then(res => res.json())
                .then(data => {
                    messageArea.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                    userModal.hide();
                    fetchAllUsers();
                    setTimeout(() => messageArea.innerHTML = '', 4000);
                });
            });

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
                        const programName = p.is_active ? `${p.name}` : `<span class="text-muted" style="opacity: 0.5"><em>${p.name}</em></span>`;
                        const statusBadge = p.is_active ? 'Ενεργό' : '<span class="badge bg-secondary" style="opacity: 0.5"><em>Ανενεργό</em></span>';
                        const programType = p.type === 'group' ? '<span class="badge bg-danger">Ομαδικό</span>' : '<span class="badge bg-success">Ατομικό</span>';
                        const progranTypeFormatted = p.is_active ? programType : `<span class="text-muted" style="opacity: 0.5"><em>${programType}</em></span>`;
                        const row = `<tr>
                            
                            <td>${programName}</td>
                            <td>${progranTypeFormatted}</td>
                            <td>${statusBadge}</td>
                            <td>
                                
                                <a href="#" class="edit-btn me-2" data-id="${p.id}" data-bs-toggle="tooltip" data-bs-title="Επεξεργασία"><img src="icons/pen.png" alt="Επεξεργασία" width="18"></a>
                                ${p.is_active ? `<a href="#" class="disable-btn me-2" data-id="${p.id}" data-bs-toggle="tooltip" data-bs-title="Απενεργοποίηση"><img src="icons/disable.png" alt="Απενεργοποίηση" width="18"></a>` : ''}
                            </td>
                        </tr>`;
                        programsTbody.innerHTML += row;
                    });
                    // Ενεργοποίηση tooltip για τα εικονίδια
                    const tooltipTriggerList = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')];
                    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
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
            const targetLink = e.target.closest('a');
            if (!targetLink) return;
            const id = targetLink.getAttribute('data-id');

            if (targetLink.classList.contains('edit-btn')) {
                // Φόρτωση δεδομένων για επεξεργασία
                fetch(`${apiBaseUrl}/programs/read_one.php?id=${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
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
            } else if (targetLink.classList.contains('disable-btn')) {
                // Επιβεβαίωση διαγραφής
                if (confirm('Είστε σίγουροι ότι θέλετε να απενεργοποιήσετε αυτό το πρόγραμμα;')) {
                    fetch(`${apiBaseUrl}/programs/disable.php`, {
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



    // =================================================================
    // 9. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ ΧΡΟΝΟΠΡΟΓΡΑΜΜΑΤΙΣΜΟΥ (ADMIN)
    // =================================================================
    if (document.getElementById('admin-schedule-page-identifier')) {
        const token = localStorage.getItem('jwt');
        const decodedToken = token ? parseJwt(token) : null;

        // --- Προστασία Σελίδας ---
        if (!token || !decodedToken || decodedToken.data.role_id !== 1) {
            window.location.href = 'index.php';
            return;
        }
        
        // --- DOM Element Selectors ---
        const weekPicker = document.getElementById('week-picker');
        const scheduleContainer = document.getElementById('schedule-container');
        const eventModal = new bootstrap.Modal(document.getElementById('event-modal'));
        const eventForm = document.getElementById('event-form');
        const toggleSwitch = document.getElementById('toggle-individual-programs');

        // --- State Variable ---
        // Μεταβλητή που θα κρατάει τα δεδομένα της εβδομάδας για να μην κάνουμε συνέχεια API calls
        let currentScheduleData = [];

        // --- Functions ---
        
        function populateFormDropdowns() {
            const programSelect = document.getElementById('event-program');
            const trainerSelect = document.getElementById('event-trainer');
            
            // Φόρτωση προγραμμάτων (μόνο τα ενεργά, ομαδικά)
            fetch(`${apiBaseUrl}/programs/read_admin.php`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    programSelect.innerHTML = '<option value="">Επιλέξτε...</option>';
                    data.filter(p => p.is_active && p.type === 'group').forEach(p => {
                        programSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
                    });
                });
                
            // Φόρτωση γυμναστών
            fetch(`${apiBaseUrl}/trainers/read.php`)
                .then(res => res.json())
                .then(data => {
                    trainerSelect.innerHTML = '<option value="">Κανένας</option>';
                    data.forEach(t => {
                        trainerSelect.innerHTML += `<option value="${t.id}">${t.first_name} ${t.last_name}</option>`;
                    });
                });
        }
        
        function getWeekDates(weekString) {
            const year = parseInt(weekString.substring(0, 4));
            const week = parseInt(weekString.substring(6));
            const d = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
            const day = d.getUTCDay();
            const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            const monday = new Date(d.setUTCDate(diff));
            const sunday = new Date(new Date(monday).setDate(monday.getDate() + 6));
            return {
                start: monday.toISOString().split('T')[0],
                end: sunday.toISOString().split('T')[0]
            };
        }
        
        function fetchSchedule(start, end) {
            scheduleContainer.innerHTML = `<p class="text-center">Φόρτωση προγράμματος...</p>`;
            fetch(`${apiBaseUrl}/events/read_admin.php?start=${start}&end=${end}`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    // Αποθηκεύουμε τα δεδομένα στην state variable
                    currentScheduleData = data.message ? [] : data;
                    // Καλουμε τη render για να τα εμφανίσει
                    renderSchedule();
                });
        }        

        // --- Απόδοση του προγράμματος στο UI (ΕΝΗΜΕΡΩΜΕΝΗ ΜΕ ΛΙΣΤΑ ΣΥΜΜΕΤΕΧΟΝΤΩΝ) ---
        function renderSchedule() {
            scheduleContainer.innerHTML = '';
            
            const showIndividual = toggleSwitch.checked;
            
            const eventsToRender = currentScheduleData.filter(event => {
                if (showIndividual) return true;
                return event.program_type === 'group';
            });
            
            if (eventsToRender.length === 0) {
                 scheduleContainer.innerHTML = `<p class="text-center text-muted">Δεν υπάρχουν events για εμφάνιση με τα τρέχοντα φίλτρα.</p>`;
                 return;
            }

            const days = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'];
            const eventsByDay = Array.from({ length: 7 }, () => []);
            
            eventsToRender.forEach(event => {
                const dayIndex = (new Date(event.start_time).getDay() + 6) % 7;
                eventsByDay[dayIndex].push(event);
            });

            for (let i = 0; i < 7; i++) {
                let dayHtml = `<div class="day-column mb-3"><h4>${days[i]}</h4>`;
                if(eventsByDay[i].length === 0){
                    dayHtml += `<p class="text-muted small">Κανένα event.</p>`;
                } else {
                    eventsByDay[i].sort((a,b) => new Date(a.start_time) - new Date(b.start_time));
                    eventsByDay[i].forEach(event => {
                        const programTypeDisplay = event.program_type === 'group' ? 'Ομαδικό' : 'Ατομικό';
                        const title = `${event.program_name} (${programTypeDisplay})`;
                        const capacityText = event.max_capacity === null ? 'Απεριόριστες' : event.max_capacity;
                        const cardColorClass = event.program_type === 'group' ? 'bg-danger-subtle' : 'bg-success-subtle';
                        
                        // **ΝΕΑ ΛΟΓΙΚΗ: Δημιουργία λίστας συμμετεχόντων**
                        let participantsHtml = '<h6 class="fs-6">Συμμετέχοντες:</h6>';
                        if (event.bookings && event.bookings.length > 0) {
                            participantsHtml += '<ul class="list-group mb-0 small">';
                            event.bookings.forEach(booking => {
                                participantsHtml += `<li>${booking.first_name} ${booking.last_name}</li>`;
                            });
                            participantsHtml += '</ul>';
                        } else {
                            participantsHtml += '<p class="small text-muted mb-0">Καμία κράτηση.</p>';
                        }

                        dayHtml += `<div class="card mb-2 ${cardColorClass}">
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-7">
                                                    <h6 class="card-title"><em>${title}</em></h6>
                                                    <p class="card-text mb-1"><small>${new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(event.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small></p>
                                                    <p class="card-text mb-1"><small>Γυμναστής: ${event.trainer_name || 'N/A'}</small></p>
                                                    <p class="card-text mb-2"><small>Κρατήσεις: ${event.current_bookings} / ${capacityText}</small></p>
                                                    <button class="btn btn-danger btn-sm delete-event-btn" data-id="${event.id}">Διαγραφή</button>
                                                </div>
                                                <div class="col-5 border-start">
                                                    ${participantsHtml}
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
                    });
                }
                dayHtml += '</div>';
                scheduleContainer.innerHTML += dayHtml;
            }
        }


        // --- Event Listeners ---
        
        document.getElementById('add-event-btn').addEventListener('click', () => {
            eventForm.reset();
            document.getElementById('modal-title').textContent = 'Προσθήκη Event';
            eventModal.show();
        });

        toggleSwitch.addEventListener('change', () => {
            renderSchedule();
        });

        weekPicker.addEventListener('change', () => {
            const weekDates = getWeekDates(weekPicker.value);
            fetchSchedule(weekDates.start, weekDates.end);
        });

        eventForm.addEventListener('submit', e => {
            e.preventDefault();
            const formData = {
                program_id: document.getElementById('event-program').value,
                trainer_id: document.getElementById('event-trainer').value,
                start_time: `${document.getElementById('event-date').value} ${document.getElementById('event-start-time').value}`,
                end_time: `${document.getElementById('event-date').value} ${document.getElementById('event-end-time').value}`,
                max_capacity: document.getElementById('event-capacity').value,
            };
            fetch(`${apiBaseUrl}/events/create.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            }).then(res => {
                if (res.ok) {
                    eventModal.hide();
                    const weekDates = getWeekDates(weekPicker.value);
                    fetchSchedule(weekDates.start, weekDates.end);
                } else {
                    alert('Σφάλμα κατά τη δημιουργία του event.');
                }
            });
        });
        
        scheduleContainer.addEventListener('click', e => {
            if(e.target.classList.contains('delete-event-btn')) {
                const eventId = e.target.getAttribute('data-id');
                if(confirm('Είστε σίγουροι; Αυτή η ενέργεια θα διαγράψει και τις υπάρχουσες κρατήσεις για το event.')) {
                    fetch(`${apiBaseUrl}/events/delete.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({id: eventId})
                    }).then(res => {
                        if (res.ok) {
                           const weekDates = getWeekDates(weekPicker.value);
                           fetchSchedule(weekDates.start, weekDates.end);
                        } else {
                           alert('Σφάλμα κατά τη διαγραφή του event.');
                        }
                    });
                }
            }
        });

        // --- Αρχική Φόρτωση ---
        
        populateFormDropdowns();
        
        const now = new Date();
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)));
        const year = firstDayOfWeek.getFullYear();
        const d1 = new Date(year, 0, 1);
        const days = Math.floor((firstDayOfWeek - d1) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + d1.getDay() + 1) / 7);
        
        const currentWeekString = `${year}-W${String(week).padStart(2, '0')}`;
        weekPicker.value = currentWeekString;

        const weekDates = getWeekDates(weekPicker.value);
        fetchSchedule(weekDates.start, weekDates.end);
    }



    // =================================================================
    // 10. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ ΔΙΑΧΕΙΡΙΣΗΣ ΑΝΑΚΟΙΝΩΣΕΩΝ (ADMIN)
    // =================================================================
    if (document.getElementById('admin-announcements-page-identifier')) {
        const token = localStorage.getItem('jwt');
        if (!token || parseJwt(token).data.role_id !== 1) {
            window.location.href = 'index.php';
            return;
        }

        const announcementsTbody = document.getElementById('announcements-tbody');
        const messageArea = document.getElementById('message-area');
        const announcementModal = new bootstrap.Modal(document.getElementById('announcement-modal'));
        const announcementForm = document.getElementById('announcement-form');

        function fetchAnnouncements() {
            // Το endpoint /read.php είναι δημόσιο, αλλά εδώ το καλούμε για να πάρουμε τη λίστα για διαχείριση.
            fetch(`${apiBaseUrl}/announcements/read.php`, { headers: { 'Authorization': `Bearer ${token}` }})
                .then(res => res.json())
                .then(data => {
                    announcementsTbody.innerHTML = '';
                    if (data.message) {
                        announcementsTbody.innerHTML = `<tr><td colspan="4" class="text-center">${data.message}</td></tr>`;
                    } else {
                        data.forEach(a => {
                            const row = `<tr>
                                <td>${a.title}</td>
                                <td>${a.author}</td>
                                <td>${new Date(a.created_at).toLocaleDateString('el-GR')}</td>
                                <td>
                                    
                                    <a href="#" class="edit-btn me-2" data-id="${a.id}" data-bs-toggle="tooltip" data-bs-title="Επεξεργασία"><img src="icons/pen.png" alt="Επεξεργασία" width="18"></a>
                                    <a href="#" class="delete-btn" data-id="${a.id}" data-bs-toggle="tooltip" data-bs-title="Διαγραφή"><img src="icons/bin.png" alt="Διαγραφή" width="18"></a>
                                </td>
                            </tr>`;
                            announcementsTbody.innerHTML += row;
                        });
                    }
                });
        }
        
        document.getElementById('add-announcement-btn').addEventListener('click', () => {
            announcementForm.reset();
            document.getElementById('announcement-id').value = '';
            document.getElementById('modal-title').textContent = 'Προσθήκη Νέας Ανακοίνωσης';
            announcementModal.show();
        });

        announcementsTbody.addEventListener('click', e => {
            const targetLink = e.target.closest('a');
            if (!targetLink) return;
            const id = targetLink.getAttribute('data-id');

            if (targetLink.classList.contains('edit-btn')) {
                // Φόρτωση δεδομένων για επεξεργασία
                fetch(`${apiBaseUrl}/announcements/read_one.php?id=${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    if(data.id) {
                        document.getElementById('announcement-id').value = data.id;
                        document.getElementById('announcement-title').value = data.title;
                        document.getElementById('announcement-content').value = data.content;
                        document.getElementById('modal-title').textContent = 'Επεξεργασία Ανακοίνωσης';
                        announcementModal.show();
                    }
                });
            } else if (targetLink.classList.contains('delete-btn')) {
                if(confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε οριστικά αυτή την ανακοίνωση;')){
                    fetch(`${apiBaseUrl}/announcements/delete.php`, {
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
                        fetchAnnouncements(); // Ανανέωση της λίστας
                        setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                    });
                }
            }
        });

        announcementForm.addEventListener('submit', e => {
            e.preventDefault();
            const id = document.getElementById('announcement-id').value;
            const url = id ? `${apiBaseUrl}/announcements/update.php` : `${apiBaseUrl}/announcements/create.php`;
            
            const formData = {
                id: id || undefined,
                title: document.getElementById('announcement-title').value,
                content: document.getElementById('announcement-content').value
            };
            
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            })
            .then(res => res.json())
            .then(data => {
                messageArea.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                announcementModal.hide();
                fetchAnnouncements();
                setTimeout(() => messageArea.innerHTML = '', 4000);
            });
        });
        
        fetchAnnouncements();
    }



    // =================================================================
    // 11. ΛΟΓΙΚΗ ΦΟΡΤΩΣΗΣ ΑΝΑΚΟΙΝΩΣΕΩΝ ΣΤΗΝ ΑΡΧΙΚΗ ΣΕΛΙΔΑ (ΕΝΗΜΕΡΩΜΕΝΗ)
    // =================================================================
    const announcementsContainer = document.getElementById('announcements-container');

    // Εκτέλεση μόνο αν βρισκόμαστε στην αρχική σελίδα (όπου υπάρχει το container)
    if (announcementsContainer) {
        announcementsContainer.innerHTML = '<p class="text-center">Φόρτωση ανακοινώσεων...</p>';

        apiFetch(`${apiBaseUrl}/announcements/read.php`)
            .then(data => {
                announcementsContainer.innerHTML = ''; // Καθαρισμός του container
                
                if (data && data.message && !Array.isArray(data)) {
                    // Αν η απάντηση είναι αντικείμενο με μήνυμα (π.χ. "Δεν βρέθηκαν ανακοινώσεις")
                    announcementsContainer.innerHTML = `<div class="list-group-item">${data.message}</div>`;
                } else if (Array.isArray(data) && data.length === 0) {
                    // Αν η απάντηση είναι κενός πίνακας
                    announcementsContainer.innerHTML = `<div class="list-group-item">Δεν υπάρχουν διαθέσιμες ανακοινώσεις.</div>`;
                } else if (Array.isArray(data)) {
                    // Αν η απάντηση είναι πίνακας με ανακοινώσεις
                    data.forEach(announcement => {
                        // **ΑΛΛΑΓΗ ΕΔΩ: Προσθέσαμε την κλάση 'bg-warning-subtle'** (Αυτή η γραμμή υπήρχε ήδη)
                        const item = `
                            <div class="list-group-item list-group-item-action flex-column align-items-start mb-2 bg-warning-subtle">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1"><em>${announcement.title}</em></h5>
                                    <small>${new Date(announcement.created_at).toLocaleDateString('el-GR')}</small>
                                </div>
                                <p class="mb-1">${announcement.content}</p>
                                <small>Από: ${announcement.author}</small>
                            </div>
                        `;
                        announcementsContainer.innerHTML += item;
                    });
                } else {
                    // Για απρόσμενη μορφή δεδομένων ή αν το data είναι undefined (π.χ. από 204 status)
                    announcementsContainer.innerHTML = `<div class="alert alert-warning">Μη αναμενόμενη απάντηση κατά τη φόρτωση των ανακοινώσεων.</div>`;
                    console.error("Unexpected data format for announcements:", data);
                }
            })
            .catch(error => {
                console.error('Error fetching announcements:', error);
                announcementsContainer.innerHTML = `<div class="alert alert-danger">Αδυναμία φόρτωσης των ανακοινώσεων: ${error.message || 'Προέκυψε σφάλμα'}.</div>`;
            });
    }



    // =================================================================
    // 12. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ ΔΙΑΧΕΙΡΙΣΗΣ ΓΥΜΝΑΣΤΩΝ (ADMIN)
    // =================================================================
    if (document.getElementById('admin-trainers-page-identifier')) {
        const token = localStorage.getItem('jwt');
        if (!token || parseJwt(token).data.role_id !== 1) {
            window.location.href = 'index.php';
            return;
        }

        const trainersTbody = document.getElementById('trainers-tbody');
        const messageArea = document.getElementById('message-area');
        const trainerModal = new bootstrap.Modal(document.getElementById('trainer-modal'));
        const trainerForm = document.getElementById('trainer-form');

        function fetchTrainers() {
            // Χρησιμοποιούμε το δημόσιο endpoint που φέρνει όλους τους γυμναστές
            apiFetch(`${apiBaseUrl}/trainers/read.php`)
                .then(data => {
                    trainersTbody.innerHTML = '';
                    // Ελέγχουμε αν η απάντηση περιέχει μήνυμα (π.χ. σφάλμα ή "δεν βρέθηκαν")
                    // ή αν είναι ένας κενός πίνακας.
                    if (data && data.message && !Array.isArray(data)) {
                        trainersTbody.innerHTML = `<tr><td colspan="4" class="text-center">${data.message}</td></tr>`;
                    } else if (Array.isArray(data) && data.length === 0) {
                        trainersTbody.innerHTML = `<tr><td colspan="4" class="text-center">Δεν βρέθηκαν γυμναστές.</td></tr>`;
                    } else if (Array.isArray(data)) {
                        data.forEach(t => {
                            const row = `<tr>
                                <td>${t.last_name}</td>
                                <td>${t.first_name}</td>
                                <td>
                                    <a href="#" class="edit-trainer-btn me-2" data-id="${t.id}" data-bs-toggle="tooltip" data-bs-title="Επεξεργασία"><img src="icons/pen.png" alt="Επεξεργασία" width="18"></a>
                                    <a href="#" class="delete-trainer-btn" data-id="${t.id}" data-bs-toggle="tooltip" data-bs-title="Διαγραφή"><img src="icons/bin.png" alt="Διαγραφή" width="18"></a>
                                </td>
                            </tr>`;
                            trainersTbody.innerHTML += row;
                        });
                        // Αρχικοποίηση των tooltips
                        const tooltipTriggerList = [...trainersTbody.querySelectorAll('[data-bs-toggle="tooltip"]')];
                        tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
                    } else {
                        // Για απρόσμενη μορφή δεδομένων
                        trainersTbody.innerHTML = `<tr><td colspan="4" class="text-center text-warning">Μη αναμενόμενη απάντηση από τον server.</td></tr>`;
                        console.error("Unexpected data format for trainers:", data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching trainers:', error);
                    trainersTbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Σφάλμα φόρτωσης γυμναστών: ${error.message || 'Προέκυψε σφάλμα'}</td></tr>`;
                });
        }
        
        document.getElementById('add-trainer-btn').addEventListener('click', () => {
            trainerForm.reset();
            document.getElementById('trainer-id').value = '';
            document.getElementById('modal-title').textContent = 'Προσθήκη Νέου Γυμναστή';
            trainerModal.show();
        });

        // Event listener για επεξεργασία και διαγραφή
        trainersTbody.addEventListener('click', e => {
            const targetLink = e.target.closest('a');
            if (!targetLink) return;
            const id = targetLink.getAttribute('data-id');

            if (targetLink.classList.contains('edit-trainer-btn')) {
                e.preventDefault();
                // Φόρτωση δεδομένων για επεξεργασία
                apiFetch(`${apiBaseUrl}/trainers/read_one.php?id=${id}`)
                    .then(t => {
                        if (t && t.id) {
                            document.getElementById('trainer-id').value = t.id;
                            document.getElementById('trainer-first-name').value = t.first_name;
                            document.getElementById('trainer-last-name').value = t.last_name;
                            document.getElementById('trainer-bio').value = t.bio;
                            document.getElementById('modal-title').textContent = 'Επεξεργασία Γυμναστή';
                            trainerModal.show();
                        } else {
                            messageArea.innerHTML = `<div class="alert alert-warning">${t.message || 'Δεν βρέθηκε ο γυμναστής ή τα δεδομένα είναι ελλιπή.'}</div>`;
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching trainer details:', error);
                        messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα φόρτωσης λεπτομερειών: ${error.message || 'Άγνωστο σφάλμα.'}</div>`;
                    });
            } else if (targetLink.classList.contains('delete-trainer-btn')) {
                e.preventDefault();
                if(confirm('Είστε σίγουροι; Η διαγραφή ενός γυμναστή θα τον αφαιρέσει από τα events που έχει αναλάβει.')){
                    apiFetch(`${apiBaseUrl}/trainers/delete.php`, {
                        method: 'POST',
                        body: JSON.stringify({ id: id })
                    })
                    .then(data => {
                        messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Ο γυμναστής διαγράφηκε επιτυχώς.'}</div>`;
                        fetchTrainers();
                    })
                    .catch(error => {
                        console.error('Error deleting trainer:', error);
                        messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα διαγραφής: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
                    });
                }
            }
        });

        trainerForm.addEventListener('submit', e => {
            e.preventDefault();
            const id = document.getElementById('trainer-id').value;
            const url = id ? `${apiBaseUrl}/trainers/update.php` : `${apiBaseUrl}/trainers/create.php`;
            const formData = {
                id: id || undefined,
                first_name: document.getElementById('trainer-first-name').value,
                last_name: document.getElementById('trainer-last-name').value,
                bio: document.getElementById('trainer-bio').value
            };
            apiFetch(url, {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            .then(data => {
                messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Τα στοιχεία αποθηκεύτηκαν επιτυχώς.'}</div>`;
                trainerModal.hide();
                fetchTrainers();
            })
            .catch(error => {
                console.error('Error saving trainer:', error);
                messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα αποθήκευσης: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
            });
        });
        fetchTrainers();
    }

});