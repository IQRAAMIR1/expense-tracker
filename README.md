# 💼 Business Expense Management System

A full-stack **Multi-Tenant Business Expense Management System** built using the **MERN Stack**, **Firebase Authentication**, **MongoDB Atlas**, and **Cloudinary**. The application allows companies to manage employee expenses through a secure role-based workflow similar to platforms like **Expensify**.

---

## 🚀 Features

### 🔐 Authentication

* Firebase Authentication
* Secure token verification
* Protected API routes

### 👥 Role-Based Access Control (RBAC)

* **Admin**

  * Create a company
  * Manage employees
  * View company expenses
* **Employee**

  * Submit expenses
  * Upload receipts
  * Track approval status
* **Accountant**

  * Review submitted expenses
  * Approve or reject requests
  * Add rejection reasons

---

## 🏢 Multi-Tenant Architecture

Each company has its own:

* Company Account
* Company Code
* Employees
* Accountants
* Expense Records

Users can only access data belonging to their own company.

---

## 💳 Expense Management

Employees can:

* Submit expenses
* Select expense category
* Add vendor details
* Choose payment method
* Write descriptions
* Upload receipt images using Cloudinary

Accountants can:

* Approve expenses
* Reject expenses
* Provide rejection reasons

Employees can view the updated status in real time.


---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Authentication

* Firebase Authentication
* Firebase Admin SDK

### File Upload

* Cloudinary

### Version Control

* Git & GitHub

---

## 📂 Project Structure

```
expense-tracker/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/IQRAAMIR1/expense-tracker.git
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Backend (.env)

```env
PORT=
MONGO_URI=
JWT_SECRET=
```

Firebase Admin Service Account JSON is required for backend authentication.

### Frontend (.env)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

---

## 📸 Screenshots

Add screenshots here after deployment.

Example:

* Landing Page
* Login Page
* Employee Dashboard
* Accountant Dashboard
* Admin Dashboard

---

## 👨‍💻 Author

**Iqra Amir**

GitHub: https://github.com/IQRAAMIR1
