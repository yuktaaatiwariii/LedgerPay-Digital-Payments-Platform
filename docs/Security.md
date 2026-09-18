# 🔐 LedgerPay Security

LedgerPay follows a layered security approach to protect user accounts, authentication sessions, financial transactions, administrative operations, and KYC documents.

The current security implementation includes password hashing, JWT-based authentication, HTTP-only cookies, role-based authorization, Redis-based rate limiting, transaction idempotency, secure environment configuration, and protected KYC operations.

---

## 1. Security Architecture

LedgerPay uses multiple security layers rather than relying on a single security mechanism.

```text
                         Client
                           │
                           ▼
                    Express Backend
                           │
             ┌─────────────┼─────────────┐
             │             │             │
      Authentication   Rate Limiting   Validation
             │             │             │
             └─────────────┼─────────────┘
                           │
                    Authorization
                           │
             ┌─────────────┼─────────────┐
             │             │             │
        Idempotency     Controllers    Business Logic
             │             │             │
             └─────────────┼─────────────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
              MongoDB              Redis
                 │                   │
        Persistent Data       Cache / Security
```

The backend acts as the primary security boundary between the client and the database.

---

# 2. Password Security

LedgerPay never stores user passwords as plain text.

Passwords are hashed using `bcrypt` before being stored in MongoDB.

```text
Plain Password
      │
      ▼
    bcrypt
      │
      ▼
Password Hash
      │
      ▼
   MongoDB
```

During authentication, the submitted password is compared against the stored bcrypt hash.

```text
Entered Password
      │
      ▼
bcrypt comparison
      │
      ▼
Stored Password Hash
      │
      ▼
Authentication Result
```

### Security principles

* Passwords are hashed before storage.
* Plain-text passwords are not stored in the database.
* Password hashes should not be returned to clients.
* Authentication uses password-hash comparison.

---

# 3. Authentication

LedgerPay uses token-based authentication for protected API requests.

The authentication flow is:

```text
Login Request
     │
     ▼
Verify Credentials
     │
     ▼
Generate Access + Refresh Tokens
     │
     ▼
Set Authentication Cookies
     │
     ▼
Authenticated API Requests
```

Protected API endpoints use authentication middleware to verify the user's authentication state before allowing access to protected resources.

The authentication middleware is responsible for establishing the authenticated user context for downstream controllers.

---

# 4. Access and Refresh Tokens

LedgerPay separates access-token authentication from refresh-token based session renewal.

### Access Token

The access token is used for authenticated API requests.

### Refresh Token

The refresh token allows the client to obtain a new access token when the current access token expires.

```text
              Access Token
                   │
                   ▼
          Protected API Requests
                   │
                   ▼
                Expires
                   │
                   ▼
             Refresh Token
                   │
                   ▼
           New Access Token
```

This allows authenticated sessions to continue without requiring the user to repeatedly enter their password.

---

# 5. HTTP-only Authentication Cookies

Authentication tokens are handled using HTTP-only cookies.

An HTTP-only cookie cannot be directly accessed through client-side JavaScript.

```text
Browser
   │
   │ HTTP-only authentication cookie
   ▼
LedgerPay Backend
```

This reduces the exposure of authentication tokens to JavaScript-based attacks such as token theft through certain XSS scenarios.

In production, authentication cookies should also use appropriate secure settings, including HTTPS and appropriate `SameSite` configuration.

---

# 6. Authentication Middleware

Protected routes use authentication middleware before reaching their controllers.

Example:

```javascript
router.get(
    "/me",
    authMiddleware.authMiddleware,
    controller
);
```

The middleware:

1. Receives the incoming request.
2. Checks the authentication credentials.
3. Verifies the token.
4. Identifies the authenticated user.
5. Allows the request to continue when authentication succeeds.
6. Rejects the request when authentication fails.

Keeping authentication inside middleware prevents authentication logic from being duplicated throughout individual controllers.

---

# 7. Authorization and Role Protection

Authentication answers:

> "Who is making this request?"

Authorization answers:

> "Is this user allowed to perform this operation?"

LedgerPay separates normal user operations from administrative/system operations.

```text
Normal User
     │
     ▼
authMiddleware
     │
     ▼
User Operations
```

Administrative operations use additional system/admin authorization.

```text
Admin / System User
        │
        ▼
authSystemMiddleware
        │
        ▼
Administrative Operations
```

Administrative operations include functionality such as:

* Viewing users
* Managing accounts
* System-level operations
* Reviewing KYC applications
* Approving KYC applications
* Rejecting KYC applications

The backend performs authorization checks instead of trusting the frontend.

---

# 8. Rate Limiting

LedgerPay uses rate limiting to control excessive requests to sensitive endpoints.

Redis is used as part of the rate-limiting infrastructure.

Current rate-limited operations include authentication and transaction-related operations.

Examples of application rate limiters include:

```text
loginLimiter
forgotPasswordLimiter
transactionLimiter
```

The general flow is:

```text
Client Request
      │
      ▼
Rate Limiter
      │
      ├──────────────► Within Limit
      │                      │
      │                      ▼
      │                 Continue Request
      │
      └──────────────► Limit Exceeded
                             │
                             ▼
                       Reject Request
```

