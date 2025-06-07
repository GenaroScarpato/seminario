// models/conductorModel.js

const getAllConductores = async (pool) => {
    const query = `
      SELECT c.*, v.*
      FROM conductores c
      LEFT JOIN vehiculos v ON c.vehiculo_asignado = v.id
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
      vehiculo_id = null,  // <-- nuevo campo
    } = data;
  
    if (!nombre || !dni) {
      throw new Error('Faltan campos requeridos: nombre y dni');
    }
  
    const query = `
      INSERT INTO conductores (
        nombre, apellido, dni, url_licencia, telefono, email, direccion, estado, vehiculo_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
  
    const values = [nombre, apellido, dni, url_licencia, telefono, email, direccion, estado, vehiculo_id];
  
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
  
  const getDocuments = async (pool, conductor_id) => {
    const query = `SELECT * FROM documentos WHERE conductor_id = $1`;
    const { rows } = await pool.query(query, [conductor_id]);
    return rows;
  };
  
  const uploadDocument = async (pool, conductor_id, data) => {
    const { tipo, url } = data;
    const query = `
      INSERT INTO documentos (conductor_id, tipo, url)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [conductor_id, tipo, url];
    const { rows } = await pool.query(query, values);
    return rows[0];
  };
  
  module.exports = {
    getAllConductores,
    createConductor,
    getConductorById,
    updateConductor,
    deleteConductor,
    getHistory,
    getFeedback,
    getDocuments,
    uploadDocument
  };
  