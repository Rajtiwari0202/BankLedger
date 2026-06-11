# BankLedger

A production-inspired digital banking backend built with Node.js, Express, MongoDB, and Mongoose.

Unlike traditional CRUD banking demos, BankLedger implements immutable ledger accounting, idempotent money transfers, MongoDB transaction sessions, JWT token blacklisting, and system-funded account initialization.

---

## Architecture Overview

BankLedger follows a ledger-first accounting model.

Balances are never stored directly in the database.

Instead, every transaction generates immutable ledger entries and account balances are derived from transaction history.

This approach provides:

* Auditability
* Consistency
* Transaction traceability
* Reduced risk of balance corruption

---

## Core Features

### Authentication

* User Registration
* User Login
* JWT Authentication
* Secure HTTP-only Cookies
* JWT Token Blacklisting
* Logout Support

### Account Management

* Create Account
* Retrieve User Accounts
* Account Ownership Validation
* Account Status Management

  * ACTIVE
  * FROZEN
  * CLOSED

### Ledger System

* Immutable Ledger Entries
* Credit Entries
* Debit Entries
* Transaction References
* Update/Delete Protection

### Transactions

* User-to-User Transfers
* Idempotency Protection
* Duplicate Request Prevention
* Transaction Status Tracking

Supported statuses:

* PENDING
* COMPLETED
* FAILED
* REVERSED

### Initial Funding System

System-funded account initialization through a dedicated internal account.

Allows controlled creation of funds without exposing minting functionality to normal users.

### Notifications

Email notifications for:

* User Registration
* Successful Transactions
* Failed Transactions

---

## Double Entry Accounting

Every transfer generates two ledger entries.

Example:

User A sends ₹1000 to User B

Debit Entry

Account: User A
Amount: ₹1000
Type: DEBIT

Credit Entry

Account: User B
Amount: ₹1000
Type: CREDIT

Result:

User A Balance = Previous Balance - ₹1000

User B Balance = Previous Balance + ₹1000

---

## Balance Calculation

Balances are calculated dynamically from ledger entries.

Formula:

Balance = Total Credits - Total Debits

No mutable balance field exists inside the Account model.

This prevents balance drift and maintains accounting integrity.

---

## Transaction Flow

1. Validate Request
2. Validate Idempotency Key
3. Validate Account Status
4. Derive Current Balance
5. Create Transaction (PENDING)
6. Create Debit Ledger Entry
7. Create Credit Ledger Entry
8. Mark Transaction COMPLETED
9. Commit MongoDB Transaction
10. Send Notification

---

## Tech Stack

Backend:

* Node.js
* Express.js

Database:

* MongoDB
* Mongoose

Authentication:

* JWT
* Cookie Parser

Email:

* Nodemailer
* Gmail OAuth2

Security:

* Token Blacklisting
* Protected Routes
* Account Ownership Validation

Database Consistency:

* MongoDB Sessions
* ACID Transactions

---

## API Endpoints

Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

Accounts

POST /api/accounts

GET /api/accounts

GET /api/accounts/:accountId/balance

Transactions

POST /api/transactions

POST /api/transactions/initial-funds

---

## Future Improvements

* Transaction History APIs
* Monthly Statements
* Scheduled Transfers
* Multi-Currency Support
* Rate Limiting
* Admin Dashboard
* Fraud Detection Rules
* Webhook Notifications

---

## License

MIT License
