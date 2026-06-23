 Development Log

 Phase 1 - Project Initialization

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

 Phase 3 - Email Service

Nodemailer setup
Email utility functions
Registration and transaction email implementation

 Learnings

Email functionality should be separated into reusable services.
External services should be abstracted from controllers.

---

Phase 4 - Account Module and Middleware 

Account model
Account routes
Account controller


 Features

* Created the Account model.
* Implemented account routes and controllers.
* Linked users with their financial accounts.
* Added account management functionality.

 Learnings

* Financial systems require clear separation between user identity and financial accounts.
* Learned how to structure modules using models, routes, and controllers.
* Understood the importance of organizing account-related business logic.


---

 Phase 5 - Ledger System and Transaction implementation

 Features

* Implemented a ledger-based transaction system.
* Added debit and credit ledger entries for transfers.
* Created transaction records with status tracking.
* Ensured atomic operations using MongoDB transactions.

 Learnings

* Learned the principles of double-entry bookkeeping.
* Understood how to maintain transaction consistency.
* Gained experience with MongoDB sessions and transactions.



---

 Phase 6 - Balance calculation using ledger aggregation

 Features

* Balance calculation using ledger aggregation.
* Real-time balance derived from debit and credit entries.
* Improved consistency by using the ledger as the source of truth.

Learnings

* Learned MongoDB aggregation for balance calculation.
* Understood ledger-based accounting concepts.
* Gained experience with transaction-driven data models.

---

 Phase 7 - Token blacklist with TTL expiration

 Features

* Implemented JWT token blacklist.
* Added TTL expiration for blacklisted tokens.
* Secured logout by preventing token reuse.

 Learnings

* Learned JWT revocation strategies.
* Understood MongoDB TTL indexes.
* Improved knowledge of authentication security.




note for self----

<!-- initial bank transfer logic get one user make login make account and then logout ok
then make login of system user for funds then make account the token saved in cookie is should of system
then in toacount give user qaccount id idemkey and amount and then complete transactions
after that login again from user account and get your balance 
thats the logic -->