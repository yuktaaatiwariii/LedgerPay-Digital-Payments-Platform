# LedgerPay – Digital Payments Platform

LedgerPay is a full-stack digital payments platform designed around **ledger-based financial accounting** rather than directly modifying account balances.

The system demonstrates how a modern payment application can handle authentication, account management, financial transactions, double-entry ledger records, idempotency, Redis-based infrastructure, role-based access control, KYC verification, and containerized deployment.

The project is built incrementally with a focus on **backend architecture, financial data consistency, security, scalability, and real-world payment-system concepts**.

---

## 🚀 Key Features

### 🔐 Authentication & Authorization

- User registration and login
- Secure password hashing using `bcrypt`
- Access and refresh token authentication
- HTTP-only cookies for token storage
- Protected API routes
- Token refresh mechanism
- Secure logout
- Token revocation / blacklist support
- Role-based access control
- `USER` and `ADMIN` authorization levels

---

### 🏦 Account Management

- Create bank accounts for authenticated users
- Associate accounts with users
- Account status management
- Supported account currencies
- Account ownership validation
- Account balance derived from ledger entries
- Account-level transaction history

LedgerPay does not treat a manually stored balance as the financial source of truth.

Instead:

```text
Ledger Entries
      ↓
Credit / Debit Aggregation
      ↓
Current Account Balance
```

---

### 💸 Ledger-Based Transactions

Financial transactions are represented using an **append-only ledger**.

For a transfer of ₹500:

```text
Source Account
      │
      └── DEBIT  ₹500

Destination Account
      │
      └── CREDIT ₹500
```

The balance is calculated as:

```text
Balance = Total Credits − Total Debits
```

Ledger records are treated as immutable financial history and are not directly edited or deleted during normal transaction processing.

---

### 🛡️ Idempotent Transactions

LedgerPay protects financial write operations against duplicate requests.

Each transaction can be associated with an idempotency key:

```text
Client Request
      ↓
Idempotency-Key
      ↓
Check existing request
      ↓
┌───────────────┬────────────────┐
│ New Request   │ Duplicate      │
│       ↓       │       ↓        │
│ Process       │ Return/Reject  │
└───────────────┴────────────────┘
```

Redis provides fast atomic coordination for idempotency state, while MongoDB remains the source of truth for financial records.

This protects against duplicate payments caused by retries, network failures, or repeated client requests.

---

### ⚡ Redis Integration

Redis is used as an infrastructure layer for:

- Dashboard caching
- Idempotency coordination
- API rate limiting
- Temporary request state

The financial ledger does **not** depend on Redis for correctness.

```text
                    Redis
              ┌──────┼──────┐
              ↓      ↓      ↓
           Cache  Idempotency  Rate Limit
              │      │      │
              └──────┼──────┘
                     ↓
                  Backend
                     ↓
                  MongoDB
                     ↓
                 Ledger
```

MongoDB remains the authoritative source for accounts, transactions, and ledger records.

---

### 🚦 Rate Limiting

Redis-backed rate limiting is used to protect APIs from excessive requests and abuse.

It can help protect sensitive endpoints such as:

- Login
- Authentication-related APIs
- General API requests
- Other protected operations

When the configured request threshold is exceeded, the API returns:

```text
HTTP 429 Too Many Requests
```

---

### 🧾 KYC Verification

LedgerPay includes a KYC verification workflow for identity-document submission and administrative review.

Users can:

- Submit KYC documents
- Upload identity documents
- Resubmit rejected documents

Administrators can:

- View submitted KYC requests
- Review documents
- Approve KYC
- Reject KYC

Uploaded documents are stored using **Cloudinary**, while KYC metadata and verification status are maintained in MongoDB.

KYC states include:

```text
PENDING
APPROVED
REJECTED
```

---

### 👨‍💼 Admin APIs

The platform includes administrative functionality for system-level management and KYC review.