Rate limiting helps reduce:

* Brute-force login attempts
* Password-reset abuse
* Excessive transaction requests
* Request flooding

Redis allows this state to be maintained outside an individual application process.

---

# 9. Transaction Idempotency

Financial transactions must be protected against accidental duplicate processing.

LedgerPay implements transaction idempotency using an idempotency key.

A transaction request can include:

```http
Idempotency-Key: unique-request-key
```

The general flow is:

```text
Transaction Request
        │
        ▼
Idempotency Key
        │
        ▼
      Redis
        │
        ├──────────────► New Key
        │                    │
        │                    ▼
        │              Process Transaction
        │
        └──────────────► Existing Key
                             │
                             ▼
                    Prevent Duplicate Processing
```

Idempotency protects against duplicate transactions caused by:

* Network retries
* Request timeouts
* Duplicate button clicks
* Client retries
* Multiple submissions of the same request

This is particularly important for financial operations because processing the same request multiple times can create incorrect financial state.

---

# 10. Redis Security and Infrastructure Role

Redis is used as a supporting component for both security and performance.

Current Redis use cases include:

```text
Redis
 ├── Rate Limiting
 ├── Transaction Idempotency
 └── Dashboard Caching
```

Redis is not the authoritative source of financial records.

MongoDB remains responsible for persistent application and financial data.

```text
                 LedgerPay
                    │
          ┌─────────┴─────────┐
          │                   │
       MongoDB              Redis
          │                   │
 Persistent Data       Temporary / Supporting State
          │                   │
   Financial Records    Cache / Rate Limits /
                        Idempotency
```

This separation ensures that temporary Redis state does not replace the application's persistent financial records.

---

# 11. Ledger and Financial Data Security

LedgerPay uses a ledger-based accounting system for financial transactions.

Financial operations create ledger entries instead of relying only on a mutable balance value.

```text
Transaction
     │
     ▼
Ledger Entries
     │
     ▼
Financial State
```

The ledger provides a historical record of financial operations.

The conceptual accounting model is:

```text
Balance = Credits - Debits
```

Ledger records should be treated as financial history and should not be arbitrarily modified or deleted after successful processing.

This provides:

* Transaction traceability
* Historical financial records
* Auditable transaction history
* Consistent accounting information

---

# 12. Transaction Integrity

Financial transactions pass through multiple security and validation layers before being persisted.

The general processing flow is:

```text
Authentication
      │
      ▼
Rate Limiting
      │
      ▼
Idempotency Check
      │
      ▼
Request Validation
      │
      ▼
Business Logic
      │
      ▼
Transaction Processing
      │
      ▼
Ledger Entries
      │
      ▼
MongoDB Persistence
```

This ensures that security and integrity checks occur before the financial operation is finalized.

---

# 13. KYC Document Security

LedgerPay provides a KYC verification workflow for users.

The current KYC flow uses Cloudinary for document storage and MongoDB for KYC metadata and verification state.

```text
Authenticated User
       │
       ▼
KYC API
       │
       ▼
Document Upload
       │
       ├──────────────► Cloudinary
       │
       └──────────────► MongoDB
                            │
                            ▼
                     KYC Record / Status
```

The KYC workflow supports:

* KYC submission
* KYC resubmission
* Viewing KYC information
* Administrative KYC review
* KYC approval
* KYC rejection

KYC documents are uploaded through the backend rather than directly exposing database access to the frontend.

---

# 14. KYC Authorization

KYC operations are separated between normal users and administrative users.

### User Operations

```text
Authenticated User
       │
       ├── Submit KYC
       ├── View Own KYC
       └── Resubmit KYC
```

### Administrative Operations

```text
Admin / System User
       │
       ├── View KYC Applications
       ├── Review KYC
       ├── Approve KYC
       └── Reject KYC
```

Administrative KYC actions are protected using the application's system/admin authorization middleware.

---

# 15. Environment Variables and Secret Management

Sensitive configuration should not be hard-coded into the application source code.

LedgerPay uses environment variables for sensitive configuration.

Examples include:

```text
MongoDB credentials
JWT secrets
Redis configuration
Cloudinary credentials
Email credentials
Application configuration
```

The application loads environment variables using:

```javascript
require("dotenv").config();
```

A local `.env` file should not be committed to Git.

The repository should instead use an example configuration file such as:

```text
.env.example
```

The example file should contain variable names but no real credentials.

Example:

```env
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
MONGO_URI=
REDIS_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Real credentials should be provided through the deployment environment.

---

# 16. Database Security

MongoDB is the persistent data store for LedgerPay.

The frontend never connects directly to MongoDB.

```text
Frontend
    │
    ▼
Backend API
    │
    ▼
MongoDB
```

The backend is responsible for:

* Authentication
* Authorization
* Input validation
* Business rules
* Financial operations
* Database access

Database credentials should be stored in environment variables.

For MongoDB Atlas deployments, database access should be restricted according to the deployment environment and only trusted application sources should be permitted.

---

# 17. Backend as the Security Boundary

The frontend should be treated as an untrusted client.

Security-sensitive decisions are made on the backend.

```text
Frontend
    │
    │ Request
    ▼
