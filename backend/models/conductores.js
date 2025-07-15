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

  if (keys.length === 0) {
    throw new Error('No se enviaron campos para actualizar');
  }

  // --- Start of new logic for vehicle assignment ---

  // 1. Get the current conductor data to know their existing vehiculo_id
  const currentConductor = await getConductorById(pool, id);
  const oldVehiculoId = currentConductor ? currentConductor.vehiculo_id : null;
  const newVehiculoId = data.vehiculo_id !== undefined ? (data.vehiculo_id === '' ? null : data.vehiculo_id) : undefined; // Handle empty string as null

  // Use a transaction for atomicity
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start transaction

    // 2. Unassign the old vehicle if it's different from the new one (and not null)
    // and if vehiculo_id is actually part of the update data
    if (newVehiculoId !== undefined && oldVehiculoId && oldVehiculoId !== newVehiculoId) {
      const unassignQuery = `
        UPDATE vehiculos
        SET conductor_id = NULL
        WHERE id = $1;
      `;
      await client.query(unassignQuery, [oldVehiculoId]);
    }

    // 3. Assign the new vehicle if a newVehiculoId is provided and it's different from the old one
    // and if vehiculo_id is actually part of the update data
    if (newVehiculoId !== undefined && newVehiculoId && newVehiculoId !== oldVehiculoId) {
      const assignQuery = `
        UPDATE vehiculos
        SET conductor_id = $1
        WHERE id = $2;
      `;
      await client.query(assignQuery, [id, newVehiculoId]);
    }

    // --- End of new logic for vehicle assignment ---

    // Preprocesar password si viene
    const updatedData = await Promise.all(
      keys.map(async (key) => {
        if (key === 'password') {
          const hashed = await bcrypt.hash(data[key], 10);
          return [key, hashed];
        }
        // Ensure vehiculo_id is correctly set to null if received as empty string from frontend
        if (key === 'vehiculo_id' && data[key] === '') {
          return [key, null];
        }
        return [key, data[key]];
      })
    );
    
    // Filter out vehiculo_id from updatedData if it was explicitly set to undefined (meaning it wasn't in the original `data` object for update)
    const filteredUpdatedData = updatedData.filter(([key, value]) => {
      // If newVehiculoId was undefined (meaning vehiculo_id wasn't in original `data`),
      // we don't want to include it in the SET clause of the conductor update.
      // We only handled its side effect on the `vehiculos` table.
      if (key === 'vehiculo_id' && newVehiculoId === undefined) {
          return false;
      }
      return true;
    });

    const campos = filteredUpdatedData.map(([key], index) => `${key} = $${index + 1}`);
    const valores = filteredUpdatedData.map(([, value]) => value);

    const query = `
      UPDATE conductores
      SET ${campos.join(', ')}
      WHERE id = $${valores.length + 1}
      RETURNING *;
    `;
    valores.push(id); // el id es el último parámetro
    const { rows } = await client.query(query, valores); // Use client for query

    await client.query('COMMIT'); // Commit transaction
    return rows[0];

  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error("Error en updateConductor (transacción):", error); // Log the transaction error
    throw error;
  } finally {
    client.release(); // Release the client back to the pool
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