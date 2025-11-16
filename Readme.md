<<<<<<< HEAD
# Inventory Management System - Backend

## Overview
RESTful API built with Node.js and Express.js for managing inventory items.

## Technologies
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)

### Installation

1. Navigate to backend directory:
```bash
   cd backend
```

2. Install dependencies:
```bash
   npm install
```

3. Create .env file:
```bash
   cp .env.example .env
```

4. Start MongoDB:
```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
```

5. Start server:
```bash
   npm start
```

Server will run on http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/stats | Inventory statistics |
| GET | /api/items | Get all items |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |

## Testing

Test health endpoint:
```bash
curl http://localhost:5000/api/health
```

Create item:
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Test Item",
    "quantity": 10,
    "price": 99.99,
    "category": "Electronics"
  }'
```
=======
INVENTORY MANAGEMENT SYSTEM – 

1. Project Overview**

The **Inventory Management System** is a full-stack MERN application designed to help users manage their product inventory digitally.
It allows users to add, update, delete, search, and categorize items while maintaining accurate stock records.
The system includes authentication, responsive UI, and real-time data updates.

The project reflects practical knowledge of frontend design, backend API development, database modeling, and secure user management.



# **2. Objective of the Project**

The main objective is to provide an easy, secure, and structured way for users or small businesses to:

* Keep track of their inventory
* Reduce manual errors
* View insights (total items, value, etc.)
* Manage stock from a single dashboard

This project is built to demonstrate full-stack development capability and industry-standard coding practices.



# **3. Key Features**

### **User Features**

* User Signup & Login
* Secure authentication with JWT
* Add new inventory items
* Update existing items
* Delete items
* Search items
* Category filters
* Live dashboard statistics
* Mobile-friendly responsive layout

### **System Features**

* Role-based data isolation
* Proper form validation
* Error handling on frontend & backend
* CRUD operations for items
* Real-time stock calculations


# **4. How the Application Works (Simple Flow)**

1. **User signs up or logs in**
   – Credentials are verified and token is generated.

2. **User reaches dashboard**
   – They see total items, quantity, and inventory value.

3. **User manages items**
   – Add → Fill form
   – Edit → Modify fields
   – Delete → Confirm
   – Search → Type item name
   – Filter → Select category

4. **System updates dashboard**
   – Stats change automatically after each action.

5. **Data is stored securely**
   – All data linked to the logged-in user only.



# **5. Technology Stack**

### **Frontend**

* React 18
* Tailwind CSS
* Context API
* Lucide Icons

### **Backend**

* Node.js
* Express.js
* JWT Authentication
* Bcrypt password hashing

### **Database**

* MongoDB
* Mongoose ODM


# **6. System Architecture**
React Frontend → Express.js REST API → MongoDB Database


* React handles UI and state.
* Express handles business logic & authentication.
* MongoDB stores user and item data.



# **7. Backend API Summary (Short)**

| Method | Route            | Function             |
| ------ | ---------------- | -------------------- |
| POST   | /api/auth/signup | Register user        |
| POST   | /api/auth/login  | Login user           |
| GET    | /api/auth/me     | Fetch user           |
| POST   | /api/items       | Add item             |
| GET    | /api/items       | Get all user items   |
| PUT    | /api/items/:id   | Update item          |
| DELETE | /api/items/:id   | Delete item          |
| GET    | /api/stats       | Inventory statistics |



# **8. Database Structure**

### **Users Collection**

* username
* email
* password (hashed)
* createdAt

### **Items Collection**

* itemName
* quantity
* price
* category
* description
* userId
* timestamps



# **9. Security Measures**

* **Password hashing** using bcrypt
* **JWT token authentication** for every API call
* **User-specific data filtering** (no cross-user access)
* **Validation** on required fields
* **CORS protection**



# **10. Installation & Setup**

### **To run backend**

```
cd backend
npm install
npm start
```

### **To run frontend**

```
cd frontend
npm install
npm start
```

### **Database**

MongoDB is running locally.



# **11. Testing Checklist (For Reviewers)**

* Create new user → Should work
* Login → Token generated
* Add multiple items → Should show on dashboard
* Edit item → Data updates
* Delete item → Item removed
* Search → Instant filtering
* Category filters → Correct results
* Dashboard stats → Should update
* Reload page → User remains logged in
* Logout → Session cleared



# **12. Project Highlights**

* Fully functional MERN application
* Clean and responsive UI
* Secure authentication system
* Backend with complete REST API
* Proper state management
* Clear database modeling
* Complete CRUD with filter & search

# **13. Conclusion**

This Inventory Management System is a complete, secure, and production-ready full-stack project.
It demonstrates strong skills in:

* Frontend development
* Backend development
* Database design
* Security implementation
* User interface design
* Debugging & problem-solving

INVENTORY MANAGEMENT SYSTEM – 

1. Project Overview**

The **Inventory Management System** is a full-stack MERN application designed to help users manage their product inventory digitally.
It allows users to add, update, delete, search, and categorize items while maintaining accurate stock records.
The system includes authentication, responsive UI, and real-time data updates.

The project reflects practical knowledge of frontend design, backend API development, database modeling, and secure user management.



# **2. Objective of the Project**

The main objective is to provide an easy, secure, and structured way for users or small businesses to:

* Keep track of their inventory
* Reduce manual errors
* View insights (total items, value, etc.)
* Manage stock from a single dashboard

This project is built to demonstrate full-stack development capability and industry-standard coding practices.



# **3. Key Features**

### **User Features**

* User Signup & Login
* Secure authentication with JWT
* Add new inventory items
* Update existing items
* Delete items
* Search items
* Category filters
* Live dashboard statistics
* Mobile-friendly responsive layout

### **System Features**

* Role-based data isolation
* Proper form validation
* Error handling on frontend & backend
* CRUD operations for items
* Real-time stock calculations


# **4. How the Application Works (Simple Flow)**

1. **User signs up or logs in**
   – Credentials are verified and token is generated.

2. **User reaches dashboard**
   – They see total items, quantity, and inventory value.

3. **User manages items**
   – Add → Fill form
   – Edit → Modify fields
   – Delete → Confirm
   – Search → Type item name
   – Filter → Select category

4. **System updates dashboard**
   – Stats change automatically after each action.

5. **Data is stored securely**
   – All data linked to the logged-in user only.



# **5. Technology Stack**

### **Frontend**

* React 18
* Tailwind CSS
* Context API
* Lucide Icons

### **Backend**

* Node.js
* Express.js
* JWT Authentication
* Bcrypt password hashing

### **Database**

* MongoDB
* Mongoose ODM


# **6. System Architecture**
React Frontend → Express.js REST API → MongoDB Database


* React handles UI and state.
* Express handles business logic & authentication.
* MongoDB stores user and item data.



# **7. Backend API Summary (Short)**

| Method | Route            | Function             |
| ------ | ---------------- | -------------------- |
| POST   | /api/auth/signup | Register user        |
| POST   | /api/auth/login  | Login user           |
| GET    | /api/auth/me     | Fetch user           |
| POST   | /api/items       | Add item             |
| GET    | /api/items       | Get all user items   |
| PUT    | /api/items/:id   | Update item          |
| DELETE | /api/items/:id   | Delete item          |
| GET    | /api/stats       | Inventory statistics |



# **8. Database Structure**

### **Users Collection**

* username
* email
* password (hashed)
* createdAt

### **Items Collection**

* itemName
* quantity
* price
* category
* description
* userId
* timestamps



# **9. Security Measures**

* **Password hashing** using bcrypt
* **JWT token authentication** for every API call
* **User-specific data filtering** (no cross-user access)
* **Validation** on required fields
* **CORS protection**



# **10. Installation & Setup**

### **To run backend**

```
cd backend
npm install
npm start
```

### **To run frontend**

```
cd frontend
npm install
npm start
```

### **Database**

MongoDB is running locally.



# **11. Testing Checklist (For Reviewers)**

* Create new user → Should work
* Login → Token generated
* Add multiple items → Should show on dashboard
* Edit item → Data updates
* Delete item → Item removed
* Search → Instant filtering
* Category filters → Correct results
* Dashboard stats → Should update
* Reload page → User remains logged in
* Logout → Session cleared



# **12. Project Highlights**

* Fully functional MERN application
* Clean and responsive UI
* Secure authentication system
* Backend with complete REST API
* Proper state management
* Clear database modeling
* Complete CRUD with filter & search

# **13. Conclusion**

This Inventory Management System is a complete, secure, and production-ready full-stack project.
It demonstrates strong skills in:

* Frontend development
* Backend development
* Database design
* Security implementation
* User interface design
* Debugging & problem-solving

## 📸 Screenshots

### 🔐 Authentication Page
![Auth](frontend/screenshots/auth.png)

### 🖥️ Dashboard
![Dashboard](frontend/screenshots/dashboard.png)

### 🗄️ MongoDB Storage
![DB Storage](frontend/screenshots/dbstorage.png)

>>>>>>> 33a39dbb40a491ebeeaff49ab6dd8e32276feaa4
