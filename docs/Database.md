# LedgerPay Database Design

## 1. Overview

LedgerPay uses **MongoDB** as its primary persistent database.

The database stores application identity, accounts, transactions, ledger records, refresh-token state, and KYC information.

The most important design decision is that **the ledger is the source of truth for financial activity**.

Account balances are derived from ledger entries rather than being treated as an independently maintained financial value.

---

# 2. Database Technology

| Technology | Purpose |
|---|---|
| MongoDB | Primary application database |
| Mongoose | MongoDB object modeling and schema management |
| MongoDB Atlas | Cloud database environment |
| MongoDB Compass | Database inspection and development |
| Redis | Temporary cache and request coordination |

---

# 3. Data Model Overview

The major entities are:

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ↓             ↓             ↓
         Accounts      RefreshToken      KYC
             │
             ↓
        Transactions
             │
             ↓
          Ledger
```

The relationships can be summarized as:


User
 ├── Accounts
 ├── Refresh Tokens
 └── KYC

Account
 └── Transactions / Ledger Entries

Transaction
 └── Ledger Entries

---

# 4. User Model

**File:**

```text
src/models/user.model.js
```

The User model represents application users and their authentication identity.

### Responsibilities

- Store user identity information
- Store authentication credentials
- Associate users with their accounts
- Store user role/system authorization information
- Maintain user timestamps

### Core Data

The user entity contains information such as:

| Field | Purpose |
|---|---|
| `_id` | Unique MongoDB identifier |
| `name` | User's display/name information |
| `email` | Unique login identifier |
| `password` | bcrypt password hash |
| `systemUser` | System-level user identification where applicable |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last update timestamp |

### Security

Passwords are never stored as plaintext.

The authentication flow is:

```text
Plain Password
      ↓
bcrypt hashing
      ↓
Password Hash
      ↓
MongoDB
```

During login:

```text
Submitted Password
       ↓
bcrypt comparison
       ↓
Stored Password Hash
       ↓
Authentication Result
```

The email field is indexed/validated to support unique user identification.

---

# 5. Account Model

**File:**

```text
src/models/account.model.js
```

An Account represents a financial account belonging to a user.

A user can have one or more accounts.

```text
User
 │
 ├── Account A
 ├── Account B
 └── Account C
```

### Core Data

| Field | Purpose |
|---|---|
| `_id` | Unique account identifier |
| `user` | Reference to account owner |
| `status` | Current account state |
| `currency` | Account currency |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last update timestamp |

### Account Status

The account model supports account states such as:

```text
ACTIVE
FROZEN
CLOSED
```

These states allow application logic to determine whether an account can participate in financial operations.

---

# 6. Account Balance Design

LedgerPay does not rely on a manually updated account balance as the financial source of truth.

Instead:

Ledger Entries
      ↓
Aggregate Credits
      ↓
Aggregate Debits
      ↓
Calculate Balance

The balance is:

```text
Balance = Total Credits − Total Debits
```

# 7. Transaction Model

**File:**

```text
src/models/transaction.model.js
```

The Transaction model represents a financial operation between accounts.

A transfer contains information identifying:

- Source account
- Destination account
- Amount
- Transaction status
- Idempotency key
- Timestamps

### Core Data

| Field | Purpose |
|---|---|
| `_id` | Unique transaction identifier |
| `fromAccount` | Account sending funds |
| `toAccount` | Account receiving funds |
| `amount` | Transfer amount |
| `status` | Transaction lifecycle state |
| `idempotencyKey` | Duplicate-request protection |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last update timestamp |

---

# 8. Transaction Lifecycle

Transactions can move through states representing their processing lifecycle.

```text
             ┌──────────────┐
             │    PENDING   │
             └──────┬───────┘
                    │
              Processing
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
     COMPLETED              FAILED
          │
          ↓
      REVERSED
   (when applicable)
```

The exact transition depends on the result of transaction processing.

A successful financial operation results in the corresponding ledger entries being committed.

---

# 9. Idempotency Key

Each protected financial request can contain an idempotency key.

Example:

```text
Idempotency-Key: transfer-001
```

The key allows the system to recognize repeated requests.

```text
First Request
     ↓
New Idempotency Key
     ↓
Process Transaction
     ↓
Store Result
```

Repeated request:

```text
Same Idempotency Key
       ↓
Existing Request Detected
       ↓
Do Not Create Another Financial Operation
```

Redis is used for fast coordination of idempotency state, while MongoDB stores the actual financial transaction.

This separation is important:

```text
Redis
 └── Request coordination

MongoDB
 └── Financial record
