# LedgerPay — Development Guide

## 1. Overview

This document describes the development workflow, project structure, development phases, environment configuration, and recommended practices for the LedgerPay platform.

LedgerPay is developed as a full-stack digital payments platform with a ledger-based accounting system.

### Current technology stack

#### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios

#### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Nodemailer
- Redis
- Cloudinary
- Multer

#### Infrastructure

- Docker
- Docker Compose
- MongoDB
- Redis

---

# 2. Project Architecture

LedgerPay follows a modular client-server architecture.

```text
                    ┌──────────────────┐
                    │     Frontend     │
                    │ React + Vite     │
                    └────────┬─────────┘
                             │
                             │ HTTP/API
                             ▼
                    ┌──────────────────┐
                    │     Backend      │
                    │ Node + Express   │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌────────────┐
        │ MongoDB  │   │  Redis   │   │ Cloudinary │
        └──────────┘   └──────────┘   └────────────┘
```

MongoDB stores persistent application data.

Redis provides infrastructure-level functionality such as:

- Caching
- Idempotency
- Rate limiting

Cloudinary stores uploaded KYC documents.

---

# 3. Development Directory Structure

A simplified project structure is:

```text
LedgerPay/
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── Dockerfile.dev
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   │
│   ├── package.json
│   ├── Dockerfile
│   └── Dockerfile.dev
│
├── docs/
│   ├── README.md
│   ├── architecture.md
│   ├── database.md
│   ├── api-reference.md
│   ├── security.md
│   ├── redis.md
│   ├── testing.md
│   ├── development.md
│   └── docker.md
│
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

The exact structure may evolve as additional modules are introduced.

---

# 4. Backend Structure

The backend follows a separation-of-concerns approach.

```text
Backend/src/
│
├── config/
│   ├── db.js
│   ├── redis.config.js
│   └── cloudinary.config.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── account.controller.js
│   ├── transaction.controller.js
│   └── kyc.controller.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── cache.middleware.js
│   ├── idempotency.middleware.js
│   └── rateLimiter.middleware.js
│
├── models/
│   ├── user.model.js
│   ├── account.model.js
│   ├── transaction.model.js
│   ├── ledger.model.js
│   └── kyc.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── account.routes.js
│   ├── transaction.routes.js
│   ├── kyc.routes.js
│   └── admin.kyc.routes.js
│
└── app.js
```

The backend entry point is:

```text
server.js
```

---

# 5. Backend Startup Flow

LedgerPay intentionally connects to required infrastructure before accepting requests.

The startup sequence is:

```text
server.js
   │
   ▼
Load environment variables
   │
   ▼
Connect MongoDB
   │
   ▼
Connect Redis
   │
   ▼
Load Express application
   │
   ▼
Start HTTP server
```

This prevents the application from accepting requests before its required database and Redis connections are initialized.

If startup fails, the server process exits rather than continuing in a partially initialized state.

---

# 6. Frontend Development

The frontend uses React with Vite.

Typical development flow:

```text
React Components
      │
      ▼
Pages
      │
      ▼
React Router
      │
      ▼
API Layer
      │
      ▼
Express Backend
```

TanStack Query can be used for server-state management, while Axios handles HTTP communication.

---

# 7. Environment Configuration

Sensitive configuration should be stored using environment variables rather than hard-coded directly into source code.

Typical backend configuration includes:

```env
PORT=3000

MONGO_URI=...

REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...

CLIENT_URL=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

EMAIL configuration...
```

The exact variables should match the project's current `.env` and configuration files.

---

# 8. Environment Separation

LedgerPay can be developed in different environments.

```text
Development
     │
     ├── Local services
     │
     └── Docker development mode


Production
     │
     └── Docker production mode
