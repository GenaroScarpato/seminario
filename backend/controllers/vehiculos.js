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
        const { name, capacity } = req.body;
        const nuevo = await vehiculoModel.crear(req.pool, { name, capacity });
        res.status(201).json(nuevo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.actualizarVehiculo = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, capacity } = req.body;
        const actualizado = await vehiculoModel.actualizar(req.pool, id, { name, capacity });
        res.json(actualizado);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.eliminarVehiculo = async (req, res) => {
    try {
        const id = req.params.id;
        await vehiculoModel.eliminar(req.pool, id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
