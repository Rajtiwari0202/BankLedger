const express = require("express");

const {
  createTransaction,
  createInitialFundsTransaction,
} = require("../controllers/transaction.controller");

const { authMiddleware } = require("../middleware/auth.middleware");

const transactionRoutes = express.Router();

/**
 * POST /api/transactions/
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
 */

transactionRoutes.post(
  "/initial-funds",
  authMiddleware,
  createInitialFundsTransaction
);

module.exports = transactionRoutes;