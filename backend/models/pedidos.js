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
    scheduled_at,
    cliente_nombre,
    cliente_telefono
  } = data;

  const query = `
    INSERT INTO pedidos (
      direccion, lat, lng, volumen, peso, estado, scheduled_at,
      cliente_nombre, cliente_telefono
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;

  const values = [
    direccion, lat, lng, volumen, peso || null, estado || 'pendiente', scheduled_at,
    cliente_nombre || null, cliente_telefono || null
  ];

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
    scheduled_at,
    cliente_nombre,
    cliente_telefono
  } = data;

  const query = `
    UPDATE pedidos SET
      direccion = $1,
      lat = $2,
      lng = $3,
      volumen = $4,
      peso = $5,
      estado = $6,
      scheduled_at = $7,
      cliente_nombre = $8,
      cliente_telefono = $9
    WHERE id = $10
    RETURNING *;
  `;

  const values = [
    direccion, lat, lng, volumen, peso || null, estado, scheduled_at,
    cliente_nombre || null, cliente_telefono || null, id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}


async function updateEstado(pool, id, estado) {
  const query = `
    UPDATE pedidos SET
      estado = $1
    WHERE id = $2
    RETURNING *;
  `;
  const values = [estado, id];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error(`Pedido con ID ${id} no encontrado.`);
  }
  return result.rows[0];
}



async function deletePedido(pool, id) {
  await pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
}

module.exports = {
  getAll,
  create,
  update,
  delete: deletePedido,
  updateEstado
};
