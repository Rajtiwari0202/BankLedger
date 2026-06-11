const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");

function getPagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

async function findOwnedAccount(accountId, userId) {
  return accountModel.findOne({
    _id: accountId,
    user: userId,
  });
}

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

/**
 * PATCH /api/accounts/:accountId/status
 * Update account status for operational controls.
 */
async function updateAccountStatusController(req, res) {
  try {
    const { accountId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["ACTIVE", "FROZEN", "CLOSED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be ACTIVE, FROZEN, or CLOSED",
      });
    }

    const account = await findOwnedAccount(accountId, req.user._id);

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    if (account.status === "CLOSED" && status !== "CLOSED") {
      return res.status(400).json({
        message: "Closed accounts cannot be reactivated",
      });
    }

    account.status = status;
    await account.save();

    return res.status(200).json({
      message: "Account status updated successfully",
      account,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update account status",
      error: error.message,
    });
  }
}

/**
 * GET /api/accounts/:accountId/ledger
 * Paginated immutable ledger entries for one owned account.
 */
async function getAccountLedgerController(req, res) {
  try {
    const { accountId } = req.params;
    const { page, limit, skip } = getPagination(req.query);
    const account = await findOwnedAccount(accountId, req.user._id);

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const filter = { account: account._id };
    const [entries, total] = await Promise.all([
      ledgerModel
        .find(filter)
        .populate("transaction", "status amount fromAccount toAccount idempotencyKey createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ledgerModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: "Ledger entries fetched successfully",
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch ledger entries",
      error: error.message,
    });
  }
}

/**
 * GET /api/accounts/:accountId/statement
 * Account statement with opening, closing, credit, and debit totals.
 */
async function getAccountStatementController(req, res) {
  try {
    const { accountId } = req.params;
    const account = await findOwnedAccount(accountId, req.user._id);

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    const dateFilter = {};

    if (from && Number.isNaN(from.getTime())) {
      return res.status(400).json({ message: "Invalid from date" });
    }

    if (to && Number.isNaN(to.getTime())) {
      return res.status(400).json({ message: "Invalid to date" });
    }

    if (from) dateFilter.$gte = from;
    if (to) dateFilter.$lte = to;

    const openingMatch = {
      account: account._id,
    };

    if (from) {
      openingMatch.createdAt = { $lt: from };
    }

    const periodMatch = {
      account: account._id,
    };

    if (Object.keys(dateFilter).length > 0) {
      periodMatch.createdAt = dateFilter;
    }

    const [openingData, periodData, entries] = await Promise.all([
      from
        ? ledgerModel.aggregate([
            { $match: openingMatch },
            {
              $group: {
                _id: null,
                credits: { $sum: { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0] } },
                debits: { $sum: { $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0] } },
              },
            },
          ])
        : Promise.resolve([]),
      ledgerModel.aggregate([
        { $match: periodMatch },
        {
          $group: {
            _id: null,
            credits: { $sum: { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0] } },
            debits: { $sum: { $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0] } },
          },
        },
      ]),
      ledgerModel
        .find(periodMatch)
        .populate("transaction", "status amount fromAccount toAccount idempotencyKey createdAt")
        .sort({ createdAt: -1 }),
    ]);

    const opening = (openingData[0]?.credits || 0) - (openingData[0]?.debits || 0);
    const credits = periodData[0]?.credits || 0;
    const debits = periodData[0]?.debits || 0;

    return res.status(200).json({
      message: "Statement generated successfully",
      account: {
        _id: account._id,
        status: account.status,
        currency: account.currency,
      },
      period: {
        from: from || null,
        to: to || null,
      },
      summary: {
        openingBalance: opening,
        totalCredits: credits,
        totalDebits: debits,
        closingBalance: opening + credits - debits,
      },
      entries,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate statement",
      error: error.message,
    });
  }
}

module.exports = {
  createAccountController,
  getAccountsController,
  getAccountBalanceController,
  updateAccountStatusController,
  getAccountLedgerController,
  getAccountStatementController,
};