Administrative operations are protected through role-based authorization so that normal users cannot access admin-only endpoints.

---

### 📧 Email Services

Nodemailer is used as the application's email communication layer.

Email functionality is separated into a dedicated service rather than being tightly coupled with controllers.

---

### 🐳 Dockerized Infrastructure

LedgerPay can run as a multi-container application using Docker Compose.

The primary services are:

```text
┌─────────────────────┐
│      Frontend       │
│   React + Vite      │
│      + Nginx        │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│      Backend        │
│   Node + Express    │
└───────┬─────┬───────┘
        │     │
        ↓     ↓
   ┌───────┐ ┌───────┐
   │MongoDB│ │ Redis │
   └───────┘ └───────┘
```

Docker Compose provides:

- Isolated services
- Internal service discovery
- Persistent MongoDB storage
- Persistent Redis storage
- Development configuration
- Production configuration
- Reproducible local environments

---

## 🧰 Technology Stack

### Frontend

- React
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express.js
- Mongoose

### Database

- MongoDB
- MongoDB Atlas
- MongoDB Compass

### Authentication & Security

- JWT
- Access Tokens
- Refresh Tokens
- HTTP-only Cookies
- bcrypt
- Role-Based Access Control
- Token Revocation / Blacklisting
- Rate Limiting
- Idempotency

### Infrastructure

- Redis
- Docker
- Docker Compose
- Nginx

### File & Communication Services

- Cloudinary
- Multer
- Nodemailer

---

## 🏗️ System Architecture

LedgerPay follows a modular backend architecture based on separation of responsibilities.

```text
                    Client
                      │
                      ↓
                 React Frontend
                      │
                    Axios
                      │
                      ↓
                Express Backend
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
      Middleware    Routes    Controllers
          │                       │
          │                       ↓
          │                    Services
          │                       │
          └───────────────┬───────┘
                          ↓
                       Models
                          │
              ┌───────────┴───────────┐
              ↓                       ↓
           MongoDB                  Redis
              │
              ↓
        Ledger / Financial Data
```

The backend is organized around:

```text
Config
Controllers
Middleware
Models
Routes
Services
```

---

## 💰 Financial Data Flow

A typical transfer follows this flow:

```text
Client
  ↓
Authentication
  ↓
Rate Limiting
  ↓
Idempotency Check
  ↓
Transaction Validation
  ↓
MongoDB Transaction
  ↓
Transaction Record
  ↓
Ledger Entries
  ↓
Commit
  ↓
Invalidate Relevant Cache
  ↓
Response
```

The important architectural rule is:

> **MongoDB ledger records are the financial source of truth. Redis is used for performance and coordination, not financial correctness.**

---

## 📂 Project Structure

```text
LedgerPay/
│
├── Backend/
│   ├── docs/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.config.js
│   │   │   ├── db.js
│   │   │   └── redis.config.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── account.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── kyc.controller.js
│   │   │   └── transaction.controller.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── cache.middleware.js
│   │   │   ├── idempotency.middleware.js
│   │   │   └── rateLimiter.middleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── account.model.js
│   │   │   ├── kyc.model.js
│   │   │   ├── ledger.model.js
│   │   │   ├── refreshToken.model.js
│   │   │   ├── transaction.model.js
│   │   │   └── user.model.js
│   │   │
│   │   ├── routes/
│   │   │   ├── account.routes.js
│   │   │   ├── admin.kyc.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── kyc.routes.js
│   │   │   └── transaction.routes.js
│   │   │
│   │   └── services/
│   │       ├── email.service.js
│   │       └── token.service.js
│   │
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── package.json
│
├── Frontend/
│   ├── docs/
│   ├── src/
│   │   ├── components/
│   │   ├── layout/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── nginx.conf
│   └── package.json
│
├── docs/
│
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

---

## 🔑 Core Design Principles

### 1. Ledger as the Source of Truth

Account balances are derived from financial ledger entries instead of relying on a manually updated balance field.

### 2. Immutable Financial History

Ledger entries represent financial events and are treated as append-only records.

### 3. Atomic Financial Operations

Financial operations use database transactions to maintain consistency between transaction records and ledger entries.

### 4. Idempotent Writes

Repeated requests with the same idempotency key should not create duplicate financial operations.

### 5. Separation of Concerns

Authentication, business logic, persistence, middleware, external services, and routing are separated into dedicated modules.

### 6. Security by Layers

The system combines:

```text
Password Hashing
      +
