/**
 * Comprueba .env + conexión MySQL + tabla tasks (sin arrancar Express).
 * Uso: npm run db:check
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../db');

(async () => {
    console.log('Resumen:', db.dbConfigSummary());
    const r = await db.verifyDatabase();
    if (r.ok) {
        console.log('Estado: OK — conexión y tabla `tasks` correctas.');
        process.exit(0);
    }
    console.error('Estado: ERROR —', r.message);
    process.exit(1);
})();
