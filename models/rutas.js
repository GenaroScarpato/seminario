exports.getAll = async (pool) => {
  const result = await pool.query('SELECT * FROM routes ORDER BY id');
  return result.rows;
};

exports.create = async (pool, data) => {
  const {
    vehicle_id,
    path,
    total_distance,
    estimated_time
  } = data;

  const query = `
    INSERT INTO routes (vehicle_id, path, total_distance, estimated_time)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [vehicle_id, path, total_distance, estimated_time];
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.update = async (pool, id, data) => {
  const {
    vehicle_id,
    path,
    total_distance,
    estimated_time
  } = data;

  const query = `
    UPDATE routes SET
      vehicle_id = $1,
      path = $2,
      total_distance = $3,
      estimated_time = $4
    WHERE id = $5
    RETURNING *;
  `;

  const values = [vehicle_id, path, total_distance, estimated_time, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

exports.delete = async (pool, id) => {
  await pool.query('DELETE FROM routes WHERE id = $1', [id]);
};
