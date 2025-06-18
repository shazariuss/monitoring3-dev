const { getConnection } = require("../config/database");

class TransactionService {
    async getTransactions(filters = {}) {
        let connection;
        try {
            connection = await getConnection();

            console.log("📋 Fetching transactions with filters:", filters);

            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 10;
            const offset = (page - 1) * limit;

            let whereClause = "WHERE 1=1";
            const binds = {};

            // Фильтр по дате (от)
            if (filters.dateFrom) {
                whereClause += " AND cq.INIT_TIME >= :dateFrom";
                binds.dateFrom = new Date(filters.dateFrom);
            }

            // Фильтр по дате (до)
            if (filters.dateTo) {
                whereClause += " AND cq.INIT_TIME <= :dateTo";
                binds.dateTo = new Date(filters.dateTo);
            }

            // Фильтр по статусу
            if (filters.status) {
                whereClause += " AND cq.STATE = :status";
                binds.status = parseInt(filters.status);
            }

            // Фильтр по типу
            if (filters.type) {
                whereClause += " AND UPPER(cq.TYPE) LIKE UPPER(:type)";
                binds.type = `%${filters.type}%`;
            }

            // Фильтр только ошибки
            if (filters.errorsOnly === "true") {
                whereClause += " AND cq.ERROR IS NOT NULL AND cq.ERROR != 0";
            }

            // Поиск
            if (filters.search) {
                whereClause += ` AND (
          UPPER(TO_CHAR(cq.MESSAGE_ID)) LIKE UPPER(:search) OR 
          UPPER(cq.FILE_NAME) LIKE UPPER(:search) OR 
          UPPER(cq.REFERENCE_) LIKE UPPER(:search) OR
          UPPER(TO_CHAR(cq.ID)) LIKE UPPER(:search)
        )`;
                binds.search = `%${filters.search}%`;
            }

            const query = `
        SELECT 
          cq.ID,
          cq.MESSAGE_ID,
          cq.TYPE,
          cq.DIRECTION,
          cq.STATE,
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
          ft.SHORT_TITLE as TYPE_SHORT_TITLE
        FROM CONV_QUERIES cq
        LEFT JOIN R_ERRORS re ON cq.ERROR = re.CODE
        LEFT JOIN R_FORM_TYPES ft ON cq.TYPE = ft.ALIAS || '.' || ft.BODY_VERSION
        ${whereClause}
        ORDER BY cq.INIT_TIME DESC
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `;

            console.log("📝 Executing query:", query);
            console.log("📦 Query binds:", binds);

            const result = await connection.execute(query, binds);

            // Преобразуем результаты в чистые объекты
            const transactions = result.rows.map((row) => {
                const transaction = {};
                result.metaData.forEach((column, index) => {
                    const columnName = column.name.toLowerCase();
                    let value = row[index];

                    // Преобразуем Date объекты в ISO строки
                    if (value instanceof Date) {
                        value = value.toISOString();
                    }

                    // Убеждаемся что значения простые
                    if (
                        typeof value === "string" ||
                        typeof value === "number" ||
                        value === null ||
                        value === undefined
                    ) {
                        transaction[columnName] = value;
                    } else {
                        // Преобразуем сложные объекты в строки
                        transaction[columnName] = String(value);
                    }
                });
                return transaction;
            });

            // Подсчет общего количества записей
            const countQuery = `
        SELECT COUNT(*) as TOTAL
        FROM CONV_QUERIES cq
        LEFT JOIN R_ERRORS re ON cq.ERROR = re.CODE
        LEFT JOIN R_FORM_TYPES ft ON cq.TYPE = ft.ALIAS || '.' || ft.BODY_VERSION
        ${whereClause}
      `;

            const countResult = await connection.execute(countQuery, binds);
            const total = countResult.rows[0][0];

            console.log(
                `✅ Loaded ${transactions.length} transactions (${total} total) - User: tuitshoxrux, Time: 2025-06-18 05:16:52`
            );

            return {
                data: transactions,
                pagination: {
                    current: page,
                    pageSize: limit,
                    total: total,
                },
            };
        } catch (error) {
            console.error("❌ Error fetching transactions:", error);
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

            console.log(
                `📋 Fetching transaction details for ID: ${id} - User: tuitshoxrux, Time: 2025-06-18 05:24:59`
            );

            // Основной запрос для получения данных транзакции
            const query = `
      SELECT 
        cq.ID,
        cq.MESSAGE_ID,
        cq.TYPE,
        cq.DIRECTION,
        cq.STATE,
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
        ft.ALIAS as TYPE_ALIAS,
        ft.SHORT_TITLE as TYPE_SHORT_TITLE
      FROM CONV_QUERIES cq
      LEFT JOIN R_ERRORS re ON cq.ERROR = re.CODE
      LEFT JOIN R_FORM_TYPES ft ON cq.TYPE = ft.ALIAS || '.' || ft.BODY_VERSION
      WHERE cq.ID = :id
    `;

            const result = await connection.execute(query, { id });

            if (result.rows.length === 0) {
                console.log(`❌ Transaction not found: ${id}`);
                return null;
            }

            // Создаем чистый объект транзакции
            const row = result.rows[0];
            const metaData = result.metaData;

            const transaction = {};

            // Мапим только простые значения без циклических ссылок
            metaData.forEach((column, index) => {
                const columnName = column.name.toLowerCase();
                let value = row[index];

                // Преобразуем Date объекты в ISO строки
                if (value instanceof Date) {
                    value = value.toISOString();
                }

                // Добавляем только простые типы данных
                if (
                    typeof value === "string" ||
                    typeof value === "number" ||
                    value === null ||
                    value === undefined
                ) {
                    transaction[columnName] = value;
                } else {
                    // Преобразуем сложные объекты в строки
                    transaction[columnName] = String(value);
                }
            });

            console.log(`✅ Base transaction data loaded for: ${id}`);

            // Получаем JSON данные
            console.log(`🔍 Fetching JSON data for transaction: ${id}`);
            let jsonData = null;
            try {
                const jsonQuery = `
        SELECT SOURCE 
        FROM CONV_QUERY_SOURCES 
        WHERE QUERY_ID = :id
      `;
                const jsonResult = await connection.execute(jsonQuery, { id });

                if (jsonResult.rows.length > 0 && jsonResult.rows[0][0]) {
                    const rawJsonData = jsonResult.rows[0][0];
                    console.log(
                        `📄 JSON data found, type: ${typeof rawJsonData}, constructor: ${
                            rawJsonData.constructor?.name
                        }`
                    );

                    if (
                        typeof rawJsonData === "object" &&
                        rawJsonData.constructor.name === "Lob"
                    ) {
                        console.log(`📖 Reading JSON CLOB data...`);
                        jsonData = await this.readLob(rawJsonData);
                        console.log(
                            `✅ JSON CLOB data read, length: ${
                                jsonData?.length || 0
                            }`
                        );
                    } else if (typeof rawJsonData === "string") {
                        jsonData = rawJsonData;
                        console.log(
                            `✅ JSON string data loaded, length: ${rawJsonData.length}`
                        );
                    } else {
                        console.log(`🔄 Converting JSON data to string...`);
                        jsonData = String(rawJsonData);
                    }
                } else {
                    console.log(`❌ No JSON data found for transaction: ${id}`);
                }
            } catch (error) {
                console.error("❌ Error fetching JSON data:", error);
                jsonData = null;
            }

            // Получаем XML данные - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ ПРАВИЛЬНОГО ПРЕОБРАЗОВАНИЯ
            console.log(`🔍 Fetching XML data for transaction: ${id}`);
            let xmlData = null;
            let xmlLoadMethod = "none";

            try {
                // Метод 1: Используем XMLSERIALIZE как CLOB
                console.log(`🔬 Trying XML method 1: XMLSERIALIZE as CLOB...`);
                try {
                    const xmlQuery1 = `
          SELECT XMLSERIALIZE(CONTENT SOURCE as CLOB INDENT) as XML_DATA 
          FROM CONV_QUERY_SOURCES_XML 
          WHERE QUERY_ID = :id
        `;
                    const xmlResult1 = await connection.execute(xmlQuery1, {
                        id,
                    });

                    if (xmlResult1.rows.length > 0 && xmlResult1.rows[0][0]) {
                        const rawXmlData = xmlResult1.rows[0][0];
                        xmlLoadMethod = "XMLSERIALIZE as CLOB";
                        console.log(
                            `📄 XML data found via XMLSERIALIZE as CLOB, type: ${typeof rawXmlData}, constructor: ${
                                rawXmlData.constructor?.name
                            }`
                        );

                        if (
                            typeof rawXmlData === "object" &&
                            rawXmlData.constructor.name === "Lob"
                        ) {
                            console.log(`📖 Reading XML CLOB data...`);
                            xmlData = await this.readLob(rawXmlData);
                            console.log(
                                `✅ XML CLOB data read, length: ${
                                    xmlData?.length || 0
                                }`
                            );
                        } else if (typeof rawXmlData === "string") {
                            xmlData = rawXmlData;
                            console.log(
                                `✅ XML string data loaded, length: ${rawXmlData.length}`
                            );
                        }
                    } else {
                        console.log(
                            `❌ No XML data found via XMLSERIALIZE as CLOB for transaction: ${id}`
                        );
                    }
                } catch (clobError) {
                    console.log(
                        `❌ XMLSERIALIZE as CLOB failed:`,
                        clobError.message
                    );

                    // Метод 2: XMLSerialize как VARCHAR2
                    console.log(
                        `🔬 Trying XML method 2: XMLSERIALIZE as VARCHAR2...`
                    );
                    try {
                        const xmlQuery2 = `
            SELECT XMLSERIALIZE(CONTENT SOURCE as VARCHAR2(4000) INDENT) as XML_DATA 
            FROM CONV_QUERY_SOURCES_XML 
            WHERE QUERY_ID = :id
          `;
                        const xmlResult2 = await connection.execute(xmlQuery2, {
                            id,
                        });

                        if (
                            xmlResult2.rows.length > 0 &&
                            xmlResult2.rows[0][0]
                        ) {
                            xmlData = xmlResult2.rows[0][0];
                            xmlLoadMethod = "XMLSERIALIZE as VARCHAR2";
                            console.log(
                                `✅ XML string data loaded via VARCHAR2, length: ${xmlData.length}`
                            );
                        } else {
                            console.log(
                                `❌ No XML data found via VARCHAR2 for transaction: ${id}`
                            );
                        }
                    } catch (varcharError) {
                        console.log(
                            `❌ XMLSERIALIZE as VARCHAR2 failed:`,
                            varcharError.message
                        );

                        // Метод 3: extract().getClobVal()
                        console.log(
                            `🔬 Trying XML method 3: extract().getClobVal()...`
                        );
                        try {
                            const xmlQuery3 = `
              SELECT SOURCE.extract('/*').getClobVal() as XML_DATA 
              FROM CONV_QUERY_SOURCES_XML 
              WHERE QUERY_ID = :id
            `;
                            const xmlResult3 = await connection.execute(
                                xmlQuery3,
                                { id }
                            );

                            if (
                                xmlResult3.rows.length > 0 &&
                                xmlResult3.rows[0][0]
                            ) {
                                const rawXmlData3 = xmlResult3.rows[0][0];
                                xmlLoadMethod = "extract+getClobVal";
                                console.log(
                                    `📄 XML data found via extract+getClobVal, type: ${typeof rawXmlData3}, constructor: ${
                                        rawXmlData3.constructor?.name
                                    }`
                                );

                                if (
                                    typeof rawXmlData3 === "object" &&
                                    rawXmlData3.constructor.name === "Lob"
                                ) {
                                    console.log(
                                        `📖 Reading XML CLOB data from extract...`
                                    );
                                    xmlData = await this.readLob(rawXmlData3);
                                    console.log(
                                        `✅ XML CLOB data read from extract, length: ${
                                            xmlData?.length || 0
                                        }`
                                    );
                                } else if (typeof rawXmlData3 === "string") {
                                    xmlData = rawXmlData3;
                                    console.log(
                                        `✅ XML string data loaded from extract, length: ${rawXmlData3.length}`
                                    );
                                }
                            } else {
                                console.log(
                                    `❌ No XML data found via extract+getClobVal for transaction: ${id}`
                                );
                            }
                        } catch (extractError) {
                            console.log(
                                `❌ extract+getClobVal failed:`,
                                extractError.message
                            );

                            // Метод 4: Получаем XMLType и работаем с его методами
                            console.log(
                                `🔬 Trying XML method 4: XMLType object inspection...`
                            );
                            try {
                                const xmlQuery4 = `
                SELECT SOURCE 
                FROM CONV_QUERY_SOURCES_XML 
                WHERE QUERY_ID = :id
              `;
                                const xmlResult4 = await connection.execute(
                                    xmlQuery4,
                                    { id }
                                );

                                if (
                                    xmlResult4.rows.length > 0 &&
                                    xmlResult4.rows[0][0]
                                ) {
                                    const rawXmlData4 = xmlResult4.rows[0][0];
                                    xmlLoadMethod = "XMLType object";
                                    console.log(
                                        `📄 XML object found, type: ${typeof rawXmlData4}, constructor: ${
                                            rawXmlData4.constructor?.name
                                        }`
                                    );

                                    if (
                                        typeof rawXmlData4 === "object" &&
                                        rawXmlData4 !== null
                                    ) {
                                        // Логируем все доступные свойства и методы
                                        console.log(
                                            `🔍 XMLType object properties:`,
                                            Object.getOwnPropertyNames(
                                                rawXmlData4
                                            )
                                        );
                                        console.log(
                                            `🔍 XMLType object prototype:`,
                                            Object.getPrototypeOf(rawXmlData4)
                                        );

                                        // Пробуем различные способы получения строки из XMLType
                                        const extractionMethods = [
                                            {
                                                name: "getClobVal",
                                                async: false,
                                            },
                                            {
                                                name: "getStringVal",
                                                async: false,
                                            },
                                            { name: "toString", async: false },
                                            { name: "valueOf", async: false },
                                        ];

                                        for (const method of extractionMethods) {
                                            if (
                                                rawXmlData4[method.name] &&
                                                typeof rawXmlData4[
                                                    method.name
                                                ] === "function"
                                            ) {
                                                try {
                                                    console.log(
                                                        `🔬 Trying XMLType method: ${method.name}`
                                                    );
                                                    let result;

                                                    if (method.async) {
                                                        result =
                                                            await rawXmlData4[
                                                                method.name
                                                            ]();
                                                    } else {
                                                        result =
                                                            rawXmlData4[
                                                                method.name
                                                            ]();
                                                    }

                                                    console.log(
                                                        `📄 Method ${
                                                            method.name
                                                        } result type: ${typeof result}, constructor: ${
                                                            result?.constructor
                                                                ?.name
                                                        }`
                                                    );

                                                    if (
                                                        typeof result ===
                                                            "string" &&
                                                        result.length > 0
                                                    ) {
                                                        xmlData = result;
                                                        xmlLoadMethod = `XMLType.${method.name}`;
                                                        console.log(
                                                            `✅ XML extracted via ${method.name}, length: ${result.length}`
                                                        );
                                                        break;
                                                    } else if (
                                                        typeof result ===
                                                            "object" &&
                                                        result &&
                                                        result.constructor
                                                            .name === "Lob"
                                                    ) {
                                                        console.log(
                                                            `📖 Reading CLOB from ${method.name}...`
                                                        );
                                                        xmlData =
                                                            await this.readLob(
                                                                result
                                                            );
                                                        xmlLoadMethod = `XMLType.${method.name}+Lob`;
                                                        console.log(
                                                            `✅ XML extracted via ${
                                                                method.name
                                                            }+Lob, length: ${
                                                                xmlData?.length ||
                                                                0
                                                            }`
                                                        );
                                                        break;
                                                    }
                                                } catch (methodError) {
                                                    console.log(
                                                        `❌ XMLType method ${method.name} failed:`,
                                                        methodError.message
                                                    );
                                                }
                                            }
                                        }

                                        // Если методы не сработали, пробуем прямое преобразование
                                        if (!xmlData) {
                                            console.log(
                                                `🔬 Trying direct XMLType conversion...`
                                            );

                                            // Проверяем, может быть это обёртка над строкой
                                            if (
                                                rawXmlData4.data &&
                                                typeof rawXmlData4.data ===
                                                    "string"
                                            ) {
                                                xmlData = rawXmlData4.data;
                                                xmlLoadMethod = "XMLType.data";
                                                console.log(
                                                    `✅ XML extracted from .data property, length: ${xmlData.length}`
                                                );
                                            } else if (
                                                rawXmlData4.value &&
                                                typeof rawXmlData4.value ===
                                                    "string"
                                            ) {
                                                xmlData = rawXmlData4.value;
                                                xmlLoadMethod = "XMLType.value";
                                                console.log(
                                                    `✅ XML extracted from .value property, length: ${xmlData.length}`
                                                );
                                            } else if (
                                                rawXmlData4.content &&
                                                typeof rawXmlData4.content ===
                                                    "string"
                                            ) {
                                                xmlData = rawXmlData4.content;
                                                xmlLoadMethod =
                                                    "XMLType.content";
                                                console.log(
                                                    `✅ XML extracted from .content property, length: ${xmlData.length}`
                                                );
                                            } else {
                                                console.log(
                                                    `❌ No suitable XMLType extraction method found`
                                                );
                                                console.log(
                                                    `🔍 XMLType object keys:`,
                                                    Object.keys(rawXmlData4)
                                                );
                                                console.log(
                                                    `🔍 XMLType object values:`,
                                                    Object.values(rawXmlData4)
                                                );
                                            }
                                        }
                                    }
                                } else {
                                    console.log(
                                        `❌ No XML object found for transaction: ${id}`
                                    );
                                }
                            } catch (objectError) {
                                console.log(
                                    `❌ XMLType object inspection failed:`,
                                    objectError.message
                                );
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("❌ Error fetching XML data:", error);
                xmlData = null;
            }

            // БЕЗОПАСНОЕ ЛОГИРОВАНИЕ ПЕРЕД ПРИСВОЕНИЕМ
            console.log(`🔍 Final XML data check before assignment:`);
            console.log(`   - xmlData type: ${typeof xmlData}`);
            console.log(`   - xmlData length: ${xmlData?.length || 0}`);
            console.log(
                `   - xmlData is string: ${typeof xmlData === "string"}`
            );
            console.log(
                `   - xmlData preview: ${
                    typeof xmlData === "string" && xmlData.length > 0
                        ? xmlData.substring(0, 100) + "..."
                        : "not a string or empty"
                }`
            );
            console.log(`   - xmlLoadMethod: ${xmlLoadMethod}`);

            console.log(`🔍 Final JSON data check before assignment:`);
            console.log(`   - jsonData type: ${typeof jsonData}`);
            console.log(`   - jsonData length: ${jsonData?.length || 0}`);
            console.log(
                `   - jsonData preview: ${
                    typeof jsonData === "string" && jsonData.length > 0
                        ? jsonData.substring(0, 100) + "..."
                        : "not a string or empty"
                }`
            );

            // ПРИСВАИВАЕМ ДАННЫЕ С ЛОГИРОВАНИЕМ
            const finalJsonData =
                typeof jsonData === "string" && jsonData.length > 0
                    ? jsonData
                    : null;
            const finalXmlData =
                typeof xmlData === "string" && xmlData.length > 0
                    ? xmlData
                    : null;

            console.log(`🔧 Assignment results:`);
            console.log(
                `   - finalJsonData: ${
                    finalJsonData
                        ? "SET (" + finalJsonData.length + " chars)"
                        : "NULL"
                }`
            );
            console.log(
                `   - finalXmlData: ${
                    finalXmlData
                        ? "SET (" + finalXmlData.length + " chars)"
                        : "NULL"
                }`
            );

            transaction.json_data = finalJsonData;
            transaction.xml_data = finalXmlData;

            console.log(`📊 Transaction summary:`, {
                id: transaction.id,
                hasJson: !!transaction.json_data,
                hasXml: !!transaction.xml_data,
                jsonLength: transaction.json_data?.length || 0,
                xmlLength: transaction.xml_data?.length || 0,
                xmlLoadMethod: xmlLoadMethod,
            });

            return transaction;
        } catch (error) {
            console.error("❌ Error fetching transaction by ID:", error);
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

            console.log(
                "📊 Fetching transaction statistics... User: tuitshoxrux, Time: 2025-06-18 05:16:52"
            );

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

            console.log("✅ Statistics loaded:", stats);

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

    // Утилита для чтения CLOB данных
    async readLob(lob) {
        return new Promise((resolve, reject) => {
            let data = "";

            try {
                lob.setEncoding("utf8");

                lob.on("data", (chunk) => {
                    data += chunk;
                    console.log(
                        `📚 CLOB chunk received, current total length: ${data.length}`
                    );
                });

                lob.on("end", () => {
                    console.log(
                        `📚 CLOB read completed, final length: ${data.length}`
                    );
                    resolve(data);
                });

                lob.on("error", (error) => {
                    console.error("❌ CLOB read error:", error);
                    reject(error);
                });

                // Таймаут для предотвращения зависания
                setTimeout(() => {
                    console.log(
                        `⏰ CLOB read timeout reached, current data length: ${data.length}`
                    );
                    resolve(data); // Возвращаем то что есть
                }, 10000); // 10 секунд
            } catch (error) {
                console.error("❌ Error setting up CLOB reader:", error);
                reject(error);
            }
        });
    }

    // Остальные методы остаются прежними...
    async getFormTypes() {
        let connection;
        try {
            connection = await getConnection();

            console.log("📋 Fetching form types...");

            const query = `
        SELECT DISTINCT
          ALIAS,
          NAME,
          SHORT_TITLE
        FROM R_FORM_TYPES
        WHERE ALIAS IS NOT NULL
        ORDER BY ALIAS
      `;

            const result = await connection.execute(query);

            const formTypes = result.rows.map((row) => ({
                alias: row[0],
                name: row[1],
                shortTitle: row[2],
            }));

            console.log(`✅ Loaded ${formTypes.length} form types`);

            return formTypes;
        } catch (error) {
            console.error("❌ Error fetching form types:", error);
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

            console.log("📋 Fetching error codes...");

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

            console.log(`✅ Loaded ${errors.length} error codes`);

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
}

module.exports = new TransactionService();
