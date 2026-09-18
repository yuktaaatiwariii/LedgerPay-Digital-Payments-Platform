# LedgerPay API Reference

LedgerPay is a ledger-based digital payments platform built with Node.js, Express, MongoDB, Redis, and secure authentication mechanisms.

This document provides a reference for the currently implemented LedgerPay backend APIs.

---

# 1. Base URL

For local development:

```text
http://localhost:3000/api
```

All endpoints documented below are relative to the `/api` base path.

---

# 2. Authentication

LedgerPay uses access and refresh token-based authentication.

Protected routes use authentication middleware to verify the authenticated user.

Administrative and system-level operations use system/admin authorization middleware.

### Authentication mechanisms

* bcrypt password hashing
* Access tokens
* Refresh tokens
* HTTP-only cookies
* Authentication middleware
* System/admin authorization middleware
* Login rate limiting
* Password reset rate limiting
* Transaction rate limiting
* Token invalidation during logout

---

# 3. Authentication APIs

## 3.1 Register User

### Endpoint

```http
POST /api/auth/register
```

### Authentication

```text
Public
```

### Description

Registers a new LedgerPay user.

The password is securely hashed using bcrypt before the user is stored in MongoDB.

### Request Body

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123"
}
```

### Example Request

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123"
}
```

---

## 3.2 Login

### Endpoint

```http
POST /api/auth/login
```

### Authentication

```text
Public
```

### Middleware

```text
loginLimiter
```

### Description

Authenticates a user using their email and password.

The login process:

1. Finds the user.
2. Compares the provided password with the stored bcrypt hash.
3. Generates authentication tokens.
4. Establishes the authenticated session using cookies.

### Request Body

```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```

### Example Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "rahul@example.com",
  "password": "password123"
}
```

---

## 3.3 Refresh Access Token

### Endpoint

```http
POST /api/auth/refresh
```

### Authentication

```text
Refresh Token
```

### Description

Generates a new access token using the refresh token.

This allows an authenticated session to continue without requiring the user to log in again when the access token expires.

---

## 3.4 Logout

### Endpoint

```http
POST /api/auth/logout
```

### Authentication

```text
Authenticated User
```

### Description

Logs out the current user and invalidates the authentication session according to the application's token invalidation mechanism.

Authentication cookies are cleared during logout.

---

## 3.5 Forgot Password

### Endpoint

```http
POST /api/auth/forgot-password
```

### Authentication

```text
Public
```

### Middleware

```text
forgotPasswordLimiter
```

### Description

Starts the password recovery process for a user.

The endpoint is rate-limited to reduce abuse of the password-reset mechanism.

### Request Body

```json
{
  "email": "rahul@example.com"
}
```

---

## 3.6 Reset Password

### Endpoint

```http
POST /api/auth/reset-password/:token
```

### Authentication

```text
Password Reset Token
```

### Middleware

```text
forgotPasswordLimiter
```

### URL Parameter

```text
token
```

### Description

Resets the user's password using the password-reset token.

### Example

```http
POST /api/auth/reset-password/RESET_TOKEN
Content-Type: application/json

{
  "password": "newPassword123"
}
```

---

## 3.7 Get Current User

### Endpoint

```http
GET /api/auth/me
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
```

### Description

Returns information about the currently authenticated user.

### Example Response

```json
{
  "success": true,
  "user": {
    "email": "rahul@example.com",
    "role": "USER"
  }
}
```

---

# 4. Account APIs

All account APIs require an authenticated user.

---

## 4.1 Create Account

### Endpoint

```http
POST /api/accounts/
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
```

### Description

Creates a new account associated with the authenticated user.

---

## 4.2 Get User Accounts

### Endpoint

```http
GET /api/accounts/
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
```

### Description

Returns the accounts associated with the authenticated user.

---

## 4.3 Get Account Balance

### Endpoint

```http
GET /api/accounts/balance/:accountId
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
```

### URL Parameter

```text
accountId
```

### Description

Returns the balance associated with the specified account.

LedgerPay uses ledger entries as the financial source of truth.

Conceptually:

```text
Balance = Total Credits - Total Debits
```

---

## 4.4 Get Account Summary

### Endpoint

```http
GET /api/accounts/getSummary
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
cacheDashboard
```

### Description

Returns account and dashboard summary information for the authenticated user.

Redis caching is used to reduce repeated database queries.

After relevant financial operations, cached dashboard data can be invalidated so that updated information is returned.

---

# 5. Transaction APIs

Transactions represent financial operations within LedgerPay.

Financial transactions create corresponding ledger entries.

---

## 5.1 Create Transaction

### Endpoint

```http
POST /api/transactions/
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
transactionLimiter
idempotencyMiddleware
```

### Request Body

```json
{
  "fromAccount": "account_id_1",
  "toAccount": "account_id_2",
  "amount": 1000
}
```

### Required Header

```http
Idempotency-Key: unique-request-key
```

### Description

Creates a financial transaction between two accounts.

Before processing the transaction, the request passes through:

1. Authentication
2. Rate limiting
3. Idempotency checking
4. Request validation
5. Transaction processing
6. Ledger entry creation
7. Database persistence

### Processing Flow

```text
Client
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
Validation
  │
  ▼
