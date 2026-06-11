const accountModel = require("../models/account.model");

/**
 * POST /api/accounts
 * Create a new account for the authenticated user
 */
async function createAccountController(req, res) {
  try {
    const userId = req.user._id;

    const existingAccount = await accountModel.findOne({
      user: userId,
      status: "ACTIVE",
    });

    if (existingAccount) {
      return res.status(400).json({
        message: "Active account already exists for this user",
      });
    }

    const account = await accountModel.create({
      user: userId,
      currency: "INR",
    });

    return res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create account",
      error: error.message,
    });
  }
}

/**
 * GET /api/accounts
 * Get all accounts belonging to the authenticated user
 */
async function getAccountsController(req, res) {
  try {
    const userId = req.user._id;

    const accounts = await accountModel.find({
      user: userId,
    });

    const accountsWithBalance = await Promise.all(
      accounts.map(async (account) => {
        const balance = await account.getBalance();

        return {
          _id: account._id,
          user: account.user,
          status: account.status,
          currency: account.currency,
          balance,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        };
      })
    );

    return res.status(200).json({
      message: "Accounts fetched successfully",
      accounts: accountsWithBalance,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch accounts",
      error: error.message,
    });
  }
}

/**
 * GET /api/accounts/:accountId/balance
 * Get balance of a specific account owned by the authenticated user
 */
async function getAccountBalanceController(req, res) {
  try {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const balance = await account.getBalance();

    return res.status(200).json({
      accountId: account._id,
      balance,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch account balance",
      error: error.message,
    });
  }
}

module.exports = {
  createAccountController,
  getAccountsController,
  getAccountBalanceController,
};