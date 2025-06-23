# gym-management-system

## Olympus Gym - Management Application

### 1. Overview and Purpose

Olympus Gym is a web-based application designed to streamline the management of a fitness center. Its primary purpose is to provide a user-friendly platform for both gym members and administrators.

**For Members:**
*   View available fitness programs (group and individual).
*   Register for an account.
*   Book sessions for various programs based on real-time availability.
*   View and manage their existing bookings (e.g., cancel bookings within a specified timeframe).
*   Stay updated with gym announcements.

**For Administrators:**
*   Manage user accounts (approve pending registrations, edit user details, manage roles and statuses, delete users).
*   Manage fitness programs (create, update, view, and disable programs).
*   Manage the gym's schedule by creating and deleting events (specific time slots for programs), assigning trainers, and setting capacities.
*   View event participants.
*   Manage gym trainers (add, edit, delete).
*   Create and manage gym announcements.

The application aims to enhance operational efficiency for the gym and provide a convenient experience for its members.

### 2. Technologies and Architecture

The application follows a multi-tier architecture:

*   **Frontend (Client-Side):**
    *   **HTML5:** Structures the web pages.
    *   **CSS3 & Bootstrap 5:** Styles the application for a responsive and modern user interface. Custom CSS is likely used for specific styling needs, including the JWT session timer.
    *   **JavaScript (Vanilla JS):** Handles all client-side logic, dynamic content updates, user interactions, form validations, and communication with the backend API.
        *   **DOM Manipulation:** Dynamically renders content fetched from the API (e.g., program lists, schedules, user tables, announcements).
        *   **Event Handling:** Manages user interactions like button clicks, form submissions, and selection changes.
        *   **API Communication:** Uses a centralized `apiFetch` wrapper function (an enhancement over the native `fetch` API) to make asynchronous requests (GET, POST) to the backend. This wrapper handles JWT token injection, content type headers, and centralized error handling (including 401 unauthorized redirects).
        *   **Local Storage:** Stores the JWT token for session management.

*   **Backend (Server-Side):**
    *   **PHP:** (Inferred from file extensions like `login.php`, `index.php`, etc., and the `/api/endpoints` base URL structure) Serves as the backend language, handling business logic and API endpoint creation.
    *   **RESTful API:** The backend exposes RESTful API endpoints (e.g., `/users/login.php`, `/programs/read.php`, `/events/create.php`) that the frontend consumes. These endpoints handle CRUD (Create, Read, Update, Delete) operations.

*   **Database:**
    *   **MySQL/MariaDB (Assumed):** While not explicitly stated in `script.js`, PHP applications commonly use MySQL or MariaDB for data persistence. The database stores information about users, roles, programs, trainers, events (schedule), bookings, and announcements.

**Communication Flow:**
1.  The user interacts with the frontend (e.g., clicks a button to view programs).
2.  JavaScript on the client-side initiates an API call (via `apiFetch`) to the relevant PHP backend endpoint.
3.  The PHP backend processes the request, interacts with the database (executes SQL queries) to fetch or modify data.
4.  The backend sends a JSON response back to the frontend.
5.  JavaScript parses the JSON response and dynamically updates the HTML DOM to display the information to the user or provide feedback (e.g., success/error messages).

### 3. Database and Data Management

*   **Database System:** Likely MySQL or a similar relational database.
*   **Data Storage:** The database stores entities such as:
    *   `Users`: Usernames, hashed passwords, email, first/last names, roles (admin, registered_user), status (active, pending_approval, etc.), registration details (country, city, address).
    *   `Programs`: Name, description, type (group, individual), active status.
    *   `Trainers`: First name, last name, biography.
    *   `Events` (Schedule): Links programs to specific dates, start/end times, assigned trainers, and maximum capacity. Includes booking counts.
    *   `Bookings`: Links users to specific events, status of the booking.
    *   `Announcements`: Title, content, author, creation date.
*   **Data Integrity & Continuity:**
    *   **Database Schema Scripts:** (Assumed to exist) SQL scripts would be used for the initial creation of the database schema (tables, columns, relationships, constraints).
    *   **Dummy Data Scripts:** (Assumed to exist) SQL scripts for populating the database with initial/dummy data would be crucial for development, testing, and potentially for initial setup.
    *   **SQL Query Testing:** (Assumed) Backend API endpoints would contain and execute SQL queries. These queries would ideally be tested to ensure correctness and efficiency.