```

---

# 10. Ledger Model

**File:**

```text
src/models/ledger.model.js
```

The Ledger model represents individual financial movements.

Ledger records are the core accounting records of LedgerPay.

### Core Data

| Field | Purpose |
|---|---|
| `_id` | Unique ledger entry identifier |
| `account` | Account affected by the entry |
| `transaction` | Related transaction |
| `amount` | Amount represented by the entry |
| `type` | CREDIT or DEBIT |

### Entry Types

```text
CREDIT
DEBIT
```

A:

```text
CREDIT
```

represents money entering an account.

A:

```text
DEBIT
```

represents money leaving an account.

---

# 11. Double-Entry Ledger Concept

LedgerPay represents a transfer using corresponding debit and credit entries.

For a ₹500 transfer:

```text
Transaction: ₹500

Source Account
      ↓
DEBIT ₹500

Destination Account
      ↓
CREDIT ₹500
```

Therefore:

```text
Total Debit  = ₹500
Total Credit = ₹500
```

The two entries represent the two sides of the same financial movement.

---

# 12. Ledger Immutability

Ledger records represent historical financial events.

The intended modification model is:

```text
INSERT  → Allowed
UPDATE  → Not used for normal ledger correction
DELETE  → Not used for normal ledger correction
```

Instead of rewriting historical financial records, subsequent financial events can represent corrections or reversals where the business logic supports them.

This provides:

- Historical traceability
- Easier reconciliation
- Auditability
- Clear transaction history
- Reduced risk of silently changing financial history

---

# 13. Transaction and Ledger Relationship

A transaction can generate multiple ledger entries.

```text
Transaction
     │
     ├── Ledger Entry
     │      └── DEBIT
     │
     └── Ledger Entry
            └── CREDIT
```

For example:

```text
Transaction T001
Amount: ₹1,000

        ┌──────────────────────┐
        │      Transaction      │
        │       T001            │
        │       ₹1,000          │
        └──────────┬───────────┘
                   │
          ┌────────┴────────┐
          ↓                 ↓
     Ledger Entry       Ledger Entry
     DEBIT ₹1,000       CREDIT ₹1,000
     Account A          Account B
```

This relationship allows the transaction history and accounting history to be connected.

---

# 14. MongoDB Transactions

Financial writes are processed using MongoDB database transactions where multiple related records need to remain consistent.

A transfer can conceptually perform:

```text
BEGIN
  │
  ├── Create Transaction
  │
  ├── Create Debit Ledger Entry
  │
  ├── Create Credit Ledger Entry
  │
  └── COMMIT
```

If an operation fails:

```text
BEGIN
  │
  ├── Transaction
  ├── Ledger Entry
  ├── Error
  │
  └── ROLLBACK
```

The objective is to avoid situations where a transaction record exists without its corresponding ledger entries, or where only one side of the accounting operation is recorded.

---

# 15. Refresh Token Model

**File:**

```text
src/models/refreshToken.model.js
```

The RefreshToken model stores refresh-token-related authentication state.

Refresh tokens support the application's access-token renewal mechanism.

Conceptually:

```text
Access Token
     │
     └── Shorter-lived authentication

Refresh Token
     │
     └── Used to obtain a new access token
```

Keeping refresh-token state separately allows token lifecycle and revocation behavior to be managed independently from the User document.

The exact expiration and revocation rules are controlled by the authentication implementation and environment configuration.

---

# 16. KYC Model

**File:**

```text
src/models/kyc.model.js
```

The KYC model stores KYC submission metadata and verification state.

KYC is associated with the user submitting the documents.

### Purpose

- Track KYC submissions
- Store document-related metadata
- Store uploaded document references/URLs
- Track administrative review
- Track verification status
- Support resubmission after rejection

### KYC Lifecycle

```text
PENDING
   │
   ├──────────────→ APPROVED
   │
   └──────────────→ REJECTED
                         │
                         ↓
                      RESUBMIT
                         │
                         ↓
                      PENDING
```

The actual document file is stored in Cloudinary, while MongoDB stores the application-level KYC information and reference to the uploaded document.

---

# 17. KYC Document Storage

KYC document storage is separated into two responsibilities:

```text
                KYC Upload
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
     Cloudinary               MongoDB
          │                     │
     Actual file          Metadata / URL /
                          verification state
```

This prevents large uploaded files from becoming part of the MongoDB document storage itself while keeping the application able to associate each document with its owner and verification workflow.

---

# 18. Entity Relationships

The main relationships are:

```text
USER
 │
 ├───────────────┐
 │               │
 ↓               ↓
ACCOUNT         KYC
 │
 │
 ↓
TRANSACTION
 │
 ↓
