const transactionService = require("../services/transactionService");

class TransactionController {
    async getTransactions(req, res) {
        try {
            const filters = req.query;
            console.log("📋 Fetching transactions with filters:", filters);

            const result = await transactionService.getTransactions(filters);

            res.json(result);
        } catch (error) {
            console.error("Error in getTransactions:", error);
            res.status(500).json({ error: "Failed to fetch transactions" });
        }
    }

    async getTransactionById(req, res) {
        try {
            const { id } = req.params;
            console.log(`📋 Fetching transaction details for ID: ${id}`);

            const transaction = await transactionService.getTransactionById(id);

            if (!transaction) {
                console.log(`❌ Transaction not found: ${id}`);
                return res.status(404).json({ error: "Transaction not found" });
            }

            console.log(`✅ Transaction details loaded for: ${id}`);
            console.log(
                `📊 Data summary: JSON=${!!transaction.json_data}, XML=${!!transaction.xml_data}`
            );

            // Просто возвращаем объект как есть - он уже чистый
            res.json(transaction);
        } catch (error) {
            console.error("Error in getTransactionById:", error);
            res.status(500).json({
                error: "Failed to fetch transaction details",
            });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await transactionService.getStats();
            res.json(stats);
        } catch (error) {
            console.error("Error in getStats:", error);
            res.status(500).json({ error: "Failed to fetch stats" });
        }
    }
}

module.exports = new TransactionController();
