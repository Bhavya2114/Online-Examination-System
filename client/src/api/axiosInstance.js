import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: false, // change to true only if using cookies
});

// Log axios configuration for debugging
console.log("🔌 Axios BaseURL:", api.defaults.baseURL);

// 🔐 Request Interceptor → Attach Token Automatically
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ Token attached to request:", config.url);
      } else {
        console.log("⚠️ No token found for request:", config.url);
      }
    } catch (error) {
      console.error("❌ Error attaching token:", error);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// 🚨 Response Interceptor → Handle Expired Token
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      url: error.config?.url,
      fullError: error
    });

    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.warn("🔐 Unauthorized - Token invalid or expired");
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;



// NOTES: #1
/* 
1. This file creates a custom axios instance for API communication.

2. It sets the base URL from environment variables for flexibility.


# 📘 Detailed Notes — axiosInstance.js (API Communication Layer)

---

# 🔵 1. Purpose of This File

This file creates a **centralized communication system** between frontend and backend.

Instead of calling axios directly in every component, we:

* Create a custom axios instance
* Configure it once
* Reuse it everywhere

This improves:

* Code cleanliness
* Scalability
* Security handling
* Maintainability

---

# 🔵 2. Why Do We Create an Axios Instance?

Normally, you can write:

```js
axios.get("http://localhost:5000/api/exams")
```

But this creates problems:

* You repeat backend URL everywhere
* You manually attach token every time
* You manually handle errors everywhere
* Hard to scale

So instead, we do:

```js
const api = axios.create({...})
```

Now `api` becomes our customized axios.

From now on we use:

```js
api.get("/exams")
```

This automatically:

* Adds base URL
* Adds token
* Handles errors

---

# 🔵 3. Base URL Configuration

```js
baseURL: import.meta.env.VITE_API_URL
```

We don’t hardcode backend URL.

Instead we use environment variable.

Why?

Because:

* In development → localhost
* In production → deployed backend URL
* You change it in `.env` only
* No code modification needed

This is professional practice.

---

# 🔵 4. What is an Interceptor?

Interceptor = a function that runs automatically:

* Before request goes to backend (Request Interceptor)
* After response comes from backend (Response Interceptor)

Think of it like:

Security guard checking every request.

---

# 🔵 5. Request Interceptor (Before Sending Request)

```js
api.interceptors.request.use(...)
```

This runs before every API call.

Its job here:

👉 Automatically attach JWT token to request header.

---

## 🔹 Why Do We Attach Token?

Because backend protected routes require:

```
Authorization: Bearer <token>
```

Without this header:

Backend middleware will reject request.

---

## 🔹 How It Works

1. We get user from localStorage
2. Convert it from string to object
3. Check if token exists
4. Add token to request header

This means:

When you call:

```js
api.get("/exams")
```

It automatically becomes:

```
GET /api/exams
Authorization: Bearer abc123
```

Without writing extra code.

---

## 🔹 Why We Use Optional Chaining (?.)

```js
if (user?.token)
```

Prevents error if user is null.

Without this, app could crash.

---

## 🔹 Why We Return config

```js
return config;
```

Very important.

If we don’t return config:

The request will stop.
API call will never be sent.

---

# 🔵 6. Response Interceptor (After Backend Responds)

```js
api.interceptors.response.use(...)
```

This runs after backend sends response.

Two cases:

1. Success
2. Error

---

## 🔹 Success Case

```js
(response) => response
```

Just return response normally.

---

## 🔹 Error Case (401 Handling)

If backend returns:

```
401 Unauthorized
```

It means:

* Token expired
* Token invalid
* User not logged in

So we:

1. Remove user from localStorage
2. Redirect to login page

This prevents user from staying in broken state.

This is professional auto-logout system.

---

# 🔵 7. Why This File is Important for Architecture

This file separates concerns.

It handles:

* API communication
* Token attachment
* Global error handling

Components should NOT handle this.

Components should only:

* Call API
* Display data

Separation of responsibilities = clean architecture.

---

# 🔵 8. Security Perspective

This file:

* Sends JWT securely in header
* Clears invalid tokens
* Prevents unauthorized access

However:

Token in localStorage has XSS risk.

In production, HTTP-only cookies are safer.

---

# 🔵 9. Big Picture Flow

When user logs in:

1. Backend sends token
2. We store token in localStorage
3. Next API call:

   * Interceptor reads token
   * Attaches to header
4. Backend verifies token
5. If expired → 401
6. Response interceptor logs out user

Complete authentication loop.

---

# 🔵 10. Why This is Industry Standard

Because:

* Centralized configuration
* Easy to maintain
* Easy to scale
* Easy to debug
* Clean separation of logic

This pattern is used in:

* Large SaaS apps
* Enterprise dashboards
* Admin panels
* Real-world production apps

---

# 🧠 Final Conceptual Understanding

This file acts like:

👉 A smart messenger between frontend and backend.

It ensures:

* Every request is authenticated
* Errors are handled globally
* Backend URL is controlled
* Code repetition is avoided

---

When you write notes, do not just copy code.

Write:

* Why we created it
* What problem it solves
* How it improves scalability
* What would happen without it

That thinking makes you strong developer.



*/


// After this go to AuthContext.jsx to see how we use this api instance for login/logout.