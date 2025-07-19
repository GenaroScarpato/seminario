// models/conductorModel.js

const bcrypt = require('bcrypt');

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
  const validKeys = ['nombre', 'apellido', 'dni', 'telefono', 'email', 'direccion', 'estado', 'vehiculo_id', 'url_licencia', 'password'];
  const keys = Object.keys(data).filter(key => validKeys.includes(key));
 console.log('keys', keys);
  if (keys.length === 0) {
    throw new Error('No se enviaron campos para actualizar');
  }

  const currentConductor = await getConductorById(pool, id);
  const oldVehiculoId = currentConductor ? currentConductor.vehiculo_id : null;
  const newVehiculoId = data.vehiculo_id !== undefined ? (data.vehiculo_id === '' ? null : data.vehiculo_id) : undefined;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // vehículo
    if (newVehiculoId !== undefined && oldVehiculoId && oldVehiculoId !== newVehiculoId) {
      await client.query(`UPDATE vehiculos SET conductor_id = NULL WHERE id = $1;`, [oldVehiculoId]);
    }
    if (newVehiculoId !== undefined && newVehiculoId && newVehiculoId !== oldVehiculoId) {
      await client.query(`UPDATE vehiculos SET conductor_id = $1 WHERE id = $2;`, [id, newVehiculoId]);
    }

    // ⚠️ Evitar re-encriptado innecesario
    const updatedData = await Promise.all(
      keys.map(async (key) => {
        if (key === 'password') {
          const incomingPassword = data[key];
          const currentPassword = currentConductor.password;

          // Si ya está hasheada, NO reencriptar
          const isHashed = /^\$2[aby]\$/.test(incomingPassword); // bcrypt hash regex

          if (isHashed && incomingPassword === currentPassword) {
            return null; // no actualizar
          }

          const hashed = await bcrypt.hash(incomingPassword, 10);
          return [key, hashed];
        }

        if (key === 'vehiculo_id' && data[key] === '') {
          return [key, null];
        }

        return [key, data[key]];
      })
    );

    const fieldsToUpdate = updatedData.filter(Boolean); // saca los null
    if (fieldsToUpdate.length === 0) {
      await client.query('COMMIT');
      return currentConductor;
    }

    const setClauses = fieldsToUpdate.map(([key], i) => `${key} = $${i + 1}`);
    const values = fieldsToUpdate.map(([_, value]) => value);

    const updateQuery = `UPDATE conductores SET ${setClauses.join(', ')} WHERE id = $${values.length + 1} RETURNING *;`;
    const result = await client.query(updateQuery, [...values, id]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


const deleteConductor = async (pool, id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the conductor to know their assigned vehicle
    const conductorToDelete = await getConductorById(client, id); // Use client here too

    if (conductorToDelete && conductorToDelete.vehiculo_id) {
      // Unassign the vehicle if it was assigned to this conductor
      const unassignVehicleQuery = `
        UPDATE vehiculos
        SET conductor_id = NULL
        WHERE id = $1;
      `;
      await client.query(unassignVehicleQuery, [conductorToDelete.vehiculo_id]);
    }

    const query = `DELETE FROM conductores WHERE id = $1`;
    await client.query(query, [id]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en deleteConductor (transacción):", error);
    throw error;
  } finally {
    client.release();
  }
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