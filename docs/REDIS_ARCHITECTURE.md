# Redis Architecture

LedgerPay uses Redis as a high-performance supporting layer for **caching, idempotency, and rate limiting**.

Redis is not used as the financial source of truth. All authoritative user, account, transaction, ledger, and KYC data remains in MongoDB.

---

## 1. Redis Responsibilities

Redis currently provides three major capabilities in LedgerPay:

```text
                    Redis
                      │
        ┌─────────────┼─────────────┐
        │             │             │
     Caching      Idempotency   Rate Limiting
        │             │             │
   Dashboard       Transactions    API
    Summary        Protection     Protection
```

### Current Use Cases

| Feature | Redis Role | Purpose |
|---|---|---|
| Dashboard Caching | Cache | Reduce repeated database queries |
| Transaction Idempotency | Coordination/State | Prevent duplicate transaction processing |
| Rate Limiting | Distributed State | Control excessive API requests |

---

# 2. Architecture

The general request flow is:

```text
                         Client
                           │
                           ▼
                     Express API
                           │
                    Authentication
                           │
                    Rate Limiting
                           │
                    Idempotency
                           │
                      Controller
                       /       \
                      /         \
                  Redis       MongoDB
                    │             │
          ┌─────────┼───────┐     │
          │         │       │     │
       Cache   Idempotency  RL    │
                                  │
                           Source of Truth
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                  Users        Accounts     Transactions
                                                │
                                              Ledger
```

Redis handles temporary and coordination-related state, while MongoDB stores persistent application and financial data.

---

# 3. Redis Connection

LedgerPay connects to Redis during application startup.

The server startup sequence is:

```text
Application Start
       ↓
Connect MongoDB
       ↓
Connect Redis
       ↓
Initialize Express
       ↓
Start HTTP Server
```

The application does not start accepting requests until Redis has successfully connected.

Redis configuration is loaded through environment variables.

Example:

```env
REDIS_URL=redis://localhost:6379
```

For Docker-based execution, the Redis connection URL can point to the Redis service defined in Docker Compose.

---

# 4. Dashboard Caching

LedgerPay uses Redis to cache dashboard summary data.

The main endpoint using dashboard caching is:

```http
GET /api/accounts/getSummary
```

The route uses:

```text
authMiddleware
        ↓
cacheDashboard
        ↓
accountController.getAccountSummaryController
```

---

## Cache Flow

When a user requests the dashboard:

```text
Client
  ↓
GET /api/accounts/getSummary
  ↓
Authentication
  ↓
Check Redis Cache
  │
  ├── HIT ──────→ Return Cached Data
  │
  └── MISS
        ↓
     MongoDB
        ↓
   Generate Summary
        ↓
      Redis
        ↓
   Return Response
```

### Cache HIT

If valid cached data exists:

```text
Request
   ↓
Redis
   ↓
Cached Response
   ↓
Client
```

The database does not need to be queried for that request.

### Cache MISS

If cached data does not exist:

```text
Request
   ↓
Redis MISS
   ↓
MongoDB
   ↓
Generate Summary
   ↓
Store in Redis
   ↓
Client
```

This reduces unnecessary database reads for frequently accessed dashboard information.

---

# 5. Cache Invalidation

Cached financial information can become stale after a successful transaction.

Therefore, LedgerPay invalidates the relevant dashboard cache after successful financial operations.

The conceptual flow is:

```text
Transaction
    ↓
Successful Database Operation
    ↓
Ledger Updated
    ↓
Dashboard Cache Invalidated
    ↓
Next Dashboard Request
    ↓
Cache MISS
    ↓
Fresh Data from MongoDB
    ↓
Redis Cache Updated
```

This prevents previously cached dashboard information from remaining the primary representation after a financial state change.

MongoDB remains the source of truth.

---

# 6. Transaction Idempotency

Financial transactions require protection against duplicate requests.

LedgerPay uses Redis to maintain idempotency state for transaction requests.

The protected endpoint is:

```http
POST /api/transactions/
```

The request includes an idempotency key:

```http
Idempotency-Key: unique-request-key
```

---

## Idempotency Flow

```text
Client Request
      ↓
Idempotency-Key
      ↓
Redis
      │
      ├── Key does not exist
      │       ↓
      │    PROCESSING
      │       ↓
      │   Transaction
      │       ↓
      │    COMPLETED
      │
      └── Key already exists
              ↓
        Prevent duplicate
        processing
```

The purpose is to ensure that retrying the same logical request does not create another financial transaction.

---

# 7. Why Idempotency Is Important

Transaction requests can be repeated because of:

- Network failures
- Request timeouts
- Browser retries
- Frontend retries
- Duplicate button clicks
- Client-side retry mechanisms

Without idempotency:

```text
Same Request
     ↓
Request 1 → Transaction Created
Request 2 → Transaction Created Again
```

This could result in duplicate financial operations.

With idempotency:

```text
Same Idempotency Key
        ↓
Redis Check
        ↓
Already Processed?
        ↓
Prevent Duplicate
```

