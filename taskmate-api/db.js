const mysql = require('mysql2/promise');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const database = process.env.DB_NAME || 'taskmate_db';
const port = Number(process.env.DB_PORT) || 3306;

const missing = [];
if (!host) missing.push('DB_HOST');
if (!user) missing.push('DB_USER');
if (!database) missing.push('DB_NAME');
if (missing.length) {
    console.error('[db] Faltan variables en .env:', missing.join(', '));
    process.exit(1);
}

/** @type {import('mysql2/promise').PoolOptions} */
const poolConfig = {
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Evita sorpresas con fechas en modo "local"
    dateStrings: true,
};

if (process.env.DB_SOCKET && String(process.env.DB_SOCKET).trim()) {
    poolConfig.socketPath = process.env.DB_SOCKET.trim();
    delete poolConfig.host;
    delete poolConfig.port;
}

const pool = mysql.createPool(poolConfig);

/**
 * Comprueba conexión y que exista la tabla `tasks`.
 * @returns {Promise<{ ok: true } | { ok: false, message: string, code?: string }>}
 */
async function verifyDatabase() {
    try {
        const [ping] = await pool.query('SELECT 1 AS ok');
        if (!ping?.[0] || ping[0].ok !== 1) {
            return { ok: false, message: 'Respuesta inesperada al hacer ping a MySQL.' };
        }
        const [tables] = await pool.query(
            'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
            [database, 'tasks']
        );
        if (!tables.length) {
            return {
                ok: false,
                code: 'ER_NO_SUCH_TABLE',
                message:
                    `La base "${database}" existe pero no tiene la tabla "tasks". ` +
                    'Ejecuta schema.sql: mysql -u root -p < schema.sql'
            };
        }

        // --- Migración automática de columnas ---
        const [columns] = await pool.query('SHOW COLUMNS FROM tasks');
        const colNames = columns.map(c => c.Field.toLowerCase());

        if (!colNames.includes('category')) {
            console.log('[db] Migración: Añadiendo columna `category`...');
            await pool.query('ALTER TABLE tasks ADD COLUMN category VARCHAR(100) NULL');
        }
        if (!colNames.includes('due_date')) {
            console.log('[db] Migración: Añadiendo columna `due_date`...');
            await pool.query('ALTER TABLE tasks ADD COLUMN due_date DATETIME NULL');
        }

        return { ok: true };

    } catch (err) {
        const code = err.code || err.errno?.toString();
        let hint = '';
        if (code === 'ECONNREFUSED') {
            hint = ' MySQL no está en marcha o el puerto es incorrecto (por defecto 3306, variable DB_PORT).';
        } else if (code === 'ER_ACCESS_DENIED_ERROR') {
            hint = ' Revisa DB_USER y DB_PASSWORD en .env.';
        } else if (code === 'ER_BAD_DB_ERROR') {
            hint = ` Crea la base "${database}" con schema.sql.`;
        }
        return { ok: false, code, message: (err.message || String(err)) + hint };
    }
}

pool.verifyDatabase = verifyDatabase;
pool.dbConfigSummary = () => ({
    host: poolConfig.socketPath ? `(socket ${poolConfig.socketPath})` : host,
    port: poolConfig.socketPath ? '—' : port,
    user,
    database
});

module.exports = pool;