Backend
    │
    ├── Authenticate
    ├── Authorize
    ├── Validate
    ├── Rate Limit
    ├── Check Idempotency
    ├── Execute Business Logic
    └── Persist Data
```

The frontend should not determine:

* Whether a user is authorized
* Whether a transaction is valid
* Whether a financial operation can be executed
* Whether an administrative operation is permitted
* Whether a KYC application can be approved

These decisions belong to the backend.

---

# 18. Input Validation

Incoming API requests should be validated before they reach financial or administrative business logic.

Validation is important for:

* User registration
* Login requests
* Account operations
* Transaction requests
* KYC requests
* Administrative operations

The general pattern is:

```text
Incoming Request
      │
      ▼
Validation
      │
      ├── Invalid → Reject
      │
      └── Valid
           │
           ▼
      Business Logic
```

Validation should be performed on the backend even when the frontend already performs client-side validation.

Client-side validation improves user experience, but backend validation provides the actual security boundary.

---

# 19. Logout and Token Invalidation

LedgerPay supports logout functionality.

The logout process removes the authentication session from the client and uses server-side token invalidation mechanisms where configured.

The general flow is:

```text
User Logout
     │
     ▼
Authentication Session Invalidated
     │
     ▼
Authentication Cookies Cleared
     │
     ▼
Future Protected Requests Rejected
```

Token invalidation helps prevent continued use of authentication credentials after logout.

---

# 20. Docker Security

LedgerPay can run using Docker Compose with separate application services.

The current architecture contains:

```text
Frontend
Backend
MongoDB
Redis
```

Sensitive configuration should be supplied through environment variables rather than hard-coded inside Dockerfiles or application source code.

Production deployments should follow these practices:

* Use strong JWT secrets.
* Do not commit credentials to Git.
* Use HTTPS.
* Restrict MongoDB network exposure.
* Restrict Redis network exposure.
* Avoid unnecessarily exposing internal infrastructure ports.
* Use production environment variables.
* Keep application secrets outside the source repository.

---

# 21. Security Responsibilities

Security responsibilities are distributed across different layers of the application.

| Layer                     | Responsibility                                               |
| ------------------------- | ------------------------------------------------------------ |
| Frontend                  | UI validation and secure API usage                           |
| Backend                   | Authentication, authorization, validation and business logic |
| Redis                     | Rate limiting, idempotency and caching                       |
| MongoDB                   | Persistent application and financial data                    |
| Cloudinary                | KYC document storage                                         |
| Docker                    | Application and infrastructure isolation                     |
| Environment Configuration | Secret and deployment configuration                          |

The backend remains the primary security boundary.

---

# 22. Security Checklist

Before deploying LedgerPay to production, verify the following:

```text
[ ] Strong JWT access-token secret configured
[ ] Strong JWT refresh-token secret configured
[ ] MongoDB credentials stored securely
[ ] Redis configuration secured
[ ] Cloudinary credentials stored securely
[ ] Email credentials stored securely
[ ] .env excluded from Git
[ ] .env.example contains no real credentials
[ ] HTTPS enabled
[ ] Secure cookie configuration enabled
[ ] Appropriate SameSite cookie configuration enabled
[ ] MongoDB access restricted
[ ] Redis access restricted
[ ] Rate limiting enabled
[ ] Transaction idempotency enabled
[ ] Admin routes protected
[ ] KYC administrative routes protected
[ ] Financial operations validated server-side
[ ] Frontend does not connect directly to MongoDB
[ ] Ledger records protected from unauthorized modification
[ ] Production secrets are different from development secrets
```

---

# 23. Current Security Components

The current LedgerPay security implementation can be summarized as:

```text
                         LedgerPay Security
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
   Authentication         Authorization        Infrastructure
          │                     │                     │
      bcrypt              Admin/System            MongoDB
   Access Token           Middleware               Redis
   Refresh Token
   HTTP-only Cookies
          │
          └─────────────────────┬─────────────────────┘
                                │
                       Application Security
                                │
                ┌───────────────┼───────────────┐
                │               │               │
           Rate Limiting    Idempotency     Validation
                │               │               │
                └───────────────┼───────────────┘
                                │
                       Financial Security
                                │
                         Ledger System
                                │
                         KYC Protection
```

---

# 24. Security Philosophy

LedgerPay follows a layered security model.

Authentication verifies the identity of users, authorization controls access to protected operations, rate limiting limits excessive requests, idempotency prevents duplicate transaction processing, and backend validation protects business logic.

MongoDB acts as the persistent data store, while Redis provides supporting functionality such as rate limiting, idempotency, and caching.

The overall approach is:

```text
Authenticate
     ↓
Authorize
     ↓
Validate
     ↓
Protect Against Abuse
     ↓
Prevent Duplicate Operations
     ↓
Execute Business Logic
     ↓
Persist Securely
```

This layered approach is designed to protect both application functionality and the integrity of financial operations.
