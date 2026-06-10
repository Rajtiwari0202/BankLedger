# 💰 BankLedger

A secure and modern banking ledger management system built with the MERN stack backend technologies. BankLedger helps users manage accounts, track transactions, maintain ledger records, and securely authenticate using JWT-based authentication with email services powered by Gmail OAuth2.

---

## 🚀 Features

### 🔐 Authentication & Security

* User Registration
* Secure Login System
* JWT Authentication
* Password Hashing with bcrypt
* Protected Routes
* Role-Based Authorization Support
* Secure Environment Variable Configuration

### 📧 Email Integration

* Gmail OAuth2 Authentication
* Welcome Emails
* Account Verification Support
* Password Reset Email Infrastructure
* Nodemailer Integration

### 👤 User Management

* Create Account
* User Profile Management
* Account Status Tracking
* Secure Session Handling

### 💳 Ledger Management

* Create Ledger Entries
* View Transaction History
* Credit Transactions
* Debit Transactions
* Balance Tracking
* Transaction Validation

### 🛡 Backend Features

* RESTful API Architecture
* MongoDB Database Integration
* Mongoose ODM
* Centralized Error Handling
* Request Validation
* Middleware-Based Security

---

## 🏗 Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT (JSON Web Tokens)
* bcryptjs

### Email Service

* Nodemailer
* Gmail OAuth2

### Development Tools

* Nodemon
* dotenv

---

## 📂 Project Structure

```bash
BankLedger/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
├── config/
│
├── .env
├── server.js
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

---

## 🛠 Installation

### Clone Repository

```bash
git clone https://github.com/Rajtiwari0202/BankLedger.git
```

### Navigate to Project

```bash
cd BankLedger
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Server will run on:

```bash
http://localhost:3000
```

---

## 📡 API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

#### Login User

```http
POST /api/auth/login
```

#### Get Current User

```http
GET /api/auth/me
```

### Ledger

#### Create Transaction

```http
POST /api/ledger
```

#### Get All Transactions

```http
GET /api/ledger
```

#### Get Transaction By ID

```http
GET /api/ledger/:id
```

---

## 🔒 Security Measures

* Password Hashing using bcrypt
* JWT-Based Authentication
* Environment Variable Protection
* Secure Route Middleware
* Input Validation
* OAuth2 Email Authentication

---

## 📸 Screenshots

### Authentication

*Add screenshots here*

### Dashboard

*Add screenshots here*

### Ledger Records

*Add screenshots here*

---

## 🧪 Future Enhancements

* Account Verification Flow
* Password Reset Functionality
* Admin Dashboard
* Transaction Categories
* Analytics & Reports
* PDF Statement Generation
* Multi-Account Support
* Export Transactions (CSV/PDF)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork this repository and submit a pull request.

---

## 👨‍💻 Author

**Raj Tiwari**

* GitHub: https://github.com/Rajtiwari0202
* LinkedIn: https://www.linkedin.com/in/rajtiwari02

---

## ⭐ Support

If you found this project useful, please consider giving it a star on GitHub.
