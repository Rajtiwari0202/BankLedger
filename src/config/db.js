const mongoose = require("mongoose");

/**
 * Connect to MongoDB Database
 */
function connectToDB() {
  return mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Database Connected Successfully");
    })
    .catch((err) => {
      console.error("Error Connecting to DB:", err.message);
      process.exit(1);
    });
}

module.exports = connectToDB;