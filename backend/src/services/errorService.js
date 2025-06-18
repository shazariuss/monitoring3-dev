const { getConnection } = require("../config/database");

class ErrorService {
    async getAllErrors() {
        let connection;
        try {
            connection = await getConnection();

            const query = `
        SELECT CODE, MESSAGE
        FROM R_ERRORS
        ORDER BY CODE
      `;

            const result = await connection.execute(query);

            return result.rows.map((row) => ({
                code: row[0],
                message: row[1],
            }));
        } catch (error) {
            console.error("Error fetching errors:", error);
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

            const query = `
        SELECT ID, NAME, ALIAS, STATE, SHORT_TITLE
        FROM R_FORM_TYPES
        ORDER BY ID
      `;

            const result = await connection.execute(query);

            return result.rows.map((row) => ({
                id: row[0],
                name: row[1],
                alias: row[2],
                state: row[3],
                shortTitle: row[4],
            }));
        } catch (error) {
            console.error("Error fetching form types:", error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = new ErrorService();