Authentication
      +
HTTP-only Cookies
      +
Authorization
      +
Rate Limiting
      +
Idempotency
      +
Token Revocation
```

### 7. Performance Without Sacrificing Financial Correctness

Redis is used to improve performance and coordinate requests, while MongoDB remains the authoritative financial datastore.

---

## 🧪 Testing

The project includes testing and verification procedures for important backend and infrastructure behavior, including:

- Authentication
- Account operations
- Transactions
- Ledger consistency
- Idempotency
- Concurrent duplicate requests
- Redis cache hit/miss behavior
- Cache invalidation
- Rate limiting
- Redis failure handling
- KYC workflow

Detailed testing instructions are available in the project documentation.

---

## 🐳 Running with Docker

### Development

```bash
docker compose -f docker-compose.dev.yml up -d
```

Development Docker configuration is intended for active development and supports the project's development workflow.

### Production

```bash
docker compose up -d --build
```

Check running services:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Detailed Docker configuration is documented separately.

---

## ⚙️ Environment Configuration

The backend uses environment variables for configuration and sensitive credentials.

Typical configuration includes:

```env
PORT=3000

MONGO_URI=<your-mongodb-uri>

REDIS_URL=<your-redis-url>

JWT_ACCESS_SECRET=<your-access-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>

CLIENT_URL=<frontend-url>
```

Additional variables may be required for:

- Cloudinary
- Email / Nodemailer
- OAuth credentials
- Other external services

Never commit real credentials or secrets to Git.

Use the provided environment example file as the starting point for local configuration.

---

## 📚 Documentation

Detailed documentation is organized separately from this overview.

| Document | Purpose |
|---|---|
| `docs/architecture.md` | System architecture and request/data flows |
| `docs/database.md` | MongoDB models, relationships and ledger design |
| `docs/api-reference.md` | Available REST API endpoints |
| `docs/security.md` | Authentication, authorization and security mechanisms |
| `docs/redis.md` | Redis architecture, caching, idempotency and rate limiting |
| `docs/testing.md` | Testing and verification procedures |
| `docs/development.md` | Development phases and implementation milestones |
| `docs/docker.md` | Docker development and production configuration |

---

## 🔮 Future Development

LedgerPay V1 focuses on the online digital payments platform.

Future development can extend the system with a separate offline transaction architecture, including concepts such as:

- Offline transaction relay
- Hybrid RSA + AES-GCM encryption
- Replay protection
- Secure transaction nonces
- Multi-bridge concurrency handling
- Offline-to-online transaction synchronization

These capabilities are planned as a **V2 extension** rather than being part of the current V1 architecture.

---

## 🎯 Project Goals

LedgerPay was built to explore practical concepts used in financial and distributed systems:

- Secure authentication
- Financial ledger design
- Double-entry accounting concepts
- Database transactions
- Idempotency
- Distributed request coordination
- Caching
- Rate limiting
- Role-based authorization
- KYC workflows
- Secure file handling
- API architecture
- Docker-based deployment
- Failure handling

The project is intended as an engineering-focused implementation of these concepts rather than a production banking system.

---

## ⚠️ Disclaimer

LedgerPay is an educational and portfolio project.

It demonstrates financial-system architecture and security concepts but is **not intended to process real-world financial transactions or replace a regulated banking/payment infrastructure**.
