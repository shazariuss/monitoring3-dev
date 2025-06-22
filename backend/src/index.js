const express = require("express");
const cors = require("cors");
require("dotenv").config();

const transactionRoutes = require("./routes/transactions");
const errorRoutes = require("./routes/errors");
const exportRoutes = require("./routes/export");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/transactions", transactionRoutes);
app.use("/api/errors", errorRoutes);
app.use("/api/export", exportRoutes);

app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
