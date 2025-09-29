# MERN Todo App with RBAC, Authentication, Optimized Refresh Tokens, Real-Time Notifications, Animations, and Toast Notifications

## Setup
1. Install dependencies:
   - cd client && npm install
   - cd ../server && npm install
2. Set .env files as per examples. Ensure JWT_SECRET and REFRESH_TOKEN_SECRET are unique and strong.
3. Run locally:
   - Backend: cd server && node server.js
   - Frontend: cd client && npm start
4. Deploy to Render as described in the code comments.

## Features
- Toast notifications (via react-toastify) for todo actions, login, registration, logout, and errors.
- Visual animations using Framer Motion for todo add/remove, view transitions, and UI interactions.
- Real-time updates via Socket.io: Todo changes broadcast to owners and admins.
- Role-Based Access Control: 'user' and 'admin' roles.
- First registered user is admin.
- Admins can view/manage all todos; users only their own.
- User registration and login with JWT (access and refresh tokens).
- Access tokens (15m), refresh tokens (7d) with rotation.
- Optimized token refresh: Handles concurrent 401s efficiently with queuing.
- User-specific CRUD for todos.
- Protected routes with automatic token refresh and retry.
- Responsive UI with modern dark theme and animations.