const { getConnection } = require("../config/database");
const XLSX = require("xlsx");
const { Parser } = require("json2csv");

class ExportService {
    cleanFilters(filters) {
        const cleaned = {};

        Object.keys(filters).forEach((key) => {
            const value = filters[key];

            if (
                value !== null &&
                value !== undefined &&
                value !== "" &&
                value !== "null" &&
                value !== "undefined"
            ) {
                if (key === "status" && !isNaN(value)) {
                    cleaned[key] = parseInt(value);
                } else if (key === "errorsOnly") {
                    cleaned[key] = value === "true";
                } else {
                    cleaned[key] = value;
                }
            }
        });

        return cleaned;
    }

    async exportTransactions(filters = {}, format = "xlsx") {
        let connection;
        try {
            connection = await getConnection();

            const cleanedFilters = this.cleanFilters(filters);
            console.log("Cleaned filters:", cleanedFilters);

            let query = `
        SELECT 
          cq.ID,
          cq.MESSAGE_ID,
          cq.TYPE,
          CASE 
            WHEN cq.DIRECTION = 1 THEN 'Outbound'
            WHEN cq.DIRECTION = 2 THEN 'Inbound'
            ELSE 'Unknown'
          END as DIRECTION,
          CASE 
            WHEN cq.ERROR IS NOT NULL AND cq.ERROR != 0 THEN 'Error'
            WHEN cq.STATE = 9 THEN 'Success'
            WHEN cq.STATE IN (1, 2, 3) THEN 'Processing'
            ELSE 'Unknown'
          END as STATUS,
          cq.INIT_TIME,
          cq.SEND_TIME,
          cq.RES_TIME,
          cq.ERROR,
          cq.ERROR_MESSAGE,
          cq.FILE_NAME,
          cq.RES_FILE_NAME,
          cq.REFERENCE_,
          re.MESSAGE as ERROR_DESCRIPTION,
          ft.NAME as TYPE_DESCRIPTION,
          ft.SHORT_TITLE as TYPE_SHORT_TITLE
        FROM CONV_QUERIES cq
        LEFT JOIN R_ERRORS re ON cq.ERROR = re.CODE
        LEFT JOIN R_FORM_TYPES ft ON cq.TYPE = ft.ALIAS || '.' || ft.BODY_VERSION
        WHERE 1=1
      `;

            const binds = {};

            if (cleanedFilters.dateFrom) {
                query += ` AND cq.INIT_TIME >= :dateFrom`;
                binds.dateFrom = new Date(cleanedFilters.dateFrom);
            }

            if (cleanedFilters.dateTo) {
                query += ` AND cq.INIT_TIME <= :dateTo`;
                binds.dateTo = new Date(cleanedFilters.dateTo);
            }

            if (cleanedFilters.status) {
                query += ` AND cq.STATE = :status`;
                binds.status = cleanedFilters.status;
            }

            if (cleanedFilters.type) {
                query += ` AND cq.TYPE LIKE :type`;
                binds.type = `%${cleanedFilters.type}%`;
            }

            if (cleanedFilters.errorsOnly === true) {
                query += ` AND cq.ERROR IS NOT NULL AND cq.ERROR != 0`;
            }

            if (cleanedFilters.search) {
                query += ` AND (
          UPPER(TO_CHAR(cq.MESSAGE_ID)) LIKE UPPER(:search) OR 
          UPPER(cq.FILE_NAME) LIKE UPPER(:search) OR 
          UPPER(cq.REFERENCE_) LIKE UPPER(:search) OR
          UPPER(TO_CHAR(cq.ID)) LIKE UPPER(:search)
        )`;
                binds.search = `%${cleanedFilters.search}%`;
            }

            query += ` ORDER BY cq.INIT_TIME DESC`;
            query += ` FETCH FIRST 10000 ROWS ONLY`;

            console.log("Final query:", query);
            console.log("Query binds:", binds);

            const result = await connection.execute(query, binds);

            const data = result.rows.map((row) => {
                const transaction = {};
                result.metaData.forEach((column, index) => {
                    let value = row[index];

                    if (value instanceof Date) {
                        value = value
                            .toISOString()
                            .replace("T", " ")
                            .substring(0, 19);
                    }

                    transaction[column.name] = value;
                });
                return transaction;
            });

            if (format === "csv") {
                return this.generateCSV(data);
            } else {
                return this.generateExcel(data);
            }
        } catch (error) {
            console.error("Error exporting transactions:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    generateExcel(data) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        const colWidths = [
            { wch: 12 },
            { wch: 15 },
            { wch: 20 },
            { wch: 10 },
            { wch: 12 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 8 },
            { wch: 30 },
            { wch: 25 },
            { wch: 25 },
            { wch: 15 },
            { wch: 30 },
            { wch: 30 },
            { wch: 20 },
        ];

        worksheet["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        return XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
            compression: true,
        });
    }

    generateCSV(data) {
        const fields = [
            "ID",
            "MESSAGE_ID",
            "TYPE",
            "DIRECTION",
            "STATUS",
            "INIT_TIME",
            "SEND_TIME",
            "RES_TIME",
            "ERROR",
            "ERROR_MESSAGE",
            "FILE_NAME",
            "RES_FILE_NAME",
            "REFERENCE_",
            "ERROR_DESCRIPTION",
            "TYPE_DESCRIPTION",
            "TYPE_SHORT_TITLE",
        ];

        const parser = new Parser({
            fields,
            delimiter: ",",
            quote: '"',
            escape: '"',
        });

        return parser.parse(data);
    }

    async getExportStats(filters = {}) {
        let connection;
        try {
            connection = await getConnection();

            const cleanedFilters = this.cleanFilters(filters);
            console.log("Stats cleaned filters:", cleanedFilters);

            let query = `
        SELECT COUNT(*) as TOTAL_RECORDS
        FROM CONV_QUERIES cq
        WHERE 1=1
      `;

            const binds = {};

            if (cleanedFilters.dateFrom) {
                query += ` AND cq.INIT_TIME >= :dateFrom`;
                binds.dateFrom = new Date(cleanedFilters.dateFrom);
            }

            if (cleanedFilters.dateTo) {
                query += ` AND cq.INIT_TIME <= :dateTo`;
                binds.dateTo = new Date(cleanedFilters.dateTo);
            }

            if (cleanedFilters.status) {
                query += ` AND cq.STATE = :status`;
                binds.status = cleanedFilters.status;
            }

            if (cleanedFilters.type) {
                query += ` AND cq.TYPE LIKE :type`;
                binds.type = `%${cleanedFilters.type}%`;
            }

            if (cleanedFilters.errorsOnly === true) {
                query += ` AND cq.ERROR IS NOT NULL AND cq.ERROR != 0`;
            }

            if (cleanedFilters.search) {
                query += ` AND (
          UPPER(TO_CHAR(cq.MESSAGE_ID)) LIKE UPPER(:search) OR 
          UPPER(cq.FILE_NAME) LIKE UPPER(:search) OR 
          UPPER(cq.REFERENCE_) LIKE UPPER(:search) OR
          UPPER(TO_CHAR(cq.ID)) LIKE UPPER(:search)
        )`;
                binds.search = `%${cleanedFilters.search}%`;
            }

            console.log("Stats query:", query);
            console.log("Stats binds:", binds);

            const result = await connection.execute(query, binds);

            return {
                totalRecords: result.rows[0][0],
                maxExportLimit: 10000,
            };
        } catch (error) {
            console.error("Error getting export stats:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = new ExportService();
