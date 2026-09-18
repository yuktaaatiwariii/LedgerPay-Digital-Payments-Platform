# LedgerPay — Testing Documentation

## 1. Overview

LedgerPay uses a combination of manual API testing, integration testing, database verification, and infrastructure testing to validate the application's core functionality.

Testing focuses especially on areas where incorrect behavior could affect financial consistency or authentication security.

### Primary testing areas

- Authentication
- Access and refresh tokens
- Password reset
- Role-based authorization
- Account management
- Ledger-based transactions
- Balance calculation
- Transaction idempotency
- Redis caching
- Rate limiting
- KYC submission and review
- Admin operations
- MongoDB persistence
- Docker services
- Error handling

---

# 2. Testing Strategy

LedgerPay follows a layered testing approach:

```text
                    ┌─────────────────────┐
                    │   Manual API Tests  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Integration Testing │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
       │  MongoDB    │  │   Redis     │  │   Docker    │
       │ Verification│  │ Verification│  │ Verification│
       └─────────────┘  └─────────────┘  └─────────────┘
```

The most important principle is:

> A successful API response is not enough. Critical operations should also be verified against the underlying database and infrastructure state.

---

# 3. Testing Environment

LedgerPay can be tested using either a local development environment or Docker Compose.

### Local development

```text
Frontend
   │
   ▼
Express Backend
   │
   ├── MongoDB
   │
   └── Redis
```

### Docker environment

```text
┌──────────────────────────────────────────────┐
│              Docker Compose                  │
│                                              │
│  Frontend ──► Backend ──► MongoDB            │
│                     │                        │
│                     └──────► Redis           │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 4. Authentication Testing

Authentication is one of the primary security boundaries of LedgerPay.

## 4.1 User Registration

### Endpoint

```http
POST /api/auth/register
```

### Test cases

| Test | Expected Result |
|---|---|
| Register with valid details | User is created |
| Register with existing email | Request is rejected |
| Missing required fields | Validation/error response |
| Invalid email | Request is rejected |
| Weak/invalid password format | Request is rejected if validation applies |
| Password storage | Password is stored hashed, not plaintext |

### Database verification

After successful registration, verify the corresponding user document in MongoDB.

Confirm that:

- The user exists.
- Email is stored correctly.
- Password is hashed.
- Role is assigned correctly.
- Sensitive password data is never returned in the API response.

---

# 5. Login Testing

### Endpoint

```http
POST /api/auth/login
```

### Test cases

| Test | Expected Result |
|---|---|
| Valid credentials | Login succeeds |
| Wrong password | Login rejected |
| Unknown email | Login rejected |
| Missing credentials | Request rejected |
| Repeated login attempts | Rate limiter eventually applies |
| Successful login | Authentication cookies/tokens are issued according to implementation |

Login testing should verify both the response and authentication state.

---

# 6. Access Token Testing

### Endpoint

```http
GET /api/auth/me
```

### Test cases

```text
Valid authentication
        │
        ▼
      /me
        │
        ▼
Authenticated user returned
```

Verify:

- Authenticated users can access the endpoint.
- Unauthenticated users are rejected.
- User information comes from the authenticated request context.
- Protected endpoints cannot be accessed without valid authentication.

---

# 7. Refresh Token Testing

### Endpoint

```http
POST /api/auth/refresh
```

### Test cases

| Test | Expected Result |
|---|---|
| Valid refresh token | New access authentication is issued |
| Missing refresh token | Request rejected |
| Invalid refresh token | Request rejected |
| Expired refresh token | Request rejected |
| Repeated invalid refresh attempts | Request remains protected |

The refresh flow should not allow an attacker to generate valid access authentication without possessing valid refresh credentials.

---

# 8. Logout Testing

### Endpoint

```http
POST /api/auth/logout
```

After logout:

1. Authentication state should be invalidated according to the implemented logout flow.
2. Protected endpoints should no longer accept the invalidated authentication.
3. Refresh authentication should not remain usable if the implementation revokes it.

Example verification:

```text
Login
  │
  ▼
Authenticated request succeeds
  │
  ▼
Logout
  │
  ▼
Authenticated state invalidated
  │
  ▼
