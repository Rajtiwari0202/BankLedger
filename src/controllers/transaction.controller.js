const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

/**
 * POST /api/transactions
 *
 * Create a normal user-to-user transaction.
 *
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account ownership and account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction with PENDING status
 * 6. Create DEBIT ledger entry for sender
 * 7. Create CREDIT ledger entry for receiver
 * 8. Mark transaction as COMPLETED
 * 9. Commit MongoDB transaction session
 * 10. Send email notification
 */
async function createTransaction(req, res) {
  const session = await mongoose.startSession();

  try {
    /**
     * 1. Validate Request
     */
    const { fromAccount, toAccount, idempotencyKey } = req.body;
    const amount = Number(req.body.amount);

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "fromAccount, toAccount, amount and idempotencyKey are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    if (fromAccount === toAccount) {
      return res.status(400).json({
        message: "fromAccount and toAccount cannot be same",
      });
    }

    /**
     * 2. Validate Idempotency Key
     */
    const existingTransaction = await transactionModel.findOne({
      idempotencyKey,
    });

    if (existingTransaction) {
      if (existingTransaction.status === "COMPLETED") {
        return res.status(200).json({
          message: "Transaction already processed",
          transaction: existingTransaction,
        });
      }

      if (existingTransaction.status === "PENDING") {
        return res.status(200).json({
          message: "Transaction is still processing",
        });
      }

      return res.status(400).json({
        message: `Transaction already exists with status ${existingTransaction.status}`,
      });
    }

    /**
     * 3. Check Account Ownership and Account Status
     */
    const fromUserAccount = await accountModel.findOne({
      _id: fromAccount,
      user: req.user._id,
    });

    const toUserAccount = await accountModel.findById(toAccount);

    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        message: "Invalid fromAccount or toAccount",
      });
    }

    if (
      fromUserAccount.status !== "ACTIVE" ||
      toUserAccount.status !== "ACTIVE"
    ) {
      return res.status(400).json({
        message: "Both fromAccount and toAccount must be active to process transaction",
      });
    }

    /**
     * 4. Derive Sender Balance From Ledger
     */
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
      });
    }

    /**
     * 5. Create Transaction (PENDING)
     */
    session.startTransaction();

    const [transaction] = await transactionModel.create(
      [
        {
          fromAccount,
          toAccount,
          amount,
          idempotencyKey,
          status: "PENDING",
        },
      ],
      { session }
    );

    /**
     * 6. Create DEBIT Ledger Entry
     */
    const [debitLedgerEntry] = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session }
    );

    /**
     * 7. Create CREDIT Ledger Entry
     */
    const [creditLedgerEntry] = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session }
    );

    /**
     * 8. Mark Transaction Completed
     */
    transaction.status = "COMPLETED";
    await transaction.save({ session });

    /**
     * 9. Commit MongoDB Session
     */
    await session.commitTransaction();

    /**
     * 10. Send Email Notification
     */
    try {
      if (req.user?.email) {
        await emailService.sendTransactionEmail(
          req.user.email,
          req.user.name,
          amount,
          toAccount
        );
      }
    } catch (emailError) {
      console.error("Transaction email failed:", emailError.message);
    }

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction,
      debitLedgerEntry,
      creditLedgerEntry,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      message: "Transaction failed",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
}

/**
 * POST /api/transactions/initial-funds
 *
 * Add initial funds to a user account using the internal system account.
 * This creates one DEBIT entry from the system account and one CREDIT entry
 * to the receiver account.
 */
async function createInitialFundsTransaction(req, res) {
  const session = await mongoose.startSession();

  try {
    /**
     * 1. Validate Request
     */
    const { toAccount, idempotencyKey } = req.body;
    const amount = Number(req.body.amount);

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "toAccount, amount and idempotencyKey are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    /**
     * 2. Validate Idempotency Key
     */
    const existingTransaction = await transactionModel.findOne({
      idempotencyKey,
    });

    if (existingTransaction) {
      return res.status(200).json({
        message: "Initial funding already processed",
        transaction: existingTransaction,
      });
    }

    /**
     * 3. Validate Receiver Account
     */
    const toUserAccount = await accountModel.findById(toAccount);

    if (!toUserAccount) {
      return res.status(400).json({
        message: "Invalid toAccount",
      });
    }

    if (toUserAccount.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Receiver account must be active",
      });
    }

    /**
     * 4. Find System Account
     */
    const systemAccount = await accountModel
      .findOne({
        systemAccount: true,
        status: "ACTIVE",
      })
      .select("+systemAccount");

    if (!systemAccount) {
      return res.status(400).json({
        message: "System account not found",
      });
    }

    /**
     * 5. Start MongoDB Transaction Session
     */
    session.startTransaction();

    /**
     * 6. Create Transaction (PENDING)
     */
    const [transaction] = await transactionModel.create(
      [
        {
          fromAccount: systemAccount._id,
          toAccount,
          amount,
          idempotencyKey,
          status: "PENDING",
        },
      ],
      { session }
    );

    /**
     * 7. Create DEBIT Ledger Entry
     */
    const [debitLedgerEntry] = await ledgerModel.create(
      [
        {
          account: systemAccount._id,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session }
    );

    /**
     * 8. Create CREDIT Ledger Entry
     */
    const [creditLedgerEntry] = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session }
    );

    /**
     * 9. Mark Transaction Completed
     */
    transaction.status = "COMPLETED";
    await transaction.save({ session });

    /**
     * 10. Commit MongoDB Transaction
     */
    await session.commitTransaction();

    return res.status(201).json({
      message: "Initial funds added successfully",
      transaction,
      debitLedgerEntry,
      creditLedgerEntry,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      message: "Initial funding failed",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};