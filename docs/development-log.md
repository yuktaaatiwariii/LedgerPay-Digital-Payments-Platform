 Development Log

 Phase 1 - Project Initialization

 Completed

 Basic Express server setup
 Folder structure organization
 MongoDB Atlas configuration
 MongoDB connection management
 Environment variable management using dotenv

Learnings

 Environment variables should be used to protect sensitive information.
 Database configuration should be isolated from application logic.

---

 Phase 2 - Authentication System

 Completed

 User schema design
 Email validation
 Password hashing using bcrypt
 Password comparison methods
 Registration endpoint
 Login endpoint
 JWT generation
 Cookie parser integration
 Authentication middleware

 Learnings

* Passwords must never be stored in plain text.
* JWT enables stateless authentication.
* Middleware centralizes authorization logic.

---

## Phase 3 - Email Service

### Completed

* Nodemailer setup
* Email utility functions
* Registration email implementation

### Learnings

* Email functionality should be separated into reusable services.
* External services should be abstracted from controllers.

---

## Phase 4 - Account Module

### Completed

* Account model
* Account routes
* Account controller

### Learnings

* Financial systems require clear separation between user identity and financial accounts.

---

## Phase 5 - Ledger System

### Status

Currently under development.

### Goals

* Record all financial events.
* Derive account balances from ledger entries.
* Maintain auditability.
* Prepare foundation for transaction processing.