Protected request rejected
```

---

# 9. Password Reset Testing

LedgerPay provides password recovery through:

```http
POST /api/auth/forgot-password
```

and:

```http
POST /api/auth/reset-password/:token
```

### Test cases

- Request password reset for a valid account.
- Verify reset email flow.
- Verify reset token handling.
- Attempt reset using an invalid token.
- Attempt reset using an expired token if expiration is implemented.
- Reset password successfully.
- Login using the new password.
- Verify the old password no longer works.
- Verify repeated reset attempts are subject to the configured rate limiting.

---

# 10. Account Testing

## Create Account

```http
POST /api/accounts/
```

Verify:

- Authenticated user can create an account.
- Account is associated with the correct user.
- Account is persisted in MongoDB.
- Unauthorized requests are rejected.

---

## Get Accounts

```http
GET /api/accounts/
```

Verify:

- Only authenticated users can access the endpoint.
- Returned accounts belong to the authenticated user.
- Unauthorized access is rejected.

---

## Get Account Balance

```http
GET /api/accounts/balance/:accountId
```

Verify:

- Valid account ID returns the correct balance.
- Invalid account ID is handled safely.
- Users cannot access another user's account without authorization.

---

# 11. Transaction Testing

Transactions are a critical part of LedgerPay because they modify financial state.

### Endpoint

```http
POST /api/transactions/
```

A basic successful transaction should be verified at multiple levels:

```text
Transaction Request
        │
        ▼
Authentication
        │
        ▼
Rate Limiting
        │
        ▼
Idempotency Check
        │
        ▼
Transaction Processing
        │
        ▼
Ledger Entries
        │
        ▼
Balance Verification
        │
        ▼
Cache Invalidation
```

---

# 12. Transaction Test Cases

| Test Case | Expected Result |
|---|---|
| Valid transaction | Transaction succeeds |
| Invalid account | Request rejected |
| Unauthorized transaction | Request rejected |
| Invalid amount | Request rejected |
| Insufficient balance | Transaction rejected if enforced |
| Same account transfer | Handled according to business rules |
| Missing required data | Request rejected |
| Duplicate idempotency key | Original transaction result reused |
| Concurrent duplicate requests | Only one transaction is processed |
| Database failure | Transaction does not leave inconsistent state |

---

# 13. Ledger Verification

LedgerPay uses ledger-based accounting rather than treating a manually stored balance as the sole source of truth.

After a transaction, verify the corresponding ledger entries.

The balance concept is:

```text
Balance = Total Credits - Total Debits
```

Testing should verify:

```text
Initial Balance
      +
Credits
      -
Debits
      =
Calculated Balance
```

For example:

```text
Initial balance = 1000
Debit           = 250
Credit          = 100

Expected balance = 850
```

The actual calculation must be verified against the application's implemented transaction and ledger behavior.

---

# 14. Ledger Integrity Tests

For every successful financial transaction, verify:

- Transaction record exists.
- Appropriate ledger entries exist.
- Debit/credit information is correct.
- Account references are correct.
- Transaction amount is correct.
- The resulting balance is correct.
- Failed transactions do not create unintended financial entries.

### Important invariant

A transaction should not result in money being created or destroyed accidentally.

Conceptually:

```text
Total Debit
     =
Total Credit
```

for a balanced transfer operation.

---

# 15. Idempotency Testing

LedgerPay uses Redis-backed idempotency for transaction requests.

### Endpoint

```http
POST /api/transactions/
```

A client should provide an idempotency key according to the implemented middleware contract.

Example:

```http
Idempotency-Key: transaction-123
```

---

## 15.1 First Request

```text
Request
  │
  ▼
Redis: key does not exist
  │
  ▼
Transaction processed
  │
  ▼
Result stored
```

Expected:

- Transaction is processed once.
- Response is returned.
- Idempotency state is stored.

---

## 15.2 Duplicate Request

Send the same request again using the same idempotency key.

Expected:

```text
Same Idempotency Key
        │
        ▼
Existing Redis Entry
        │
        ▼
Original Result / Duplicate Handling
```

The system should not create a second financial transaction.

---

## 15.3 Concurrent Requests

Send multiple identical requests at approximately the same time.

Expected:

```text
Request A ─┐
Request B ─┼──► Redis atomic key operation
Request C ─┘
                  │
                  ▼
          One request processes
          others are prevented
```

Verify in MongoDB that only one financial transaction was created.

This is one of the most important tests in the project because duplicate payment requests can otherwise produce duplicate financial effects.

---

# 16. Redis Cache Testing

The account summary endpoint uses Redis caching.

### Endpoint

```http
GET /api/accounts/getSummary
```

## Cache MISS

First request:

```text
Client
  │
  ▼
