# BankLedger

A production-inspired digital banking backend built with Node.js, Express.js, MongoDB, and Mongoose.

BankLedger implements immutable double-entry ledger accounting, idempotent transactions, MongoDB ACID transactions, JWT authentication with token blacklisting, and email notifications.

Unlike traditional CRUD banking demos, balances are never stored directly in the database. Instead, they are derived from immutable ledger entries, providing auditability and consistency similar to real-world financial systems.

---

## Live Demo

**Deployment URL**

https://bankledger-hu91.onrender.com

**Health Check**

```http
GET /
```

Response:

```txt
Ledger service is up and running
```

---

## Highlights

* JWT Authentication
* Token Blacklisting
* Secure Logout
* Account Management
* Double Entry Accounting
* Immutable Ledger Entries
* Ledger-Based Balance Calculation
* Browser-Based Banking Operations Console
* Transaction History APIs
* Account Statements
* Ledger Audit APIs
* MongoDB Transaction Sessions
* Idempotent Transactions
* System Account Funding
* Email Notifications
* MongoDB Atlas Integration
* Render Deployment

---

## Why This Project?

Most beginner banking applications store balances directly inside an account document.

This approach can lead to inconsistencies, race conditions, and balance corruption.

BankLedger follows a ledger-first architecture:

* Every financial action creates immutable ledger entries.
* Account balances are calculated from transaction history.
* Transactions are processed atomically using MongoDB sessions.
* Duplicate requests are prevented using idempotency keys.

This architecture is significantly closer to how financial systems are built in production environments.

---

## Architecture Overview

```text
User
  │
  ▼
Authentication Layer
  │
  ▼
Transaction Service
  │
  ├── Transaction Collection
  │
  ├── Ledger Collection
  │
  └── Account Collection
          │
          ▼
     Balance Calculation
     (Credits - Debits)
```

---

## Core Features

### Authentication

* User Registration
* User Login
* JWT Authentication
* HTTP-only Cookies
* Logout Support
* Token Blacklisting

### Account Management

* Create Account
* View User Accounts
* View Account Balance
* Account Ownership Validation

### Account Statuses

Supported account states:

```txt
ACTIVE
FROZEN
CLOSED
```

Only ACTIVE accounts can participate in transactions.

### Transaction Management

* User-to-User Transfers
* Transaction Status Tracking
* MongoDB ACID Transactions
* Idempotency Protection

Supported statuses:

```txt
PENDING
COMPLETED
FAILED
REVERSED
```

### Ledger System

Each transaction generates immutable ledger entries.

Supported entry types:

```txt
DEBIT
CREDIT
```

Ledger entries cannot be modified or deleted after creation.

### Initial Funding System

A dedicated internal system account is used to provide initial account funding.

This ensures controlled money creation while maintaining ledger integrity.

### Email Notifications

Automatic email notifications for:

* User Registration
* Successful Transactions
* Failed Transactions

---

## Double Entry Accounting

Example:

User A sends ₹1000 to User B.

Ledger entries created:

```txt
DEBIT
Account: User A
Amount: ₹1000
```

```txt
CREDIT
Account: User B
Amount: ₹1000
```

Result:

```txt
User A Balance = Previous Balance - ₹1000

User B Balance = Previous Balance + ₹1000
```

---

## Balance Calculation

Balances are derived dynamically from ledger entries.

Formula:

```txt
Balance = Total Credits - Total Debits
```

No mutable balance field exists in the Account model.

This prevents balance drift and ensures accounting accuracy.

---

## Transaction Flow

### User Transfer Flow

1. Validate Request
2. Validate Idempotency Key
3. Validate Account Status
4. Calculate Sender Balance
5. Create Transaction (PENDING)
6. Create DEBIT Ledger Entry
7. Create CREDIT Ledger Entry
8. Mark Transaction COMPLETED
9. Commit MongoDB Session
10. Send Notification Email

---

## Database Models

### User

```js
{
  email,
  name,
  password,
  systemUser
}
```

### Account

```js
{
  user,
  status,
  currency,
  systemAccount
}
```

### Transaction

```js
{
  fromAccount,
  toAccount,
  amount,
  status,
  idempotencyKey
}
```

### Ledger

```js
{
  account,
  transaction,
  amount,
  type
}
```

### Token Blacklist

```js
{
  token,
  blacklistedAt,
  expiresAt
}
```

---

## API Endpoints

### Authentication

#### Register

```http
POST /api/auth/register
```

#### Login

```http
POST /api/auth/login
```

#### Logout

```http
POST /api/auth/logout
```

#### Current User

```http
GET /api/auth/me
```

---

### Accounts

#### Create Account

```http
POST /api/accounts
```

#### Get User Accounts

```http
GET /api/accounts
```

#### Get Account Balance

```http
GET /api/accounts/:accountId/balance
```

#### Update Account Status

```http
PATCH /api/accounts/:accountId/status
```

#### Get Account Ledger

```http
GET /api/accounts/:accountId/ledger?page=1&limit=20
```

#### Get Account Statement

```http
GET /api/accounts/:accountId/statement?from=2026-01-01&to=2026-12-31
```

---

### Transactions

#### Get Transaction History

```http
GET /api/transactions?page=1&limit=20
```

#### Get Transaction Detail

```http
GET /api/transactions/:transactionId
```

#### Create Transaction

```http
POST /api/transactions
```

Example:

```json
{
  "fromAccount": "ACCOUNT_ID",
  "toAccount": "ACCOUNT_ID",
  "amount": 1000,
  "idempotencyKey": "unique-transfer-id"
}
```

#### Initial Funding

```http
POST /api/transactions/initial-funds
```

---

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* JWT
* Cookie Parser

### Email

* Nodemailer
* Gmail OAuth2

### Deployment

* Render

---

## Environment Variables

Create a `.env` file:

```env
PORT=3000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email

CLIENT_ID=your_google_client_id

CLIENT_SECRET=your_google_client_secret

REFRESH_TOKEN=your_google_refresh_token
```

---

## Local Setup

Clone the repository:

```bash
git clone <repository-url>
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Run production server:

```bash
npm start
```

Open the banking operations console:

```txt
http://localhost:3000/app
```

---

## Frontend Deployment

The frontend lives in the `public` folder and is ready for Vercel static hosting.

By default it connects to:

```txt
https://bankledger-hu91.onrender.com
```

To point the frontend somewhere else, update:

```txt
public/config.js
```

On Render, set one of these environment variables to your Vercel frontend URL after deployment:

```env
CLIENT_URL=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Localhost and `*.vercel.app` origins are already allowed by CORS.

---

## Future Improvements

* Scheduled Transfers
* Multi-Currency Support
* Rate Limiting
* Fraud Detection Rules
* Admin Dashboard
* Audit Reporting

---

## License

MIT License

---

Built by Raj Tiwari
