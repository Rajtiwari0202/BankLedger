const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

/**
 * POST /api/accounts/
 * Create a new account
 * Protected Route
 */
router.post(
  "/",
  authMiddleware.authMiddleware,
  accountController.createAccountController
);

/**
 * GET /api/accounts/
 * Get all accounts of the logged-in user
 * Protected Route
 */
router.get(
  "/",
  authMiddleware.authMiddleware,
  accountController.getAccountsController
);

/**
 * GET /api/accounts/:accountId/ledger
 * Get immutable ledger entries for an account
 * Protected Route
 */
router.get(
  "/:accountId/ledger",
  authMiddleware.authMiddleware,
  accountController.getAccountLedgerController
);

/**
 * GET /api/accounts/:accountId/statement
 * Get account statement summary and entries
 * Protected Route
 */
router.get(
  "/:accountId/statement",
  authMiddleware.authMiddleware,
  accountController.getAccountStatementController
);

/**
 * PATCH /api/accounts/:accountId/status
 * Freeze, activate, or close an owned account
 * Protected Route
 */
router.patch(
  "/:accountId/status",
  authMiddleware.authMiddleware,
  accountController.updateAccountStatusController
);

/**
 * GET /api/accounts/:accountId/balance
 * Get balance of a specific account
 * Protected Route
 */
router.get(
  "/:accountId/balance",
  authMiddleware.authMiddleware,
  accountController.getAccountBalanceController
);

module.exports = router;
