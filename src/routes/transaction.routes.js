const express = require("express");

const {
  createTransaction,
  createInitialFundsTransaction,
  getTransactions,
  getTransactionById,
} = require("../controllers/transaction.controller");

const {
  authMiddleware,
  authSystemUserMiddleware,
} = require("../middleware/auth.middleware");

const transactionRoutes = express.Router();

/**
 * GET /api/transactions
 * Get paginated transaction history for logged-in user's accounts
 */
transactionRoutes.get(
  "/",
  authMiddleware,
  getTransactions
);

/**
 * GET /api/transactions/:transactionId
 * Get one transaction with ledger entries
 */
transactionRoutes.get(
  "/:transactionId",
  authMiddleware,
  getTransactionById
);

/**
 * POST /api/transactions
 * Create normal user-to-user transaction
 */
transactionRoutes.post(
  "/",
  authMiddleware,
  createTransaction
);

/**
 * POST /api/transactions/initial-funds
 * Add initial funds from system account
 * System User Only
 */
transactionRoutes.post(
  "/initial-funds",
  authSystemUserMiddleware,
  createInitialFundsTransaction
);

module.exports = transactionRoutes;
