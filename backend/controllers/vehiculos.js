const Joi = require('joi');
const vehiculoModel = require('../models/vehiculos');
const vehicleSchema = require('../schemas/vehicleSchema');

// Esquema para validar filtros
const filtroSchema = Joi.object({
  patente: Joi.string()
    .pattern(/^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/)
    .optional(),
  marca: Joi.string()
    .min(2)
    .max(50)
    .optional(),
  modelo: Joi.string()
    .min(2)
    .max(50)
    .optional(),
  tipo: Joi.string()
    .valid('auto', 'camioneta', 'moto')
    .optional(),
  estado: Joi.string()
    .valid('disponible', 'en_servicio', 'mantenimiento', 'inactivo')
    .optional()
});

const validateVehicle = (data) => {
  const { error } = vehicleSchema.validate(data);
  return error;
};

const validateEstado = (data) => {
  const { estado } = data;
  const validStates = ['disponible', 'en_servicio', 'mantenimiento', 'inactivo'];
  
  if (!estado || !validStates.includes(estado)) {
    return {
      details: [{
        message: 'Estado inválido. Los estados válidos son: disponible, en_servicio, mantenimiento, inactivo'
      }]
    };
  }
  return null;
};

exports.getVehiculos = async (req, res) => {
  try {
    const vehiculos = await vehiculoModel.obtenerTodos(req.pool);
    res.json(vehiculos);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error al obtener los vehículos' });
  }
};

exports.getVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
    const vehiculo = await vehiculoModel.obtenerPorId(req.pool, id);
    
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    res.json(vehiculo);
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    res.status(500).json({ error: 'Error al obtener el vehículo' });
  }
};

exports.filtrarVehiculos = async (req, res) => {
  try {
    const { error } = filtroSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const vehiculos = await vehiculoModel.filtrar(req.pool, req.query);
    res.json(vehiculos);
  } catch (error) {
    console.error('Error al filtrar vehículos:', error);
    res.status(500).json({ error: 'Error al filtrar los vehículos' });
  }
};

exports.crearVehiculo = async (req, res) => {
  try {
    
    // Convertir patente a mayúsculas antes de validar
    const data = { 
      ...req.body, 
      patente: req.body.patente.trim().toUpperCase()  // <-- ahora sí
    };
        
    const error = validateVehicle(data);
    if (error) {
      console.error('Error de validación:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const nuevo = await vehiculoModel.crear(req.pool, {
      ...data,
      capacidad: data.capacidad || 0,
      estado: data.estado || 'disponible'
    });
    
    console.log('Vehículo creado:', nuevo);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error detallado:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    
    if (error.message.includes('Faltan campos requeridos')) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (error.message.includes('Patente ya existe')) {
      return res.status(400).json({ error: 'Patente ya existe' });
    }
    if (error.message.includes('No se pudo crear el vehículo')) {
      return res.status(500).json({ error: 'Error al crear el vehículo' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.actualizarVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
    const error = req.body.estado 
    ? validateEstado(req.body) 
    : validateVehicle(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

    const actualizado = await vehiculoModel.actualizar(req.pool, id, {
      ...req.body,
      capacidad: req.body.capacidad || 0,
      estado: req.body.estado || 'disponible'
    });
    
    res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    if (error.message.includes('Faltan campos requeridos')) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (error.message.includes('Patente ya existe')) {
      return res.status(400).json({ error: 'Patente ya existe' });
    }
    if (error.message.includes('Vehículo no encontrado')) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.eliminarVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
    await vehiculoModel.eliminar(req.pool, id);
    res.status(200).json({ message: `Vehículo con id ${id} eliminado.` });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    if (error.message.includes('Vehículo no encontrado')) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
