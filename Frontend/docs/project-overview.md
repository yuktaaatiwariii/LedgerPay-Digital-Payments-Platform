# LedgerPay – Digital Payments Platform - Frontend Overview

## Introduction

The LedgerPay – Digital Payments Platform is a full-stack web application developed to simulate the core functionalities of a modern banking platform. The application allows customers to create bank accounts, transfer funds, manage multiple accounts, and view transaction history through a secure and responsive web interface. Alongside the customer portal, the system also provides an administrator dashboard for managing users, accounts, and system-level banking operations.


---

# Project Objectives

The primary objective of this project is to design and implement a secure banking management system that demonstrates the integration of frontend technologies with backend services while following modern web development practices.

The frontend aims to provide an intuitive user interface that allows users to:

- Register and securely log into the system.
- Create and manage multiple bank accounts.
- Perform money transfers between accounts.
- View account balances and transaction history.
- Access different dashboards based on user roles.
- Allow administrators to monitor users and banking accounts.

In addition to implementing banking features, the project also focuses on learning how frontend applications communicate with backend services through REST APIs, how authentication is maintained across multiple pages, and how server data is managed efficiently using React Query.

---

# Technology Stack

The frontend is developed using modern React libraries and tools to ensure scalability, maintainability, and performance.

| Technology | Purpose |
|------------|---------|
| React.js | Building reusable user interface components |
| Vite | Fast development server and optimized build tool |
| React Router DOM | Client-side routing |
| React Query | Server state management and API caching |
| Axios | HTTP client for backend communication |
| Tailwind CSS | Utility-first CSS framework for responsive UI |
| React Hot Toast | Notification messages |
| Lucide React | Icons used throughout the application |

---

# Core Features

The frontend application is divided into two major sections based on user roles.

### User Features

A normal user can:

- Register a new banking account.
- Login securely.
- View personal dashboard.
- Create multiple bank accounts.
- Transfer funds between accounts.
- View account information.
- Track previous transactions.
- Logout securely.

---

### Administrator Features

An administrator has access to additional system-level operations.

These include:

- Viewing all registered users.
- Viewing every bank account in the system.
- Performing initial fund transfers.
- Monitoring banking operations.
- Accessing an exclusive administrator dashboard.

Role-based navigation ensures that administrators and normal users only access pages relevant to their permissions.

---

# Frontend Architecture

The frontend follows a component-based architecture provided by React.

Instead of writing one large application file, the project is divided into multiple reusable components responsible for handling different parts of the interface.

Some examples include:

- Authentication components
- Dashboard pages
- Navigation layout
- Account management pages
- Administrator dashboard
- Reusable modal components

This modular approach improves code readability, makes debugging easier, and allows new features to be added without affecting the existing codebase.

---

# Frontend and Backend Communication

One of the primary goals of this project is demonstrating how a React frontend communicates with an Express backend.

Every operation performed by the user eventually results in an HTTP request being sent to the backend.

For example:

User Login

↓

React Form

↓

Axios Request

↓

Express API

↓

MongoDB

↓

Response

↓

React Query

↓

Updated UI

Instead of storing large amounts of data inside React state, the application relies on **React Query** to fetch, cache, and synchronize server data automatically.

Axios acts as the communication layer responsible for sending HTTP requests and receiving API responses.

---

# Authentication Flow

Authentication is implemented using JSON Web Tokens (JWT).

When a user successfully logs in, the backend generates a signed JWT and stores it inside an HTTP-only cookie.

For every subsequent API request:

1. The browser automatically sends the cookie.
2. Express middleware verifies the token.
3. The authenticated user's information is attached to the request.
4. Protected APIs execute successfully.
5. React Query fetches the authenticated user through the `/auth/me` endpoint.

This approach eliminates the need to manually store authentication tokens in local storage while improving application security.

---

# Project Structure

To keep the frontend organized, the application is divided into dedicated folders responsible for different aspects of development.

The project contains separate directories for:

- Components
- Pages
- Layout
- API utilities
- Authentication context
- Global styling
- Static assets

A detailed explanation of the folder hierarchy and routing architecture is provided in the next document.

---

# Summary

The frontend of the Smart Bank Management System demonstrates how modern React applications are built using reusable components, client-side routing, REST API communication, server state management, and secure authentication.

Rather than functioning as a collection of independent pages, the application behaves as a connected system where React, Axios, React Query, Express, and MongoDB work together to provide a seamless banking experience.

The following chapters explain the implementation details of each part of the frontend, including folder organization, routing, authentication, API integration, React Query, Axios configuration, and component design.