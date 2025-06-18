const express = require("express");
const { getConnection } = require("../config/database");

const router = express.Router();

router.get("/inspect", async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const result = {
            timestamp: new Date().toISOString(),
            tables: {},
        };

        const tables = [
            "R_ERRORS",
            "R_FORM_TYPES",
            "CONV_QUERIES",
            "CONV_QUERY_SOURCES",
            "CONV_QUERY_SOURCES_XML",
        ];

        for (const tableName of tables) {
            console.log(`📋 Checking table structure for ${tableName}...`);

            try {
                const tableExistsQuery = `
          SELECT COUNT(*) as TABLE_EXISTS
          FROM user_tables 
          WHERE table_name = :tableName
        `;
                const existsResult = await connection.execute(
                    tableExistsQuery,
                    { tableName }
                );
                const tableExists = existsResult.rows[0][0] > 0;

                if (!tableExists) {
                    result.tables[tableName] = {
                        exists: false,
                        error: "Table does not exist",
                    };
                    continue;
                }

                const structureQuery = `
          SELECT 
            column_name,
            data_type,
            data_length,
            nullable,
            column_id
          FROM user_tab_columns 
          WHERE table_name = :tableName
          ORDER BY column_id
        `;
                const structureResult = await connection.execute(
                    structureQuery,
                    { tableName }
                );

                const countQuery = `SELECT COUNT(*) as ROW_COUNT FROM ${tableName}`;
                const countResult = await connection.execute(countQuery);
                const rowCount = countResult.rows[0][0];

                let sampleData = [];
                if (rowCount > 0) {
                    const sampleQuery = `SELECT * FROM ${tableName} WHERE ROWNUM <= 3`;
                    const sampleResult = await connection.execute(sampleQuery);

                    sampleData = sampleResult.rows.map((row) => {
                        const rowObject = {};
                        sampleResult.metaData.forEach((column, index) => {
                            rowObject[column.name] = row[index];
                        });
                        return rowObject;
                    });
                }

                result.tables[tableName] = {
                    exists: true,
                    rowCount: rowCount,
                    columns: structureResult.rows.map((row) => ({
                        name: row[0],
                        type: row[1],
                        length: row[2],
                        nullable: row[3],
                        position: row[4],
                    })),
                    sampleData: sampleData,
                };
            } catch (error) {
                result.tables[tableName] = {
                    exists: false,
                    error: error.message,
                };
            }
        }

        console.log("\n🔍 DATABASE INSPECTION REPORT");
        console.log("============================");

        for (const [tableName, tableInfo] of Object.entries(result.tables)) {
            console.log(`\n📊 Table: ${tableName}`);

            if (!tableInfo.exists) {
                console.log(`  ❌ ${tableInfo.error}`);
                continue;
            }

            console.log(`  ✅ Exists with ${tableInfo.rowCount} records`);
            console.log(`  📋 Columns:`);

            tableInfo.columns.forEach((col) => {
                console.log(
                    `    - ${col.name}: ${col.type}${
                        col.length ? `(${col.length})` : ""
                    } ${col.nullable === "Y" ? "(nullable)" : "(not null)"}`
                );
            });

            if (tableInfo.sampleData.length > 0) {
                console.log(`  📄 Sample data:`);
                tableInfo.sampleData.forEach((row, index) => {
                    console.log(`    Record ${index + 1}:`);
                    Object.entries(row).forEach(([key, value]) => {
                        const displayValue =
                            value === null
                                ? "NULL"
                                : value instanceof Date
                                ? value.toISOString()
                                : typeof value === "string" && value.length > 50
                                ? value.substring(0, 50) + "..."
                                : value;
                        console.log(`      ${key}: ${displayValue}`);
                    });
                });
            }
        }

        console.log("\n✅ Database inspection completed!");

        res.json(result);
    } catch (error) {
        console.error("Database inspection error:", error);
        res.status(500).json({
            error: "Database inspection failed",
            message: error.message,
        });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

module.exports = router;
