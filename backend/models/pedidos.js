// models/pedidos.js
async function getAll(pool) {
  const result = await pool.query('SELECT * FROM pedidos ORDER BY id');
  return result.rows;
}

async function create(pool, data) {
  const {
    direccion,
    lat,
    lng,
    volumen,
    peso,
    estado,
    scheduled_at
  } = data;

  const query = `
    INSERT INTO pedidos (direccion, lat, lng, volumen, peso, estado, scheduled_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [direccion, lat, lng, volumen, peso || null, estado || 'pendiente', scheduled_at];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function update(pool, id, data) {
  const {
    direccion,
    lat,
    lng,
    volumen,
    peso,
    estado,
    scheduled_at
  } = data;

  const query = `
    UPDATE pedidos SET
      direccion = $1,
      lat = $2,
      lng = $3,
      volumen = $4,
      peso = $5,
      estado = $6,
      scheduled_at = $7
    WHERE id = $8
    RETURNING *;
  `;

  const values = [direccion, lat, lng, volumen, peso || null, estado, scheduled_at, id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function deletePedido(pool, id) {
  await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
}

module.exports = {
  getAll,
  create,
  update,
  delete: deletePedido
};