Redis
  │
  └── Cache MISS
        │
        ▼
     MongoDB
        │
        ▼
    Calculate Data
        │
        ▼
   Store in Redis
        │
        ▼
     Response
```

Expected:

- Data is retrieved from the database.
- Result is stored in Redis.
- Client receives the correct response.

---

## Cache HIT

Second request:

```text
Client
  │
  ▼
Redis
  │
  └── Cache HIT
        │
        ▼
     Response
```

Expected:

- Cached data is returned.
- Database does not need to perform the same calculation for that request.

---

# 17. Cache Invalidation Testing

After a successful financial transaction:

```text
Transaction
    │
    ▼
Database Updated
    │
    ▼
Dashboard Cache Invalidated
```

Test sequence:

1. Request account summary.
2. Confirm cache is populated.
3. Perform a successful transaction.
4. Request account summary again.
5. Verify the response reflects the new financial state.

This prevents stale financial information from remaining in the dashboard cache.

---

# 18. Rate Limiting Testing

LedgerPay uses Redis-backed rate limiting for selected sensitive operations.

Known protected areas include:

- Login
- Password recovery
- Transactions

### Login test

Repeatedly send:

```http
POST /api/auth/login
```

Verify that:

- Requests initially proceed according to the configured limit.
- Excessive requests are eventually rejected.
- A rate-limit response is returned.
- Redis stores the distributed rate-limit state.

Do not hard-code a request count in documentation unless it matches the current middleware configuration.

---

# 19. Rate Limit Isolation

Verify that rate limiting does not incorrectly block unrelated users.

Example:

```text
User A
  │
  ├── Repeated login attempts
  │
  └── Rate limit reached

User B
  │
  └── Normal login request
       │
       ▼
    Should remain independent
```

The exact isolation behavior depends on the configured rate-limit key strategy.

---

# 20. Redis Failure Testing

Redis is an infrastructure dependency for:

- Caching
- Idempotency
- Rate limiting

Redis failure behavior should be tested separately for each feature.

### Cache

Verify that the application handles Redis unavailability according to its configured fail-open behavior.

### Rate Limiting

Verify that the application's configured failure behavior is respected if Redis becomes unavailable.

### Idempotency

Because idempotency protects financial operations from duplicate processing, Redis availability should be treated more strictly.

Verify that the application does not silently process unsafe duplicate transaction requests when the idempotency store cannot be reached.

---

# 21. KYC Testing

KYC provides document upload and verification workflows.

## User Submission

```http
POST /api/kyc/
```

Request:

```text
Content-Type: multipart/form-data
Field: document
```

Verify:

- Authenticated user can submit a document.
- File is uploaded successfully.
- Cloudinary stores the document.
- KYC record is stored in MongoDB.
- Initial KYC state is correct.

---

## Get Own KYC

```http
GET /api/kyc/me
```

Verify:

- User receives their own KYC information.
- Unauthorized requests are rejected.
- KYC data belongs to the authenticated user.

---

## KYC Resubmission

```http
PUT /api/kyc/resubmit
```

Verify:

- User can resubmit when allowed by the workflow.
- New document is uploaded.
- MongoDB record is updated correctly.
- KYC state changes according to the implemented workflow.

---

# 22. Admin KYC Testing

Admin KYC operations are protected by system/admin authentication.

Available operations include:

```text
GET      /
GET      /:id
PATCH    /:id/approve
PATCH    /:id/reject
```

The exact mounted API prefix is determined by the application's route configuration.

### Test cases

| Test | Expected Result |
|---|---|
| Admin views applications | Applications returned |
| Admin views specific application | Correct KYC record returned |
| Admin approves KYC | Status changes to APPROVED |
| Admin rejects KYC | Status changes to REJECTED |
| Normal user accesses admin route | Request rejected |
| Invalid KYC ID | Safe error response |
| Repeated invalid review action | Handled according to workflow rules |

---

# 23. Authorization Testing

Authentication answers:

> "Who is the user?"

Authorization answers:

> "Is this user allowed to perform this operation?"

Test both independently.

### User vs Admin

```text
USER
 │
 ├── Own account operations
 ├── Own transactions
 ├── Own KYC
 │
 └── Admin operations ──► DENIED


ADMIN / SYSTEM
 │
 └── Authorized administrative operations
