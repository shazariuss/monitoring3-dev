const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// Основные роуты
router.get("/", transactionController.getTransactions);
router.get("/stats", transactionController.getStats);

// Справочники - ВАЖНО: эти роуты должны быть ДО роута /:id
router.get("/form-types", transactionController.getFormTypes);
router.get("/query-states", transactionController.getQueryStates);
router.get("/message-states", transactionController.getMessageStates);
router.get("/errors", transactionController.getErrors);

// Роут для конкретной транзакции - ДОЛЖЕН быть ПОСЛЕДНИМ
router.get("/:id", transactionController.getTransactionById);

// Тест соединения
router.get("/test/connection", transactionController.testConnection);

module.exports = router;
