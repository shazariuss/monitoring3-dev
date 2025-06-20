const { getConnection } = require("../config/database");

class TransactionService {
    async getTransactions(filters = {}) {
        let connection;
        try {
            connection = await getConnection();

            let query = `
      SELECT 
        cq.ID,
        cq.MESSAGE_ID,
        cq.TYPE,
        cq.DIRECTION,
        cq.STATE as CONV_STATE,
        cq.INIT_TIME,
        cq.SEND_TIME,
        cq.RES_TIME,
        cq.ERROR,
        cq.ERROR_MESSAGE,
        cq.FILE_NAME,
        cq.RES_FILE_NAME,
        cq.REFERENCE_,
        cq.DATA,
        re.MESSAGE as ERROR_DESCRIPTION,
        ft.NAME as TYPE_DESCRIPTION,
        ft.SHORT_TITLE as TYPE_SHORT_TITLE,
        m.STATUS as MESSAGE_STATUS,
        m.REASON as MESSAGE_REASON,
        m.AMOUNT,
        m.CURRENCY,
        m.PAYER,
        m.RECEIVER,
        rqs.NAME as CONV_STATUS_NAME,
        rqs.COLOR as CONV_STATUS_COLOR,
        rqs.STATUS as CONV_STATUS_ACTIVE,
        -- Получаем CLOB данные из связанных таблиц
        cqs.SOURCE as JSON_DATA,
        cqsx.SOURCE.getClobVal() as XML_DATA
      FROM CONV_QUERIES cq
      LEFT JOIN R_ERRORS re ON cq.ERROR = re.CODE
      LEFT JOIN R_FORM_TYPES ft ON cq.TYPE = ft.ALIAS || '.' || ft.BODY_VERSION
      LEFT JOIN MESSAGES m ON cq.ID = m.QUERY_ID
      LEFT JOIN R_QUERY_STATES rqs ON cq.STATE = rqs.ID
      LEFT JOIN CONV_QUERY_SOURCES cqs ON cq.ID = cqs.QUERY_ID
      LEFT JOIN CONV_QUERY_SOURCES_XML cqsx ON cq.ID = cqsx.QUERY_ID
    `;

            let whereConditions = [];
            let binds = {};

            if (filters.dateFrom && filters.dateTo) {
                whereConditions.push(
                    `cq.INIT_TIME >= TO_DATE(:dateFrom, 'YYYY-MM-DD')`
                );
                whereConditions.push(
                    `cq.INIT_TIME < TO_DATE(:dateTo, 'YYYY-MM-DD') + 1`
                );
                binds.dateFrom = filters.dateFrom;
                binds.dateTo = filters.dateTo;
            } else if (filters.dateFrom) {
                whereConditions.push(
                    `cq.INIT_TIME >= TO_DATE(:dateFrom, 'YYYY-MM-DD')`
                );
                binds.dateFrom = filters.dateFrom;
            } else if (filters.dateTo) {
                whereConditions.push(
                    `cq.INIT_TIME < TO_DATE(:dateTo, 'YYYY-MM-DD') + 1`
                );
                binds.dateTo = filters.dateTo;
            }

            if (filters.status) {
                whereConditions.push(
                    `(cq.STATE = :status OR m.STATUS = :status)`
                );
                binds.status = filters.status;
            }

            if (filters.type) {
                whereConditions.push(`cq.TYPE LIKE :type`);
                binds.type = `%${filters.type}%`;
            }

            if (filters.search) {
                whereConditions.push(`(
        UPPER(cq.REFERENCE_) LIKE UPPER(:search) OR 
        UPPER(cq.FILE_NAME) LIKE UPPER(:search) OR
        UPPER(CAST(cq.MESSAGE_ID AS VARCHAR2(50))) LIKE UPPER(:search) OR
        UPPER(CAST(cq.ID AS VARCHAR2(50))) LIKE UPPER(:search) OR
        UPPER(m.PAYER) LIKE UPPER(:search) OR
        UPPER(m.RECEIVER) LIKE UPPER(:search)
      )`);
                binds.search = `%${filters.search}%`;
            }

            if (filters.errorsOnly === "true" || filters.errorsOnly === true) {
                whereConditions.push(`cq.ERROR IS NOT NULL AND cq.ERROR != 0`);
            }

            if (whereConditions.length > 0) {
                query += ` WHERE ${whereConditions.join(" AND ")}`;
            }

            const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
            const countResult = await connection.execute(countQuery, binds);
            const totalCount = countResult.rows[0][0];

            query += ` ORDER BY cq.INIT_TIME DESC`;

            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 10;
            const offset = (page - 1) * limit;

            const paginatedQuery = `
      SELECT * FROM (
        SELECT rownum as rn, sub.* FROM (
          ${query}
        ) sub WHERE rownum <= :endRow
      ) WHERE rn > :startRow
    `;

            binds.startRow = offset;
            binds.endRow = offset + limit;

            const result = await connection.execute(paginatedQuery, binds);

            const transactions = await Promise.all(
                result.rows.map(async (row, index) => {
                    const transaction = {};

                    await Promise.all(
                        result.metaData.map(async (column, colIndex) => {
                            const columnName = column.name.toLowerCase();
                            let value = row[colIndex];

                            if (columnName === "rn") return;

                            if (
                                value &&
                                typeof value === "object" &&
                                value.getData
                            ) {
                                try {
                                    value = await value.getData();
                                } catch (error) {
                                    console.error(
                                        `❌ Error reading CLOB for ${columnName} - User: tuitshoxrux, Time: 2025-06-20 11:49:25:`,
                                        error
                                    );
                                    value = null;
                                }
                            }

                            if (value instanceof Date) {
                                value = value.toISOString();
                            }

                            if (
                                typeof value === "string" ||
                                typeof value === "number" ||
                                value === null ||
                                value === undefined
                            ) {
                                transaction[columnName] = value;
                            } else {
                                transaction[columnName] = String(value);
                            }
                        })
                    );

                    return transaction;
                })
            );

            return {
                data: transactions,
                pagination: {
                    page: page,
                    limit: limit,
                    total: totalCount,
                },
            };
        } catch (error) {
            console.error(
                "❌ Error fetching transactions with CLOB - User: tuitshoxrux, Time: 2025-06-20 11:49:25:",
                error
            );
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getQueryStates() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
      SELECT 
        ID,
        NAME,
        STATUS as ACTIVE,
        COLOR,
        DIRECTION,
        MESSAGES_STATE
      FROM R_QUERY_STATES
      WHERE STATUS = 1
      ORDER BY ID
    `;

            const result = await connection.execute(query);

            const states = result.rows.map((row) => ({
                id: row[0],
                name: row[1],
                active: row[2],
                color: row[3],
                direction: row[4],
                messages_state: row[5],
            }));

            return states;
        } catch (error) {
            console.error(
                "❌ Error fetching query states - User: tuitshoxrux, Time: 2025-06-20 11:05:22:",
                error
            );
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    async getQueryStates() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
      SELECT 
        CODE,
        NAME,
        ACTIVE,
        COLOR
      FROM R_QUERY_STATES
      WHERE ACTIVE = 1
      ORDER BY CODE
    `;

            const result = await connection.execute(query);

            const states = result.rows.map((row) => ({
                code: row[0],
                name: row[1],
                active: row[2],
                color: row[3],
            }));

            return states;
        } catch (error) {
            console.error("❌ Error fetching query states:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getTransactionById(id) {
        let connection;
        try {
            connection = await getConnection();

            const query = `
      SELECT 
        cq.ID,
        cq.MESSAGE_ID,
        cq.TYPE,
        cq.DIRECTION,
        cq.STATE as CONV_STATE,
        cq.INIT_TIME,
        cq.SEND_TIME,
        cq.RES_TIME,
        cq.ERROR,
        cq.ERROR_MESSAGE,
        cq.FILE_NAME,
        cq.RES_FILE_NAME,
        cq.REFERENCE_,
        cq.DATA,
        re.MESSAGE as ERROR_DESCRIPTION,
        ft.NAME as TYPE_DESCRIPTION,
        ft.SHORT_TITLE as TYPE_SHORT_TITLE,
        m.STATUS as MESSAGE_STATUS,
        m.REASON as MESSAGE_REASON,
        m.AMOUNT,
        m.CURRENCY,
        m.PAYER,
        m.RECEIVER,
        rqs.NAME as CONV_STATUS_NAME,
        rqs.COLOR as CONV_STATUS_COLOR,
        cqs.SOURCE as JSON_DATA,
        cqsx.SOURCE.getClobVal() as XML_DATA
      FROM CONV_QUERIES cq
      LEFT JOIN R_ERRORS re ON cq.ERROR = re.CODE
      LEFT JOIN R_FORM_TYPES ft ON cq.TYPE = ft.ALIAS || '.' || ft.BODY_VERSION
      LEFT JOIN MESSAGES m ON cq.ID = m.QUERY_ID
      LEFT JOIN R_QUERY_STATES rqs ON cq.STATE = rqs.ID
      LEFT JOIN CONV_QUERY_SOURCES cqs ON cq.ID = cqs.QUERY_ID
      LEFT JOIN CONV_QUERY_SOURCES_XML cqsx ON cq.ID = cqsx.QUERY_ID
      WHERE cq.ID = :id
    `;

            const result = await connection.execute(query, { id });

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            const transaction = {};

            await Promise.all(
                result.metaData.map(async (column, index) => {
                    const columnName = column.name.toLowerCase();
                    let value = row[index];

                    if (value && typeof value === "object" && value.getData) {
                        try {
                            value = await value.getData();
                        } catch (error) {
                            console.error(
                                `❌ Error reading full CLOB for ${columnName} - User: tuitshoxrux, Time: 2025-06-20 11:49:25:`,
                                error
                            );
                            value = null;
                        }
                    }

                    if (value instanceof Date) {
                        value = value.toISOString();
                    }

                    transaction[columnName] = value;
                })
            );

            return transaction;
        } catch (error) {
            console.error(
                `❌ Error fetching transaction ${id} - User: tuitshoxrux, Time: 2025-06-20 11:49:25:`,
                error
            );
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getQueryStates() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
      SELECT 
        CODE,
        NAME,
        ACTIVE,
        COLOR
      FROM R_QUERY_STATES
      WHERE ACTIVE = 1
      ORDER BY CODE
    `;

            const result = await connection.execute(query);

            const states = result.rows.map((row) => ({
                code: row[0],
                name: row[1],
                active: row[2],
                color: row[3],
            }));

            return states;
        } catch (error) {
            console.error("❌ Error fetching query states:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getMessageStates() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
      SELECT 
        CODE,
        NAME,
        ACTIVE,
        COLOR
      FROM R_MESSAGES_STATES
      WHERE ACTIVE = 1
      ORDER BY CODE
    `;

            const result = await connection.execute(query);

            const states = result.rows.map((row) => ({
                code: row[0],
                name: row[1],
                active: row[2],
                color: row[3],
            }));

            return states;
        } catch (error) {
            console.error("❌ Error fetching message states:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getStats() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
        SELECT 
          COUNT(*) as TOTAL,
          COUNT(CASE WHEN ERROR IS NOT NULL AND ERROR != 0 THEN 1 END) as ERRORS,
          COUNT(CASE WHEN STATE IN (1, 2, 3) THEN 1 END) as PENDING,
          COUNT(CASE WHEN STATE = 9 THEN 1 END) as SUCCESS
        FROM CONV_QUERIES
        WHERE INIT_TIME >= SYSDATE - 30
      `;

            const result = await connection.execute(query);
            const row = result.rows[0];

            const stats = {
                total: row[0] || 0,
                errors: row[1] || 0,
                pending: row[2] || 0,
                success: row[3] || 0,
            };

            return stats;
        } catch (error) {
            console.error("❌ Error fetching stats:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async readLob(lob) {
        return new Promise((resolve, reject) => {
            let data = "";

            try {
                lob.setEncoding("utf8");

                lob.on("data", (chunk) => {
                    data += chunk;
                });

                lob.on("end", () => {
                    resolve(data);
                });

                lob.on("error", (error) => {
                    console.error("❌ CLOB read error:", error);
                    reject(error);
                });

                setTimeout(() => {
                    resolve(data);
                }, 10000);
            } catch (error) {
                console.error("❌ Error setting up CLOB reader:", error);
                reject(error);
            }
        });
    }

    async getFormTypes() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
      SELECT 
        ID,
        NAME,
        ALIAS,
        STATE,
        HEAD_VERSION,
        BODY_VERSION,
        TITLE,
        SHORT_TITLE,
        ISPDF
      FROM R_FORM_TYPES
      WHERE STATE = 1
      ORDER BY NAME
    `;

            const result = await connection.execute(query);

            const formTypes = result.rows.map((row) => ({
                id: row[0],
                name: row[1],
                alias: row[2],
                state: row[3],
                head_version: row[4],
                body_version: row[5],
                title: row[6],
                short_title: row[7],
                ispdf: row[8],
            }));

            return formTypes;
        } catch (error) {
            console.error(
                "❌ Error fetching form types - User: tuitshoxrux, Time: 2025-06-20 12:28:15:",
                error
            );
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getQueryStates() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
      SELECT 
        ID,
        NAME,
        STATUS as ACTIVE,
        DIRECTION,
        COLOR,
        MESSAGES_STATE
      FROM R_QUERY_STATES
      WHERE STATUS = 1
      ORDER BY ID
    `;

            const result = await connection.execute(query);

            const queryStates = result.rows.map((row) => ({
                id: row[0],
                name: row[1],
                active: row[2],
                direction: row[3],
                color: row[4],
                messages_state: row[5],
            }));

            return queryStates;
        } catch (error) {
            console.error(
                "❌ Error fetching query states - User: tuitshoxrux, Time: 2025-06-20 12:28:15:",
                error
            );
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getMessageStates() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
      SELECT DISTINCT 
        STATUS as code,
        CASE 
          WHEN STATUS = 7 THEN 'Отправлено'
          WHEN STATUS = 9 THEN 'Завершено'
          WHEN STATUS = 11 THEN 'Отклонено'
          ELSE 'Статус ' || STATUS
        END as name,
        CASE 
          WHEN STATUS = 7 THEN 'success'
          WHEN STATUS = 9 THEN 'success'
          WHEN STATUS = 11 THEN 'error'
          ELSE 'default'
        END as color
      FROM MESSAGES
      WHERE STATUS IS NOT NULL
      ORDER BY STATUS
    `;

            const result = await connection.execute(query);

            const messageStates = result.rows.map((row) => ({
                code: row[0],
                name: row[1],
                color: row[2],
            }));

            return messageStates;
        } catch (error) {
            console.error(
                "❌ Error fetching message states - User: tuitshoxrux, Time: 2025-06-20 12:28:15:",
                error
            );
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getErrors() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
        SELECT 
          CODE,
          MESSAGE
        FROM R_ERRORS
        WHERE CODE IS NOT NULL
        ORDER BY CODE
      `;

            const result = await connection.execute(query);

            const errors = result.rows.map((row) => ({
                code: row[0],
                message: row[1],
            }));

            return errors;
        } catch (error) {
            console.error("❌ Error fetching errors:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async testConnection() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
        SELECT 
          'OK' as STATUS,
          USER as CURRENT_USER,
          TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') as CURRENT_TIME,
          SYS_CONTEXT('USERENV', 'DB_NAME') as DB_NAME
        FROM DUAL
      `;

            const result = await connection.execute(query);
            const row = result.rows[0];

            return {
                status: row[0],
                currentUser: row[1],
                currentTime: row[2],
                dbName: row[3],
                message: "Database connection successful",
            };
        } catch (error) {
            console.error("❌ Database connection test failed:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getQueryStates() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
      SELECT 
        CODE,
        NAME,
        ACTIVE,
        COLOR
      FROM R_QUERY_STATES
      WHERE ACTIVE = 1
      ORDER BY CODE
    `;

            const result = await connection.execute(query);

            const states = result.rows.map((row) => ({
                code: row[0],
                name: row[1],
                active: row[2],
                color: row[3],
            }));

            return states;
        } catch (error) {
            console.error(
                "❌ Error fetching query states - User: tuitshoxrux, Time: 2025-06-20 10:51:20:",
                error
            );
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getFormTypes() {
        let connection;
        try {
            connection = await getConnection();

            const checkQuery = `
      SELECT column_name 
      FROM user_tab_columns 
      WHERE table_name = 'R_FORM_TYPES'
      ORDER BY column_id
    `;

            try {
                const checkResult = await connection.execute(checkQuery);
            } catch (e) {}

            let query = `
      SELECT 
        ID,
        NAME,
        ALIAS,
        STATE,
        HEAD_VERSION,
        BODY_VERSION,
        TITLE,
        SHORT_TITLE
      FROM R_FORM_TYPES
    `;

            const hasStateColumn = true;

            try {
                if (hasStateColumn) {
                    query += ` WHERE STATE = 1`;
                }
                query += ` ORDER BY NAME`;

                const result = await connection.execute(query);

                const formTypes = result.rows.map((row) => ({
                    id: row[0],
                    name: row[1],
                    alias: row[2],
                    state: row[3],
                    head_version: row[4],
                    body_version: row[5],
                    title: row[6],
                    short_title: row[7],
                }));

                return formTypes;
            } catch (error) {
                if (error.message.includes("STATE")) {
                    const simpleQuery = `
          SELECT 
            ID,
            NAME,
            ALIAS,
            1 as STATE,
            HEAD_VERSION,
            BODY_VERSION,
            TITLE,
            SHORT_TITLE
          FROM R_FORM_TYPES
          ORDER BY NAME
        `;

                    const result = await connection.execute(simpleQuery);

                    const formTypes = result.rows.map((row) => ({
                        id: row[0],
                        name: row[1],
                        alias: row[2],
                        state: row[3],
                        head_version: row[4],
                        body_version: row[5],
                        title: row[6],
                        short_title: row[7],
                    }));

                    return formTypes;
                }
                throw error;
            }
        } catch (error) {
            console.error(
                "❌ Error fetching form types - User: tuitshoxrux, Time: 2025-06-20 12:37:14:",
                error
            );

            return [
                {
                    id: 1,
                    name: "Customer Credit Transfer",
                    alias: "pacs.008.001.08",
                    state: 1,
                    head_version: "1",
                    body_version: "08",
                    title: "FIToFICustomerCreditTransfer",
                    short_title: "Кредитовый перевод",
                },
                {
                    id: 2,
                    name: "Payment Return",
                    alias: "pacs.004.001.09",
                    state: 1,
                    head_version: "1",
                    body_version: "09",
                    title: "PaymentReturn",
                    short_title: "Возврат платежа",
                },
                {
                    id: 3,
                    name: "Financial Institution Credit Transfer",
                    alias: "pacs.009.001.08",
                    state: 1,
                    head_version: "1",
                    body_version: "08",
                    title: "FinancialInstitutionCreditTransfer",
                    short_title: "Межбанковский перевод",
                },
            ];
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

    async getQueryStates() {
        let connection;
        try {
            connection = await getConnection();

            const checkQuery = `
      SELECT column_name 
      FROM user_tab_columns 
      WHERE table_name = 'R_QUERY_STATES'
      ORDER BY column_id
    `;

            try {
                const checkResult = await connection.execute(checkQuery);
            } catch (e) {}

            let queryStates = [];

            try {
                const query1 = `
        SELECT 
          ID,
          NAME,
          STATUS as ACTIVE,
          DIRECTION,
          COLOR,
          MESSAGES_STATE
        FROM R_QUERY_STATES
        WHERE STATUS = 1
        ORDER BY ID
      `;

                const result = await connection.execute(query1);

                queryStates = result.rows.map((row) => ({
                    id: row[0],
                    name: row[1],
                    active: row[2],
                    direction: row[3],
                    color: row[4],
                    messages_state: row[5],
                }));
            } catch (error1) {
                try {
                    const query2 = `
          SELECT 
            ID,
            NAME,
            1 as ACTIVE,
            DIRECTION,
            COLOR,
            MESSAGES_STATE
          FROM R_QUERY_STATES
          ORDER BY ID
        `;

                    const result = await connection.execute(query2);

                    queryStates = result.rows.map((row) => ({
                        id: row[0],
                        name: row[1],
                        active: row[2],
                        direction: row[3],
                        color: row[4],
                        messages_state: row[5],
                    }));
                } catch (error2) {
                    try {
                        const query3 = `
            SELECT 
              ID,
              NAME
            FROM R_QUERY_STATES
            ORDER BY ID
          `;

                        const result = await connection.execute(query3);

                        queryStates = result.rows.map((row) => ({
                            id: row[0],
                            name: row[1],
                            active: 1,
                            direction: null,
                            color: null,
                            messages_state: null,
                        }));
                    } catch (error3) {
                        throw error3;
                    }
                }
            }

            if (queryStates.length > 0) {
                return queryStates;
            }

            throw new Error("No query states found");
        } catch (error) {
            console.error(
                "❌ Error fetching query states - User: tuitshoxrux, Time: 2025-06-20 12:40:35:",
                error
            );

            return [
                {
                    id: 0,
                    name: "Инициализация",
                    active: 1,
                    direction: null,
                    color: "#1890ff",
                    messages_state: null,
                },
                {
                    id: 1,
                    name: "В обработке",
                    active: 1,
                    direction: null,
                    color: "#faad14",
                    messages_state: null,
                },
                {
                    id: 5,
                    name: "Отбракован",
                    active: 1,
                    direction: null,
                    color: "#ff4d4f",
                    messages_state: null,
                },
                {
                    id: 6,
                    name: "Авторизован",
                    active: 1,
                    direction: null,
                    color: "#52c41a",
                    messages_state: null,
                },
                {
                    id: 7,
                    name: "Принят",
                    active: 1,
                    direction: null,
                    color: "#52c41a",
                    messages_state: null,
                },
                {
                    id: 8,
                    name: "Отправлен",
                    active: 1,
                    direction: null,
                    color: "#722ed1",
                    messages_state: null,
                },
                {
                    id: 9,
                    name: "Завершен",
                    active: 1,
                    direction: null,
                    color: "#52c41a",
                    messages_state: null,
                },
            ];
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = new TransactionService();
