# 📚 API Reference - This document explains all the APIs available in the 
**LedgerPay – A Ledger-Based Digital Payments Platform.**

**Base URL** - /api

Most APIs require the user to be logged in and provide a valid JWT token. Protected routes use authentication middleware to verify the user's identity.

---

# 🔐 Authentication APIs

Authentication APIs allow users to register, log in, and log out of the system.

---

## 1. Register a New User - Creates a new user account in the system.

### Endpoint

```http
POST /api/auth/register
```

### Request Body

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123"
}
```

### What happens?

- The server validates the input.
- The password is securely hashed using bcrypt.
- A new user document is stored in MongoDB.

### Success Response

```json
{
  "message": "User registered successfully"
}
```

---

## 2. Login - Logs an existing user into the application.

### Endpoint

```http
POST /api/auth/login
```

### Request Body

```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```

### What happens?

- The email is searched in the database.
- The password is compared with the stored hash.
- If valid, the server generates a JWT token.

### Success Response

```json
{
  "token": "<jwt_token>"
}
```

---

## 3. Logout - Logs the user out by adding the current JWT token to the token blacklist.

### Endpoint

```http
POST /api/auth/logout
```

### What happens?

- The token is extracted.
- The token is stored in the blacklist collection.
- Blacklisted tokens are rejected in future requests.

### Success Response

```json
{
  "message": "Logged out successfully"
}
```

---

# 🏦 Account APIs -
 Account APIs are used to create and manage bank accounts.

---

## 1. Create a Bank Account - Creates a new bank account for the authenticated user.

### Endpoint

```http
POST /api/accounts
``` 

### Authentication Required - ✅ Yes

### What happens?

- The logged-in user becomes the owner of the account.
- The account is created with status `ACTIVE`.
- The default currency is `INR` unless another supported currency is provided.

### Success Response

```json
{
  "message": "Account created successfully"
}
```

---

## 2. Get All Accounts - Returns every bank account owned by the currently logged-in user.

### Endpoint

```http
GET /api/accounts
```

### Authentication Required - ✅ Yes

### What happens?

- The server identifies the logged-in user.
- All accounts linked to that user are returned.

### Example Response

```json
[
  {
    "_id": "64abc123",
    "status": "ACTIVE",
    "currency": "INR"
  }
]
```

---

## 3. Get Account Balance - Returns the current balance of a specific account.

### Endpoint

```http
GET /api/accounts/balance/:accountId
```

### Authentication Required - ✅ Yes

### URL Parameter - accountId 

How is the balance calculated?

The project does **not** store the balance directly in the account document.

Instead, it calculates:

```
Balance = Total Credits − Total Debits
```

using all ledger entries associated with that account.

### Example Response

```json
{
  "balance": 12500
}
```

---

# 💸 Transaction APIs

Transaction APIs handle the movement of money between accounts.

---

## 1. Create a Transaction - Transfers money from one account to another

### Endpoint

```http
POST /api/transactions

## Authentication Required - ✅ Yes

### Example Request

```json
{
  "fromAccount": "account_id_1",
  "toAccount": "account_id_2",
  "amount": 1000,
  "idempotencyKey": "transfer-001"
}
```

### What happens?

1. The user is authenticated.
2. The request is validated.
3. A transaction record is created.
4. Ledger entries are generated.
5. The transaction is completed.

### Success Response

```json
{
  "message": "Transaction completed successfully"
}
```

---

## 2. Create Initial Funds

### Endpoint

```http
POST /api/transactions/system/initial-funds
```

### Description

Adds initial funds to an account through a system-level operation.

This endpoint is intended for internal or administrative use and is protected by a special middleware.

### Authentication Required

✅ Yes (System Authentication)

### Example Request

```json
{
  "toAccount": "account_id",
  "amount": 5000,
  "idempotencyKey": "initial-funds-001"
}
```

### Success Response

```json
{
  "message": "Initial funds added successfully"
}
```

---

# 🔒 Protected Routes

The following endpoints require a valid JWT token:

| Method | Endpoint |
| -------- | ------------------------------- |
| POST | `/api/auth/logout` |
| POST | `/api/accounts` |
| GET | `/api/accounts` |
| GET | `/api/accounts/balance/:accountId` |
| POST | `/api/transactions` |
| POST | `/api/transactions/system/initial-funds` |

---

# 📝 Important Notes

- Passwords are hashed before being stored in the database.
- JWT tokens are used to authenticate protected routes.
- Logged-out tokens are stored in a blacklist so they cannot be reused.
- Account balances are **calculated from ledger entries**, not stored directly.
- Ledger records are immutable, meaning they cannot be edited or deleted after creation.
- Every transaction includes an `idempotencyKey` to help prevent accidental duplicate processing.

---

# 🔄 Typical Flow

A typical user journey looks like this:

1. Register a new account.
2. Log in to receive a JWT token.
3. Create one or more bank accounts.
4. Perform transactions between accounts.
5. The system records ledger entries for every transfer.
6. When checking a balance, the system calculates it from the ledger history.
7. Log out to invalidate the current JWT token.