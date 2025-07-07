// models/conductorModel.js

const getAllConductores = async (pool) => {
  const query = `
    SELECT 
      c.id,
      c.nombre,
      c.apellido,
      c.dni,
      c.url_licencia,
      c.telefono,
      c.email,
      c.direccion,
      c.estado,
      c.created_at,
      c.vehiculo_id,
      v.marca AS vehiculo_marca,
      v.modelo AS vehiculo_modelo,
      v.patente AS vehiculo_patente
    FROM conductores c
    LEFT JOIN vehiculos v ON c.vehiculo_id = v.id;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const createConductor = async (pool, data) => {
  const {
    nombre,
    apellido = null,
    dni,
    url_licencia = null,
    telefono = null,
    email = null,
    direccion = null,
    estado = 'disponible',
    vehiculo_id = null,
    password // ⬅️ campo nuevo
  } = data;

  if (!nombre || !dni || !password) {
    throw new Error('Faltan campos requeridos: nombre, dni y password');
  }

  const query = `
    INSERT INTO conductores (
      nombre, apellido, dni, url_licencia, telefono, email, direccion, estado, vehiculo_id, password
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, nombre, apellido, dni, email, estado;
  `;

  const values = [
    nombre,
    apellido,
    dni,
    url_licencia,
    telefono,
    email,
    direccion,
    estado,
    vehiculo_id,
    password // ⬅️ importante
  ];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};
  
  
  const getConductorById = async (pool, id) => {
    const query = `SELECT * FROM conductores WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  };
  
  const updateConductor = async (pool, id, data) => {
    // Actualiza solo campos que mandes (podés mejorar con dynamic SQL)
    const { nombre, apellido, vehiculo_asignado, telefono, email } = data;
    const query = `
      UPDATE conductores
      SET nombre = $1, apellido = $2, vehiculo_asignado = $3, telefono = $4, email = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [nombre, apellido, vehiculo_asignado, telefono, email, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  };
  
  const deleteConductor = async (pool, id) => {
    const query = `DELETE FROM conductores WHERE id = $1`;
    await pool.query(query, [id]);
  };
  
  const getHistory = async (pool, conductor_id) => {
    const query = `
      SELECT r.*, c.nombre as cliente_nombre, v.marca as vehiculo_marca
      FROM rutas r
      JOIN clientes c ON r.cliente_id = c.id
      JOIN vehiculos v ON r.vehiculo_id = v.id
      WHERE r.conductor_id = $1
    `;
    const { rows } = await pool.query(query, [conductor_id]);
    return rows;
  };
  
  const getFeedback = async (pool, conductor_id) => {
    const query = `
      SELECT f.*, c.nombre as cliente_nombre
      FROM feedback f
      JOIN clientes c ON f.cliente_id = c.id
      WHERE f.conductor_id = $1
    `;
    const { rows } = await pool.query(query, [conductor_id]);
    return rows;
  };
  
  
  

  
  module.exports = {
    getAllConductores,
    createConductor,
    getConductorById,
    updateConductor,
    deleteConductor,
    getHistory,
    getFeedback
  };
  