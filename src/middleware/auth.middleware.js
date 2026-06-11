const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/tokenBlacklist.model");

/**
 * Middleware Helper
 * Extract token from Authorization header or cookie.
 * Header is prioritized to avoid old cookies overriding Postman Bearer tokens.
 */
function getTokenFromRequest(req) {
  return req.headers.authorization?.split(" ")[1] || req.cookies.token;
}

/**
 * Protected Route Middleware
 * Verifies JWT, checks blacklist, and attaches logged-in user to req.user.
 */
async function authMiddleware(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  try {
    const blacklistedToken = await tokenBlacklistModel.findOne({ token });

    if (blacklistedToken) {
      return res.status(401).json({
        message: "Unauthorized access, token has been blacklisted",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access, user not found",
      });
    }

    req.user = user;

    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
}

/**
 * System User Middleware
 * Allows access only if the authenticated user has systemUser=true.
 */
async function authSystemUserMiddleware(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  try {
    const blacklistedToken = await tokenBlacklistModel.findOne({ token });

    if (blacklistedToken) {
      return res.status(401).json({
        message: "Unauthorized access, token has been blacklisted",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId).select("+systemUser");

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access, user not found",
      });
    }

    if (!user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, not a system user",
      });
    }

    req.user = user;

    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware,
};