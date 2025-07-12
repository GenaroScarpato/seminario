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
    const { asignaciones } = req.body;

    if (!asignaciones || typeof asignaciones !== 'object') {
      return res.status(400).json({ msg: 'Faltan asignaciones válidas en el cuerpo' });
    }

    await client.query('BEGIN');

    // Borramos asignaciones anteriores
    await client.query('DELETE FROM asignaciones');

    // Recorremos objeto asignaciones { vehiculoId: [pedidoId, pedidoId,...], ... }
    for (const vehiculoIdStr in asignaciones) {
      const pedidoIds = asignaciones[vehiculoIdStr];
      const vehiculoId = parseInt(vehiculoIdStr);

      if (!Array.isArray(pedidoIds)) continue;

      // Buscamos conductor_id desde tabla conductores con vehiculo_id
      const { rows } = await client.query(
        'SELECT id as conductor_id FROM conductores WHERE vehiculo_id = $1',
        [vehiculoId]
      );
      const conductorId = rows.length > 0 ? rows[0].conductor_id : null;

      if (!conductorId) {
        console.warn(`Vehículo ${vehiculoId} no tiene conductor asignado, saltando`);
        continue;
      }

      // Insertar asignaciones para cada pedido
      for (const pedidoId of pedidoIds) {
        await client.query(
          `INSERT INTO asignaciones (pedido_id, vehiculo_id, conductor_id, estado, created_at, updated_at)
           VALUES ($1, $2, $3, 'asignado', NOW(), NOW())`,
          [pedidoId, vehiculoId, conductorId]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ msg: 'Asignaciones guardadas correctamente.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error asignando rutas:', error);
    handleError(res, error);
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
