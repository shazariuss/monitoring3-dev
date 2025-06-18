const express = require("express");
const transactionController = require("../controllers/transactionController");

const router = express.Router();

// Получить список транзакций
router.get("/", transactionController.getTransactions);

// Получить статистику транзакций
router.get("/stats", transactionController.getStats);

// Получить конкретную транзакцию по ID
router.get("/:id", transactionController.getTransactionById);

module.exports = router;
