exports.obtenerTodos = async (pool) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.*, 
        c.estado AS conductor_estado
      FROM vehiculos v
      LEFT JOIN conductores c ON v.conductor_id = c.id
      ORDER BY v.id
    `);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    throw error;
  }
};


exports.obtenerPorId = async (pool, id) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vehiculos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    throw error;
  }
};

exports.filtrar = async (pool, filtro) => {
  try {
    let query = 'SELECT * FROM vehiculos WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Agregar filtros según los campos proporcionados
    if (filtro.patente) {
      query += ` AND LOWER(patente) LIKE LOWER($${paramIndex})`;
      params.push(`%${filtro.patente}%`);
      paramIndex++;
    }
    if (filtro.marca) {
      query += ` AND LOWER(marca) LIKE LOWER($${paramIndex})`;
      params.push(`%${filtro.marca}%`);
      paramIndex++;
    }
    if (filtro.modelo) {
      query += ` AND LOWER(modelo) LIKE LOWER($${paramIndex})`;
      params.push(`%${filtro.modelo}%`);
      paramIndex++;
    }
    if (filtro.tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(filtro.tipo);
      paramIndex++;
    }
    if (filtro.estado) {
      query += ` AND estado = $${paramIndex}`;
      params.push(filtro.estado);
      paramIndex++;
    }

    query += ' ORDER BY id';
    
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error al filtrar vehículos:', error);
    throw error;
  }
};

exports.crear = async (pool, data) => {
  try {
    // Convertir patente a mayúsculas
    const patenteMayusculas = data.patente.toUpperCase();
    
    const result = await pool.query(
      'INSERT INTO vehiculos (patente, marca, modelo, anio, tipo, capacidad, estado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [patenteMayusculas, data.marca, data.modelo, data.anio, data.tipo, data.capacidad || 0, data.estado || 'disponible']
    );
    
    if (result.rows.length === 0) {
      throw new Error('No se pudo crear el vehículo');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    if (error.code === '23502') { // Violación de restricción NOT NULL
      throw new Error('Faltan campos requeridos');
    }
    if (error.code === '23505') { // Violación de restricción UNIQUE
      throw new Error('Patente ya existe');
    }
    throw error;
  }
};

exports.actualizar = async (pool, id, data) => {
  try {
    const result = await pool.query(
      'UPDATE vehiculos SET patente = $1, marca = $2, modelo = $3, anio = $4, tipo = $5, capacidad = $6, estado = $7 WHERE id = $8 RETURNING *',
      [data.patente, data.marca, data.modelo, data.anio, data.tipo, data.capacidad, data.estado, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Vehículo no encontrado');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    if (error.code === '23502') { // Violación de restricción NOT NULL
      throw new Error('Faltan campos requeridos');
    }
    if (error.code === '23505') { // Violación de restricción UNIQUE
      throw new Error('Patente ya existe');
    }
    throw error;
  }
};

exports.eliminar = async (pool, id) => {
  try {
    const result = await pool.query('DELETE FROM vehiculos WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      throw new Error('Vehículo no encontrado');
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    throw error;
  }
};
