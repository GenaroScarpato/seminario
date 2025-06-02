exports.getAll = async (pool) => {
  const result = await pool.query('SELECT * FROM feedback ORDER BY id');
  return result.rows;
};

exports.create = async (pool, data) => {
  const {
    vehicle_id,
    order_id,
    description
  } = data;

  const query = `
    INSERT INTO feedback (vehicle_id, order_id, description)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [vehicle_id, order_id, description];
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.update = async (pool, id, data) => {
  const {
    vehicle_id,
    order_id,
    description
  } = data;

  const query = `
    UPDATE feedback SET
      vehicle_id = $1,
      order_id = $2,
      description = $3
    WHERE id = $4
    RETURNING *;
  `;

  const values = [vehicle_id, order_id, description, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.delete = async (pool, id) => {
  await pool.query('DELETE FROM feedback WHERE id = $1', [id]);
};