```

Environment-specific values should not be committed to source control.

Use an example environment file to document required variables:

```text
.env.example
```

The example file should contain variable names and safe placeholder values, not real credentials.

---

# 9. Local Development

A local development environment consists of:

```text
Frontend
Backend
MongoDB
Redis
```

The backend requires MongoDB and Redis to be available before it can fully operate.

A typical workflow is:

```text
1. Start MongoDB
2. Start Redis
3. Start Backend
4. Start Frontend
5. Open application
```

---

# 10. Docker Development

LedgerPay also provides a Docker-based development workflow.

Development Compose configuration:

```text
docker-compose.dev.yml
```

The development setup is intended to provide:

- Frontend development server
- Vite hot module replacement
- Backend development server
- Nodemon-based restart behavior
- MongoDB container
- Redis container

The objective is to allow source-code changes to be reflected during development without rebuilding the production image after every change.

---

# 11. Docker Production

The production configuration uses:

```text
docker-compose.yml
```

The expected application services are:

```text
Frontend
Backend
MongoDB
Redis
```

Production images are built separately from the development images.

Typical production startup:

```bash
docker compose up -d --build
```

Check running services with:

```bash
docker compose ps
```

---

# 12. Development vs Production

| Area | Development | Production |
|---|---|---|
| Frontend | Vite development server | Production build served through configured web server |
| Frontend updates | Hot reload | Rebuild required |
| Backend | Nodemon | Node production process |
| Source mounting | Development volumes | Production image |
| Debugging | Development-friendly | Production configuration |
| Build | Development workflow | Optimized build |
| Compose file | `docker-compose.dev.yml` | `docker-compose.yml` |

The two environments should remain separate so development conveniences do not accidentally become production behavior.

---

# 13. API Development Workflow

When adding a new backend feature, follow this general sequence:

```text
Requirement
    │
    ▼
Database Model
    │
    ▼
Controller / Business Logic
    │
    ▼
Middleware
    │
    ▼
Route
    │
    ▼
Frontend API Integration
    │
    ▼
Frontend UI
    │
    ▼
Testing
    │
    ▼
Documentation
```

Not every feature requires a new model or middleware, but the separation should be maintained where applicable.

---

# 14. Adding a New API Endpoint

A new endpoint should generally follow:

### Step 1 — Define the requirement

Clearly identify:

- HTTP method
- URL
- Authentication requirement
- Authorization requirement
- Request data
- Response data
- Error conditions

### Step 2 — Implement business logic

Place request-specific business logic in the appropriate controller or service layer.

### Step 3 — Add middleware

Apply required middleware such as:

```text
Authentication
Authorization
Rate limiting
Idempotency
Caching
File upload
```

### Step 4 — Register the route

Add the endpoint to the appropriate route module.

### Step 5 — Test the endpoint

Test:

- Valid request
- Invalid request
- Unauthorized request
- Forbidden request
- Edge cases
- Infrastructure failures where relevant

### Step 6 — Update documentation

Update:

```text
api-reference.md
```

and any other documentation affected by the change.

---

# 15. Authentication Development Flow

Authentication changes should be handled carefully because multiple components depend on authentication state.

The current authentication architecture includes:

```text
Register
   │
   ▼
Login
   │
   ▼
Access Authentication
   │
   ├──► Protected APIs
   │
   └──► User Identity

Refresh Authentication
   │
   ▼
New Access Authentication

Logout
   │
   ▼
Authentication Invalidated
```

When modifying authentication, test:

- Login
- `/me`
- Refresh
- Logout
- Protected routes
- Admin routes
- Password reset
- Rate limiting

---

# 16. Transaction Development Flow

Financial logic should be developed incrementally.

```text
Request
   │
   ▼
Authentication
   │
   ▼
Validation
   │
   ▼
Idempotency
   │
   ▼
Transaction Processing
   │
   ▼
Ledger Update
   │
   ▼
Balance Verification
   │
   ▼
Cache Invalidation
   │
   ▼
Response
```

Transaction-related changes should always be followed by database verification.

---

# 17. Idempotency Development Rule

Any change to transaction processing must consider idempotency.

Before modifying transaction code, verify:

```text
Does the same request have a unique idempotency key?
```

Then verify:

```text
First request
    └──► Process once

Duplicate request
    └──► Do not create another financial transaction
```

Concurrency should also be considered.

Two requests arriving at approximately the same time must not bypass the idempotency mechanism.

---

# 18. Redis Development Rules

Redis is not the source of truth for financial records.

Its responsibilities include:

```text
Redis
 ├── Cache
 ├── Idempotency
 └── Rate Limiting
```

MongoDB remains responsible for persistent application and financial data.

When changing Redis-related code, test:

- Connection
- Cache behavior
- Cache invalidation
- Idempotency
- Rate limiting
- Redis unavailable behavior

---

# 19. Cache Development Rule

Cached financial summaries must never become permanently stale after a successful financial operation.

The expected pattern is:

```text
Read
 │
 ├── Cache HIT ──► Return cached data
 │
 └── Cache MISS
         │
         ▼
      MongoDB
         │
         ▼
    Cache result
```

After a successful transaction:

```text
Transaction
    │
    ▼
Persistent State Updated
    │
    ▼
Relevant Cache Invalidated
```

Any change to transaction logic should therefore be checked against dashboard caching.

---

# 20. KYC Development Flow

KYC combines authentication, file upload, Cloudinary, MongoDB, and administrative authorization.

```text
Authenticated User
       │
       ▼
