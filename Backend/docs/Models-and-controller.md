# System Architecture

## Architecture Pattern

MVC (Model-View-Controller)

Client
│
▼
Routes
│
▼
Controllers
│
▼
Models
│
▼
MongoDB

## Components

### Config
- Database connection

### Controllers
- Handle HTTP requests
- Validate input
- Coordinate business logic

### Models
- User
- Account
- Transaction
- Ledger
- TokenBlacklist

### Middleware
- JWT verification
- Route protection

### Services
- Email service

## Transaction Flow

Client
    │
    ▼
POST /transaction
    │
    ▼
Authentication Middleware
    │
    ▼
Transaction Controller
    │
    ├── Validate accounts
    ├── Create transaction
    ├── Create ledger entries
    └── Return response

## Balance Calculation

Balance = Total Credits − Total Debits

No balance field is stored permanently.

## Security

- Password hashing
- JWT authentication
- Token blacklist
- Immutable ledger
- Idempotency keys



<!-- # Authentication Model -->

## Registration

User provides:
- Name
- Email
- Password

Password is hashed using bcrypt before storage.

## Login

- Email verification
- Password comparison
- JWT generation

## Protected Routes

Authentication middleware:
- Reads Authorization header
- Verifies JWT
- Rejects invalid tokens

## Logout

JWT is stored in TokenBlacklist collection.

## Token Blacklist

Purpose:
- Prevent reuse of logged-out tokens

TTL:
- Automatically removed after 3 days

## Password Security

- bcrypt hashing
- Plain passwords never stored

## Future Improvements

- Refresh tokens
- Email verification
- Password reset


<!-- # Database Schema -->

## User Collection

Fields:
- _id
- name
- email
- password
- systemUser
- createdAt
- updatedAt

Indexes:
- email (unique)

---

## Account Collection

Fields:
- user
- status
- currency
- createdAt
- updatedAt

Statuses:
- ACTIVE
- FROZEN
- CLOSED

Indexes:
- user
- user + status

---

## Transaction Collection

Fields:
- fromAccount
- toAccount
- amount
- status
- idempotencyKey
- timestamps

Statuses:
- PENDING
- COMPLETED
- FAILED
- REVERSED

Indexes:
- fromAccount
- toAccount
- idempotencyKey (unique)

---

## Ledger Collection

Fields:
- account
- transaction
- amount
- type

Types:
- CREDIT
- DEBIT

Characteristics:
- Immutable
- Append-only

---

## TokenBlacklist Collection

Fields:
- token
- createdAt

TTL:
- 3 days


<!-- # Account Module -->

## Purpose

Represents bank accounts owned by users.

## Responsibilities

- Create accounts
- Associate accounts with users
- Maintain account status
- Calculate balances

## Status Values

ACTIVE
FROZEN
CLOSED

## Balance Calculation

Balance is computed dynamically from ledger entries.

Formula:

Balance = Credits - Debits

## Relationships

User
│
└── Multiple Accounts

Each account references exactly one user.

## Indexes

(user)

(user, status)

## Benefits

- No duplicated balance field
- Ledger remains source of truth



<!-- # Transaction Module -->

## Purpose

Represents movement of funds between accounts.

## Responsibilities

- Transfer money
- Store transaction metadata
- Prevent duplicate execution
- Track processing state

## Lifecycle

PENDING
    │
    ▼
COMPLETED

or

FAILED

or

REVERSED

## Fields

- fromAccount
- toAccount
- amount
- status
- idempotencyKey

## Idempotency

Every request requires a unique key.

Duplicate keys prevent accidental double processing.

## Relationships

One transaction may generate multiple ledger entries.


<!-- # Ledger System -->

## Purpose

Acts as the financial source of truth.

Every balance is derived from ledger entries.

## Principles

- Immutable
- Append-only
- Auditable

## Entry Types

DEBIT

Money leaving an account.

CREDIT

Money entering an account.

## Balance Formula

Balance = Σ(CREDITS) − Σ(DEBITS)

## Example

Transfer ₹500

Account A:
- DEBIT 500

Account B:
- CREDIT 500

## Modification Rules

Updates:
❌ Not allowed

Deletes:
❌ Not allowed

New inserts:
✅ Allowed

## Benefits

- Full audit history
- Easy reconciliation
- Financial consistency
- Historical 


