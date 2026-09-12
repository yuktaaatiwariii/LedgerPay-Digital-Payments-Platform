# Redis Testing Guide

This document provides Postman / cURL instructions to verify the Redis integrations in the Ledger-Based Banking System.

Ensure the backend server is running and Redis is active on `localhost:6379`.

### TEST 1: Redis connection
**Action**: Start the Node.js backend (`npm run dev`).
**Expected**: Terminal logs `Redis connected successfully.` and `Redis client is ready.`

### TEST 2 & 3: Dashboard cache MISS & HIT
**Action**:
```bash
curl -X GET http://localhost:3000/api/accounts/getSummary \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```
**Expected (First Request - MISS)**: Terminal logs `Redis cache MISS for dashboard: ...`
**Expected (Second Request - HIT)**: Terminal logs `Redis cache HIT for dashboard: ...`. Response is faster.

### TEST 4: Cache invalidation
**Action**: Perform a valid transfer (see TEST 5), then immediately check the dashboard again.
**Expected**: Terminal logs `Dashboard cache invalidated for user: ...` during the transfer. The next dashboard request logs a `MISS`.

### TEST 5: Idempotency first request
**Action**:
```bash
curl -X POST http://localhost:3000/api/transactions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
     -H "Idempotency-Key: abc-123-xyz-001" \
     -d '{"fromAccount": "<ID>", "toAccount": "<ID>", "amount": 10}'
```
**Expected**: Terminal logs `Idempotency key created: abc-123-xyz-001`. HTTP 201 response. MongoDB creates a ledger entry.

### TEST 6: Idempotency duplicate request
**Action**: Resend the exact same request from TEST 5.
**Expected**: Terminal logs `Idempotency duplicate detected, returning cached response...`. HTTP 201 response with the exact same body. MongoDB does **not** create a second transaction.

### TEST 7: Concurrent duplicate requests
**Action**: Send two identical requests at the exact same millisecond.
**Expected**: One succeeds (HTTP 201), the other gets HTTP 409 Conflict (`Duplicate request is already processing.`).

### TEST 8 & 9: Rate limit under allowed threshold & Exceeded
**Action**:
```bash
for i in {1..6}; do
   curl -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com", "password":"password"}'
done
```
**Expected (Under limit)**: Standard 401 or 200 responses.
**Expected (Exceeded - 6th request)**: HTTP 429 Too Many Requests. Response: `Too many requests. Please try again later.` Terminal/Network headers show `RateLimit-Remaining: 0`.

### TEST 10: Redis failure behavior
**Action**: Stop your local Redis server (`sudo service redis-server stop` or close the Docker container).
**Action 2**: Try to hit `/api/accounts/getSummary` and `/api/transactions` (Transfer).
**Expected (Dashboard)**: Succeeds (Fail open). Logs `Redis unavailable, bypassing cache...`.
**Expected (Transfer)**: Fails (Fail closed). HTTP 503 `Service temporarily unavailable. Cannot guarantee idempotency.`

---
**Verification via redis-cli**:
Run `redis-cli` in your terminal.
- Type `keys *` to see all keys.
- You should see keys like `dashboard:user:<id>`, `idempotency:<id>:abc-123`, and `rl:...` (rate limits).