Document Upload
       │
       ├────────► Cloudinary
       │
       ▼
MongoDB KYC Record
       │
       ▼
PENDING
       │
       ▼
Admin Review
      / \
     /   \
    ▼     ▼
APPROVED REJECTED
            │
            ▼
         Resubmit
```

When modifying KYC functionality, verify both:

- Cloudinary document storage
- MongoDB KYC record

The admin interface should also correctly consume the stored document information.

---

# 21. Admin Development Rules

Administrative operations should remain protected by backend authorization.

Frontend visibility is not sufficient for security.

For every admin feature:

```text
Frontend restriction
        +
Backend authorization
        =
Proper access control
```

A user should not gain administrative permissions simply by modifying frontend requests.

---

# 22. Database Development Rules

Database changes should consider:

- Existing documents
- Existing relationships
- Indexes
- Validation
- Backward compatibility
- Financial consistency

Before changing a financial schema, identify which controllers and services depend on the affected fields.

---

# 23. Git Development Workflow

A clean Git workflow helps isolate changes.

Recommended sequence:

```bash
git status
```

Review changed files.

Then:

```bash
git diff
```

Review the actual changes before committing.

After testing:

```bash
git add .
git commit -m "describe the change"
```

Push to the appropriate branch:

```bash
git push
```

Commit messages should describe the actual change rather than using vague messages such as:

```text
update
changes
fix stuff
```

Prefer messages such as:

```text
Add KYC admin approval workflow
Fix Redis cache invalidation
Add transaction idempotency handling
```

---

# 24. Feature Development Checklist

Before marking a feature complete:

```text
[ ] Requirement clearly defined
[ ] Backend logic implemented
[ ] Required middleware added
[ ] Route registered
[ ] Frontend integrated
[ ] Authentication verified
[ ] Authorization verified
[ ] Database state verified
[ ] Redis behavior verified if applicable
[ ] Error handling tested
[ ] Edge cases tested
[ ] Documentation updated
```

---

# 25. Debugging Workflow

When something is not working, avoid changing multiple unrelated parts simultaneously.

Use this sequence:

```text
1. Reproduce the problem
        │
        ▼
2. Read browser/network error
        │
        ▼
3. Check backend logs
        │
        ▼
4. Check request payload
        │
        ▼
5. Check API response
        │
        ▼
6. Check database
        │
        ▼
7. Check Redis / external service
        │
        ▼
8. Identify root cause
        │
        ▼
9. Apply minimal fix
        │
        ▼
10. Retest complete flow
```

---

# 26. Frontend Debugging

For frontend issues, inspect:

### Browser Console

Look for:

```text
JavaScript errors
React errors
Network errors
CORS errors
```

### Network Tab

Check:

```text
Request URL
HTTP method
Request headers
Cookies
Request body
Response status
Response body
```

### Application State

Verify:

```text
Authentication state
User data
API response data
Loading state
Error state
```

---

# 27. Backend Debugging

For backend issues, inspect:

```text
Server logs
Request parameters
Request body
Authentication context
Controller logic
Database queries
Redis operations
External service responses
```

Avoid exposing secrets while debugging.

Never log:

```text
Passwords
JWT secrets
API secrets
Cloudinary secrets
Email credentials
```

---

# 28. Docker Debugging

If an application change is not appearing in Docker:

### Check container status

```bash
docker compose ps
```

### Check logs

```bash
docker compose logs backend
docker compose logs frontend
```

### Check development volumes

Confirm that the development Compose configuration mounts the source code correctly.

### Check the running command

Verify that the container is actually running the development command when using development mode.

### Rebuild only when necessary

A production image generally requires rebuilding after source changes.

A properly configured development environment should normally use mounted source files and development reload mechanisms instead.

---

# 29. Common Development Problems

## Backend cannot connect to MongoDB

Check:

```text
MONGO_URI
MongoDB availability
Network configuration
Docker service name
Port configuration
```

---

## Backend cannot connect to Redis

Check:

```text
REDIS_URL
Redis service status
Port 6379
Docker network
Redis container logs
```

---

## Frontend cannot reach backend

Check:

```text
Frontend API base URL
Backend port
Docker port mapping
CORS configuration
Browser Network tab
```

---

## Changes are not reflected in Docker

Check:

```text
Development Compose file
Volume mounts
Vite HMR
Nodemon
Container command
Browser cache
```

Do not immediately rebuild every container without first checking whether the development environment is configured correctly.

---

# 30. Documentation Workflow

Documentation should be updated when a feature changes behavior.

Relevant files include:

```text
README.md
architecture.md
database.md
api-reference.md
security.md
redis.md
testing.md
development.md
docker.md
```

Not every code change requires every documentation file to be modified.

Update only the documentation affected by the change.

---

# 31. Documentation Principles

LedgerPay documentation should be:

### Accurate

Document the current implementation rather than planned functionality.

### Concise

Avoid repeating the same architecture explanation in multiple files.

### Technical

Include enough implementation detail to explain design decisions.

### Interview-Friendly

Documentation should make it easy to explain:

- Why MongoDB is used
- Why Redis is used
- How idempotency works
- How ledger accounting works
- How authentication works
- How KYC works
- How Docker is structured
- How financial consistency is protected

---

# 32. Development Milestones

LedgerPay development can be viewed as a sequence of implementation milestones.

| Phase | Area | Status |
|---|---|---|
| 1 | Project initialization | Completed |
| 2 | Authentication | Completed |
| 3 | Email integration | Completed |
| 4 | Account management | Completed |
| 5 | Ledger and transactions | Completed |
| 6 | Balance and summary functionality | Completed |
| 7 | Token/session protection improvements | Completed |
| 8 | Access + refresh authentication | Completed |
| 9 | Redis integration | Completed |
| 10 | Idempotency | Completed |
| 11 | Rate limiting | Completed |
| 12 | Dashboard caching | Completed |
| 13 | Admin APIs | Completed |
| 14 | KYC upload workflow | Completed |
| 15 | Admin KYC approval/rejection | Completed |
| 16 | Docker development environment | Completed |
| 17 | Docker production environment | Completed |
| 18 | Documentation consolidation | In progress |

The milestone list describes the current V1 development progression and should be updated when major features are added.

---

# 33. Current V1 Scope

The current LedgerPay V1 focuses on a secure online digital payments architecture.

### Implemented areas

```text
Authentication
      │
      ├── Access authentication
      ├── Refresh authentication
      ├── Logout
      └── Password recovery

