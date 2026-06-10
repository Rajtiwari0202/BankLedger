# BankLedger

BankLedger is a backend-focused banking and ledger management system built with Node.js, Express, MongoDB, and Mongoose.

The project focuses on secure account management, transaction processing, immutable ledger records, authentication, and email integration using Gmail OAuth2.

---

## Features

### Authentication & Security

* JWT-based authentication
* Password hashing with bcrypt
* Protected routes and middleware
* Environment-based configuration
* Gmail OAuth2 integration with Nodemailer

### Account Management

* Create and manage accounts
* Account status handling
* Currency support
* Indexed account queries

### Transaction System

* Credit and debit transaction flow
* Transaction status tracking
* Idempotency support
* Atomic transaction-ready architecture

### Immutable Ledger System

* Immutable ledger entries
* Linked transaction references
* Credit/debit record tracking
* Middleware protection against modifications or deletion

---

## Tech Stack

| Category          | Technologies             |
| ----------------- | ------------------------ |
| Runtime           | Node.js                  |
| Framework         | Express.js               |
| Database          | MongoDB                  |
| ODM               | Mongoose                 |
| Authentication    | JWT, bcryptjs            |
| Email Service     | Nodemailer, Gmail OAuth2 |
| Development Tools | Nodemon, dotenv          |

---

## Project Structure

```bash id="v56j0v"
src/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
│
├── app.js
└── server.js
```

---

## Environment Variables

Create a `.env` file in the root directory.

```env id="t6nk8e"
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

---

## Installation

Clone the repository:

```bash id="tr9h10"
git clone https://github.com/Rajtiwari0202/BankLedger.git
```

Move into the project directory:

```bash id="t6q5tb"
cd BankLedger
```

Install dependencies:

```bash id="m7pxx7"
npm install
```

Start the development server:

```bash id="qz9n99"
npm run dev
```

---

## Core Models

### Account

Stores user banking account information and account status.

### Transaction

Handles transfer records between accounts with transaction state management and idempotency support.

### Ledger

Maintains immutable financial records associated with transactions.

---

## API Architecture

The backend follows a modular architecture:

* Controllers handle request logic
* Routes define API endpoints
* Middleware handles authentication and validation
* Models define database structure
* Services isolate business logic

---

## Future Improvements

* Database transactions using MongoDB sessions
* OTP verification flow
* Password reset system
* Role-based access control
* Rate limiting
* Audit logging
* Statement generation
* Swagger/OpenAPI documentation
* Docker support
* Unit and integration testing

---

## Author

Raj Tiwari

GitHub: https://github.com/Rajtiwari0202
LinkedIn: https://www.linkedin.com/in/raj-tiwari-687b67284

---

## License

This project is licensed under the MIT License.
