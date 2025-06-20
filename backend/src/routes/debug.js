const express = require("express");
const { getConnection } = require("../config/database");

const router = express.Router();

router.get("/transaction/:id/sources", async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const { id } = req.params;

        const jsonQuery = `
      SELECT 
        QUERY_ID,
        DATA,
        CASE 
          WHEN SOURCE IS NULL THEN 'NULL'
          WHEN DBMS_LOB.GETLENGTH(SOURCE) = 0 THEN 'EMPTY'
          ELSE 'HAS_DATA'
        END as JSON_STATUS,
        DBMS_LOB.GETLENGTH(SOURCE) as JSON_LENGTH
      FROM CONV_QUERY_SOURCES 
      WHERE QUERY_ID = :id
    `;

        const jsonResult = await connection.execute(jsonQuery, { id });

        const xmlQuery = `
      SELECT 
        QUERY_ID,
        DATA,
        CASE 
          WHEN SOURCE IS NULL THEN 'NULL'
          ELSE 'HAS_DATA'
        END as XML_STATUS
      FROM CONV_QUERY_SOURCES_XML 
      WHERE QUERY_ID = :id
    `;

        const xmlResult = await connection.execute(xmlQuery, { id });

        let actualJsonData = null;
        let actualXmlData = null;

        if (jsonResult.rows.length > 0) {
            try {
                const jsonDataQuery = `SELECT SOURCE FROM CONV_QUERY_SOURCES WHERE QUERY_ID = :id`;
                const jsonDataResult = await connection.execute(jsonDataQuery, {
                    id,
                });

                if (
                    jsonDataResult.rows.length > 0 &&
                    jsonDataResult.rows[0][0]
                ) {
                    const jsonData = jsonDataResult.rows[0][0];

                    if (
                        typeof jsonData === "object" &&
                        jsonData.constructor.name === "Lob"
                    ) {
                        actualJsonData = await readLob(jsonData);
                    } else {
                        actualJsonData = jsonData;
                    }
                }
            } catch (error) {
                console.error("Error reading JSON:", error);
            }
        }

        if (xmlResult.rows.length > 0) {
            try {
                const xmlDataQuery = `SELECT XMLSERIALIZE(CONTENT SOURCE INDENT) as XML_DATA FROM CONV_QUERY_SOURCES_XML WHERE QUERY_ID = :id`;
                const xmlDataResult = await connection.execute(xmlDataQuery, {
                    id,
                });

                if (xmlDataResult.rows.length > 0) {
                    actualXmlData = xmlDataResult.rows[0][0];
                }
            } catch (error) {
                console.error("Error reading XML:", error);
            }
        }

        const result = {
            transactionId: id,
            jsonTable: {
                exists: jsonResult.rows.length > 0,
                data:
                    jsonResult.rows.length > 0
                        ? {
                              queryId: jsonResult.rows[0][0],
                              data: jsonResult.rows[0][1],
                              status: jsonResult.rows[0][2],
                              length: jsonResult.rows[0][3],
                          }
                        : null,
                actualData: actualJsonData
                    ? actualJsonData.substring(0, 500) + "..."
                    : null,
            },
            xmlTable: {
                exists: xmlResult.rows.length > 0,
                data:
                    xmlResult.rows.length > 0
                        ? {
                              queryId: xmlResult.rows[0][0],
                              data: xmlResult.rows[0][1],
                              status: xmlResult.rows[0][2],
                          }
                        : null,
                actualData: actualXmlData
                    ? actualXmlData.substring(0, 500) + "..."
                    : null,
            },
        };

        res.json(result);
    } catch (error) {
        console.error("Debug error:", error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

async function readLob(lob) {
    return new Promise((resolve, reject) => {
        let data = "";

        lob.setEncoding("utf8");

        lob.on("data", (chunk) => {
            data += chunk;
        });

        lob.on("end", () => {
            resolve(data);
        });

        lob.on("error", (error) => {
            reject(error);
        });
    });
}

module.exports = router;