```

Verify that changing a client-side role value does not grant backend privileges.

The backend must remain the final authorization boundary.

---

# 24. API Error Testing

Test common invalid inputs and infrastructure failures.

Examples:

```text
Missing fields
Invalid IDs
Invalid authentication
Expired authentication
Unauthorized access
Duplicate requests
Invalid transaction amount
Invalid KYC document
Database errors
Redis unavailable
Cloudinary upload failure
```

The application should return structured error responses rather than exposing internal implementation details.

---

# 25. Database Verification

API testing should be followed by MongoDB verification for critical operations.

### Verify User

```text
users
 └── User document
```

### Verify Account

```text
accounts
 └── Account document
```

### Verify Transaction

```text
transactions
 └── Transaction document
```

### Verify Ledger

```text
ledger
 └── Ledger entries
```

### Verify KYC

```text
kyc
 └── KYC document
      └── Cloudinary document reference
```

Database verification is particularly important for financial operations because an API response alone does not prove that persistent state is correct.

---

# 26. Docker Testing

When running LedgerPay with Docker Compose, verify all expected services.

```text
Frontend
Backend
MongoDB
Redis
```

Check:

```bash
docker compose ps
```

All required containers should be running/healthy according to their configured health checks.

---

## Backend Logs

Check:

```bash
docker compose logs backend
```

Verify that the backend successfully connects to:

```text
MongoDB
Redis
```

and starts listening on the configured port.

---

## Redis Logs

```bash
docker compose logs redis
```

Verify that Redis starts without errors.

---

## MongoDB Logs

```bash
docker compose logs mongodb
```

Verify that MongoDB starts correctly and remains available.

---

# 27. Docker Development Testing

Development mode should support live code changes through the configured development tooling.

Verify:

```text
Frontend
   │
   └── Vite development server / HMR

Backend
   │
   └── Nodemon restart behavior
```

A source-code change should be reflected without manually rebuilding the entire production image.

If changes are not reflected, verify:

- Volume mounts.
- Container command.
- Development Dockerfile.
- Vite configuration.
- Nodemon configuration.
- Browser cache.

---

# 28. Production Docker Testing

For the production Compose configuration, verify:

```bash
docker compose up -d --build
```

Then:

```bash
docker compose ps
```

Verify that:

- Frontend container is running.
- Backend container is running.
- MongoDB container is running.
- Redis container is running.
- Backend can connect to MongoDB.
- Backend can connect to Redis.
- Frontend can communicate with the backend.

---

# 29. End-to-End Critical Flow

A complete LedgerPay smoke test can follow this sequence:

```text
1. Register User
        │
        ▼
2. Login
        │
        ▼
3. Access /me
        │
        ▼
4. Create Account
        │
        ▼
5. Add Initial Funds
        │
        ▼
6. Verify Balance
        │
        ▼
7. Perform Transaction
        │
        ▼
8. Verify Ledger
        │
        ▼
9. Verify Balance
        │
        ▼
10. Verify Dashboard Cache
        │
        ▼
11. Repeat Transaction
    with same Idempotency Key
        │
        ▼
12. Verify No Duplicate Transaction
```

This flow tests the most important components of the platform together.

---

# 30. KYC End-to-End Flow

```text
User Login
    │
    ▼
KYC Document Upload
    │
    ├──► Cloudinary
    │
    └──► MongoDB
             │
             ▼
        PENDING
             │
             ▼
        Admin Review
          /       \
         /         \
        ▼           ▼
   APPROVED      REJECTED
                    │
                    ▼
                Resubmit
```

Verify the state transition and persisted data at every important stage.

---

# 31. Security Smoke Test

Before considering a build ready for demonstration, verify:

```text
[ ] Passwords are hashed
[ ] Protected endpoints reject unauthenticated users
[ ] Admin endpoints reject normal users
[ ] Authentication cookies/tokens are handled securely
[ ] Login is rate limited
[ ] Password recovery is rate limited
[ ] Transactions are rate limited
[ ] Duplicate transactions are prevented by idempotency
[ ] Financial records are persisted correctly
[ ] KYC routes enforce authentication
[ ] Admin KYC routes enforce authorization
[ ] Secrets are loaded from environment variables
[ ] Sensitive errors are not exposed to clients
```

---

# 32. Financial Consistency Smoke Test

The following should always be checked after implementing or modifying transaction logic:

```text
Transaction Created
        │
        ├──► Correct source account
        │
        ├──► Correct destination account
        │
        ├──► Correct amount
        │
        ├──► Correct ledger entries
        │
        ├──► Correct resulting balances
        │
        ├──► No duplicate transaction
        │
        └──► Cache reflects latest state