Accounts
      │
      ├── Account creation
      ├── Account retrieval
      ├── Balance
      └── Summary

Transactions
      │
      ├── Transfers
      ├── Ledger
      ├── History
      └── Idempotency

Redis
      │
      ├── Cache
      ├── Rate limiting
      └── Idempotency

KYC
      │
      ├── Document upload
      ├── Cloudinary storage
      ├── User KYC status
      └── Admin review

Infrastructure
      │
      └── Docker Compose
```

---

# 34. Future Development

Future versions may expand LedgerPay with capabilities such as:

- Transaction queues
- Audit logging
- Advanced fraud detection
- Expanded RBAC
- KYC enhancements
- Automated test coverage
- Offline transaction relay
- Hybrid cryptographic transaction security
- Replay protection
- Multi-node transaction relay
- Additional distributed-system capabilities

These features belong to future development unless explicitly implemented in the current version.

---

# 35. Development Principles

The project follows several core engineering principles.

## Separation of Concerns

Authentication, controllers, models, middleware, infrastructure, and frontend logic should remain clearly separated.

## Security by Default

Protected operations should require authentication and appropriate authorization.

## Financial Consistency

Transactions should preserve ledger and balance consistency.

## Idempotent Financial Operations

Retrying a transaction request should not unintentionally create duplicate financial effects.

## Infrastructure Awareness

Redis, MongoDB, Cloudinary, and Docker should be treated as explicit system dependencies.

## Observable Failures

Errors should be logged appropriately and handled without exposing sensitive internal information.

## Documentation as Part of Development

Important architecture and API changes should be reflected in the documentation.

---

# 36. Development Definition of Done

A LedgerPay feature is considered development-complete when:

```text
Requirement
     │
     ▼
Implementation
     │
     ▼
Integration
     │
     ▼
Testing
     │
     ▼
Database Verification
     │
     ▼
Security Verification
     │
     ▼
Documentation
     │
     ▼
Git Commit
```

A feature should not be considered complete simply because it works in one successful manual request.

---

# 37. Summary

LedgerPay development is organized around a modular full-stack architecture with:

- React frontend
- Express backend
- MongoDB persistence
- Redis infrastructure
- Cloudinary document storage
- Authentication and authorization
- Ledger-based financial accounting
- Idempotent transactions
- Rate limiting
- Caching
- KYC workflow
- Docker-based development and deployment

The development workflow emphasizes:

```text
Build
  ↓
Test
  ↓
Verify
  ↓
Document
  ↓
Commit
```

For financial functionality, additional emphasis is placed on:

```text
Correctness
+
Security
+
Consistency
+
Idempotency
```

This approach keeps LedgerPay maintainable while providing a strong foundation for future distributed and offline transaction capabilities.