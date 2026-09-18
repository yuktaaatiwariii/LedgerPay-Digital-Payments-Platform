# LedgerPay Architecture

## 1. Overview

LedgerPay follows a modular full-stack architecture designed around separation of concerns, secure request processing, and ledger-based financial consistency.

The system consists of:

- **React + Vite frontend**
- **Node.js + Express backend**
- **MongoDB database**
- **Redis infrastructure layer**
- **Cloudinary file storage**
- **Nodemailer email service**
- **Docker-based development and deployment**

The backend is organized into configuration, controllers, middleware, models, routes, and services.

---

# 2. High-Level Architecture

                         ┌──────────────────┐
                         │      Browser     │
                         └────────┬─────────┘
                                  │
                                  ↓
                         ┌──────────────────┐
                         │ React + Vite UI  │
                         └────────┬─────────┘
                                  │
                             HTTP / Axios
                                  │
                                  ↓
                    ┌──────────────────────────┐
                    │     Express Backend      │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │       Middleware          │
                    │                           │
                    │ Authentication             │
                    │ Rate Limiting             │
                    │ Idempotency                │
                    │ Caching                    │
                    └────────────┬─────────────┘
                                 │
                                 ↓
                             Routes
                                 │
                                 ↓
                          Controllers
                                 │
                    ┌────────────┴─────────────┐
                    │                          │
                    ↓                          ↓
                 Services                   Models
                    │                          │
          ┌─────────┴─────────┐               ↓
          ↓                   ↓            MongoDB
       Email              Tokens              │
                                              ↓
                                         Ledger Data

                         Redis
                    ┌────────┼────────┐
                    ↓        ↓        ↓
                  Cache  Idempotency Rate Limit

                       Cloudinary
                            ↑
                            │
                         KYC Files
```
# 3 Config

src/config/
├── cloudinary.config.js
├── db.js
└── redis.config.js
```

### `db.js`

Responsible for establishing and managing the MongoDB connection.

MongoDB stores the application's persistent data, including:

- Users
- Accounts
- Transactions
- Ledger entries
- Refresh tokens
- KYC records

---

### `redis.config.js`

Initializes the Redis connection used by the application.

Redis supports:

- Dashboard caching
- Idempotency coordination
- Rate limiting
- Temporary application state

Redis is not treated as the financial source of truth.

---

### `cloudinary.config.js`

Configures Cloudinary for KYC document storage.

Uploaded files are stored externally while MongoDB stores the associated KYC metadata and verification state.

---

# 4. Controllers

```text
src/controllers/
├── account.controller.js
├── auth.controller.js
├── kyc.controller.js
└── transaction.controller.js
```

Controllers handle HTTP-level application operations and coordinate business logic.

### Authentication Controller

Responsible for:

- Registration
- Login
- Logout
- Token-related authentication operations

### Account Controller

Responsible for:

- Account creation
- Account retrieval
- Account-related operations
- Balance retrieval

### Transaction Controller

Responsible for:

- Transfer processing
- Transaction validation
- Transaction creation
- Ledger entry creation
- Transaction-related operations

### KYC Controller

Responsible for:

- KYC submission
- KYC resubmission
- KYC review operations
- Approval/rejection workflow

Controllers coordinate the request rather than directly managing infrastructure configuration.

---

# 5. Middleware Architecture

```text
src/middleware/
├── auth.middleware.js
├── cache.middleware.js
├── idempotency.middleware.js
└── rateLimiter.middleware.js
```

Middleware executes before or around protected application operations.

---

## 5.1 Authentication Middleware

`auth.middleware.js`

Responsible for:

- Verifying authentication credentials/tokens
- Identifying the current user
- Protecting authenticated routes
- Rejecting unauthorized requests

---

## 5.2 Cache Middleware

`cache.middleware.js`

Used for read-heavy operations where temporary cached data can reduce repeated MongoDB queries.

Typical flow:

