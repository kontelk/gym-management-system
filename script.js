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
                // Προσπάθεια να διαβάσουμε την απάντηση ως κείμενο πρώτα
                const errorText = await response.text();
                try {
                    // Προσπάθεια να την κάνουμε parse ως JSON
                    const errorData = JSON.parse(errorText);
                    return Promise.reject(errorData);
                } catch (e) {
                    // Αν αποτύχει το parse, σημαίνει ότι δεν ήταν JSON (π.χ. HTML σφάλματος)
                    console.error('Server returned non-JSON error:', errorText);
                    return Promise.reject({ message: `Σφάλμα server: ${response.status} ${response.statusText}. Δείτε την κονσόλα για λεπτομέρειες.` });
                }
            }
            
            // Για 204 No Content (π.χ. σε επιτυχημένη διαγραφή χωρίς σώμα απάντησης)
            if (response.status === 204) {
                return Promise.resolve();
            }

            return response.json(); // Για 200 OK, 201 Created κ.λπ. επιστροφή των δεδομένων JSON

        } catch (error) {
            console.error('Network or Fetch Error:', error);
            return Promise.reject({ message: 'Σφάλμα δικτύου. Ελέγξτε τη σύνδεσή σας.' });
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
            window.location.href = 'index.php'; // Ανακατεύθυνση στην αρχική σελίδα
        });
    }

    // Κλήση της updateNavbar() σε κάθε φόρτωση σελίδας
    updateNavbar();

    
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

            // Ενημέρωση του κυκλικού progress bar μόνο αν υπάρχει το iat
            if (decodedToken.iat) {
                const totalDuration = decodedToken.exp - decodedToken.iat;
                if (totalDuration > 0) { // Αποφυγή διαίρεσης με μηδέν ή αρνητικό
                    const elapsed = totalDuration - remainingSeconds;
                    const percentage = Math.round((elapsed / totalDuration) * 100);
                    timerElement.style.setProperty('--p', 100 - percentage); // Το conic-gradient λειτουργεί αντίστροφα
                }
            }
        };
        
        updateTimerDisplay(); // Αρχική εμφάνιση
        jwtTimerInterval = setInterval(updateTimerDisplay, 1000); // Ενημέρωση κάθε 1 δευτερόλεπτο
    }

    // Event listener για την ανανέωση του token
    document.getElementById('jwt-timer')?.addEventListener('click', () => {
        // if (!confirm('Θέλετε να ανανεώσετε τον χρόνο της συνδεσής σας;')) return;
        // Η apiFetch θα στείλει αυτόματα το υπάρχον token στο header Authorization
        apiFetch(`${apiBaseUrl}/users/refresh_token.php`, { method: 'POST' }) // Προσθέτουμε method: 'POST' αν το API το απαιτεί για refresh
            .then(data => {
                if (data.jwt) {
                    localStorage.setItem('jwt', data.jwt); // Αποθήκευση του νέου token
                    startJwtTimer(data.jwt); // Επανεκκίνηση του timer με το νέο token
                }
            })
            .catch(error => {
                console.error('Token refresh failed:', error);
                // Εδώ θα μπορούσατε να εμφανίσετε ένα μήνυμα στον χρήστη, π.χ. μέσω του messageArea αν υπάρχει στη σελίδα
            });
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
                body: JSON.stringify(loginData) // Χρήση του loginData που ορίστηκε παραπάνω
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
                if (messageArea) {
                    messageArea.innerHTML = `<div class="alert alert-danger">${error.message || 'Προέκυψε κάποιο σφάλμα κατά τη σύνδεση.'}</div>`;
                }
                console.error('Login error:', error);
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
        apiFetch('https://countriesnow.space/api/v0.1/countries/positions')
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
                     countrySelect.innerHTML = `<option selected disabled value="">Σφάλμα φόρτωσης: ${data.msg || 'Άγνωστο σφάλμα API'}</option>`;
                }
            })
            .catch(error => {
                console.error('Error fetching countries:', error);
                countrySelect.innerHTML = `<option selected disabled value="">Σφάλμα φόρτωσης χωρών: ${error.message || 'Πρόβλημα δικτύου'}</option>`;
            });

        // --- Event Listener για αλλαγή χώρας ---
        countrySelect.addEventListener('change', function() {
            const selectedCountry = this.value;
            citySelect.innerHTML = '<option selected disabled value="">Φόρτωση πόλεων...</option>';
            citySelect.disabled = true;

            if (selectedCountry) {
                // Κλήση στο API για τις πόλεις της επιλεγμένης χώρας
                apiFetch('https://countriesnow.space/api/v0.1/countries/cities', {
                    method: 'POST',
                    body: JSON.stringify({ country: selectedCountry })
                })
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
                        citySelect.innerHTML = `<option selected disabled value="">${data.msg || 'Δεν βρέθηκαν πόλεις'}</option>`;
                        // citySelect.disabled = true; // Ήδη είναι disabled, αλλά για σιγουριά
                    }
                })
                .catch(error => {
                    console.error('Error fetching cities:', error);
                    citySelect.innerHTML = `<option selected disabled value="">Σφάλμα φόρτωσης πόλεων: ${error.message || 'Πρόβλημα δικτύου'}</option>`;
                });
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
            apiFetch(`${apiBaseUrl}/users/register.php`, {
                method: 'POST',
                body: JSON.stringify(registerData)
            })
            .then(body => { // Η apiFetch επιστρέφει το body της επιτυχούς απάντησης (π.χ. 201)
                // Πρώτα, καθαρίζουμε όλα τα προηγούμενα σφάλματα
                registerForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
                
                messageArea.innerHTML = `<div class="alert alert-success">${body.message}</div>`;
                registerForm.reset();
                registerForm.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
                citySelect.disabled = true;
                citySelect.innerHTML = '<option selected disabled value="">Επιλέξτε πόλη</option>'; // Επαναφορά του city select
            })
            .catch(error => { // Η apiFetch χειρίζεται τα HTTP errors και τα στέλνει εδώ
                console.error('Registration Error:', error);
                // Καθαρίζουμε τυχόν παλιά is-valid classes
                registerForm.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
                // Καθαρίζουμε παλιά σφάλματα πριν εμφανίσουμε νέα
                registerForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
                registerForm.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');

                if (error && error.message && error.errors) { // Σφάλματα Validation από τον Server (π.χ. 422)
                    messageArea.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
                    for (const field in error.errors) {
                        const input = document.getElementById(field);
                        if (input) {
                            input.classList.add('is-invalid');
                            const feedbackDiv = input.nextElementSibling;
                            if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
                                feedbackDiv.textContent = error.errors[field];
                            }
                        }
                    }
                } else { // Άλλα σφάλματα (π.χ. 500, ή σφάλμα δικτύου από την apiFetch)
                    messageArea.innerHTML = `<div class="alert alert-danger">${error.message || 'Προέκυψε κάποιο σφάλμα κατά την εγγραφή.'}</div>`;
                }
            });

        });
    }



    // =================================================================
    // 4. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ ΔΙΑΧΕΙΡΙΣΗΣ ΠΡΟΓΡΑΜΜΑΤΩΝ (PROGRAMS)
    // =================================================================
    const programsContainer = document.getElementById('programs-container');

    if (programsContainer) {
        const messageArea = document.getElementById('message-area');
        // Προαιρετικά: Εμφάνιση μηνύματος φόρτωσης
        programsContainer.innerHTML = '<p class="text-center">Φόρτωση προγραμμάτων...</p>';

        apiFetch(`${apiBaseUrl}/programs/read.php`)
            .then(data => {
                // Case 1: Η απάντηση είναι αντικείμενο με μήνυμα (π.χ. "Δεν βρέθηκαν προγράμματα")
                if (data && data.message && !Array.isArray(data)) {
                    if (messageArea) {
                        messageArea.innerHTML = `<div class="alert alert-warning">${data.message}</div>`;
                    }
                    programsContainer.innerHTML = ''; // Καθαρισμός του container
                    return;
                }

                // Case 2: Η απάντηση είναι κενός πίνακας
                if (Array.isArray(data) && data.length === 0) {
                    if (messageArea) {
                        messageArea.innerHTML = `<div class="alert alert-info">Δεν υπάρχουν διαθέσιμα προγράμματα αυτή τη στιγμή.</div>`;
                    }
                    programsContainer.innerHTML = ''; // Καθαρισμός του container
                    return;
                }
                
                // Case 3: Η απάντηση είναι πίνακας με προγράμματα
                if (Array.isArray(data)) {
                    programsContainer.innerHTML = ''; // Καθαρισμός του container από τυχόν μήνυμα φόρτωσης
                    data.forEach(program => {
                        const card = `
                            <div class="col-md-6 col-lg-4 mb-4">
                                <div class="card h-100">
                                    <div class="card-body d-flex flex-column ${program.type === 'group' ? 'bg-primary-subtle' : 'bg-success-subtle'}">
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
                    if (messageArea) {
                        messageArea.innerHTML = ''; // Καθαρισμός προηγούμενων μηνυμάτων
                    }
                } else {
                // Case 4: Μη αναμενόμενη μορφή δεδομένων
                    console.error("Unexpected data format for programs:", data);
                    if (messageArea) {
                        messageArea.innerHTML = `<div class="alert alert-danger">Μη αναμενόμενη απάντηση από τον server.</div>`;
                    }
                    programsContainer.innerHTML = ''; // Καθαρισμός του container
                }
            })
            .catch(error => {
                console.error('Error fetching programs:', error);
                if (messageArea) {
                    messageArea.innerHTML = `<div class="alert alert-danger">Αδυναμία φόρτωσης των προγραμμάτων: ${error.message || 'Προέκυψε σφάλμα'}.</div>`;
                }
                programsContainer.innerHTML = ''; // Καθαρισμός του container σε περίπτωση σφάλματος
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
        let selectedDate =  null; // Αρχικοποίηση της μεταβλητής για την επιλεγμένη ημερομηνία
        
        // Ορισμός της ελάχιστης ημερομηνίας στο σήμερα
        datePicker.min = new Date().toISOString().split("T")[0];

        if (!programId) {
            programTitleEl.textContent = 'Σφάλμα: Δεν επιλέχθηκε πρόγραμμα.';
            datePicker.disabled = true;
        } else {
            // Φόρτωση του ονόματος του προγράμματος
            // Η apiFetch θα στείλει το token αν υπάρχει, αλλά για read_one προγράμματος μπορεί να μην είναι απαραίτητο.
            // Αν το endpoint είναι δημόσιο, η apiFetch θα λειτουργήσει κανονικά.
            apiFetch(`${apiBaseUrl}/programs/read_one.php?id=${programId}`)
                .then(data => {
                    if (data.name) {
                        programTitleEl.textContent = `Κράτηση για: ${data.name}`;
                    } else {
                        programTitleEl.textContent = data.message || 'Το πρόγραμμα δεν βρέθηκε.';
                    }
                })
                .catch(error => {
                    programTitleEl.textContent = `Σφάλμα: ${error.message || 'Δεν ήταν δυνατή η φόρτωση του προγράμματος.'}`;
                });
        }
        
        // --- Event Listener για αλλαγή ημερομηνίας ---
        datePicker.addEventListener('change', function() {
            selectedDate = this.value;
            if (programId && selectedDate) {
                fetchAvailability(programId, selectedDate);
            }
        });

        // --- Συνάρτηση για φόρτωση διαθεσιμότητας ---
        function fetchAvailability(pId, date) {
            availabilityResults.innerHTML = `<p class="text-center">Αναζήτηση διαθεσιμότητας...</p>`;

            Promise.all([
                apiFetch(`${apiBaseUrl}/events/search.php?program_id=${pId}&date=${date}`),
                apiFetch(`${apiBaseUrl}/bookings/read_by_user.php`) // Φέρνουμε όλες τις κρατήσεις του χρήστη
            ])
            .then(([slotsData, userBookingsData]) => {
                availabilityResults.innerHTML = ''; // Καθαρισμός

                let slots = [];
                if (Array.isArray(slotsData)) {
                    slots = slotsData;
                } else if (slotsData && slotsData.message) {
                    availabilityResults.innerHTML = `<p class="text-center text-warning">${slotsData.message}</p>`;
                    return;
                } else {
                    availabilityResults.innerHTML = `<p class="text-center text-danger">Σφάλμα φόρτωσης διαθέσιμων τμημάτων.</p>`;
                    console.error("Unexpected data format for slots:", slotsData);
                    return;
                }

                let userBookings = [];
                if (Array.isArray(userBookingsData)) {
                    userBookings = userBookingsData;
                } // Αν το userBookingsData έχει message (π.χ. "Δεν έχετε κρατήσεις"), το userBookings παραμένει κενό, που είναι οκ.
                const userBookedEventIds = new Set(userBookings.map(b => parseInt(b.event_id, 10)));
                console.log('User Bookings:', userBookings);
                console.log('User booked event IDs:', userBookedEventIds);

                // Έλεγχος αν ο χρήστης έχει ήδη κράτηση για αυτό το πρόγραμμα (pId) σε αυτή την ημερομηνία (date)
                // Αυτό γίνεται ελέγχοντας αν κάποιο από τα event_id των τρεχόντων slots υπάρχει στις κρατήσεις του χρήστη.
                const userHasBookingForProgramOnThisDate = slots.some(slot => userBookedEventIds.has(parseInt(slot.event_id, 10)));
                console.log('User has booking for this program on this date:', userHasBookingForProgramOnThisDate);

                if (slots.length === 0) {
                    availabilityResults.innerHTML = `<p class="text-center text-info">Δεν υπάρχει διαθεσιμότητα για την επιλεγμένη ημερομηνία.</p>`;
                    return;
                }

                slots.forEach(slot => {
                        const startTime = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const userHasBookedThisSpecificSlot = userBookedEventIds.has(parseInt(slot.event_id, 10));
                        let bookedBadgeHtml = '';
                        if (userHasBookedThisSpecificSlot) {
                            // Αν ο χρήστης έχει ήδη κάνει κράτηση για αυτό το slot, εμφανίζουμε μήνυμα "Έχετε κάνει Κράτηση".
                            bookedBadgeHtml = '<span class="badge bg-dark text-light ms-2">Έχετε κάνει Κράτηση</span>';
                        }
                        const disableButton = slot.available_slots <= 0 || userHasBookingForProgramOnThisDate;
                        let bookButtonHtml = '';
                        if (disableButton) {
                            // Αν ο χρήστης έχει ήδη κράτηση για αυτό το slot, το κουμπί "Κράτηση" είναι απενεργοποιημένο.
                            bookButtonHtml = `<button class="btn btn-secondary btn-sm" disabled>Κράτηση</button>`;
                        } else {
                            bookButtonHtml = `<button class="btn btn-success btn-sm book-btn" data-event-id="${slot.event_id}">Κράτηση</button>`;
                        }
                        // Δημιουργία του HTML στοιχείου για κάθε διαθέσιμο slot
                        // Χρησιμοποιούμε template literals για να κάνουμε τον κώδικα πιο καθαρό
                        const item = `
                            <div class="list-group-item py-0 w-75 mx-auto d-flex justify-content-between align-items-center mb-1 bg-body-secondary">
                                <div>
                                    <strong>${startTime}</strong> | Διαθέσιμες θέσεις:
                                    <span class="badge ${slot.available_slots > 5 ? 'bg-primary' : (slot.available_slots > 0 ? 'bg-warning' : 'bg-danger')}">${slot.available_slots}</span>
                                </div>
                                ${bookedBadgeHtml}
                                ${bookButtonHtml}
                            </div>
                        `;
                        availabilityResults.innerHTML += item;
                    });
            })
            .catch(error => {
                console.error('Error fetching availability:', error);
                availabilityResults.innerHTML = `<p class="text-center text-danger">Σφάλμα φόρτωσης διαθεσιμότητας: ${error.message || 'Προέκυψε σφάλμα'}.</p>`;
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
            fetchAvailability(programId, selectedDate); //  Επαναφόρτωση της διαθεσιμότητας μετά την κράτηση
        });
        
        
        // --- Συνάρτηση για δημιουργία κράτησης ---
        function createBooking(eId) {
            // Η apiFetch θα προσθέσει αυτόματα Content-Type και Authorization headers
            apiFetch(`${apiBaseUrl}/bookings/create.php`, {
                method: 'POST',
                body: JSON.stringify({ event_id: eId })
            })
            // Η apiFetch επιστρέφει το body της επιτυχούς απάντησης (π.χ. 201)
            .then(data => {
                messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Η κράτηση δημιουργήθηκε επιτυχώς!'}</div>`;
                // **ΝΕΟ: Ανακατεύθυνση στη σελίδα "Οι Κρατήσεις μου" μετά από μικρή καθυστέρηση**
                // setTimeout(() => {
                //     window.location.href = 'my_bookings.php';
                // }, 1500); // Καθυστέρηση 1.5 δευτερόλεπτο για να φανεί το μήνυμα
            })
            .catch(error => {
                console.error('Error creating booking:', error);
                messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα δημιουργίας κράτησης: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
                setTimeout(() => { messageArea.innerHTML = ''; }, 5000);
            });
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
                    // Φτιάχνουμε μια booolean μεταβλητή για ακυρωμένες κρατήσεις < 2 ώρες πριν
                    const immutable = (booking.status === 'cancelled_by_user' || booking.status === 'cancelled_by_admin' || hoursDiff < 2);
                    let programNameStr = '';
                    let eventDateStr = '';
                    if (immutable) {
                        // Αν η κράτηση είναι ακυρωμένη και < 2 ώρες πριν, εμφανίζουμε το πρόγραμμα και την ημερομηνία
                        // με την κλάση text-muted για να δείχνει ότι δεν είναι ενεργή.
                        programNameStr = `<span class="text-muted" style="opacity: 0.5">${booking.program_name}</span>`;
                        eventDateStr = `<span class="text-muted" style="opacity: 0.5">${eventDate.toLocaleString('el-GR')}</span>`;
                    } else {
                        programNameStr = booking.program_name;
                        eventDateStr = eventDate.toLocaleString('el-GR');
                    }
                    // Δημιουργία του status badge ανάλογα με την κατάσταση της κράτησης
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
                    // Δημιουργία της γραμμής του πίνακα με τα δεδομένα της κράτησης
                    const row = `
                        <tr>
                            <td>${programNameStr}</td>
                            <td>${eventDateStr}</td>
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
                // Η apiFetch θα προσθέσει αυτόματα το Authorization header
                apiFetch(`${apiBaseUrl}/users/read_pending.php`)
                    .then(data => {
                        pendingUsersTbody.innerHTML = '';
                        // Ελέγχουμε αν η απάντηση περιέχει μήνυμα (π.χ. σφάλμα ή "δεν βρέθηκαν")
                        // ή αν είναι ένας κενός πίνακας.
                        if (data && data.message && !Array.isArray(data)) {
                            pendingCountBadge.textContent = '0';
                            pendingUsersTbody.innerHTML = `<tr><td colspan="5" class="text-center">${data.message}</td></tr>`;
                        } else if (Array.isArray(data) && data.length === 0) {
                            pendingCountBadge.textContent = '0';
                            pendingUsersTbody.innerHTML = `<tr><td colspan="5" class="text-center">Δεν υπάρχουν χρήστες σε αναμονή έγκρισης.</td></tr>`;
                        } else if (Array.isArray(data)) {
                            pendingCountBadge.textContent = data.length;
                            data.forEach(user => {
                                const row = `<tr>
                                    <td>${user.username}</td>
                                    <td>${user.last_name} ${user.first_name}</td>
                                    <td>${user.email}</td>
                                    <td>${user.request_date ? new Date(user.request_date).toLocaleDateString('el-GR') : 'N/A'}</td>
                                    <!-- Προσθήκη κουμπιών έγκρισης και απόρριψης -->
                                    <td>
                                        <a href="#" class="approve-btn me-2" data-id="${user.id}" data-username="${user.username}" data-bs-toggle="tooltip" data-bs-title="Έγκριση"><img src="icons/approve.png" alt="Έγκριση" width="25"></a>
                                        <a href="#" class="decline-btn me-2" data-id="${user.id}" data-username="${user.username}" data-bs-toggle="tooltip" data-bs-title="Απόρριψη"><img src="icons/decline.png" alt="Απόρριψη" width="25"></a>
                                    </td>
                                </tr>`;
                                pendingUsersTbody.innerHTML += row;
                            });
                        } else {
                            pendingCountBadge.textContent = '0';
                            pendingUsersTbody.innerHTML = `<tr><td colspan="5" class="text-center text-warning">Μη αναμενόμενη απάντηση από τον server.</td></tr>`;
                            console.error("Unexpected data format for pending users:", data);
                        }
                        // Αρχικοποίηση των tooltips μόνο για τα στοιχεία μέσα στο pendingUsersTbody
                        const tooltipTriggerList = [...pendingUsersTbody.querySelectorAll('[data-bs-toggle="tooltip"]')];
                        tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
                    })
                    .catch(error => {
                        console.error('Error fetching pending users:', error);
                        pendingCountBadge.textContent = '0';
                        pendingUsersTbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Σφάλμα φόρτωσης χρηστών σε αναμονή: ${error.message || 'Προέκυψε σφάλμα'}</td></tr>`;
                    });
            }

            // --- Φόρτωση όλων των χρηστών (ΕΝΗΜΕΡΩΜΕΝΗ) ---
            function fetchAllUsers() {
                //  fetch(`${apiBaseUrl}/users/read.php`, { headers: { 'Authorization': `Bearer ${token}` } })
                //     .then(res => res.json())
                // Η apiFetch θα προσθέσει αυτόματα το Authorization header
                apiFetch(`${apiBaseUrl}/users/read.php`)
                    .then(data => {
                        allUsersTbody.innerHTML = '';
                        // if (data.message) {
                        // Ελέγχουμε αν η απάντηση περιέχει μήνυμα (π.χ. σφάλμα ή "δεν βρέθηκαν")
                        // ή αν είναι ένας κενός πίνακας.
                        if (data && data.message && !Array.isArray(data)) {
                             allUsersTbody.innerHTML = `<tr><td colspan="6" class="text-center">${data.message}</td></tr>`;
                        // } else {
                        } else if (Array.isArray(data) && data.length === 0) {
                            allUsersTbody.innerHTML = `<tr><td colspan="6" class="text-center">Δεν βρέθηκαν εγγεγραμμένοι χρήστες.</td></tr>`;
                        } else if (Array.isArray(data)) {
                            data.forEach(user => {
                                let roleBadge = '';// = user.role_name ? `?<span class="badge bg-info">${user.role_name}</span>:` : '<span class="badge bg-secondary">unregistered_user</span>';
                                if (user.role_name) {
                                    if (user.role_name === 'admin') {
                                        roleBadge = '<span class="badge bg-dark">admin</span>';
                                    } else if (user.role_name === 'registered_user') {
                                        roleBadge = '<span class="badge bg-primary">registered_user</span>';
                                    }
                                } else {
                                    roleBadge = '';
                                }
                                
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
                                // const statusBadge = user.status === 'active' ? '<span class="badge bg-success">Ενεργός</span>' : '<span class="badge bg-secondary">Ανενεργός</span>';
                                const statusBadge = `<span class="badge ${badgeClass}">${user.status}</span>`;

                                const row = `<tr>
                                    <!-- εαν user.status είναι rejected ή inactive τότε κάνε το χρώμα του κειμένου πολύ ανοιχτό πολύ θαμπό (περισσότερο από text-muted) -->
                                     
                                    <td ${user.status === 'rejected' || user.status === 'inactive' ? ' class="text-muted" style="opacity: 0.5" ' : ''} >${user.username}</td>
                                    <td ${user.status === 'rejected' || user.status === 'inactive' ? ' class="text-muted" style="opacity: 0.5" ' : ''} >${user.last_name} ${user.first_name}</td>
                                    <td ${user.status === 'rejected' || user.status === 'inactive' ? ' class="text-muted" style="opacity: 0.5" ' : ''} >${user.email}</td>
                                    <td ${user.status === 'rejected' || user.status === 'inactive' ? ' class="text-muted" style="opacity: 0.5" ' : ''} >${roleBadge}</td>
                                    <td>${statusBadge}</td>
                                    
                                    <td>
                                        <a href="#" class="edit-btn me-2" data-id="${user.id}" data-username="${user.username}" data-bs-toggle="tooltip" data-bs-title="Επεξεργασία"><img src="icons/pen.png" alt="Επεξεργασία" width="25"></a>
                                        <a href="#" class="delete-btn" data-id="${user.id}" data-username="${user.username}" data-bs-toggle="tooltip" data-bs-title="Διαγραφή"><img src="icons/bin.png" alt="Διαγραφή" width="25"></a>
                                    </td>
                                </tr>`;
                                allUsersTbody.innerHTML += row;
                            });
                            // // Αρχικοποίηση των tooltips
                            // const tooltipTriggerList = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')];
                            // Αρχικοποίηση των tooltips μόνο για τα στοιχεία μέσα στο allUsersTbody
                            const tooltipTriggerList = [...allUsersTbody.querySelectorAll('[data-bs-toggle="tooltip"]')];
                            tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
                        } else {
                            allUsersTbody.innerHTML = `<tr><td colspan="6" class="text-center text-warning">Μη αναμενόμενη απάντηση από τον server.</td></tr>`;
                            console.error("Unexpected data format for all users:", data);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching all users:', error);
                        allUsersTbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Σφάλμα φόρτωσης χρηστών: ${error.message || 'Προέκυψε σφάλμα'}</td></tr>`;
                    });
            }

            // Event Listeners για επεξεργασία και διαγραφή χρηστών
            allUsersTbody.addEventListener('click', e => {
                const targetLink = e.target.closest('a');
                if (!targetLink) return;
                const userId = targetLink.getAttribute('data-id');
                const username = targetLink.getAttribute('data-username');
                console.log(`User ID: ${userId}`); // Για debugging
                if (!userId) return; // Αν δεν υπάρχει ID, σταματάμε την εκτέλεση
                if (targetLink.classList.contains('edit-btn')) {

                    // Χρήση της apiFetch για να πάρουμε τα τρέχοντα δεδομένα του χρήστη
                    apiFetch(`${apiBaseUrl}/users/read_one_admin.php?id=${userId}`)
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
                    })
                    .catch(error => {
                        console.error('Error fetching user details for edit:', error);
                        messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα φόρτωσης στοιχείων χρήστη: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
                    });
                } else if (targetLink.classList.contains('delete-btn')) {
                    if(confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τον χρήστη [${username}]; Η ενέργεια είναι μη αναστρέψιμη.`)){
                        deleteUser(userId);
                    }
                }
            });


            // Event Listener για έγκριση ή απορριψη χρηστών σε αναμονή
            pendingUsersTbody.addEventListener('click', function(e){
                const targetLink = e.target.closest('a');
                const userId = targetLink.getAttribute('data-id');
                const username = targetLink.getAttribute('data-username');
                if (targetLink.classList.contains('approve-btn')) {
                    if(confirm(`Είστε σίγουροι ότι θέλετε να εγκρίνετε τον χρήστη [${username}];`)){
                        approveUser(userId);
                    }
                } else if (targetLink.classList.contains('decline-btn')) {
                    if(confirm(`Είστε σίγουροι ότι θέλετε να απορρίψετε τον χρήστη [${username}];`)){
                        declineUser(userId);
                    }
                }
            });


            // Συνάρτηση για έγκριση χρήστη
            function approveUser(userId) {
                apiFetch(`${apiBaseUrl}/users/approve.php`, {
                    method: 'POST',
                    body: JSON.stringify({ user_id: userId, role_id: 2 }) // Εγκρίνουμε πάντα ως registered_user (ID=2)
                })
                .then(data => { // Η apiFetch επιστρέφει το body της επιτυχούς απάντησης
                    messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Ο χρήστης εγκρίθηκε επιτυχώς.'}</div>`;
                    fetchAllUsers();
                    fetchPendingUsers();
                    setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                })
                .catch(error => {
                    console.error('Error approving user:', error);
                    messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα έγκρισης χρήστη: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
                    setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                });
            }

            // Συνάρτηση για την απορριψη χρήστη
            function declineUser(userId) {
                apiFetch(`${apiBaseUrl}/users/decline.php`, {
                    method: 'POST',
                    body: JSON.stringify({ user_id: userId}) // Εγκρίνουμε πάντα ως registered_user (ID=2)
                })
                .then(data => { // Η apiFetch επιστρέφει το body της επιτυχούς απάντησης
                    messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Ο χρήστης απορρίφθηκε επιτυχώς.'}</div>`;
                    fetchAllUsers();
                    fetchPendingUsers();
                    setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                })
                .catch(error => {
                    console.error('Error approving user:', error);
                    messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα απόρριψης του χρήστη: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
                    setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                });
            }
            
            function deleteUser(id) {
                apiFetch(`${apiBaseUrl}/users/delete.php`, {
                    method: 'POST',
                    body: JSON.stringify({ id: id })
                })
                .then(data => { // Η apiFetch επιστρέφει το body της επιτυχούς απάντησης (ή τίποτα για 204)
                    messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Ο χρήστης διαγράφηκε επιτυχώς.'}</div>`;
                    fetchAllUsers();
                    setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                    messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα διαγραφής χρήστη: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
                    setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                });
            }

            
            
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
                // Η apiFetch θα προσθέσει αυτόματα Content-Type και Authorization headers
                apiFetch(`${apiBaseUrl}/users/update.php`, {
                    method: 'POST',
                    body: JSON.stringify(formData)
                })
                .then(data => {
                    messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Τα στοιχεία χρήστη ενημερώθηκαν επιτυχώς.'}</div>`;
                    userModal.hide();
                    fetchAllUsers();
                    setTimeout(() => messageArea.innerHTML = '', 4000);
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                    messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα ενημέρωσης χρήστη: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
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
        const modalMessageArea = document.getElementById('modal-message-area'); // ΝΕΟ: Selector για το message area του modal

        // --- Συνάρτηση για τον έλεγχο της φόρμας ---
        function validateProgramForm() {
            let isValid = true;
            const requiredInputs = programForm.querySelectorAll('[required]');
            
            requiredInputs.forEach(input => {
                input.classList.remove('is-invalid');
                if (input.value.trim() === '') {
                    isValid = false;
                    input.classList.add('is-invalid');
                }
            });
            return isValid;
        }

        // Βοηθητική συνάρτηση για καθαρισμό των validation states της φόρμας προγράμματος
        function clearProgramFormValidation(form) {
            const elements = form.elements;
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA' || element.nodeName === 'SELECT') {
                    element.classList.remove('is-invalid');
                    // Βρίσκουμε το επόμενο sibling που είναι το invalid-feedback div
                    const feedbackDiv = element.nextElementSibling;
                    if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
                        feedbackDiv.textContent = '';
                    }
                }
            }
            if (modalMessageArea) { // Καθαρισμός και του γενικού χώρου μηνυμάτων του modal
                modalMessageArea.innerHTML = '';
            }
        }

        // Φόρτωση των προγραμμάτων
        function fetchAdminPrograms() {
            apiFetch(`${apiBaseUrl}/programs/read_admin.php`)
                .then(data => {
                    programsTbody.innerHTML = '';
                    // Καθαρισμός του κύριου message area της σελίδας κατά την επαναφόρτωση
                    // για να μην μένουν παλιά μηνύματα επιτυχίας/σφάλματος από προηγούμενες ενέργειες.
                    if (messageArea) {
                        messageArea.innerHTML = '';
                    }
                    
                    if (data && data.message && !Array.isArray(data)) {
                        programsTbody.innerHTML = `<tr><td colspan="5" class="text-center">${data.message}</td></tr>`;
                    } else if (Array.isArray(data) && data.length === 0) {
                        programsTbody.innerHTML = `<tr><td colspan="5" class="text-center">Δεν βρέθηκαν προγράμματα.</td></tr>`;
                    } else if (Array.isArray(data)) {
                        data.forEach(p => {
                            const programName = p.is_active ? `${p.name}` : `<span class="text-muted" style="opacity: 0.5">${p.name}</span>`;
                            const statusBadge = p.is_active ? 'Ενεργό' : '<span class="badge bg-secondary" style="opacity: 0.5">Ανενεργό</span>';
                            const programType = p.type === 'group' ? '<span class="badge bg-info">Ομαδικό</span>' : '<span class="badge bg-success">Ατομικό</span>';
                            const progranTypeFormatted = p.is_active ? programType : `<span class="text-muted" style="opacity: 0.5">${programType}</span>`;
                            const maxCapacityDisplay = p.is_active ? `${p.max_capacity} άτομα` : `<span class="text-muted" style="opacity: 0.5">${p.max_capacity} άτομα</span>`;
                            const row = `
                                <tr>
                                    <td>${programName}</td>
                                    <td>${progranTypeFormatted}</td>
                                    <td>${maxCapacityDisplay}</td>
                                    <td>${statusBadge}</td>
                                    <td>                   
                                        <a href="#" class="edit-btn me-2" data-id="${p.id}" data-bs-toggle="tooltip" data-bs-title="Επεξεργασία"><img src="icons/pen.png" alt="Επεξεργασία" width="25"></a>
                                        <a href="#" class="delete-btn me-2" data-id="${p.id}" data-bs-toggle="tooltip" data-bs-title="Διαγραφή"><img src="icons/bin.png" alt="Διαγραφή" width="25"></a>
                                        ${p.is_active ? `<a href="#" class="disable-btn me-2" data-id="${p.id}" data-bs-toggle="tooltip" data-bs-title="Απενεργοποίηση"><img src="icons/disable.png" alt="Απενεργοποίηση" width="25"></a>` : 
                                            `<span class="text-muted" style="opacity: 0.5"><img src="icons/disable.png" alt="Απενεργοποίηση" width="25"></span>`}

                                    </td>
                                </tr>`;
                            programsTbody.innerHTML += row;
                        });
                        // Ενεργοποίηση tooltip για τα εικονίδια μόνο εντός του programsTbody
                        const tooltipTriggerList = [...programsTbody.querySelectorAll('[data-bs-toggle="tooltip"]')];
                        tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
                    } else {
                        programsTbody.innerHTML = `<tr><td colspan="5" class="text-center text-warning">Μη αναμενόμενη απάντηση από τον server.</td></tr>`;
                        console.error("Unexpected data format for admin programs:", data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching admin programs:', error);
                    programsTbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Σφάλμα φόρτωσης προγραμμάτων: ${error.message || 'Προέκυψε σφάλμα'}</td></tr>`;
                });
        }
        
        // Άνοιγμα modal για νέο πρόγραμμα
        document.getElementById('add-program-btn').addEventListener('click', () => {
            programForm.reset();
            document.getElementById('program-id').value = '';
            clearProgramFormValidation(programForm); // Καθαρισμός validation
            document.getElementById('modal-title').textContent = 'Προσθήκη Νέου Προγράμματος';
            document.getElementById('status-wrapper').style.display = 'none'; // Κρύβουμε το status για νέα
            if (modalMessageArea) modalMessageArea.innerHTML = ''; // Καθαρισμός μηνυμάτων στο modal
            document.getElementById('program-max-capacity').value = 20; // Προεπιλεγμένη τιμή για νέα προγράμματα
            programModal.show();
        });

        // Event listener για επεξεργασία και διαγραφή
        programsTbody.addEventListener('click', e => {
            const targetLink = e.target.closest('a');
            if (!targetLink) return;
            const id = targetLink.getAttribute('data-id');

            if (targetLink.classList.contains('edit-btn')) {
                e.preventDefault();// ***********
                // Φόρτωση δεδομένων για επεξεργασία
                apiFetch(`${apiBaseUrl}/programs/read_one.php?id=${id}`)
                    .then(p => {
                        if (p && p.id) {
                            clearProgramFormValidation(programForm); // Καθαρισμός validation πριν το γέμισμα
                            document.getElementById('program-id').value = p.id;
                            document.getElementById('program-name').value = p.name;
                            document.getElementById('program-description').value = p.description;
                            document.getElementById('program-type').value = p.type;
                            document.getElementById('program-is-active').checked = p.is_active == 1; // == 1 για σωστή απόδοση του boolean
                            document.getElementById('program-max-capacity').value = p.max_capacity;
                            document.getElementById('status-wrapper').style.display = 'block';
                            document.getElementById('modal-title').textContent = 'Επεξεργασία Προγράμματος';
                            
                            console.log(`Editing program with ID: ${p.id}`); // Για debugging
                            console.log(`Program data: ${JSON.stringify(p)}`); // Για debugging
                            console.log(`Program is active: ${p.is_active}`); // Για debugging
                            console.log(`Program max capacity: ${p.max_capacity}`); // Για debugging
                            if (modalMessageArea) modalMessageArea.innerHTML = ''; // Καθαρισμός μηνυμάτων στο modal
                            programModal.show();
                        } else {
                            messageArea.innerHTML = `<div class="alert alert-warning">${(p && p.message) || 'Δεν βρέθηκε το πρόγραμμα ή τα δεδομένα είναι ελλιπή.'}</div>`;
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching program details for edit:', error);
                        messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα φόρτωσης λεπτομερειών: ${error.message || 'Άγνωστο σφάλμα.'}</div>`;
                        setTimeout(() => { messageArea.innerHTML = ''; }, 5000); // Αυτόματο κλείσιμο μετά από 5 δευτ.
                    });
            } else if (targetLink.classList.contains('disable-btn')) {
                // Επιβεβαίωση απενεργοποίησης
                if (confirm('Είστε σίγουροι ότι θέλετε να απενεργοποιήσετε αυτό το πρόγραμμα;')) {
                    apiFetch(`${apiBaseUrl}/programs/disable.php`, {
                        method: 'POST',
                        body: JSON.stringify({ id: id })
                    })
                    .then(data => {
                         messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Το πρόγραμμα απενεργοποιήθηκε επιτυχώς.'}</div>`;
                         fetchAdminPrograms(); // Ανανέωση της λίστας
                         setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                    })
                    .catch(error => {
                        console.error('Error disabling program:', error);
                        messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα απενεργοποίησης: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
                        setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                    });
                }
            } else if (targetLink.classList.contains('delete-btn')) {
                // Επιβεβαίωση διαγραφής
                if (confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το πρόγραμμα; ΠΡΟΣΟΧΗ: Με την ενέργεια αυτή θα διαγραφούν οριστικά και όλα τα προγραμματισμένα events καθώς και οι κρατήσεις που σχετίζονται με αυτό. Η ενέργεια είναι μη αναστρέψιμη.')) {
                    apiFetch(`${apiBaseUrl}/programs/delete.php`, {
                        method: 'POST',
                        body: JSON.stringify({ id: id })
                    })
                    .then(data => {
                        messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Το πρόγραμμα διαγράφηκε επιτυχώς.'}</div>`;
                        fetchAdminPrograms(); // Ανανέωση της λίστας
                        setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                    })
                    .catch(error => {
                        console.error('Error deleting program:', error);
                        messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα διαγραφής: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
                        setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                    });
                }
            }
        });

        // Υποβολή φόρμας
        programForm.addEventListener('submit', e => {
            e.preventDefault();
            
            // Ελέγχουμε αν η φόρμα είναι έγκυρη
            if (!validateProgramForm()) {
                if (modalMessageArea) {
                    modalMessageArea.innerHTML = `<div class="alert alert-danger">Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.</div>`;
                }
                return;
            }
            // Εάν η φόρμα είναι έγκυρη, προχωράμε με την αποστολή
            if (modalMessageArea) {
                modalMessageArea.innerHTML = ''; // Καθαρισμός μηνυμάτων στο modal πριν την αποστολή
            }
            clearProgramFormValidation(programForm); // Καθαρισμός τυχόν προηγούμενων validation

            const id = document.getElementById('program-id').value;
            const url = id ? `${apiBaseUrl}/programs/update.php` : `${apiBaseUrl}/programs/create.php`;
            // Συλλογή δεδομένων από τη φόρμα
            // Χρησιμοποιούμε το id μόνο αν υπάρχει, για να διακρίνουμε μεταξύ δημιουργίας και ενημέρωσης
            const formData = {
                id: id || undefined, // Στέλνουμε id μόνο αν υπάρχει (για update)
                name: document.getElementById('program-name').value,
                description: document.getElementById('program-description').value,
                type: document.getElementById('program-type').value,
                is_active: id ? document.getElementById('program-is-active').checked : true, // Για νέα προγράμματα, default σε active
                max_capacity: parseInt(document.getElementById('program-max-capacity').value, 10)
                
            };
            // Client-side validation για το max_capacity
            const maxCapacityInput = document.getElementById('program-max-capacity');
            if (isNaN(formData.max_capacity) || formData.max_capacity <= 0) { // <= 0 για να πιάνει και το 0
                maxCapacityInput.classList.add('is-invalid');
                const feedbackDiv = maxCapacityInput.nextElementSibling;
                if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
                    feedbackDiv.textContent = 'Η μέγιστη χωρητικότητα πρέπει να είναι αριθμός μεγαλύτερος του 0.';
                }
                if (modalMessageArea) {
                    modalMessageArea.innerHTML = `<div class="alert alert-danger">Παρακαλώ διορθώστε τα σφάλματα στη φόρμα.</div>`;
                }
                return;
            } else {
                // Προληπτικός καθαρισμός αν πέρασε το client-side validation (σε περίπτωση που είχε μείνει από προηγούμενο submit)
                maxCapacityInput.classList.remove('is-invalid');
                const feedbackDiv = maxCapacityInput.nextElementSibling;
                if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
                    feedbackDiv.textContent = '';
                }
            }

            apiFetch(url, {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            .then(data => { // ΕΠΙΤΥΧΙΑ
                messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Τα στοιχεία αποθηκεύτηκαν επιτυχώς.'}</div>`;
                programModal.hide();
                fetchAdminPrograms(); // Αυτό θα καθαρίσει το messageArea μέσω της fetchAdminPrograms
                // Δεν χρειάζεται setTimeout εδώ αν η fetchAdminPrograms καθαρίζει το messageArea
            })
            .catch(error => {
                console.error('Error saving program:', error);
                // Το clearProgramFormValidation() έχει ήδη καθαρίσει τα πάντα στην αρχή του submit handler.

                // Εμφάνιση σφαλμάτων validation αν υπάρχουν
                if (error && error.errors) {
                    // Εμφάνιση ενός γενικού μηνύματος στο modalMessageArea
                    if (modalMessageArea) {
                        modalMessageArea.innerHTML = `<div class="alert alert-danger">Παρακαλώ διορθώστε τα σφάλματα στα παρακάτω πεδία.</div>`;
                    }

                    for (const fieldKey in error.errors) {
                        const inputElement = document.getElementById(`program-${fieldKey.replace('_', '-')}`);
                        if (inputElement) {
                            inputElement.classList.add('is-invalid');
                            const feedbackDiv = inputElement.nextElementSibling;
                            if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
                                feedbackDiv.textContent = error.errors[fieldKey];
                            }
                        }
                    }
                } else if (error && error.message) { // Αν δεν υπάρχουν error.errors, αλλά υπάρχει error.message
                    // Εμφάνιση γενικού σφάλματος μέσα στο modal
                    if (modalMessageArea) {
                        modalMessageArea.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
                    } else { // Fallback στο κύριο message area αν το modalMessageArea δεν υπάρχει
                        messageArea.innerHTML = `<div class="alert alert-danger">${error.message || 'Προέκυψε κάποιο σφάλμα.'}</div>`;
                        setTimeout(() => { messageArea.innerHTML = ''; }, 5000);
                    }
                }
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
        const messageAreaSchedule = document.getElementById('message-area-schedule'); // Προσθήκη message area για αυτή την ενότητα

        // --- State Variable ---
        // Μεταβλητή που θα κρατάει τα δεδομένα της εβδομάδας για να μην κάνουμε συνέχεια API calls
        let currentScheduleData = [];

        // Αντιστοίχιση IDs πεδίων με τα προεπιλεγμένα μηνύματα σφάλματος από το HTML
        const defaultEventFormErrorMessages = {
            'event-program': 'Επιλέξτε πρόγραμμα.',
            'event-trainer': 'Επιλέξτε γυμναστή.',
            'event-date': 'Επιλέξτε μια έγκυρη ημερομηνία.',
            'event-start-time': 'Επιλέξτε μια έγκυρη ώρα έναρξης (μόνο ακέραιες ώρες, π.χ. 10:00).',
            'event-end-time': 'Επιλέξτε μια έγκυρη ώρα λήξης (μόνο ακέραιες ώρες, π.χ. 11:00).',
            'event-capacity': 'Παρακαλώ εισάγετε μια έγκυρη μέγιστη χωρητικότητα (π.χ. 1 ή μεγαλύτερο).'
        };

        // --- Functions ---

        function populateFormDropdowns() {
            const programSelect = document.getElementById('event-program');
            const trainerSelect = document.getElementById('event-trainer');

            // Φόρτωση προγραμμάτων (μόνο τα ενεργά)
            apiFetch(`${apiBaseUrl}/programs/read_admin.php`) // Δεν χρειάζεται token header, η apiFetch το χειρίζεται
                .then(data => {
                    programSelect.innerHTML = '<option value="">Επιλέξτε Πρόγραμμα...</option>';
                    if (Array.isArray(data)) {
                        data.filter(p => p.is_active && p.type === 'group').forEach(p => { // Φιλτράρισμα για ενεργά ΚΑΙ ομαδικά προγράμματα
                            programSelect.innerHTML += `<option value="${p.id}" data-type="${p.type}">${p.name} (Ομαδικό)</option>`;
                        });
                    } else if (data && data.message) {
                        programSelect.innerHTML = `<option value="">${data.message}</option>`;
                    }
                })
                .catch(error => {
                    console.error('Error fetching programs for dropdown:', error);
                    programSelect.innerHTML = '<option value="">Σφάλμα φόρτωσης προγραμμάτων</option>';
                });

            // Φόρτωση γυμναστών
            apiFetch(`${apiBaseUrl}/trainers/read.php`) // Δημόσιο endpoint, η apiFetch δεν θα στείλει token αν δεν υπάρχει
                .then(data => {
                    trainerSelect.innerHTML = '<option value="">Επιλέξτε Γυμναστή (Προαιρετικό)</option>';
                    if (Array.isArray(data)) {
                        data.forEach(t => {
                            trainerSelect.innerHTML += `<option value="${t.id}">${t.first_name} ${t.last_name}</option>`;
                        });
                    } else if (data && data.message) {
                        trainerSelect.innerHTML = `<option value="">${data.message}</option>`;
                    }
                })
                .catch(error => {
                    console.error('Error fetching trainers for dropdown:', error);
                    trainerSelect.innerHTML = '<option value="">Σφάλμα φόρτωσης γυμναστών</option>';
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
            scheduleContainer.innerHTML = `<p class="text-center">Φόρτωση χρονοπρογραμματισμού...</p>`;
            apiFetch(`${apiBaseUrl}/events/read_admin.php?start=${start}&end=${end}`) // Δεν χρειάζεται token header
                .then(data => {
                    if (data && data.message && !Array.isArray(data)) {
                        currentScheduleData = []; // Αν υπάρχει μήνυμα, δεν υπάρχουν events
                        scheduleContainer.innerHTML = `<p class="text-center text-muted">${data.message}</p>`;
                    } else if (Array.isArray(data)) {
                        currentScheduleData = data;
                        renderSchedule(); // Καλούμε τη render για να τα εμφανίσει
                    } else {
                        currentScheduleData = [];
                        scheduleContainer.innerHTML = `<p class="text-center text-warning">Μη αναμενόμενη απάντηση από τον server.</p>`;
                        console.error("Unexpected data format for schedule:", data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching schedule:', error);
                    currentScheduleData = [];
                    scheduleContainer.innerHTML = `<p class="text-center text-danger">Σφάλμα φόρτωσης χρονοπρογραμματισμού: ${error.message || 'Προέκυψε σφάλμα'}</p>`;
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
            
            // Λήψη της ημερομηνίας έναρξης (Δευτέρα) της επιλεγμένης εβδομάδας
            const weekDates = getWeekDates(weekPicker.value);
            const mondayDate = new Date(weekDates.start + 'T00:00:00'); // Προσθέτουμε T00:00:00 για να διασφαλίσουμε ότι είναι η αρχή της ημέρας τοπικά

            eventsToRender.forEach(event => {
                const dayIndex = (new Date(event.start_time).getDay() + 6) % 7;
                eventsByDay[dayIndex].push(event);
            });

            for (let i = 0; i < 7; i++) {
                let dayHtml = `<div class="day-column mb-3"><h4>${days[i]}</h4>`;

                // Υπολογισμός και μορφοποίηση της τρέχουσας ημερομηνίας
                const currentDate = new Date(mondayDate);
                currentDate.setDate(mondayDate.getDate() + i);
                const formattedDate = currentDate.toLocaleDateString('el-GR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                dayHtml = `<div class="day-column mb-3"><h4><small class="text-muted">${formattedDate} - ${days[i]}</small></h4>`;

                if (eventsByDay[i].length === 0) {
                    dayHtml += `<p class="text-muted small">Κανένα event.</p>`;
                } else {
                    eventsByDay[i].sort((a,b) => new Date(a.start_time) - new Date(b.start_time));
                    eventsByDay[i].forEach(event => {
                        const programTypeDisplay = event.program_type === 'group' ? 'Ομαδικό' : 'Ατομικό';
                        const title = `${event.program_name} (${programTypeDisplay})`;
                        const capacityText = event.max_capacity === null || event.max_capacity === 0 ? 'Απεριόριστες' : event.max_capacity; // Ενημέρωση για null ή 0
                        const cardColorClass = event.program_type === 'group' ? 'bg-primary-subtle' : 'bg-success-subtle';
                        
                        // **Δημιουργία λίστας συμμετεχόντων**
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
            // Αυτόματη επιλογή της τρέχουσας Δευτέρας της επιλεγμένης εβδομάδας στο date picker του modal
            const weekDates = getWeekDates(weekPicker.value);
            document.getElementById('event-date').value = weekDates.start;
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

            // Καθαρισμός προηγούμενων καταστάσεων επικύρωσης και μηνυμάτων
            eventForm.classList.remove('was-validated');
            const messageAreaModal = eventForm.querySelector('.modal-message-area');
            if (messageAreaModal) messageAreaModal.innerHTML = '';

            Array.from(eventForm.elements).forEach(el => {
                if (el.willValidate && el.id) { // Ελέγχουμε αν το στοιχείο μπορεί να επικυρωθεί και έχει ID
                    el.classList.remove('is-invalid');
                    const feedbackDiv = el.nextElementSibling;
                    if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
                        if (defaultEventFormErrorMessages[el.id]) {
                            feedbackDiv.textContent = defaultEventFormErrorMessages[el.id];
                        }
                    }
                }
            });

            // Έλεγχος εγκυρότητας της φόρμας από τον browser (HTML5 validation)
            if (!eventForm.checkValidity()) {
                e.stopPropagation(); // Σταμάτημα της περαιτέρω διάδοσης του event
                eventForm.classList.add('was-validated'); // Ενεργοποίηση των μηνυμάτων του Bootstrap
                // Προαιρετικά: Εστίαση στο πρώτο άκυρο πεδίο
                const firstInvalidField = Array.from(eventForm.elements).find(el => !el.validity.valid && el.willValidate);
                if (firstInvalidField) firstInvalidField.focus();
                return; // Διακοπή της υποβολής αν η φόρμα δεν είναι έγκυρη
            }

            // Αν η φόρμα είναι έγκυρη, συνεχίζουμε
            const programSelect = document.getElementById('event-program');
            const selectedOption = programSelect.options[programSelect.selectedIndex];
            const programType = selectedOption.getAttribute('data-type');

            const formData = {
                program_id: document.getElementById('event-program').value,
                trainer_id: document.getElementById('event-trainer').value,
                date: document.getElementById('event-date').value,
                start_time: `${document.getElementById('event-date').value} ${document.getElementById('event-start-time').value}`,
                end_time: `${document.getElementById('event-date').value} ${document.getElementById('event-end-time').value}`,
                max_capacity: document.getElementById('event-capacity').value,
            };

            console.log('Program ID:', document.getElementById('event-program').value);
            console.log('Date:', document.getElementById('event-date').value);
            console.log('Start Time:', document.getElementById('event-start-time').value);
            console.log('End Time:', document.getElementById('event-end-time').value);
            console.log('Trainer ID:', document.getElementById('event-trainer').value);
            console.log('Capacity:', document.getElementById('event-capacity').value);

            apiFetch(`${apiBaseUrl}/events/create.php`, {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            .then(data => {
                if (messageAreaSchedule) {
                    messageAreaSchedule.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Το event δημιουργήθηκε επιτυχώς.'}</div>`;
                    setTimeout(() => { messageAreaSchedule.innerHTML = ''; }, 4000);
                } else {
                    alert((data && data.message) || 'Το event δημιουργήθηκε επιτυχώς.');
                }
                eventModal.hide();
                const weekDates = getWeekDates(weekPicker.value);
                fetchSchedule(weekDates.start, weekDates.end);
            })
            .catch(error => {
                console.error('Error creating event:', error);
                // Χειρισμός σφαλμάτων από τον server (συμπεριλαμβανομένων των validation errors)
                if (error && error.errors) { // Δομημένα σφάλματα επικύρωσης
                    if (messageAreaModal) {
                        messageAreaModal.innerHTML = `<div class="alert alert-danger">${error.message || 'Παρακαλώ διορθώστε τα σφάλματα.'}</div>`;
                    } else if (messageAreaSchedule) { // Fallback στο κύριο message area της σελίδας
                         messageAreaSchedule.innerHTML = `<div class="alert alert-danger">${error.message || 'Παρακαλώ διορθώστε τα σφάλματα.'}</div>`;
                         setTimeout(() => { messageAreaSchedule.innerHTML = ''; }, 5000);
                    }

                    for (const fieldKey in error.errors) {
                        let elementId = '';
                        // Αντιστοίχιση κλειδιών σφάλματος από τον server με IDs των πεδίων της φόρμας
                        if (fieldKey === 'program_id') elementId = 'event-program';
                        else if (fieldKey === 'trainer_id') elementId = 'event-trainer';
                        else if (fieldKey === 'start_time') elementId = 'event-start-time'; // Το API μπορεί να στείλει start_time για το πεδίο event-date + event-start-time
                        else if (fieldKey === 'end_time') elementId = 'event-end-time';
                        else if (fieldKey === 'max_capacity') elementId = 'event-capacity';
                        else if (fieldKey === 'date' && document.getElementById('event-date')) elementId = 'event-date'; // Αν το API στείλει ξεχωριστό σφάλμα για την ημερομηνία
                        else elementId = `event-${fieldKey.replace('_', '-')}`; // Γενική προσπάθεια αντιστοίχισης

                        const inputElement = document.getElementById(elementId);
                        if (inputElement) {
                            inputElement.classList.add('is-invalid');
                            const feedbackDiv = inputElement.nextElementSibling;
                            if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
                                feedbackDiv.textContent = error.errors[fieldKey]; // Εμφάνιση του μηνύματος από τον server
                            }
                        }
                    }
                } else { // Γενικό σφάλμα
                    const errorMessage = error.message || 'Προέκυψε σφάλμα.';
                    if (messageAreaModal) {
                        messageAreaModal.innerHTML = `<div class="alert alert-danger">Σφάλμα δημιουργίας event: ${errorMessage}</div>`;
                    } else if (messageAreaSchedule) {
                        messageAreaSchedule.innerHTML = `<div class="alert alert-danger">Σφάλμα δημιουργίας event: ${errorMessage}</div>`;
                        setTimeout(() => { messageAreaSchedule.innerHTML = ''; }, 5000);
                    } else {
                        alert(`Σφάλμα κατά τη δημιουργία του event: ${errorMessage}`);
                    }
                }
            });
        });
        
        scheduleContainer.addEventListener('click', e => {
            if(e.target.classList.contains('delete-event-btn')) {
                const eventId = e.target.getAttribute('data-id');
                if(confirm('Είστε σίγουροι; Αυτή η ενέργεια θα διαγράψει και τις υπάρχουσες κρατήσεις για το event.')) {
                    apiFetch(`${apiBaseUrl}/events/delete.php`, {
                        method: 'POST',
                        body: JSON.stringify({id: eventId})
                    })
                    .then(data => {
                        if (messageAreaSchedule) {
                            messageAreaSchedule.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Το event διαγράφηκε επιτυχώς.'}</div>`;
                            setTimeout(() => { messageAreaSchedule.innerHTML = ''; }, 4000);
                        } else { // Fallback, αν δεν υπάρχει συγκεκριμένο message area
                           alert((data && data.message) || 'Το event διαγράφηκε επιτυχώς.'); // Εμφάνιση απλού alert
                        }
                        // Προσθήκη: Ελέγχουμε αν πρέπει να κάνουμε refresh τον πίνακα
                        if (data && data.refresh) {
                           const weekDates = getWeekDates(weekPicker.value);
                           fetchSchedule(weekDates.start, weekDates.end);
                        } else {
                           renderSchedule(); // Απλά επανασχεδιάζουμε αν δεν θέλουμε πλήρη ανανέωση
                        }
                           const weekDates = getWeekDates(weekPicker.value);
                           fetchSchedule(weekDates.start, weekDates.end);
                    })
                    .catch(error => {
                        console.error('Error deleting event:', error);
                        let errorMessage = 'Προέκυψε σφάλμα κατά τη διαγραφή.';

                        // Ελέγχουμε αν το σφάλμα είναι SyntaxError από JSON parsing
                        if (error instanceof SyntaxError) {
                            errorMessage = 'Σφάλμα επικοινωνίας με τον server. Η απάντηση δεν ήταν έγκυρη.';
                            console.error('Raw error:', error); // Καταγραφή του αρχικού SyntaxError
                        } else if (error && error.message) {
                            // Χρησιμοποιούμε το μήνυμα από το structured error object που επιστρέφει η apiFetch
                            errorMessage = `Σφάλμα διαγραφής event: ${error.message}`;
                        }

                        if (messageAreaSchedule) {
                            messageAreaSchedule.innerHTML = `<div class="alert alert-danger">${errorMessage}</div>`;
                            setTimeout(() => { messageAreaSchedule.innerHTML = ''; }, 4000);
                        }
                    });
                }
            }
        });

        // --- Αρχική Φόρτωση ---
        
        populateFormDropdowns();

        const today = new Date();

        // Βοηθητική συνάρτηση για τον υπολογισμό του έτους και του αριθμού εβδομάδας ISO 8601
        function getISOWeekData(date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            // Ημέρα της εβδομάδας κατά ISO-8601 (1-Δευτέρα..7-Κυριακή)
            // Η getUTCDay() επιστρέφει 0 για Κυριακή, οπότε το (d.getUTCDay() || 7) κάνει την Κυριακή 7
            const dayNum = d.getUTCDay() || 7;
            // Μετακίνηση στην Πέμπτη της τρέχουσας εβδομάδας
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            // Έτος αυτής της Πέμπτης (αυτό είναι το έτος της εβδομάδας ISO)
            const year = d.getUTCFullYear();
            // 1η Ιανουαρίου του έτους της Πέμπτης
            const yearStart = new Date(Date.UTC(year, 0, 1));
            // Υπολογισμός του αριθμού εβδομάδας
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            return { year: year, week: weekNo };
        }
        
        const { year: isoYear, week: isoWeek } = getISOWeekData(today);
        
        const currentWeekString = `${isoYear}-W${String(isoWeek).padStart(2, '0')}`;
        weekPicker.value = currentWeekString;

        const weekDates = getWeekDates(weekPicker.value);
        fetchSchedule(weekDates.start, weekDates.end);
    }



    // =================================================================
    // 10. ΛΟΓΙΚΗ ΣΕΛΙΔΑΣ ΔΙΑΧΕΙΡΙΣΗΣ ΑΝΑΚΟΙΝΩΣΕΩΝ (ADMIN) - (ΑΝΑΒΑΘΜΙΣΜΕΝΟ ΜΕ apiFetch)
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
            // Χρήση της apiFetch. Δεν χρειάζεται πλέον να περνάμε το header του token.
            // Το endpoint /read.php είναι δημόσιο, αλλά εδώ το καλούμε για να πάρουμε τη λίστα για διαχείριση.
            // Η apiFetch θα στείλει το token αν υπάρχει, το οποίο μπορεί να χρησιμοποιηθεί από το API για να επιστρέψει π.χ. και μη δημοσιευμένες.
            apiFetch(`${apiBaseUrl}/announcements/read.php`) 
                .then(data => {
                    announcementsTbody.innerHTML = '';
                    if (data && data.message && !Array.isArray(data)) {
                        announcementsTbody.innerHTML = `<tr><td colspan="4" class="text-center">${data.message}</td></tr>`;
                    } else if (Array.isArray(data) && data.length === 0) {
                        announcementsTbody.innerHTML = `<tr><td colspan="4" class="text-center">Δεν βρέθηκαν ανακοινώσεις.</td></tr>`;
                    } else if (Array.isArray(data)) {
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
                        const tooltipTriggerList = [...announcementsTbody.querySelectorAll('[data-bs-toggle="tooltip"]')];
                        tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
                    } else {
                        announcementsTbody.innerHTML = `<tr><td colspan="4" class="text-center text-warning">Μη αναμενόμενη απάντηση.</td></tr>`;
                        console.error("Unexpected data format for announcements:", data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching announcements:', error);
                    announcementsTbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Σφάλμα φόρτωσης: ${error.message || 'Προέκυψε σφάλμα'}</td></tr>`;
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
                // **ΑΛΛΑΓΗ 2: Χρήση της apiFetch για την ανάκτηση μιας εγγραφής.**
                apiFetch(`${apiBaseUrl}/announcements/read_one.php?id=${id}`) // Δεν χρειάζεται token header
                .then(data => {
                    if(data.id) {
                        document.getElementById('announcement-id').value = data.id;
                        document.getElementById('announcement-title').value = data.title;
                        document.getElementById('announcement-content').value = data.content;
                        document.getElementById('modal-title').textContent = 'Επεξεργασία Ανακοίνωσης';
                        announcementModal.show();
                    } else {
                        messageArea.innerHTML = `<div class="alert alert-warning">${(data && data.message) || 'Δεν βρέθηκε η ανακοίνωση.'}</div>`;
                    }
                })
                .catch(error => {
                    console.error('Error fetching announcement for edit:', error);
                    messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα φόρτωσης: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
                });
            } else if (targetLink.classList.contains('delete-btn')) {
                if(confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε οριστικά αυτή την ανακοίνωση;')){
                    // **ΑΛΛΑΓΗ 3: Χρήση της apiFetch για τη διαγραφή.**
                    apiFetch(`${apiBaseUrl}/announcements/delete.php`, {
                        method: 'POST',
                        // headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, // Δεν χρειάζεται
                        body: JSON.stringify({ id: id })
                    })
                    .then(data => {
                        messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Η ανακοίνωση διαγράφηκε επιτυχώς.'}</div>`;
                        fetchAnnouncements(); // Ανανέωση της λίστας
                        setTimeout(() => { messageArea.innerHTML = ''; }, 4000);
                    })
                    .catch(error => {
                        console.error('Error deleting announcement:', error);
                        messageArea.innerHTML = `<div class="alert alert-danger">Σφάλμα διαγραφής: ${error.message || 'Προέκυψε σφάλμα.'}</div>`;
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
            
            // Χρήση της apiFetch για δημιουργία/ενημέρωση.
            apiFetch(url, {
                method: 'POST',
                // headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, // Δεν χρειάζεται
                body: JSON.stringify(formData)
            })
            .then(data => {
                messageArea.innerHTML = `<div class="alert alert-success">${(data && data.message) || 'Η ανακοίνωση αποθηκεύτηκε επιτυχώς.'}</div>`;
                announcementModal.hide();
                fetchAnnouncements();
                setTimeout(() => { messageArea.innerHTML = '', 4000; });
            })
            .catch(error => {
                console.error('Error saving announcement:', error);

                // Καθαρισμός προηγούμενων is-invalid από όλα τα πεδία της φόρμας
                const formElements = e.target.elements; // e.target είναι η φόρμα announcementForm
                for (let i = 0; i < formElements.length; i++) {
                    if (formElements[i].classList) {
                        formElements[i].classList.remove('is-invalid');
                    }
                }
                if (error && error.errors) {
                    let errorMessage = error.message || 'Παρακαλώ διορθώστε τα παρακάτω σφάλματα:';
                    let errorsList = '<ul>';
                    for (const field in error.errors) {
                        errorsList += `<li>${error.errors[field]}</li>`;
                         const inputElement = document.getElementById(`announcement-${field}`);
                        if (inputElement) {
                            inputElement.classList.add('is-invalid');
                        }
                    }
                    errorsList += '</ul>';
                    messageArea.innerHTML = `<div class="alert alert-danger">${errorMessage}${errorsList}</div>`;
                } else {
                    messageArea.innerHTML = `<div class="alert alert-danger">${error.message || 'Προέκυψε κάποιο σφάλμα.'}</div>`;
                }
            });
        });
        
        // Αρχική φόρτωση
        fetchAnnouncements();
    }



    // ====================================================================================
    // 11. ΛΟΓΙΚΗ ΦΟΡΤΩΣΗΣ ΑΝΑΚΟΙΝΩΣΕΩΝ ΣΤΗΝ ΑΡΧΙΚΗ ΣΕΛΙΔΑ (ΜΟΝΟ ΣΕ ΕΓΓΕΓΡΑΜΜΕΝΟΥΣ ΧΡΗΣΤΕΣ)
    // ====================================================================================
    
    // Εκτέλεση μόνο αν βρισκόμαστε στην αρχική σελίδα (όπου υπάρχει το container)
    // και αν ο χρήστης είναι συνδεδεμένος (έχει token)
    const announcementsContainer = document.getElementById('announcements-container');
    const token = localStorage.getItem('jwt');
    if (announcementsContainer && token) {
        // Προσθήκη μηνύματος φόρτωσης (λευκό χρώμα)
        announcementsContainer.innerHTML = '<p class="text-center text-white">Φόρτωση ανακοινώσεων...</p>';

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
                    // Προσθήκη τίτλου μόνο αν υπάρχουν ανακοινώσεις
                    announcementsContainer.innerHTML += '<h3 class="text-center mb-4 text-white">Τελευταία Νέα & Ανακοινώσεις</h3>'; 
                    data.forEach(announcement => {
                        // **ΑΛΛΑΓΗ ΕΔΩ: Προσθέσαμε την κλάση 'bg-warning-subtle'** (Αυτή η γραμμή υπήρχε ήδη)
                        const item = `
                            <div class="list-group-item list-group-item-action flex-column align-items-start mb-2">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1"><em>${announcement.title}</em></h5>
                                    <small>${new Date(announcement.created_at).toLocaleDateString('el-GR')}</small>
                                </div>
                                <p class="mb-1">${announcement.content}</p>
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

                // Καθαρισμός προηγούμενων is-invalid από όλα τα πεδία της φόρμας
                const formElements = e.target.elements; // e.target είναι η φόρμα trainerForm
                for (let i = 0; i < formElements.length; i++) {
                    if (formElements[i].classList) {
                        formElements[i].classList.remove('is-invalid');
                    }
                }
                if (error && error.errors) {
                    let errorMessage = error.message || 'Παρακαλώ διορθώστε τα παρακάτω σφάλματα:';
                    let errorsList = '<ul>';
                    for (const field in error.errors) {
                        errorsList += `<li>${error.errors[field]}</li>`;
                        const inputElement = document.getElementById(`trainer-${field.replace('_', '-')}`);
                        if (inputElement) {
                            inputElement.classList.add('is-invalid');
                        }
                    }
                    errorsList += '</ul>';
                    messageArea.innerHTML = `<div class="alert alert-danger">${errorMessage}${errorsList}</div>`;
                } else {
                    messageArea.innerHTML = `<div class="alert alert-danger">${error.message || 'Προέκυψε κάποιο σφάλμα.'}</div>`;
                }
            });
        });
        fetchTrainers();
    }

});