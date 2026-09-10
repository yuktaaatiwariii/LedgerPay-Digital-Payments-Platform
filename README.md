# 🏦 Smart Bank Management System

A full-stack banking management system built using **React**, **Node.js**, **Express.js**, and **MongoDB**. The project simulates the core functionalities of a modern banking platform, including secure authentication, account management, fund transfers, immutable ledger records, and an administrator dashboard.

The system demonstrates how a React frontend communicates with an Express backend through REST APIs while maintaining secure authentication using JWT and HTTP-only cookies.

> **Project Status:** 🚧 Under Active Development

---

# ✨ Features

## 👤 Customer Features

- User Registration
- Secure Login & Logout
- JWT Authentication
- Dashboard Overview
- Create Multiple Bank Accounts
- View Account Details
- Transfer Funds Between Accounts
- View Transaction History

---

## 👨‍💼 Administrator Features

- Admin Dashboard
- View All Registered Users
- View All Bank Accounts
- Initial Fund Transfers
- Banking Statistics
- Secure Administrator Logout

---

## ⚙️ Backend Features

- REST API Architecture
- JWT Authentication
- Cookie-Based Authorization
- Password Hashing using bcrypt
- Immutable Ledger System
- Dynamic Balance Calculation
- MongoDB with Mongoose ODM
- Idempotent Transactions
- Email Service Integration

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| React.js | User Interface |
| Vite | Development & Build Tool |
| React Router DOM | Client-side Routing |
| React Query | Server State Management |
| Axios | API Communication |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| React Hot Toast | Notifications |

---

## Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Backend Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Cookie Parser | Cookie Management |

---

# 🏗️ System Architecture

```
                    User

                      │

                      ▼

             React Frontend (Vite)

                      │

          React Query + Axios

                      │

                REST APIs

                      │

             Express.js Backend

                      │

      Authentication Middleware

                      │

      Controllers & Business Logic

                      │

      ┌───────────────┴───────────────┐

      ▼                               ▼

 Account Model                 Transaction Model

      │                               │

      └───────────────┬───────────────┘

                      ▼

              Immutable Ledger

                      │

                      ▼

                  MongoDB
```

---

# 🔐 Authentication Flow

```
User Login

      │

      ▼

React Login Form

      │

      ▼

Axios POST Request

      │

      ▼

Express Authentication API

      │

      ▼

MongoDB User Verification

      │

      ▼

JWT Token Generated

      │

      ▼

HTTP-only Cookie Stored

      │

      ▼

React Query (/auth/me)

      │

      ▼

Role Verification

      │

      ├── Customer Dashboard

      └── Admin Dashboard
```

---

# 💸 Banking Transaction Flow

```
Transfer Request

      │

      ▼

Validate User

      │

      ▼

Validate Accounts

      │

      ▼

Create Transaction

      │

      ▼

Generate Debit Ledger

      │

      ▼

Generate Credit Ledger

      │

      ▼

Commit Database Transaction

      │

      ▼

Return Success Response
```

---

# 📒 Ledger-Based Design

Instead of storing balances directly in bank accounts, the system calculates balances using immutable ledger entries.

```
Balance = Total Credits − Total Debits
```

### Example

| Entry | Amount |
|--------|--------|
| Credit | ₹10,000 |
| Debit | ₹2,500 |

**Current Balance = ₹7,500**

This approach improves consistency, auditability, and financial traceability.

---

# 📁 Project Structure

```text
Smart-Bank-Management-System/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layout/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── docs/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── docs/
│   └── server.js
│
└── README.md
```

---

# 📡 REST API Modules

### Authentication

- Register
- Login
- Logout
- Current User

---

### Accounts

- Create Account
- View Accounts
- Check Balance

---

### Transactions

- Money Transfer
- Initial Fund Transfer
- Transaction History

---

### Administration

- View All Users
- View All Accounts
- Banking Statistics

---

# 🎨 Frontend Highlights

- Responsive Banking UI
- Role-Based Navigation
- Protected Routes
- React Query Data Fetching
- Axios API Integration
- Tailwind CSS Components
- Reusable Modals
- Toast Notifications

---

# ⚙️ Backend Highlights

- Layered Architecture
- JWT Authentication
- Express Middleware
- MongoDB Transactions
- Ledger Accounting
- Idempotency Support
- Email Service
- Secure Cookie Authentication

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/your-username/smart-bank-management-system.git

cd smart-bank-management-system
```

---

## Install Backend

```bash
cd Backend
npm install
```

---

## Install Frontend

```bash
cd ../Frontend
npm install
```

---

## Configure Environment Variables

### Backend `.env`

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Run Backend

```bash
cd Backend
npm run dev
```

---

## Run Frontend

```bash
cd Frontend
npm run dev
```

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:3000
```

---

# 📚 Documentation

The project contains comprehensive documentation for both the frontend and backend.

### Frontend Documentation

- Project Overview
- Folder Structure & Routing
- Authentication & API Integration
- React Query & Axios
- UI Components & Pages
- Development Log

### Backend Documentation

- Project Overview
- Models & Controllers
- System Architecture
- API Reference
- Ledger System
- Database Design
- Development Log

---

# 🔮 Future Improvements

- Refresh Token Authentication
- Email Verification
- Password Reset
- Role-Based Access Control
- Transaction Search & Filtering
- PDF Bank Statements
- Docker Deployment
- CI/CD Pipeline
- Swagger API Documentation
- Unit & Integration Testing

---

# 👩‍💻 Author

**ASUS**

Full Stack Developer

---

# 📄 License

This project was developed for educational purposes to demonstrate modern full-stack web development concepts, secure authentication, REST API design, and banking transaction management using React, Express.js, and MongoDB. i amde this project what sholud i define it now and tell me as a recuriter i made this project till now tell me what sholud i add more be practical ansd eral world scenerio