```text
Request
   ↓
Check Redis
   ↓
┌──────────────┬──────────────┐
│ Cache HIT    │ Cache MISS   │
│      ↓       │      ↓       │
│ Return data  │ MongoDB      │
│              │      ↓       │
│              │ Store Redis  │
└──────────────┴──────────────┘
```

Financial correctness does not depend on the cached value.

---

## 5.3 Idempotency Middleware

`idempotency.middleware.js`

Protects financial write operations against duplicate requests.

```text
Request
   ↓
Read Idempotency Key
   ↓
Redis atomic check
   ↓
┌──────────────┬──────────────────┐
│ New request  │ Existing request │
│      ↓       │        ↓         │
│ Process      │ Return / Reject  │
└──────────────┴──────────────────┘
```

Redis provides fast temporary coordination, while the completed financial operation is stored in MongoDB.

Atomic operations such as `SET NX` help prevent multiple concurrent requests from entering the same processing path.

---

## 5.4 Rate Limiter Middleware

`rateLimiter.middleware.js`

Protects APIs against excessive request volume.

Redis maintains the state required for rate limiting so request limits can be coordinated through a shared store.

When a configured limit is exceeded, the API can return:

```text
HTTP 429 Too Many Requests
```

---

# 6. Routes

```text
src/routes/
├── account.routes.js
├── admin.kyc.routes.js
├── auth.routes.js
├── kyc.routes.js
└── transaction.routes.js
```

Routes define the public API surface and connect incoming requests to the appropriate middleware and controller.

Conceptually:

```text
HTTP Request
     ↓
Route
     ↓
Middleware
     ↓
Controller
     ↓
Model / Service
     ↓
Database / External Service
```

---

# 7. Services

```text
src/services/
├── email.service.js
└── token.service.js
```

Services isolate reusable infrastructure and application functionality from controllers.

### `email.service.js`

Provides email-sending functionality through the configured email provider.

### `token.service.js`

Centralizes token-related functionality used by the authentication system.

This separation prevents authentication and email infrastructure from being tightly coupled to route handlers.

---

# 8. Data Architecture

MongoDB is the persistent datastore and financial source of truth.

The main data entities are:

```text
User
  │
  └── Account
        │
        ├── Transactions
        │
        └── Ledger Entries

User
  │
  ├── Refresh Tokens
  │
  └── KYC Record
```

A transaction connects accounts and produces ledger records representing the financial movement.

---

# 9. Ledger-Based Transaction Architecture

LedgerPay uses ledger-based accounting instead of directly modifying a stored account balance.

For a transfer:

```text
                    Transaction
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
        Source Account        Destination Account
              │                     │
              ↓                     ↓
          DEBIT ₹500             CREDIT ₹500
              │                     │
              └──────────┬──────────┘
                         ↓
                  Ledger Entries
```

The resulting balance is derived from ledger activity:

```text
Balance = Total Credits − Total Debits
```

This creates a historical record of financial events.

---

# 10. Transaction Processing Flow

A normal transfer follows this sequence:

```text
Client
  ↓
Authentication
  ↓
Rate Limiting
  ↓
Idempotency Check
  ↓
Transaction Route
  ↓
Transaction Controller
  ↓
Validate Accounts
  ↓
Validate Transaction
  ↓
MongoDB Database Transaction
  ├── Create Transaction
  ├── Create Debit Ledger Entry
  └── Create Credit Ledger Entry
  ↓
Commit
  ↓
Invalidate Related Cache
  ↓
Return Response
```

MongoDB database transactions are used to keep related financial writes consistent.

The transaction record and its corresponding ledger entries should be committed together.

---

# 11. MongoDB as Financial Source of Truth

The system intentionally separates **financial correctness** from **performance infrastructure**.

```text
                 Financial Data
                       │
                       ↓
                   MongoDB
                       │
              ┌────────┴────────┐
              ↓                 ↓
          Transactions       Ledger
              │                 │
              └────────┬────────┘
                       ↓
                  Account Balance
```

