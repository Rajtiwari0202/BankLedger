const express = require("express");

const {
  createTransaction,
  createInitialFundsTransaction,
} = require("../controllers/transaction.controller");

const {
  authMiddleware,
  authSystemUserMiddleware,
} = require("../middleware/auth.middleware");

const transactionRoutes = express.Router();

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