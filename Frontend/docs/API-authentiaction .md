<!-- Authentication & API Integration -->


Introduction

Authentication is one of the most important aspects of the Smart Bank Management System. Since banking operations involve sensitive user information and financial transactions, the application implements a secure authentication mechanism using JSON Web Tokens (JWT), HTTP-only cookies, and protected backend APIs.

The frontend communicates with the Express backend through REST APIs using Axios, while React Query manages authentication state and keeps the user session synchronized across the application.

<!-- Authentication Flow -->

The authentication process begins when a user enters their email and password on the Login page.

After clicking the Login button, the frontend sends the credentials to the backend using an Axios POST request.


User Login

↓

React Login Form

↓

Axios POST Request

↓

Express Login API

↓

MongoDB Verification

↓

JWT Generated

↓

HTTP-Only Cookie

↓

User Redirected to Dashboard


Once the credentials are verified, the backend generates a JWT containing the user's ID and role. Instead of storing the token in Local Storage, it is stored inside an HTTP-only cookie, making it inaccessible to JavaScript and improving application security.





<!-- Authentication APIs -->

The frontend communicates with several authentication endpoints provided by the backend.

API	Method	Purpose -

/auth/register    	POST	Register a new user
/auth/login     	POST	Authenticate user and generate JWT
/auth/me	        GET	    Retrieve currently logged-in user
/auth/logout	    POST	Clear authentication cookie

Each API performs a specific role in managing user sessions and authentication.

Login Process - The login page collects the user's email and password using controlled React state.

When the form is submitted:

Input validation is performed.
Axios sends a POST request to /auth/login.
The backend validates the credentials.
A JWT is generated and stored in an HTTP-only cookie.
User information is returned to the frontend.

After a successful login, the application checks the user's role and redirects accordingly.

ADMIN  →  /admindashboard

USER   →  /home/dashboard

This enables role-based navigation within the application.



<!-- Maintaining User Sessions -->


After login, the frontend needs to determine whether the user is still authenticated whenever the application reloads.

This is achieved using the /auth/me endpoint.

When the application starts, React Query automatically sends a request to this endpoint.

If a valid JWT cookie exists:

The backend verifies the token.
The authenticated user's information is returned.
The frontend stores the user object inside the authentication context.

If no valid cookie exists, the user is redirected back to the Login page.

This approach allows users to remain logged in even after refreshing the browser.



<!-- Protected Routes -->

Not every page should be accessible without authentication.

Before rendering protected pages, the application checks whether an authenticated user exists.

If authentication is successful:

User Dashboard is displayed.
Banking pages become accessible.
Administrator pages are available only to users with the ADMIN role.

Otherwise, the application redirects the user to the Login page.

This ensures that unauthorized users cannot access banking functionality.



<!-- Role-Based Access Control -->

The backend stores the role of each user inside the database.

Possible roles include:

USER
ADMIN

After login, the frontend receives the user's role from the backend and performs role-based navigation.

Normal users are redirected to the customer dashboard, while administrators gain access to the dedicated Admin Dashboard with additional banking management features.

This separation ensures that administrative operations remain restricted to authorized users only.



<!-- API Communication using Axios -->

All communication between the frontend and backend is handled using Axios.

Instead of writing the backend URL repeatedly, the project creates a centralized Axios instance inside the lib folder.

This shared instance automatically:

Uses the backend base URL.
Sends authentication cookies with every request.
Provides consistent API configuration throughout the application.

As a result, every component simply imports the same Axios instance whenever it needs to communicate with the backend.



<!-- Backend Communication Flow -->

Every banking operation follows a similar communication pattern between the frontend and backend.

React Component

↓

Axios Request

↓

Express Route

↓

Controller

↓

MongoDB

↓

Response

↓

React Query

↓

Updated User Interface

This architecture separates presentation logic from business logic, making the application easier to maintain and debug.


<!-- Error Handling -->

The application provides clear feedback whenever an API request succeeds or fails.

Common scenarios include:

Invalid login credentials
Unauthorized access
Failed money transfer
Missing input fields
Server errors

React Hot Toast is used to display success and error notifications, improving the overall user experience by providing immediate feedback for every important operation.



<!-- Summary -->

Authentication and API integration form the foundation of the Smart Bank Management System. Secure user authentication is achieved through JWT-based sessions stored in HTTP-only cookies, while Axios provides a centralized mechanism for communicating with backend REST APIs.

By combining React Query, Axios, Express, and JWT authentication, the application maintains secure user sessions, protects sensitive banking routes, supports role-based access control, and ensures seamless communication between the frontend and backend.