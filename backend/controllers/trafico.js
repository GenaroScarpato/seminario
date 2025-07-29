const traficoModel = require('../models/trafico');

getZonasConTrafico = async (req, res) => {
  console.log('entro');
  try {
    const datos = await traficoModel.getTrafficData();
    res.json(datos);
    console.log('✅ joya');
  } catch (error) {
    console.log('❌ joya');
    console.error('Error al obtener tráfico:', error);
    res.status(500).json({ error: 'Error al consultar tráfico' });
  }
};

module.exports = {
  getZonasConTrafico,
};
