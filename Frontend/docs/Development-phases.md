<!-- Development Log -->

Project Timeline

The frontend of the Smart Bank Management System was developed incrementally by building one feature at a time. Instead of creating the entire application at once, the project followed a modular approach where authentication, routing, dashboard development, account management, transaction handling, and administrator features were implemented in separate stages.

Each completed feature was tested before moving to the next module, ensuring that frontend components integrated correctly with backend APIs.

<!-- Phase 1 – Project Setup -->

The project was initialized using Vite with React.js, providing a fast development environment and optimized build process.

During the initial setup, the following technologies were configured:

React Router DOM for routing
Tailwind CSS for styling
Axios for API communication
React Query for server state management
React Hot Toast for notifications
Lucide React for icons

The folder structure was organized into components, pages, utilities, and assets to maintain a clean architecture.



<!-- Phase 2 – Authentication System -->

The authentication module was implemented first.

Registration and login forms were developed using controlled React components with client-side validation.

Axios was integrated to communicate with backend authentication APIs, while React Query mutations handled login and registration requests.

After successful authentication, JWT cookies were stored by the backend and the authenticated user's information was retrieved through the /auth/me endpoint.

Role-based navigation was also implemented to redirect users to either the User Dashboard or the Admin Dashboard.



<!-- Phase 3 – User Dashboard Development -->

After authentication, the main user dashboard was created.

The dashboard serves as the central navigation point for banking operations.

Separate pages were developed for:

Dashboard overview
My Accounts
Create Account
Transactions

React Router nested routes were used so that navigation between pages could occur without reloading the application.



<!-- Phase 4 – Banking Features -->

Core banking functionality was integrated with backend services.

Users can:

Create new bank accounts
View all their accounts
Transfer money
View transaction history
Check account balances

React Query automatically synchronized the frontend with backend updates after each successful operation, eliminating unnecessary page refreshes.

Toast notifications were added to provide immediate feedback for successful or failed operations.



<!-- Phase 5 – Administrator Dashboard -->

An administrator panel was developed separately from the user dashboard.

Unlike regular users, administrators have access to system-wide banking information.

The dashboard includes:

Statistics cards
View All Users
View All Accounts
Initial Fund Transfer
Logout functionality

Interactive modal windows were created to display users and accounts in table format without leaving the dashboard.



<!-- Phase 6 – API Integration and Debugging -->

The final stage focused on connecting all frontend components with backend APIs and resolving integration issues.

Several improvements and fixes were made during development, including:

Configuring Axios to send cookies using withCredentials.
Managing server state with React Query.
Implementing role-based route protection.
Fixing React Query cache refresh after login.
Correcting backend model imports and API responses.
Resolving MongoDB populate and schema-related errors.
Improving modal rendering and data display.
Adding loading states and error notifications for better user experience.

Extensive testing was performed to ensure smooth communication between the React frontend and the Express backend.



**Challenges Faced**

During development, several practical challenges were encountered and resolved:

Managing authentication state immediately after login without refreshing the page.
Synchronizing frontend state with backend updates using React Query.
Implementing role-based access control for users and administrators.
Handling asynchronous API requests and loading states.
Debugging backend API responses and MongoDB schema issues.
Passing data correctly between components and modal windows.
Designing responsive layouts that worked across different screen sizes.

Resolving these challenges provided a deeper understanding of frontend-backend integration and modern React development practices.




*Final Outcome*

The completed frontend successfully integrates with the backend to provide a secure and responsive banking management system.

The application supports:

Secure authentication using JWT cookies
Role-based access for users and administrators
Real-time server communication through REST APIs
Efficient server state management with React Query
Responsive user interfaces built with Tailwind CSS
Modular and reusable React components
Smooth navigation using React Router

Overall, the project demonstrates how modern frontend technologies can be combined with backend services to build a scalable and maintainable full-stack banking application.