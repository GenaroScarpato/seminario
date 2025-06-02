exports.getAll = async (pool) => {
  const result = await pool.query('SELECT * FROM orders ORDER BY id');
  return result.rows;
};

exports.create = async (pool, data) => {
  const {
    address,
    lat,
    lng,
    volume,
    assigned_to,
    status,
    scheduled_at
  } = data;
  
  const query = `
    INSERT INTO orders (address, lat, lng, volume, assigned_to, status, scheduled_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [address, lat, lng, volume, assigned_to, status || 'pendiente', scheduled_at];
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.update = async (pool, id, data) => {
  const {
    address,
    lat,
    lng,
    volume,
    assigned_to,
    status,
    scheduled_at
  } = data;

  const query = `
    UPDATE orders SET
      address = $1,
      lat = $2,
      lng = $3,
      volume = $4,
      assigned_to = $5,
      status = $6,
      scheduled_at = $7
    WHERE id = $8
    RETURNING *;
  `;

  const values = [address, lat, lng, volume, assigned_to, status, scheduled_at, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.delete = async (pool, id) => {
  await pool.query('DELETE FROM orders WHERE id = $1', [id]);
};
