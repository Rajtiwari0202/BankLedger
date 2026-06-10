const accountModel = require("../models/account.model");

/**
 * Create Account
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
 * Get Logged-in User Accounts
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

async function getAccountBalanceController(req,res){
  const { accountId } = req.params

  const account = await accountModel.findOne({
    _id:accountId,
    user:req.user._id
  })
  if(!account){
    return res.status(404).json({
      message:"Account not found"
    })
  }
  const balance = await account.getBalance();
  res.status(200).json({
    accountId:account._id,
    balance:balance
  })
}

module.exports = {
  createAccountController,
  getAccountsController,
  getAccountBalanceController
};