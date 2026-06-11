const express = require("express");
const cookieParser = require("cookie-parser")
const path = require("path");
const cors = require("cors");

const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "public"), { index: false }));

/**
 * - Routes required
 */
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

app.get("/",(req,res)=>{
    res.send("Ledger service is up and running")
});//For deployment testing

/**
 * - Use Routes
 */

app.use("/api/auth",authRouter);
app.use("/api/accounts",accountRouter);
app.use("/api/transactions",transactionRoutes);

app.get("/app", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
