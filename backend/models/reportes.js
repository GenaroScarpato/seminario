
// Obtener todos los reportes con info del conductor
const getTodos = async (pool) => {
  const res = await pool.query(`
    SELECT r.id, r.tipo, r.mensaje, r.gravedad, r.creado_en,
           ST_X(r.ubicacion) AS longitud,
           ST_Y(r.ubicacion) AS latitud,
           c.nombre AS nombre_conductor
    FROM reportes r
    JOIN conductores c ON r.conductor_id = c.id
    ORDER BY r.creado_en DESC
  `);
  return res.rows;
};

// Crear un nuevo reporte
const crear = async ({ pool, data }) => {
  const { conductor_id, tipo, mensaje, gravedad, latitud, longitud } = data;

  await pool.query(`
    INSERT INTO reportes (conductor_id, tipo, mensaje, gravedad, ubicacion)
    VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326))
  `, [conductor_id, tipo, mensaje || '', gravedad || 1, longitud, latitud]);
};

// Eliminar reporte
const eliminar = async (pool, id) => {
  const res = await pool.query(`DELETE FROM reportes WHERE id = $1`, [id]);
  return res.rowCount;
};


module.exports = {
  getTodos,
  crear,
  eliminar
};
