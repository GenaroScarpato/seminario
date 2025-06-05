const db = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const conductores = await db.Conductor.findAll({
      include: [
        {
          model: db.Vehiculo,
          as: 'vehiculo_asignado',
          required: false
        }
      ]
    });
    res.json(conductores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const conductor = await db.Conductor.create(req.body);
    res.status(201).json(conductor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const conductor = await db.Conductor.findByPk(req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }
    await conductor.update(req.body);
    res.json(conductor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const conductor = await db.Conductor.findByPk(req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }
    await conductor.destroy();
    res.json({ message: 'Conductor eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const conductor = await db.Conductor.findByPk(req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }
    const historial = await db.Ruta.findAll({
      where: { conductor_id: req.params.id },
      include: [
        {
          model: db.Cliente,
          as: 'cliente'
        },
        {
          model: db.Vehiculo,
          as: 'vehiculo'
        }
      ]
    });
    res.json(historial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const conductor = await db.Conductor.findByPk(req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }
    const feedback = await db.Feedback.findAll({
      where: { conductor_id: req.params.id },
      include: [
        {
          model: db.Cliente,
          as: 'cliente'
        }
      ]
    });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const conductor = await db.Conductor.findByPk(req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }
    const documentos = await db.Documento.findAll({
      where: { conductor_id: req.params.id }
    });
    res.json(documentos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const conductor = await db.Conductor.findByPk(req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }

    const documento = await db.Documento.create({
      ...req.body,
      conductor_id: req.params.id,
      url: `/uploads/${req.file.filename}`
    });

    res.status(201).json(documento);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