Transaction Processing
  │
  ▼
Ledger Entries
  │
  ▼
MongoDB
  │
  ▼
Cache Invalidation
  │
  ▼
Response
```

### Idempotency

The `Idempotency-Key` identifies a unique transaction request.

If the same key is submitted again, the application can detect the duplicate request and prevent duplicate financial processing.

This protects against:

* Duplicate button clicks
* Network retries
* Request timeouts
* Client retries
* Multiple submissions

---

## 5.2 Create Initial Funds

### Endpoint

```http
POST /api/transactions/system/initial-funds
```

### Authentication

```text
Admin/System
```

### Middleware

```text
authSystemMiddleware
```

### Description

Creates a system-level transaction that adds initial funds to an account.

This operation is restricted to authorized system/admin users.

### Example Request

```json
{
  "toAccount": "account_id",
  "amount": 5000
}
```

---

## 5.3 Get Transaction History

### Endpoint

```http
GET /api/transactions/history/:accountId
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
```

### URL Parameter

```text
accountId
```

### Description

Returns transaction history associated with the specified account.

---

## 5.4 Get All Accounts

### Endpoint

```http
GET /api/transactions/getAllAccounts
```

### Authentication

```text
Admin/System
```

### Middleware

```text
authSystemMiddleware
```

### Description

Returns account information for authorized administrative/system operations.

---

## 5.5 View All Users

### Endpoint

```http
GET /api/transactions/viewAllUsers
```

### Authentication

```text
Admin/System
```

### Middleware

```text
authSystemMiddleware
```

### Description

Returns user information for authorized administrative/system operations.

---

## 5.6 Get Transfer Accounts

### Endpoint

```http
GET /api/transactions/transferAccounts
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
```

### Description

Returns accounts that can be selected as transfer destinations.

---

# 6. KYC APIs

LedgerPay provides a KYC workflow for identity-document submission and verification.

KYC documents are stored using Cloudinary, while KYC metadata and verification status are stored in MongoDB.

### KYC statuses

```text
PENDING
APPROVED
REJECTED
```

---

## 6.1 Submit KYC

### Endpoint

```http
POST /api/kyc/
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
```

### Content Type

```text
multipart/form-data
```

### File Field

```text
document
```

### Description

Submits a KYC application along with the required document.

### Processing Flow

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
                           PENDING
```

---

## 6.2 Get My KYC

### Endpoint

```http
GET /api/kyc/me
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
```

### Description

Returns the KYC application associated with the authenticated user.

The response can include the KYC status and stored document information.

---

## 6.3 Resubmit KYC

### Endpoint

```http
PUT /api/kyc/resubmit
```

### Authentication

```text
Required
```

### Middleware

```text
authMiddleware
```

### Content Type

```text
multipart/form-data
```

### File Field

```text
document
```

### Description

Allows an authenticated user to submit a new KYC document when resubmission is required.

---

# 7. Admin KYC APIs

Administrative KYC APIs are protected using system/admin authorization.

### Middleware

```text
authSystemMiddleware
```

Only authorized administrative/system users should be able to access these endpoints.

---

## 7.1 Get KYC Applications

### Endpoint

```http
GET /api/admin/kyc/
```

### Authentication

```text
Admin/System
```

### Middleware

```text
authSystemMiddleware
```

### Description

Returns KYC applications available for administrative review.

---

## 7.2 Get KYC Application

### Endpoint

```http
GET /api/admin/kyc/:id
```

### Authentication

```text
Admin/System
```

### Middleware

```text
authSystemMiddleware
```

### URL Parameter

```text
id
```

### Description

Returns a specific KYC application for administrative review.

---

## 7.3 Approve KYC

### Endpoint

```http
PATCH /api/admin/kyc/:id/approve
```

### Authentication

```text
Admin/System
```

### Middleware

```text
authSystemMiddleware
```

### URL Parameter

```text
id
```

### Description

Approves the specified KYC application.

The KYC status changes to:

```text
APPROVED
```

---

## 7.4 Reject KYC

### Endpoint

```http
PATCH /api/admin/kyc/:id/reject
```

### Authentication

```text
Admin/System
```

### Middleware

```text
authSystemMiddleware
```

### URL Parameter

```text
id
```

