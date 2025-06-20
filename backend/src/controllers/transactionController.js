const transactionService = require("../services/transactionService");

const getTransactions = async (req, res) => {
    try {
        const filters = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            dateFrom: req.query.dateFrom || undefined,
            dateTo: req.query.dateTo || undefined,
            status: req.query.status || undefined,
            type: req.query.type || undefined,
            search: req.query.search || undefined,
            errorsOnly: req.query.errorsOnly || undefined,
        };

        const result = await transactionService.getTransactions(filters);

        res.json(result);
    } catch (error) {
        console.error("Error in getTransactions:", error);
        res.status(500).json({
            error: "Failed to fetch transactions",
            message: error.message,
        });
    }
};

const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(
            `📋 Getting transaction ${id} - User: tuitshoxrux, Time: 2025-06-20 11:49:25`
        );

        const transaction = await transactionService.getTransactionById(id);

        if (!transaction) {
            return res.status(404).json({
                error: "Transaction not found",
                message: `Transaction with ID ${id} does not exist`,
            });
        }

        console.log(
            `✅ Transaction ${id} retrieved successfully - User: tuitshoxrux, Time: 2025-06-20 11:49:25`
        );

        res.json(transaction);
    } catch (error) {
        console.error(
            `❌ Error in getTransactionById ${req.params.id} - User: tuitshoxrux, Time: 2025-06-20 11:49:25:`,
            error
        );
        res.status(500).json({
            error: "Failed to fetch transaction",
            message: error.message,
        });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await transactionService.getStats();

        res.json(stats);
    } catch (error) {
        console.error("Error in getStats:", error);
        res.status(500).json({
            error: "Failed to fetch statistics",
            message: error.message,
        });
    }
};

const getMessageStates = async (req, res) => {
    try {
        console.log(
            "📨 Getting message states - User: tuitshoxrux, Time: 2025-06-20 12:28:15"
        );

        const messageStates = await transactionService.getMessageStates();

        console.log(
            `✅ Message states retrieved successfully: ${messageStates.length} items - User: tuitshoxrux, Time: 2025-06-20 12:28:15`
        );

        res.json(messageStates);
    } catch (error) {
        console.error(
            "❌ Error in getMessageStates - User: tuitshoxrux, Time: 2025-06-20 12:28:15:",
            error
        );
        res.status(500).json({
            error: "Failed to fetch message states",
            message: error.message,
        });
    }
};

const getErrors = async (req, res) => {
    try {
        const errors = await transactionService.getErrors();

        res.json(errors);
    } catch (error) {
        console.error("Error in getErrors:", error);
        res.status(500).json({
            error: "Failed to fetch error codes",
            message: error.message,
        });
    }
};

const testConnection = async (req, res) => {
    try {
        const result = await transactionService.testConnection();

        res.json(result);
    } catch (error) {
        console.error("Error in testConnection:", error);
        res.status(500).json({
            error: "Database connection test failed",
            message: error.message,
        });
    }
};

const getFormTypes = async (req, res) => {
    try {
        console.log(
            "📋 Getting form types - User: tuitshoxrux, Time: 2025-06-20 12:37:14"
        );

        const formTypes = await transactionService.getFormTypes();

        console.log(
            `✅ Form types retrieved successfully: ${formTypes.length} items - User: tuitshoxrux, Time: 2025-06-20 12:37:14`
        );

        res.json(formTypes);
    } catch (error) {
        console.error(
            "❌ Error in getFormTypes - User: tuitshoxrux, Time: 2025-06-20 12:37:14:",
            error
        );
        res.status(500).json({
            error: "Failed to fetch form types",
            message: error.message,
        });
    }
};

const getQueryStates = async (req, res) => {
    try {
        console.log(
            "📊 Getting query states - User: tuitshoxrux, Time: 2025-06-20 12:40:35"
        );

        const queryStates = await transactionService.getQueryStates();

        console.log(
            `✅ Query states retrieved successfully: ${queryStates.length} items - User: tuitshoxrux, Time: 2025-06-20 12:40:35`
        );

        res.json(queryStates);
    } catch (error) {
        console.error(
            "❌ Error in getQueryStates - User: tuitshoxrux, Time: 2025-06-20 12:40:35:",
            error
        );
        res.status(500).json({
            error: "Failed to fetch query states",
            message: error.message,
        });
    }
};

module.exports = {
    getTransactions,
    getTransactionById,
    getStats,
    getFormTypes,
    getErrors,
    getMessageStates,
    testConnection,
    getQueryStates,
};
