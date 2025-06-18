const express = require("express");
const exportController = require("../controllers/exportController");

const router = express.Router();

router.get("/transactions", exportController.exportTransactions);
router.get("/preview", exportController.getExportPreview);

module.exports = router;