LEDGER
```

Authentication:

```text
USER
 │
 ↓
REFRESH TOKEN
```

More specifically:

```text
User
 │
 ├── 1:N Accounts
 │
 ├── 1:N Refresh Tokens
 │
 └── KYC Record(s) / KYC workflow

Account
 │
 └── Financial activity
        │
        ├── Transactions
        └── Ledger Entries

Transaction
 │
 └── Ledger Entries
```

The exact cardinality of KYC records depends on the current application workflow and should follow the Mongoose schema constraints.

---

# 19. Indexing Strategy

Indexes are used to improve lookup performance and enforce uniqueness where required.

Important indexed access patterns include:

### User

```text
email
```

Used for authentication and unique user identification.

### Account

```text
user
user + status
```

Used to retrieve accounts belonging to a user and filter them by state.

### Transaction

Relevant transaction/account and idempotency lookup fields are indexed to support:

- Transaction retrieval
- Account-related transaction queries
- Idempotency checks
- Duplicate prevention

### Token State

Refresh-token records can be indexed according to the token lookup and expiration/revocation strategy.

### Important Principle

Indexes should support actual query patterns rather than being added indiscriminately.

---

# 20. Data Consistency Strategy

LedgerPay separates three concerns:

```text
                    Financial Correctness
                            │
                            ↓
                         MongoDB
                            │
                  ┌─────────┴─────────┐
                  ↓                   ↓
             Transactions          Ledger
                  │                   │
                  └─────────┬─────────┘
                            ↓
                       Account State


                    Performance / Coordination
                            │
                            ↓
                          Redis
                  ┌─────────┼─────────┐
                  ↓         ↓         ↓
                Cache   Idempotency Rate Limit
```

MongoDB is authoritative.

Redis can be cleared or restarted without becoming the permanent record of financial activity.

---

# 21. Financial Consistency Example

Consider a transfer of ₹2,000 from Account A to Account B.

### Before

```text
Account A = ₹10,000
Account B = ₹5,000
```

### Transfer

```text
A → B
₹2,000
```

### Ledger Entries

```text
Account A
DEBIT  ₹2,000

Account B
CREDIT ₹2,000
```

### Derived Balances

```text
Account A = ₹8,000
Account B = ₹7,000
```

The transaction and ledger entries are committed as one database operation.

---

# 22. Why Ledger-Based Accounting?

A direct balance-update model might look like:

```text
Account.balance -= amount
Account.balance += amount
```

While this can be simple, it does not by itself provide a complete history of how the balance changed.

Ledger-based accounting instead records:

```text
Financial Event
      ↓
Ledger Entry
      ↓
Historical Record
      ↓
Balance Calculation
```

Benefits include:

- Traceable financial history
- Easier reconciliation
- Clear debit/credit representation
- Better auditability
- Ability to derive account state from financial events
- Reduced dependence on a mutable balance field

---

# 23. Database Responsibility Summary

| Model | Responsibility |
|---|---|
| `user.model.js` | User identity and authentication data |
| `account.model.js` | Financial account ownership and state |
| `transaction.model.js` | Financial operation records |
| `ledger.model.js` | Debit/credit accounting entries |
| `refreshToken.model.js` | Refresh-token lifecycle state |
| `kyc.model.js` | KYC submission and verification state |

---

# 24. Source-of-Truth Rules

LedgerPay follows these rules:

### Rule 1 — MongoDB is authoritative

Persistent application and financial data belongs in MongoDB.

### Rule 2 — Ledger represents financial history

Financial movements are represented through ledger entries.

### Rule 3 — Balance is derived

```text
Balance = Credits − Debits
```

### Rule 4 — Redis is not financial storage

Redis provides:

- Cache
- Idempotency coordination
- Rate-limit state

but does not replace MongoDB.

### Rule 5 — Financial writes should be atomic

Transaction records and their related ledger entries should be committed consistently.

### Rule 6 — Historical ledger records are not casually modified

Corrections should be represented through appropriate financial events rather than silently rewriting history.

---

# 25. Database Design Summary

LedgerPay uses MongoDB to maintain a structured separation between:

```text
Identity
   ↓
Users

Financial Ownership
   ↓
Accounts

Financial Operations
   ↓
Transactions

Financial History
   ↓
Ledger Entries

Authentication State
   ↓
Refresh Tokens

Verification State
   ↓
KYC
```

The central financial design is:

```text
Transaction
     ↓
Debit + Credit Ledger Entries
     ↓
Ledger History
     ↓
Balance Aggregation
```

This provides the foundation for maintaining financial consistency while allowing Redis to improve application performance and coordinate duplicate requests.