---

# 8. Idempotency States

LedgerPay uses idempotency state to coordinate transaction processing.

Conceptually:

```text
NEW
 │
 ▼
PROCESSING
 │
 ▼
COMPLETED
```

A request that is already being processed or has already completed can be identified through its idempotency key.

The idempotency layer therefore provides protection against both repeated and concurrent requests.

---

# 9. Concurrent Transaction Requests

Idempotency is particularly important when multiple identical requests reach the backend at nearly the same time.

Example:

```text
                  Same Request
                       │
             ┌─────────┴─────────┐
             │                   │
          Request A           Request B
             │                   │
             └─────────┬─────────┘
                       ↓
                  Redis Check
                       │
                Atomic Operation
                       │
             ┌─────────┴─────────┐
             │                   │
          Process             Duplicate
          Request              Request
             │                   │
             ▼                   ▼
        Transaction          Rejected /
        Completed             Existing Result
```

Redis provides the shared state required to coordinate requests across application instances.

---

# 10. Rate Limiting

Redis is also used for rate limiting.

LedgerPay applies rate limiting to sensitive endpoints, including:

```text
Login
Password Reset
Transactions
```

The application uses dedicated middleware:

```text
loginLimiter
forgotPasswordLimiter
transactionLimiter
```

---

## Rate-Limiting Flow

```text
Client
  ↓
API Request
  ↓
Rate Limiter
  ↓
Redis
  │
  ├── Within Limit
  │       ↓
  │     Continue
  │
  └── Limit Exceeded
          ↓
       Reject Request
```

Redis allows rate-limit state to be shared rather than keeping request counters only inside one application process.

---

# 11. Why Redis-Based Rate Limiting?

A local in-memory rate limiter can become inconsistent when multiple backend instances are running.

For example:

```text
                Load Balancer
                     │
            ┌────────┴────────┐
            │                 │
        Backend A          Backend B
            │                 │
        Local Counter      Local Counter
```

Each server would maintain separate counters.

With Redis:

```text
                Load Balancer
                     │
            ┌────────┴────────┐
            │                 │
        Backend A          Backend B
            │                 │
            └────────┬────────┘
                     ↓
                   Redis
                     ↓
             Shared Rate State
```

This provides a centralized state store for distributed rate limiting.

---

# 12. Redis Failure Strategy

LedgerPay treats Redis failures differently depending on the feature involved.

### Caching

Dashboard caching is a performance optimization.

If Redis caching becomes unavailable, the application can fall back to retrieving the required data from MongoDB.

Conceptually:

```text
Redis Available
      ↓
Use Cache

Redis Unavailable
      ↓
Use MongoDB
```

This is a **fail-open** approach for caching.

---

### Idempotency

Transaction idempotency protects financial operations.

If Redis is unavailable and idempotency cannot be safely enforced, the transaction request should not proceed.

Conceptually:

```text
Transaction Request
       ↓
Redis unavailable
       ↓
Idempotency cannot be verified
       ↓
Reject transaction
```

This is a **fail-closed** approach for transaction idempotency.

The goal is to avoid processing a financial operation when duplicate protection cannot be guaranteed.

---

### Rate Limiting

Rate limiting is treated as a supporting protection layer.

The application's configured rate-limit failure behavior should be preserved consistently across deployments.

---

# 13. Redis and MongoDB Responsibilities

Redis and MongoDB have deliberately different responsibilities.

| Component | Responsibility |
|---|---|
| MongoDB | Persistent application data |
| MongoDB | Users |
| MongoDB | Accounts |
| MongoDB | Transactions |
| MongoDB | Ledger |
| MongoDB | KYC records |
| Redis | Dashboard cache |
| Redis | Idempotency state |
| Redis | Rate-limit state |

The key principle is:

```text
MongoDB = Source of Truth

Redis = Supporting Infrastructure
```

Redis should never be treated as the authoritative record for financial balances or transaction history.

---

# 14. Financial Data Consistency

For financial operations, the database remains authoritative.

The conceptual transaction flow is:

```text
Client
  ↓
Authentication
  ↓
Rate Limiting
  ↓
Idempotency
  ↓
Transaction Validation
  ↓
MongoDB Transaction
  ↓
Ledger Entries
  ↓
Cache Invalidation
  ↓
Response
```

Redis assists the process but does not replace the persistent financial records.

---

# 15. Cache Consistency

The dashboard cache is derived data.

Therefore:

```text
MongoDB
   │
   │ Source of Truth
   ▼
Dashboard Summary
   │
   ▼
Redis Cache
```

If the cache is missing or invalidated, the application can regenerate the dashboard summary from persistent data.

This keeps cached information subordinate to the database.

---

# 16. Redis Key Structure

LedgerPay uses structured Redis keys to separate different types of state.

Examples include:

```text
dashboard:user:<userId>
```

for dashboard cache data.

Idempotency keys follow the application's idempotency namespace, for example:

```text
idempotency:<userId>:<idempotencyKey>
```

