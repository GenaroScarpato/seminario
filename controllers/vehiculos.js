const vehiculoModel = require('../models/vehiculos');

exports.getVehiculos = async (req, res) => {
  try {
    const vehiculos = await vehiculoModel.obtenerTodos(req.pool);
    res.json(vehiculos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.crearVehiculo = async (req, res) => {
  try {
  const { patente, name, capacity } = req.body;
const nuevo = await vehiculoModel.crear(req.pool, { patente, name, capacity })
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.actualizarVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
  const { patente, name, capacity } = req.body;
const actualizado = await vehiculoModel.actualizar(req.pool, id, { patente, name, capacity });

    if (!actualizado) {
      return res.status(404).json({ error: `Vehículo con id ${id} no encontrado.` });
    }

    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.eliminarVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
    const eliminado = await vehiculoModel.eliminar(req.pool, id);

    if (!eliminado) {
      return res.status(200).json({ message: `Vehículo con id ${id} eliminado.` });
    }
    res.status(204).json({ message: `Vehículo con id ${id} eliminado.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
