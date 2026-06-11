const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, "Token is required to blacklist"],
    unique: true,
  },

  blacklistedAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },

  expiresAt: {
    type: Date,
    required: [true, "Expiration date is required"],
  },
}, {
  timestamps: true,
});

tokenBlacklistSchema.index({ token: 1 });

tokenBlacklistSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const tokenBlacklistModel = mongoose.model(
  "tokenBlacklist",
  tokenBlacklistSchema
);

module.exports = tokenBlacklistModel;