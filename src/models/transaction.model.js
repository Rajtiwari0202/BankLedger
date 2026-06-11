const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Transaction must be associated with a fromAccount"],
    index: true,
  },

  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Transaction must be associated with a toAccount"],
  },

  status: {
    type: String,
    enum: {
      values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      message: "Status can be either PENDING, COMPLETED, FAILED, or REVERSED",
    },
    default: "PENDING",
  },

  amount: {
    type: Number,
    required: [true, "Amount is required for creating a transaction"],
    min: [1, "Transaction amount must be greater than 0"],
  },

  idempotencyKey: {
    type: String,
    required: [true, "Idempotency key is required for creating a transaction"],
    unique: true,
    index: true,
  },

}, {
  timestamps: true,
});

const transactionModel = mongoose.model(
  "transaction",
  transactionSchema
);

module.exports = transactionModel;