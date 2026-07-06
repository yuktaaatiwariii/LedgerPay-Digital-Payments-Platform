<!-- Folder Structure & Routing -->

Introduction

The frontend of the LedgerPay – Digital Payments Platform is organized using a modular folder structure to improve readability, maintainability, and scalability. Instead of placing all files in a single directory, the project separates components, pages, utilities, and routing logic into dedicated folders.

This organization allows different parts of the application to be developed independently while making it easier to locate files, debug issues, and add new features without affecting existing functionality.

Folder Structure

The frontend project is organized as follows:

src
│
├── components/
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── HomePage.jsx
│   └── AdminDashboard.jsx
│
├── pages/
│   ├── DashboardPage.jsx
│   ├── MyAccounts.jsx
│   ├── Transaction.jsx
│   ├── CreateAccount.jsx
│   └── AdminModals.jsx
│
├── lib/
│   ├── axios.js
│   └── AuthContext.jsx
│
├── App.jsx
├── main.jsx
└── index.css




<!-- Components Folder -->

Some important components include:

 > LandingPage – Displays the application's welcome page and provides navigation to Login and Registration.
 > LoginPage – Handles user authentication by collecting login credentials and communicating with the backend.
 > RegisterPage – Allows new users to create an account.
 > HomePage – Acts as the common layout for authenticated users and contains the navigation bar with an Outlet for nested pages.
 > AdminDashboard – Provides administrative features such as viewing users, accounts, and performing initial fund transfers.




 <!-- Pages Folder -->

The pages folder contains feature-specific pages that are rendered inside the Home layout after successful login.

These pages include:

DashboardPage – Displays customer details, account summary, and banking information.
MyAccounts – Shows all bank accounts belonging to the logged-in user.
Transaction – Allows users to transfer money between accounts.
CreateAccount – Enables users to create multiple bank accounts.
AdminModals – Contains reusable modal components used within the Admin Dashboard.

Each page focuses on a single banking feature, making the application modular and easier to extend.




<!-- Utility Folder (lib) -->

The lib folder contains shared utilities that are used throughout the application.

**Axios Configuration**

The axios.js file creates a centralized Axios instance for communicating with the backend.

Instead of specifying the backend URL for every API request, all components import the same Axios instance. This reduces repetitive code and ensures that every request automatically includes the required configuration such as the base URL and authentication cookies.

**Authentication Context**

The AuthContext.jsx file manages the authenticated user's information globally.

Once a user logs in, the authenticated user object becomes accessible throughout the application without passing data manually through component props. This simplifies authentication management and ensures that user information is available wherever required.





<!-- Application Routing -->

Navigation within the application is handled using React Router DOM. Routing enables users to move between different pages without reloading the browser, creating a smoother and faster user experience.

The application contains both public routes and protected routes.

 * Public Routes - routes are accessible without authentication.

These include:

Landing Page (/)
Login Page (/login)
Registration Page (/register)

These pages provide entry points into the application before the user logs in.

 * Protected User Routes - After successful authentication, users are redirected to the Home layout.

Inside this layout, nested routing is used to display different banking pages.

/home
    ├── dashboard
    ├── accounts
    ├── transaction
    └── create

Using nested routes allows the navigation bar and overall layout to remain constant while only the page content changes. This improves user experience and avoids unnecessary repetition of layout components.

 * Administrator Routing - Users with the ADMIN role are redirected to a separate dashboard after login.

/admindashboard

The administrator dashboard is completely independent from the normal user dashboard and provides additional banking operations such as:

Viewing all registered users
Viewing all bank accounts
Initial fund transfers
Administrative banking management

Role-based routing ensures that only administrators can access these features.

 * Route Protection - The application protects sensitive pages using authentication checks.

Whenever the application starts, it calls the backend authentication endpoint (/auth/me) to determine whether a valid user session exists.

If authentication is successful, the requested page is displayed.
If authentication fails, the user is redirected to the Login page.

This mechanism prevents unauthorized users from accessing protected banking pages simply by entering URLs manually.



<!-- Summary -->

A well-organized folder structure and routing system are essential for maintaining a scalable React application. By separating components, feature pages, utilities, and routing logic into dedicated folders, the Smart Bank Management System remains easy to understand, maintain, and extend.

React Router DOM provides efficient client-side navigation, while protected routes and role-based routing ensure that users only access the features appropriate to their permissions. Together, these architectural decisions create a clean, secure, and user-friendly frontend application.

This is the report style that would look appropriate in a college project. The next chapter (Authentication & API Integration) will naturally explain how React, Axios, Express, JWT, and cookies work together, which is arguably the most important part of your project.