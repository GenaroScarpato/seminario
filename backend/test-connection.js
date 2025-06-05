const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',  // El usuario por defecto de PostgreSQL
    host: 'localhost',
    database: 'logistica',  // Nombre de tu base de datos
    password: '5153',  // Tu contraseña
    port: 5432
});

pool.connect()
    .then(client => {
        console.log('✅ Conexión exitosa a PostgreSQL');
        // Intentar una consulta simple
        return pool.query('SELECT 1 + 1 AS result')
            .then(res => {
                console.log('✅ Consulta exitosa:', res.rows[0]);
            })
            .catch(err => {
                console.error('❌ Error en la consulta:', err);
            })
            .finally(() => {
                client.release();
                pool.end();
            });
    })
    .catch(err => {
        console.error('❌ Error conectando a la base de datos:', err);
    });
