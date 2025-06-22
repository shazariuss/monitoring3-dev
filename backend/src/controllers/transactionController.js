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

        const transaction = await transactionService.getTransactionById(id);

        if (!transaction) {
            return res.status(404).json({
                error: "Transaction not found",
                message: `Transaction with ID ${id} does not exist`,
            });
        }

        res.json(transaction);
    } catch (error) {
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
        const messageStates = await transactionService.getMessageStates();

        res.json(messageStates);
    } catch (error) {
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

const getFormTypes = async (req, res) => {
    try {
        const formTypes = await transactionService.getFormTypes();

        res.json(formTypes);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch form types",
            message: error.message,
        });
    }
};

const getQueryStates = async (req, res) => {
    try {
        const queryStates = await transactionService.getQueryStates();

        res.json(queryStates);
    } catch (error) {
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
    getQueryStates,
};
