const express = require("express");
const cors = require("cors");
require("dotenv").config();

const transactionRoutes = require("./routes/transactions");
const errorRoutes = require("./routes/errors");
const databaseRoutes = require("./routes/database");
const exportRoutes = require("./routes/export");
// const debugRoutes = require("./routes/debug");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/errors", errorRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/export", exportRoutes);
// app.use("/api/debug", debugRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
