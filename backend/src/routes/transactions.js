const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/", transactionController.getTransactions);
router.get("/stats", transactionController.getStats);

router.get("/form-types", transactionController.getFormTypes);
router.get("/query-states", transactionController.getQueryStates);
router.get("/message-states", transactionController.getMessageStates);
router.get("/errors", transactionController.getErrors);

router.get("/:id", transactionController.getTransactionById);

module.exports = router;
