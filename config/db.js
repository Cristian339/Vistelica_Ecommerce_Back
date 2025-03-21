const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', // Usuario por defecto de PostgreSQL
    host: 'localhost',
    database: 'postgres', // Nombre de la base de datos
    password: 'root', // contraseña
    port: 5432, // Puerto por defecto de PostgreSQL
});

// Función de comprobación de conexión
async function checkDbConnection() {
    try {
        await pool.connect();
        console.log('🟢 Conectado a PostgreSQL');
    } catch (err) {
        console.error('🔴 Error de conexión a la base de datos', err);
        process.exit(1); // Termina el proceso si la conexión falla
    }
}

module.exports = { pool, checkDbConnection };
