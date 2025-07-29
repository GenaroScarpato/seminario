// controllers/asignacionController.js
const handleError = (res, error) => {
  console.error(error);

  if (error.code) {
    switch (error.code) {
      case '23505':
        return res.status(409).json({ message: 'Dato duplicado' });
      case '23502':
        return res.status(400).json({ message: `Falta un campo obligatorio: ${error.column}` });
      case '22001':
        return res.status(400).json({ message: `Valor demasiado largo para el campo: ${error.column}` });
      default:
        return res.status(500).json({ message: 'Error de base de datos' });
    }
  }

  return res.status(500).json({ message: 'Error interno del servidor' });
};

const asignarRutas = async (req, res) => {
  const client = await req.pool.connect();

  try {
    const { asignaciones } = req.body; // { [vehiculoId]: [pedidoId, pedidoId, ...], ... }

    if (!asignaciones || typeof asignaciones !== 'object' || Object.keys(asignaciones).length === 0) {
      return res.status(400).json({ msg: 'Faltan asignaciones válidas en el cuerpo' });
    }

    await client.query('BEGIN');

    // Limpio todas las asignaciones previas (ajusta si querés conservar historial)
    await client.query('DELETE FROM asignaciones');

    for (const [vehiculoIdStr, pedidoIds] of Object.entries(asignaciones)) {
      const vehiculoId = Number(vehiculoIdStr);
      if (!Array.isArray(pedidoIds) || pedidoIds.length === 0) continue;

      // Busco el conductor asociado al vehículo
      const { rows } = await client.query(
        'SELECT id AS conductor_id FROM conductores WHERE vehiculo_id = $1',
        [vehiculoId]
      );

      if (rows.length === 0) {
        console.warn(`Vehículo ${vehiculoId} no tiene conductor asignado, se omite`);
        continue;
      }

      const conductorId = rows[0].conductor_id;

      // Inserto cada pedido con su índice de orden
      for (let i = 0; i < pedidoIds.length; i++) {
        const pedidoId = pedidoIds[i];

        await client.query(
          `INSERT INTO asignaciones 
            (pedido_id, vehiculo_id, conductor_id, estado, orden, created_at, updated_at)
           VALUES ($1, $2, $3, 'asignado', $4, NOW(), NOW())`,
          [pedidoId, vehiculoId, conductorId, i]
        );
      }
    }

    await client.query('COMMIT');
    return res.json({ msg: 'Asignaciones guardadas correctamente con orden.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error asignando rutas:', error);
    return handleError(res, error);
  } finally {
    client.release();
  }
};


const rutasAsignadas = async (req, res) => {
  const client = await req.pool.connect();
  const conductorId = req.user?.id; // Asegurate que req.user esté seteado por middleware JWT
  if (!conductorId) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const { rows } = await client.query(`
      SELECT p.*
      FROM asignaciones a
      JOIN pedidos p ON p.id = a.pedido_id
      WHERE a.conductor_id = $1
      ORDER BY a.orden ASC
    `, [conductorId]);

    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo rutas asignadas:', error);
    handleError(res, error);
  } finally {
    client.release();
  }
};


module.exports = {
  asignarRutas,
  rutasAsignadas
};