```

A transaction should be considered successfully tested only after both the API response and persistent financial state have been verified.

---

# 33. Recommended Testing Order

When testing a new LedgerPay build, use the following order:

### Step 1 — Infrastructure

```text
MongoDB
Redis
Backend
Frontend
```

### Step 2 — Authentication

```text
Register
Login
/me
Refresh
Logout
Password Reset
```

### Step 3 — Accounts

```text
Create Account
List Accounts
Balance
Summary
```

### Step 4 — Transactions

```text
Initial Funds
Transfer
History
Idempotency
Ledger
Balance
```

### Step 5 — Redis

```text
Cache
Cache Invalidation
Rate Limiting
Idempotency
Failure Handling
```

### Step 6 — KYC

```text
Upload
View
Resubmit
Admin Review
```

### Step 7 — Docker

```text
Development
Production
Container Health
Logs
Connectivity
```

---

# 34. Testing Checklist

## Authentication

- [ ] Registration works
- [ ] Duplicate registration is rejected
- [ ] Login works
- [ ] Invalid credentials are rejected
- [ ] `/me` requires authentication
- [ ] Access authentication works
- [ ] Refresh flow works
- [ ] Logout works
- [ ] Forgot-password works
- [ ] Reset-password works

## Accounts

- [ ] Account creation works
- [ ] Account retrieval works
- [ ] Balance endpoint works
- [ ] Unauthorized account access is rejected
- [ ] Summary endpoint works

## Transactions

- [ ] Initial funds work
- [ ] Transfer works
- [ ] Transaction history works
- [ ] Invalid transactions are rejected
- [ ] Ledger entries are correct
- [ ] Balances are correct
- [ ] Duplicate requests are prevented
- [ ] Concurrent duplicate requests are handled safely

## Redis

- [ ] Redis connects successfully
- [ ] Dashboard cache MISS works
- [ ] Dashboard cache HIT works
- [ ] Cache invalidation works
- [ ] Idempotency storage works
- [ ] Rate limiting works
- [ ] Redis failure behavior is understood and tested

## KYC

- [ ] Document upload works
- [ ] Cloudinary upload works
- [ ] MongoDB KYC record is created
- [ ] User can view own KYC
- [ ] Resubmission works
- [ ] Admin can view applications
- [ ] Admin can approve KYC
- [ ] Admin can reject KYC
- [ ] Non-admin access is rejected

## Docker

- [ ] All required containers start
- [ ] Backend connects to MongoDB
- [ ] Backend connects to Redis
- [ ] Frontend is accessible
- [ ] Development hot reload works
- [ ] Production build works
- [ ] Container logs are clean

---

# 35. Testing Philosophy

LedgerPay testing prioritizes correctness of financial state over simply checking whether an endpoint returns HTTP 200.

The most important verification chain is:

```text
API Request
    ↓
Authentication
    ↓
Authorization
    ↓
Validation
    ↓
Business Logic
    ↓
Database Transaction
    ↓
Ledger Integrity
    ↓
Balance Integrity
    ↓
Cache Consistency
    ↓
API Response
```

For financial systems, correctness must be verified across the complete chain rather than at the HTTP layer alone.

---

# 36. Future Testing Expansion

Future versions can expand the test suite with:

- Automated unit tests
- Automated integration tests
- API regression tests
- Transaction concurrency tests
- Property-based financial invariant tests
- Load testing
- Redis failover testing
- Queue/worker testing
- Audit-log verification
- Offline transaction relay testing
- Cryptographic verification tests
- Replay-attack tests
- Multi-node relay concurrency tests

These are planned extensions and should not be considered part of the current V1 implementation unless separately implemented.

---

# 37. Summary

LedgerPay testing is centered around four core principles:

### 1. Authentication must be protected

Authentication, refresh tokens, password recovery, and rate limiting must be tested independently.

### 2. Authorization must be enforced server-side

Users and administrative operations must remain properly isolated.

### 3. Financial operations must be consistent

Transactions, ledger entries, balances, and idempotency must be verified together.

### 4. Infrastructure must be validated

MongoDB, Redis, Cloudinary, and Docker must be tested as part of the complete application.

The most important LedgerPay test is therefore not simply:

```text
"Did the API return 200?"
```

but:

```text
"Did the complete operation produce the correct,
secure, persistent, and non-duplicated financial state?"
```
