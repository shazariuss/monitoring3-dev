const exportService = require("../services/exportService");

class ExportController {
    async exportTransactions(req, res) {
        try {
            const filters = req.query;
            const format = req.query.format || "xlsx";

            const exportData = await exportService.exportTransactions(
                filters,
                format
            );

            const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-")
                .substring(0, 19);
            const filename = `swift-transactions-${timestamp}.${format}`;

            if (format === "csv") {
                res.setHeader("Content-Type", "text/csv");
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="${filename}"`
                );
                res.send(exportData);
            } else {
                res.setHeader(
                    "Content-Type",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="${filename}"`
                );
                res.send(exportData);
            }
        } catch (error) {
            console.error("Error in exportTransactions:", error);
            res.status(500).json({
                error: "Export failed",
                message: error.message,
            });
        }
    }

    async getExportPreview(req, res) {
        try {
            const filters = req.query;
            const stats = await exportService.getExportStats(filters);

            res.json({
                ...stats,
                willExport: Math.min(stats.totalRecords, stats.maxExportLimit),
                hasMore: stats.totalRecords > stats.maxExportLimit,
            });
        } catch (error) {
            console.error("Error in getExportPreview:", error);
            res.status(500).json({ error: "Failed to get export preview" });
        }
    }
}

module.exports = new ExportController();