### Description

Rejects the specified KYC application.

The KYC status changes to:

```text
REJECTED
```

---

# 8. Middleware Reference

LedgerPay uses middleware to provide authentication, authorization, rate limiting, idempotency, and caching.

| Middleware              | Purpose                                   |
| ----------------------- | ----------------------------------------- |
| `authMiddleware`        | Authenticates normal users                |
| `authSystemMiddleware`  | Protects administrative/system operations |
| `loginLimiter`          | Limits login attempts                     |
| `forgotPasswordLimiter` | Limits password-reset requests            |
| `transactionLimiter`    | Limits transaction requests               |
| `idempotencyMiddleware` | Prevents duplicate transaction processing |
| `cacheDashboard`        | Provides Redis-backed dashboard caching   |

---

# 9. Redis-Backed API Features

Redis is used by the API for supporting functionality.

```text
Redis
 ├── Rate Limiting
 ├── Transaction Idempotency
 └── Dashboard Caching
```

MongoDB remains the persistent source of truth for application and financial data.

### Rate Limiting

Sensitive endpoints use Redis-backed rate limiting to control excessive requests.

### Idempotency

Transaction requests use Redis to maintain idempotency state.

### Dashboard Caching

Dashboard summary requests can use Redis to reduce repeated database queries.

---

# 10. Ledger-Based Transactions

LedgerPay uses a ledger-based accounting model.

A transaction results in ledger entries representing the movement of funds.

```text
Transaction
     │
     ├── Debit Entry
     │
     └── Credit Entry
```

The conceptual balance calculation is:

```text
Balance = Total Credits - Total Debits
```

The ledger provides a persistent history of financial operations.

---

# 11. API Request Flow

A typical authenticated financial request follows this flow:

```text
Client
  │
  ▼
Express API
  │
  ▼
Authentication
  │
  ▼
Authorization
  │
  ▼
Rate Limiting
  │
  ▼
Idempotency
  │
  ▼
Validation
  │
  ▼
Controller
  │
  ▼
Business Logic
  │
  ├──────────────► Redis
  │
  ▼
MongoDB
  │
  ▼
Response
```

---

# 12. Common HTTP Status Codes

| Status Code | Meaning                                         |
| ----------- | ----------------------------------------------- |
| `200`       | Request completed successfully                  |
| `201`       | Resource or operation successfully created      |
| `400`       | Invalid request or validation error             |
| `401`       | Authentication required or invalid              |
| `403`       | Insufficient authorization                      |
| `404`       | Resource not found                              |
| `409`       | Resource/request conflict                       |
| `429`       | Rate limit exceeded                             |
| `500`       | Internal server error                           |
| `503`       | Required infrastructure temporarily unavailable |

> Actual status codes may vary depending on the controller and specific error condition.

---

# 13. Complete Endpoint Reference

| Method  | Endpoint                                 | Access        | Protection                                                      |
| ------- | ---------------------------------------- | ------------- | --------------------------------------------------------------- |
| `POST`  | `/api/auth/register`                     | Public        | —                                                               |
| `POST`  | `/api/auth/login`                        | Public        | `loginLimiter`                                                  |
| `POST`  | `/api/auth/refresh`                      | Refresh Token | Refresh authentication                                          |
| `POST`  | `/api/auth/logout`                       | User          | Authentication                                                  |
| `POST`  | `/api/auth/forgot-password`              | Public        | `forgotPasswordLimiter`                                         |
| `POST`  | `/api/auth/reset-password/:token`        | Reset Token   | `forgotPasswordLimiter`                                         |
| `GET`   | `/api/auth/me`                           | User          | `authMiddleware`                                                |
| `POST`  | `/api/accounts/`                         | User          | `authMiddleware`                                                |
| `GET`   | `/api/accounts/`                         | User          | `authMiddleware`                                                |
| `GET`   | `/api/accounts/balance/:accountId`       | User          | `authMiddleware`                                                |
| `GET`   | `/api/accounts/getSummary`               | User          | `authMiddleware`, `cacheDashboard`                              |
| `POST`  | `/api/transactions/`                     | User          | `authMiddleware`, `transactionLimiter`, `idempotencyMiddleware` |
| `POST`  | `/api/transactions/system/initial-funds` | Admin/System  | `authSystemMiddleware`                                          |
| `GET`   | `/api/transactions/history/:accountId`   | User          | `authMiddleware`                                                |
| `GET`   | `/api/transactions/getAllAccounts`       | Admin/System  | `authSystemMiddleware`                                          |
| `GET`   | `/api/transactions/viewAllUsers`         | Admin/System  | `authSystemMiddleware`                                          |
| `GET`   | `/api/transactions/transferAccounts`     | User          | `authMiddleware`                                                |
| `POST`  | `/api/kyc/`                              | User          | `authMiddleware`, Cloudinary upload                             |
| `GET`   | `/api/kyc/me`                            | User          | `authMiddleware`                                                |
| `PUT`   | `/api/kyc/resubmit`                      | User          | `authMiddleware`, Cloudinary upload                             |
| `GET`   | `/api/admin/kyc/`                        | Admin/System  | `authSystemMiddleware`                                          |
| `GET`   | `/api/admin/kyc/:id`                     | Admin/System  | `authSystemMiddleware`                                          |
| `PATCH` | `/api/admin/kyc/:id/approve`             | Admin/System  | `authSystemMiddleware`                                          |
| `PATCH` | `/api/admin/kyc/:id/reject`              | Admin/System  | `authSystemMiddleware`                                          |

