const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dbConfig = require('./db-config');

// Configuración de la conexión a la base de datos
const pool = new Pool(dbConfig);

// Leer el archivo SQL
const sql = fs.readFileSync(path.join(__dirname, 'update_conductores_table.sql'), 'utf8');

// Ejecutar el script SQL
async function runUpdate() {
  const client = await pool.connect();
  try {
    console.log('Ejecutando actualización de la tabla conductores...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Actualización completada con éxito');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al ejecutar la actualización:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runUpdate();
