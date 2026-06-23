Banking Backend System

<!-- Overview-  -->

This project is a backend implementation of a digital banking/payment system built using Node.js, Express.js, MongoDB, and JWT authentication.

The goal of the project is to simulate how modern banking and payment applications manage user authentication, account management, transaction processing, ledger-based accounting, and secure communication.

The project is being developed incrementally with a focus on backend architecture, security, scalability, and real-world financial system concepts.

<!-- Technology Stack -->

Backend :
Node.js
Express.js

Database :
MongoDB Atlas
MongoDB Compass

Authentication & Security :
JWT (JSON Web Tokens)
bcrypt
Cookie Parser

Communication :
Nodemailer 

Environment Management :
dotenv

<!-- Features -->

## User registration and login
Allows users to create an account and securely sign in using their credentials. Registration stores user information, while login verifies identity before granting access.

## Secure password hashing
User passwords are never stored in plain text. Instead, they are hashed using a secure algorithm like bcrypt, making it extremely difficult for attackers to recover the original passwords even if the database is compromised.

## JWT-based authentication
After a successful login, the server issues a JSON Web Token (JWT) that identifies the authenticated user. This token is included in future requests so protected APIs can verify the user's identity without storing server-side sessions.

## Token blacklisting on logout
When a user logs out, their JWT is added to a blacklist so it can no longer be used, even if it has not yet expired. This prevents unauthorized reuse of old tokens.

## Bank account management
Each user is associated with one or more bank accounts that store account-related information and status. The system provides APIs to create, retrieve, and manage these accounts securely.

## Money transfers between accounts
Users can transfer funds from one account to another through validated transaction APIs. The system checks business rules and records the transfer to ensure accurate processing.

## Immutable ledger system
Instead of modifying balances directly, every credit and debit is recorded as a permanent ledger entry. Existing records are not edited or deleted, creating a complete audit trail of financial activity.

## Dynamic balance calculation
The current account balance is computed from the ledger by summing all credits and debits. This approach improves transparency and makes it easier to verify historical transactions.

## Idempotent transaction processing
The system ensures that the same transaction request is processed only once, even if it is accidentally submitted multiple times due to retries or duplicate requests. This helps prevent issues such as duplicate payments or double debits.


<!-- src/ -->

├── config/
│   └── db.js
│      - MongoDB connection configuration.
│
├── controllers/
│   ├── auth.controller.js
│   │   - Registration
│   │   - Login
│   │   - Logout
│   │   - Authentication logic
│   │
│   ├── account.controller.js
│   │   - Account CRUD operations
│   │   - Balance management
│   │
│   └── transaction.controller.js
│       - Create transactions
│       - Fetch transaction history
│       - Business logic for transfers
│
├── middleware/
│   └── auth.middleware.js
│      - JWT verification
│      - Route protection
│
├── models/
│   ├── user.model.js
│   ├── account.model.js
│   ├── transaction.model.js
│   ├── ledger.model.js
│   └── tokenBlackList.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── account.routes.js
│   └── transaction.routes.js
│
└── services/
    └── email.service.js
       - Email sending functionality


  <!-- Design Principles -->
- MVC architecture
- Separation of concerns
- Immutable financial records
- RESTful APIs


 <!-- Future Enhancements -->
- Refresh tokens
- Role-based access
- Notifications
- Scheduled payments
- API documentation (Swagger)
- Automated testing


<!-- # Setup Guide -->

## Prerequisites

- Node.js
- npm
- MongoDB

## Installation

git clone <repository>

cd bank-transaction

npm install

## Environment Variables

PORT=3000

MONGODB_URI=<your-mongodb-uri>

JWT_SECRET=<your-secret>

EMAIL_USER=<optional>

CLIENT_ID=<your-id>

CLIENT_SECRET=<your-secret>

REFRESH_TOKEN=<refresh-token>

## Start Development Server

npm run dev

## Start Production

npm start

## Folder Structure

src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
└── services/

## Database

Ensure MongoDB is running before starting the server.

## Notes

- Passwords are hashed before storage.
- JWT secures protected routes.
- Logged-out tokens are blacklisted.
- Ledger entries are immutable.
- Account balances are computed from ledger records