---

# 14. API Design Principles

## REST-style Endpoints

LedgerPay uses HTTP methods and resource-oriented endpoints to organize API operations.

```text
GET     → Retrieve
POST    → Create
PUT     → Update/Resubmit
PATCH   → Partial State Change
```

## Middleware-Based Security

Authentication, authorization, rate limiting, idempotency, and caching are handled through middleware where appropriate.

## Backend Validation

The backend is responsible for validating requests and enforcing business rules.

Client-side validation should not be treated as a security boundary.

## Ledger as Financial Source of Truth

Financial activity is represented through ledger entries rather than allowing the frontend to directly modify financial balances.

## Redis as Supporting Infrastructure

Redis is used for:

```text
Caching
Rate Limiting
Idempotency
```

MongoDB remains the persistent source of truth.

---

# 15. API Security Summary

LedgerPay protects API operations through multiple layers:

```text
Password Hashing
       ↓
Authentication
       ↓
Access / Refresh Tokens
       ↓
HTTP-only Cookies
       ↓
Authorization
       ↓
Rate Limiting
       ↓
Idempotency
       ↓
Backend Validation
       ↓
Ledger Processing
       ↓
MongoDB Persistence
```

This layered approach protects authentication, financial transactions, administrative operations, and KYC workflows.

---

# 16. Current API Scope

The current LedgerPay API provides:

* User registration
* User login
* Access and refresh token authentication
* Logout
* Password recovery
* Current-user information
* Account creation
* Account retrieval
* Account balance
* Dashboard summary
* Financial transactions
* Transaction history
* System-level initial funds
* Transfer account lookup
* Redis-backed rate limiting
* Redis-backed transaction idempotency
* Redis-backed dashboard caching
* KYC document submission
* KYC resubmission
* KYC status retrieval
* Cloudinary document storage
* Administrative KYC review
* KYC approval
* KYC rejection
* Administrative user/account operations

---

# 17. API Architecture Summary

```text
                         LedgerPay API
                              │
                              ▼
                         Express Server
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
         Auth Routes     Account Routes   Transaction Routes
              │               │               │
              └───────────────┼───────────────┘
                              │
                         Middleware
                              │
                ┌─────────────┼─────────────┐
                │             │             │
          Authentication  Rate Limit   Idempotency
                │             │             │
                └─────────────┼─────────────┘
                              │
                         Controllers
                              │
                    ┌─────────┴─────────┐
                    │                   │
                  Redis              MongoDB
                    │                   │
               Supporting          Persistent
                Services              Data
                    │                   │
          ┌─────────┼─────────┐         │
          │         │         │         │
        Cache    Rate Limit  Idempotency │
                                        │
                             ┌──────────┼──────────┐
                             │          │          │
                           Users     Accounts    Ledger
                             │          │          │
                             └──────────┼──────────┘
                                        │
                                   Transactions
```

---

# 18. Future API Extensions

The current API architecture can be extended with additional LedgerPay platform capabilities.

Potential future modules include:

```text
Audit Logs
Transaction Queues
Fraud Detection
RBAC Expansion
Offline Transaction Relay
Hybrid Cryptography
KYC Enhancements
Swagger / OpenAPI
Automated Testing
```

These features should be documented as implemented only after they are added to the application.

---

# 19. Final API Overview

LedgerPay currently follows this high-level API flow:

```text
                    Client
                       │
                       ▼
                  REST API
                       │
                       ▼
                Authentication
                       │
                       ▼
                 Authorization
                       │
                       ▼
              Rate Limiting
                       │
                       ▼
                Idempotency
                       │
                       ▼
                 Validation
                       │
                       ▼
                Business Logic
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
            Redis            MongoDB
              │                 │
      Cache / Security    Persistent Data
                                │
                                ▼
                         Ledger Records
```

The API is designed to keep security and financial logic on the backend while using Redis for high-speed supporting operations and MongoDB as the persistent source of truth.
