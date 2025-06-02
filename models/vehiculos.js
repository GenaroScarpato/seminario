exports.obtenerTodos = async (pool) => {
  const result = await pool.query('SELECT * FROM vehicles ORDER BY id');
  return result.rows;
};

exports.crear = async (pool, data) => {
  const result = await pool.query(
    'INSERT INTO vehicles (patente, name, capacity) VALUES ($1, $2, $3) RETURNING *',
    [data.patente, data.name, data.capacity]
  );
  return result.rows[0];
};

exports.actualizar = async (pool, id, data) => {
  const result = await pool.query(
    'UPDATE vehicles SET patente = $1, name = $2, capacity = $3 WHERE id = $4 RETURNING *',
    [data.patente, data.name, data.capacity, id]
  );
  return result.rows[0];
};

exports.eliminar = async (pool, id) => {
  const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
  return result.rowCount > 0;
};