### 4. Frontend - User Interface and Data Presentation

*   **Dynamic Content:** Information from the database is fetched via API calls and then dynamically rendered on the frontend using JavaScript. For example:
    *   Program cards are generated based on program data.
    *   The schedule is built by iterating through event data and organizing it by day.
    *   User lists, announcement lists, and trainer lists are populated dynamically.
*   **User-Friendly Presentation:**
    *   Bootstrap 5 is used for a responsive layout and pre-styled components (modals, buttons, alerts, badges, forms).
    *   Dates and times are formatted for readability (e.g., `toLocaleDateString('el-GR')`, `toLocaleTimeString`).
    *   Visual cues like badges are used to indicate status (e.g., user status, program type).
    *   Tooltips provide additional information on hover for action icons.
    *   Loading messages and error messages are displayed to the user in designated areas (`message-area`, `message-area-schedule`).

### 5. Data Validation

Data validation is implemented at multiple levels:

*   **Client-Side (JavaScript & HTML5):**
    *   **HTML5 Form Validation:** Attributes like `required`, `type="email"`, `type="number"`, `minlength` are used for basic browser-level validation.
    *   **Custom JavaScript Validation:** The registration form (`validateRegisterForm`) implements custom JavaScript logic to check input validity (e.g., email format, required fields, min length) and provides visual feedback by adding/removing `is-invalid`/`is-valid` classes.
    *   The admin forms also clear `is-invalid` classes before re-validating upon server error, ensuring up-to-date visual feedback.
*   **Server-Side (PHP - Assumed):**
    *   The backend API is expected to perform comprehensive validation on all incoming data before processing it or interacting with the database. This is crucial for security and data integrity.
    *   The frontend is designed to handle validation error messages returned by the server (e.g., `error.errors` object) and display them to the user, often highlighting the specific fields that failed validation.

### 6. Application Logic and Functional Requirements

All core application logic and the fulfillment of functional requirements are primarily implemented in:
*   **Client-Side (JavaScript - `script.js`):** Handles UI updates, user interaction flows, conditional rendering of elements based on user role or data state, client-side validation, and orchestrating API calls.
*   **Server-Side (PHP - API Endpoints):** Implements the business rules, data processing, database interactions, and security checks related to each function (e.g., user registration, booking creation, schedule management).

### 7. Security - JWT Implementation

Application security, particularly authentication and authorization, is managed using JSON Web Tokens (JWT):
*   **Authentication (Login):**
    1.  Users submit their credentials (username/password) via the login form.
    2.  The frontend sends these credentials to the `/users/login.php` API endpoint.
    3.  If credentials are valid, the backend generates a JWT. This token contains a payload with user data (e.g., user ID, username, role ID) and an expiration time (`exp`). It may also include an issued-at time (`iat`).
    4.  The JWT is sent back to the client.
    5.  The frontend stores the JWT in `localStorage`.
*   **Authorization & Session Management:**
    1.  For subsequent requests to protected API endpoints, the `apiFetch` function automatically includes the JWT in the `Authorization: Bearer <token>` header.
    2.  The backend API endpoints verify the JWT's signature and check its expiration.
    3.  The payload of the JWT (specifically `role_id`) is used on both the client-side (to show/hide UI elements like admin links) and server-side (to control access to specific functionalities or data).
*   **Session Timer & Expiration:**
    1.  A client-side timer (`startJwtTimer`) is initiated upon successful login or page load if a token exists.
    2.  This timer visually displays the remaining session time based on the `exp` claim in the JWT.
    3.  If the token expires (or is deemed invalid by the server, resulting in a 401 response), the `apiFetch` function clears the token from `localStorage`, alerts the user, and redirects them to the login page.
*   **Token Refresh (Optional):**
    *   An event listener is attached to the JWT timer display, allowing users to potentially click it to request a token refresh via the `/users/refresh_token.php` endpoint. If successful, a new JWT is issued and stored, and the timer is restarted.
*   **Page Protection:**
    *   Client-side checks are performed at the beginning of specific page logic (e.g., admin pages) to verify the presence and validity of the JWT and the user's role. If checks fail, the user is redirected. This is a UI/UX enhancement, but true security relies on server-side authorization.