Redis may temporarily cache derived information, but it does not replace MongoDB for:

- Ledger records
- Transaction records
- Account ownership
- Financial history
- Financial correctness

---

# 12. Redis Architecture

Redis operates as a supporting infrastructure layer.

```text
                       Backend
                          │
             ┌────────────┼────────────┐
             ↓            ↓            ↓
          Caching    Idempotency   Rate Limiting
             │            │            │
             └────────────┼────────────┘
                          ↓
                        Redis
```

### Cache

Used to reduce repeated database reads.

### Idempotency

Used for fast atomic coordination of duplicate requests.

### Rate Limiting

Used to maintain request counters and enforce API limits.

---

# 13. Redis Failure Strategy

Redis features have different availability requirements.

### Cache

If Redis becomes unavailable:

```text
Redis unavailable
       ↓
Skip cache
       ↓
Read MongoDB
       ↓
Return response
```

The application can continue operating without cached data.

### Rate Limiting

Rate-limiting behavior can be configured independently from financial data storage. The system should avoid allowing Redis availability issues to become a dependency for the core financial datastore.

### Idempotency

Idempotency protects financial writes.

If the system cannot safely coordinate an idempotency-protected request because Redis is unavailable, the request can be rejected rather than risking duplicate processing.

This follows the principle:

```text
Performance feature → availability can be preferred

Financial write protection → safety is preferred
```

---

# 14. Cache Invalidation

Cached financial summaries can become stale after a successful transaction.

Therefore, the transaction flow includes cache invalidation:

```text
Transaction
    ↓
MongoDB Commit
    ↓
Financial data updated
    ↓
Invalidate related Redis cache
    ↓
Next dashboard request
    ↓
Cache MISS
    ↓
Read latest data from MongoDB
    ↓
Store updated result in Redis
```

The database commit occurs before relying on the refreshed cached state.

---

# 15. Authentication Architecture

The authentication system uses access and refresh tokens.

High-level flow:

```text
Login
  ↓
Validate Credentials
  ↓
Verify bcrypt Password Hash
  ↓
Generate Tokens
  ↓
Set Secure HTTP-only Cookies
  ↓
Authenticated Requests
  ↓
Access Token Verification
```

When an access token expires, the refresh-token mechanism can be used to obtain a new access token according to the application's token lifecycle.

Logout/revocation mechanisms prevent previously issued credentials from being reused when they have been revoked.

Detailed authentication behavior is documented separately in `security.md`.

---

# 16. Role-Based Access Control

LedgerPay separates authentication from authorization.

```text
Authentication
     ↓
Who is the user?
     ↓
Authorization
     ↓
What is the user allowed to do?
```

Administrative routes use authorization checks to restrict admin-only operations.

For example:

```text
USER
 └── Regular application operations

ADMIN
 ├── Regular authorized operations
 └── Administrative operations
```

The KYC administration workflow is protected through this authorization layer.

---

# 17. KYC Architecture

The KYC workflow separates document storage from application metadata.

```text
User
  ↓
Upload KYC Document
  ↓
Multer / Upload Handling
  ↓
Cloudinary
  │
  └── Document URL
          ↓
       MongoDB
          │
          ├── User
          ├── Document metadata
          └── Verification status
```

KYC status progresses through states such as:

```text
PENDING
   │
   ├──→ APPROVED
   │
   └──→ REJECTED
            │
            ↓
         Resubmit
            │
            ↓
         PENDING
```

Administrators review submitted KYC records and update their verification status.

---

# 18. Frontend Architecture

The frontend uses React and Vite.

```text
Frontend/
└── src/
    ├── components/
    ├── layout/
    ├── lib/
    ├── pages/
    ├── App.jsx
    ├── index.css
    └── main.jsx
```

### Components

Reusable UI elements and application components.

### Layout

Shared page layouts and structural UI elements.

### Pages

Application-level screens and route views.

### Lib

Client-side utilities and API-related functionality.

### `App.jsx`

