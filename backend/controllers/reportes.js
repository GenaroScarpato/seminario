const ReportesModel = require('../models/reportes');

const getReportes = async (req, res) => {
  try {
    const reportes = await ReportesModel.getTodos(req.pool);
    res.json(reportes);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
};

const crearReporte = async (req, res) => {
  console.log('Reporte recibido:', req.body);
  try {
    const { conductor_id, tipo, mensaje, gravedad, latitud, longitud } = req.body;

    if (!conductor_id || !tipo || latitud == null || longitud == null) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    await ReportesModel.crear({ pool: req.pool, data: req.body });
    res.status(201).json({ mensaje: 'Reporte creado' });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({ error: 'Error al crear reporte' });
  }
};



const eliminarReporte = async (req, res) => {
  try {
    const eliminado = await ReportesModel.eliminar(req.pool, req.params.id);
    if (eliminado === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    res.json({ mensaje: 'Reporte eliminado' });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({ error: 'Error al eliminar reporte' });
  }
};

module.exports = {
  getReportes,
  crearReporte,
  eliminarReporte
};