Rate-limiting keys are maintained by the rate-limiting middleware.

The exact key structure should be treated as an implementation detail and can evolve without changing the API contract.

---

# 17. Redis Data Lifecycle

Redis data is temporary or derived depending on its purpose.

```text
                 Redis
                   │
        ┌──────────┼──────────┐
        │          │          │
      Cache    Idempotency   Rate Limit
        │          │          │
     Expire /   Complete /   Expire /
    Invalidate    Resolve     Reset
```

Redis entries should therefore not be treated as permanent financial records.

---

# 18. Redis Request Architecture

For a normal cached dashboard request:

```text
Client
  ↓
Express
  ↓
Authentication
  ↓
Dashboard Cache Middleware
  ↓
Redis
  │
  ├── HIT → Response
  │
  └── MISS
       ↓
    Controller
       ↓
    MongoDB
       ↓
    Redis
       ↓
    Response
```

For a transaction request:

```text
Client
  ↓
Express
  ↓
Authentication
  ↓
Transaction Rate Limiter
  ↓
Idempotency Middleware
  ↓
Redis
  ↓
Transaction Controller
  ↓
MongoDB
  ↓
Ledger
  ↓
Cache Invalidation
  ↓
Response
```

---

# 19. Redis Design Principles

LedgerPay follows these Redis design principles:

### 1. Redis is not the source of truth

Financial data remains in MongoDB.

### 2. Cache only derived data

Dashboard information can be regenerated from persistent data.

### 3. Protect financial operations

Transaction idempotency is enforced before processing financial requests.

### 4. Use shared state for distributed protection

Redis allows rate limiting and idempotency state to be shared across backend instances.

### 5. Fail according to risk

Performance features can fall back when possible, while financial safety mechanisms should fail closed when their guarantees cannot be maintained.

### 6. Keep Redis concerns separate

Caching, idempotency, and rate limiting serve different purposes and should remain logically separated.

---

# 20. Redis Configuration

The Redis connection is configured through environment variables.

Example local configuration:

```env
REDIS_URL=redis://localhost:6379
```

When running through Docker Compose, the Redis service can be addressed using the Docker service name rather than `localhost`.

Example concept:

```text
Backend Container
       ↓
Redis Service
       ↓
Redis Container
```

The actual value should be provided through the deployment environment rather than hard-coded into application source code.

---

# 21. Redis Testing

The following scenarios should be tested when validating the Redis integration.

### Connection Test

Verify that the backend successfully connects to Redis during startup.

Expected behavior:

```text
MongoDB connected
Redis connected
Server running
```

---

### Dashboard Cache MISS

First request:

```http
GET /api/accounts/getSummary
```

Expected flow:

```text
Request
 ↓
Redis MISS
 ↓
MongoDB
 ↓
Response
 ↓
Cache
```

---

### Dashboard Cache HIT

Repeat the same request:

```http
GET /api/accounts/getSummary
```

Expected flow:

```text
Request
 ↓
Redis HIT
 ↓
Response
```

---

### Cache Invalidation

Perform a successful transaction and then request:

```http
GET /api/accounts/getSummary
```

The affected cached dashboard data should be invalidated so that updated information can be generated.

---

### Idempotency Test

Send the same transaction request twice with the same:

```http
Idempotency-Key
```

The second request should not create another financial transaction.

---

### Concurrent Idempotency Test

Send identical transaction requests concurrently using the same idempotency key.

The idempotency layer should ensure that only one logical transaction is processed.

---

### Rate Limit Test

Send repeated requests to a rate-limited endpoint.

The endpoint should eventually reject requests once the configured limit is exceeded.

---

### Redis Failure Test

Temporarily make Redis unavailable and verify:

```text
Dashboard Cache
    ↓
Can fall back to MongoDB

Transaction Idempotency
    ↓
Should reject processing if protection
cannot be guaranteed
```

---

# 22. Redis Role in LedgerPay

Redis improves LedgerPay in three areas:

```text
Performance
    ↓
Dashboard Caching

Reliability
    ↓
Transaction Idempotency

Security / Protection
    ↓
Rate Limiting
```

MongoDB remains responsible for persistent financial state.

The resulting architecture is:

```text
                 LedgerPay
                     │
          ┌──────────┴──────────┐
          │                     │
       MongoDB                Redis
          │                     │
   Persistent Data       Supporting Layer
          │                     │
   ┌──────┼──────┐       ┌──────┼──────┐
   │      │      │       │      │      │
 Users Accounts Ledger  Cache Idempotency Rate Limit
          │
    Transactions
          │
         KYC
```

---

## Summary

Redis is an important infrastructure component of LedgerPay, but it is intentionally kept separate from the authoritative financial data layer.

```text
MongoDB
   ↓
Financial Source of Truth

Redis
   ├── Dashboard Cache
   ├── Transaction Idempotency
   └── Rate Limiting
```

This separation allows LedgerPay to improve performance and distributed request handling while preserving MongoDB as the authoritative store for financial records.