Defines the main application structure and routing integration.

### `main.jsx`

Application entry point.

---

# 19. Frontend–Backend Communication

The frontend communicates with the Express API using HTTP requests.

Conceptually:

```text
React UI
   ↓
User Action
   ↓
API Client
   ↓
HTTP Request
   ↓
Express Route
   ↓
Middleware
   ↓
Controller
   ↓
MongoDB / Redis / Cloudinary
   ↓
HTTP Response
   ↓
React UI Update
```

Axios is used as the HTTP client, while TanStack Query manages server-state related operations in the frontend.

---

# 20. Docker Architecture

LedgerPay can be executed as a multi-container application.

```text
                    Browser
                       │
              ┌────────┴────────┐
              ↓                 ↓
        Frontend Container   Backend Container
           React/Nginx        Node/Express
                                  │
                         ┌────────┴────────┐
                         ↓                 ↓
                   MongoDB Container  Redis Container
```

The services communicate through the Docker Compose network using service names.

For example:

```text
Backend → mongodb:27017
Backend → redis:6379
```

rather than using `localhost` for inter-container communication.

Development and production environments use separate Docker configurations.

Detailed Docker instructions are documented in `docker.md`.

---

# 21. Error and Failure Handling Principles

LedgerPay follows different strategies depending on the importance of the operation.

### Non-critical infrastructure

For cache-related operations:

```text
Redis unavailable
      ↓
Bypass cache
      ↓
MongoDB
```

### Financial write protection

For idempotency-protected financial writes:

```text
Redis unavailable
      ↓
Cannot safely coordinate duplicate requests
      ↓
Reject request
```

The objective is to prevent infrastructure failures from silently causing financial inconsistencies.

---

# 22. Architectural Principles

LedgerPay follows these core principles:

### Separation of Concerns

Each module has a focused responsibility.

### Source of Truth

MongoDB contains the authoritative financial records.

### Immutable Ledger

Financial history is represented using ledger entries rather than destructive balance updates.

### Atomicity

Related financial database operations are committed together.

### Idempotency

Repeated requests should not create duplicate financial operations.

### Defense in Depth

Security is implemented through multiple layers:

```text
Password Hashing
       ↓
Authentication
       ↓
Authorization
       ↓
Rate Limiting
       ↓
Idempotency
       ↓
Database Transactions
       ↓
Immutable Ledger
```

### Performance Without Sacrificing Correctness

Redis improves performance and request coordination without becoming the financial source of truth.

---

# 23. Request Lifecycle Summary

A simplified LedgerPay request lifecycle is:

```text
                    Client
                      │
                      ↓
                 React Frontend
                      │
                      ↓
                Express Server
                      │
                      ↓
                  Middleware
             ┌────────┼────────┐
             ↓        ↓        ↓
            Auth    Rate     Cache /
                    Limit   Idempotency
             └────────┼────────┘
                      ↓
                    Route
                      ↓
                 Controller
                      ↓
              Service / Model
                      ↓
          ┌───────────┴───────────┐
          ↓                       ↓
       MongoDB                  Redis
          │
          ↓
      Response
          │
          ↓
     React Frontend
```

---

# 24. V1 Architecture Scope

The current LedgerPay V1 focuses on online digital payment functionality:

```text
Authentication
      +
Account Management
      +
Ledger-Based Transactions
      +
Idempotency
      +
Redis Infrastructure
      +
Rate Limiting
      +
RBAC
      +
KYC
      +
Admin Operations
      +
Docker
```

Offline transaction relay and hybrid cryptographic transaction processing are planned as a separate V2 extension.

---

## Summary

LedgerPay is designed around a simple architectural rule:

> **Use specialized infrastructure for performance and coordination, but keep financial correctness anchored in the database ledger.**

MongoDB provides persistent financial state, the ledger provides an auditable representation of money movement, Redis provides performance and distributed coordination capabilities, and the application layers isolate authentication, authorization, business logic, persistence, and external services.