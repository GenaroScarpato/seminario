const rutasModel = require('../models/rutas');

exports.getRutas = async (req, res) => {
  try {
    const rutas = await rutasModel.getAll(req.pool);
    res.json(rutas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRuta = async (req, res) => {
  try {
    const rutaData = req.body;
    const nuevaRuta = await rutasModel.create(req.pool, rutaData);
    res.status(201).json(nuevaRuta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateRuta = async (req, res) => {
  try {
    const id = req.params.id;
    const rutaData = req.body;
    const rutaActualizada = await rutasModel.update(req.pool, id, rutaData);
    res.json(rutaActualizada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRuta = async (req, res) => {
  try {
    const id = req.params.id;
    await rutasModel.delete(req.pool, id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
