import { createContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  // 🔄 Restore login on app load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      } else {
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Invalid user data in storage");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔐 Login
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      const { token, ...userData } = response.data;

      // Save token in localStorage
      if (token) {
        localStorage.setItem("token", token);
      }

      // Save user object in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      // Update user state
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Login failed",
      };
    }
  };

  // 🚪 Logout
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Remove user from localStorage
    localStorage.removeItem("user");

    // Clear user state
    setUser(null);
  };

  const triggerDashboardRefresh = () => {
    setDashboardRefreshKey((prev) => prev + 1);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, dashboardRefreshKey, triggerDashboardRefresh }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};





// NOTES: #2

/*


# 📘 Detailed Updated Notes — `AuthContext.jsx`

---

# 🔵 1. Purpose of This File (Core Responsibility)

This file manages **global authentication state** in the entire React application.

It is responsible for:

* Storing logged-in user data
* Restoring login state on page refresh
* Handling login API communication
* Handling logout logic
* Providing authentication data and functions globally
* Controlling app rendering until auth check is complete

This file acts as:

🧠 The Central Authentication Brain of the Application

It separates authentication logic from UI components.

---

# 🔵 2. Why We Use Context Instead of Props

Without Context:

We would need to pass `user` and `logout` through multiple components:

```
App → Layout → Navbar → Dashboard → Component
```

This is called **prop drilling**, and it becomes messy in large apps.

Context solves this by:

* Making authentication globally accessible
* Avoiding unnecessary prop passing
* Keeping architecture clean and scalable

---

# 🔵 3. Import Section

```js
import { createContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";
```

### Explanation

* `createContext` → Creates a global container
* `useState` → Manages user and loading state
* `useEffect` → Runs code when component loads
* `api` → Our centralized axios instance for backend communication

This file depends on:

* React state system
* Centralized API communication system

---

# 🔵 4. Creating the Context

```js
export const AuthContext = createContext();
```

This creates a global data container.

Think of it as:

A shared storage box accessible from anywhere in the app.

It will later provide:

* user
* login
* logout
* loading

---

# 🔵 5. Provider Component

```js
export const AuthProvider = ({ children }) => {
```

This is a wrapper component.

It wraps the entire application:

```jsx
<AuthProvider>
  <App />
</AuthProvider>
```

`children` represents everything inside `<AuthProvider>`.

Only components inside this provider can access AuthContext.

---

# 🔵 6. State Variables

```js
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```

---

## 🧍 user

Stores authenticated user object.

Example:

```js
{
  name: "Bhavya",
  email: "bhavya@gmail.com",
  role: "student",
  token: "abc123"
}
```

If no user → `null`.

This state controls:

* Navbar display
* Protected routes
* Role-based rendering

---

## ⏳ loading

Prevents app from rendering before login state is verified.

Why important?

If we don’t use loading:

* App may render protected content briefly
* Then suddenly redirect
* Causes flickering and unstable UI

So we wait until login check completes.

---

# 🔵 7. Checking Login on Page Load

```js
useEffect(() => {
```

Runs only once because dependency array is empty:

```js
}, []);
```

This runs when the app loads or refreshes.

---

## Step 1 — Get stored user

```js
const storedUser = localStorage.getItem("user");
```

We check browser storage for saved login.

If user logged in previously, data exists.

---

## Step 2 — Restore user

```js
if (storedUser) {
  setUser(JSON.parse(storedUser));
}
```

localStorage stores only strings.

So we convert string → object.

Now user remains logged in after page refresh.

---

## Step 3 — Error Handling

```js
catch (error) {
  console.error("Failed to parse user from storage");
  localStorage.removeItem("user");
}
```

If stored data is corrupted:

* Remove invalid data
* Prevent application crash

This is defensive programming.

---

## Step 4 — Stop Loading

```js
finally {
  setLoading(false);
}
```

Now application can safely render.

---

# 🔵 8. Login Function

```js
const login = async (email, password) => {
```

This function:

* Sends login request
* Stores user data
* Updates global state
* Returns result to UI

---

## Step 1 — Send Request

```js
const response = await api.post("/auth/login", { email, password });
```

Using centralized axios instance.

Token will be handled automatically for future requests.

---

## Step 2 — Extract User Data

```js
const userData = response.data;
```

Backend typically returns:

```js
{
  name,
  email,
  role,
  token
}
```

---

## Step 3 — Store in localStorage

```js
localStorage.setItem("user", JSON.stringify(userData));
```

This ensures login persists after refresh.

---

## Step 4 — Update Global State

```js
setUser(userData);
```

Now entire application knows user is authenticated.

Components can access:

```js
user?.name
user?.role
```

---

## Step 5 — Return Status Object

```js
return { success: true };
```

Why return object?

So UI can decide what to do:

```js
if (result.success) navigate("/dashboard");
```

Clean separation of concerns.

---

## Improved Error Handling

Better pattern:

```js
message:
  error.response?.data?.message ||
  error.message ||
  "Login failed"
```

This handles:

* Backend validation errors
* Network failures
* Unknown errors

---

# 🔵 9. Logout Function

```js
const logout = () => {
```

Responsibility:

* Remove stored authentication
* Clear state
* Let routing system handle redirect

Better approach:

```js
localStorage.removeItem("user");
setUser(null);
```

Avoid forcing full page reload using:

```
window.location.href
```

Because React Router should handle navigation.

Separation of routing and auth logic is more professional.

---

# 🔵 10. Providing Context Values

```js
<AuthContext.Provider value={{ user, login, logout, loading }}>
```

We expose:

* user → authentication data
* login → function to authenticate
* logout → function to clear auth
* loading → tells app whether auth check is complete

Now any component can do:

```js
const { user, logout } = useAuth();
```

---

# 🔵 11. Conditional Rendering

```js
{!loading && children}
```

This prevents app from rendering before auth state is confirmed.

Prevents:

* Flickering
* Flash of protected content
* Incorrect UI state

---

# 🔵 12. Updated Full Authentication Flow

1. User logs in
2. Backend returns token + user data
3. AuthContext stores data in localStorage
4. State updates globally
5. axiosInstance automatically attaches token to future requests
6. Backend validates token
7. If token expires → response interceptor logs out user

This creates a complete authentication cycle.

---

# 🔵 13. Architectural Strengths

This structure follows:

✔ Separation of concerns
✔ Centralized authentication logic
✔ Persistent login state
✔ Clean API integration
✔ Scalable architecture
✔ Defensive error handling

---

# 🔵 14. Security Awareness

Currently using:

* localStorage for token storage

Risk:

* Vulnerable to XSS attacks

More secure production alternative:

* HTTP-only secure cookies
* CSRF protection
* Short-lived tokens

For portfolio projects, localStorage is acceptable.

---

# 🔵 15. Advanced Thinking

Better design improvement:

Instead of storing full backend response,
store only required fields:

```js
{
  token,
  role,
  name
}
```

Minimize unnecessary data exposure.

---

# 🧠 Final Understanding

AuthContext is responsible for:

* Controlling authentication state
* Making authentication accessible everywhere
* Ensuring login persistence
* Protecting application rendering flow

It does NOT handle:

* UI rendering
* Route protection (ProtectedRoute does that)
* API token attachment (axiosInstance handles that)

Each file has one responsibility.

That is clean architecture.

---
THis is the new update later on we will correct the notes wiht updated architecture and flow.

📘 FINAL UPDATED NOTES (AuthContext — Correct Architecture)
🔵 Logout Behavior (Important Update)

We DO NOT use:

window.location.href = "/login";


Because:

It reloads the entire app

Breaks SPA behavior

Mixes routing logic with auth logic

Instead we use:

setUser(null);


Why?

Because:

When user becomes null

ProtectedRoute blocks access

Routes automatically redirect to login

This keeps:

✔ Authentication logic inside AuthContext
✔ Routing logic inside AppRoutes
✔ Clean separation of concerns

🔵 Updated Authentication Flow

User logs in

Token + user data stored in localStorage

Global state updated

Routes render dashboard

User logs out

setUser(null)

ProtectedRoute detects no user

Automatically redirects to /login

No forced page reload.

This is proper SPA architecture.

🔵 Why This Is Architecturally Correct

Each layer has one responsibility:

AuthContext → Manages auth state
axiosInstance → Handles API + token
ProtectedRoute → Guards routes
AppRoutes → Controls navigation

No file is doing multiple jobs.

That is clean design.


*/