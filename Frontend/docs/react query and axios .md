<!-- React Query & Axios -->


Managing server data efficiently is essential in any modern web application. Instead of manually handling API requests, loading states, caching, and refreshing data, the Smart Bank Management System uses React Query together with Axios.

Axios is responsible for communicating with the backend APIs, while React Query manages the server state by fetching, caching, and synchronizing data automatically. This combination reduces boilerplate code and keeps the user interface responsive and up to date.



*Axios Configuration*

A single Axios instance is created inside the lib folder to centralize all API communication.

This instance contains the backend base URL and is configured to automatically send authentication cookies with every request.

Instead of writing the server URL repeatedly, every component imports this shared Axios instance.

Example operations performed using Axios include:

User Login
User Registration
Fetching Current User
Viewing Bank Accounts
Transferring Funds
Admin Operations

This approach keeps API calls clean, reusable, and easy to maintain.



*React Query*

React Query is used to fetch and manage all server-side data.

Rather than storing API responses in React state, React Query automatically:

Fetches data from the backend.
Caches previously fetched data.
Prevents unnecessary API requests.
Keeps data synchronized across components.
Provides built-in loading and error states.

This significantly simplifies frontend development while improving performance.



*Fetching Data with useQuery*

Whenever data needs to be displayed, the application uses the useQuery hook.

Examples include:

Fetching authenticated user information.
Viewing all bank accounts.
Displaying account balances.
Loading transaction history.
Retrieving all users (Admin).
Retrieving all accounts (Admin).

Each query is identified using a unique queryKey, allowing React Query to cache and update the data independently.



*Updating Data with useMutation*

Operations that modify backend data are handled using the useMutation hook.

Unlike useQuery, mutations are triggered only when a user performs an action.

Examples include:

User Login
User Registration
Creating a Bank Account
Money Transfer
Initial Fund Transfer
Logout

After a successful mutation, React Query automatically refreshes the affected queries to display the latest data.



*Query Invalidation*

Whenever server data changes, previously cached data may become outdated.

To solve this, React Query provides Query Invalidation.

For example:

After creating a new account, the account list is refreshed.
After transferring money, account balances are updated.
After an initial fund transfer, account information is re-fetched.
After login or logout, the authenticated user data is refreshed.

This ensures the UI always displays the latest information without requiring a manual page refresh.



*API Request Lifecycle*

Every API request in the application follows the same lifecycle.

React Component

↓

React Query

↓

Axios Request

↓

Express Backend

↓

MongoDB

↓

Response

↓

React Query Cache

↓

Updated User Interface

This architecture separates data fetching from UI rendering, making the application more scalable and easier to maintain.



*Error and Loading States*

React Query provides built-in support for handling request states.

During API requests, components can display:

Loading indicators while data is being fetched.
Error messages if a request fails.
Updated content once the request completes successfully.

Additionally, React Hot Toast is used to display user-friendly notifications for successful operations and errors, such as login failures or successful fund transfers.



*Benefits of Using React Query and Axios*

Using React Query together with Axios offers several advantages:

Reduces manual state management.
Automatically caches API responses.
Minimizes unnecessary network requests.
Simplifies asynchronous data handling.
Keeps the UI synchronized with backend data.
Provides cleaner and more maintainable code.


**Summary**

React Query and Axios work together to provide a reliable and efficient communication layer between the frontend and backend. Axios handles HTTP requests, while React Query manages data fetching, caching, mutations, and synchronization. This combination ensures that banking information remains consistent, up to date, and responsive throughout the application while reducing the complexity of frontend state management.