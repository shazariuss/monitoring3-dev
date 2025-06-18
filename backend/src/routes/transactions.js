const express = require("express");
const transactionController = require("../controllers/transactionController");

const router = express.Router();

// Получить список транзакций
router.get("/", transactionController.getTransactions);

// Получить статистику транзакций
router.get("/stats", transactionController.getStats);

// Получить типы форм
router.get("/form-types", transactionController.getFormTypes);

// Получить коды ошибок
router.get("/errors", transactionController.getErrors);

// Получить статусы сообщений - НОВЫЙ РОУТ
router.get("/message-states", transactionController.getMessageStates);

// Тест соединения
router.get("/test", transactionController.testConnection);

// Получить конкретную транзакцию по ID
router.get("/:id", transactionController.getTransactionById);

module.exports = router;
