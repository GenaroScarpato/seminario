exports.getAll = async (pool) => {
  const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
  return result.rows;
};

exports.create = async (pool, data) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.name, data.email, data.password, data.role]
  );
  return result.rows[0];
};

exports.update = async (pool, id, data) => {
  const result = await pool.query(
    'UPDATE users SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING *',
    [data.name, data.email, data.password, data.role, id]
  );
  return result.rows[0];
};

exports.delete = async (pool, id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};
