// controllers/conductorController.js
const conductorModel = require('../models/conductores');
const bcrypt = require('bcrypt'); 


const handleError = (res, error) => {
  console.error(error);

  // Error de validación personalizada
  if (error.isJoi) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Errores Postgres comunes
  if (error.code) {
    switch (error.code) {
      case '23505': // violación de clave única
        if (error.detail.includes('email')) {
          return res.status(409).json({ message: 'El correo electrónico ya está registrado' });
        }
        if (error.detail.includes('dni')) {
          return res.status(409).json({ message: 'El DNI ya está registrado' });
        }
        if (error.detail.includes('url_licencia')) {
          return res.status(409).json({ message: 'El número de licencia ya está registrado' });
        }
        return res.status(409).json({ message: 'Dato duplicado' });

      case '23502': // valor nulo en columna no nula
        return res.status(400).json({ message: `Falta un campo obligatorio: ${error.column}` });

      case '22001': // valor demasiado largo para columna
        return res.status(400).json({ message: `Valor demasiado largo para el campo: ${error.column}` });

      default:
        return res.status(500).json({ message: 'Error de base de datos' });
    }
  }

  // Otros errores no manejados
  return res.status(500).json({ message: 'Error interno del servidor' });
};

getAll = async (req, res) => {
  try {
    const conductores = await conductorModel.getAllConductores(req.pool);
    res.json(conductores);
  } catch (error) {
    handleError(res, error);
  }
};

create = async (req, res) => {
  try {
    const { 
      nombre, 
      apellido, 
      dni, 
      email, 
      password, // ⬅️ nuevo
      telefono, 
      url_licencia, 
      estado = 'disponible',
      direccion,
      vehiculo_id = null
    } = req.body;

    // Validación de campos requeridos
    if (!nombre || !dni || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan campos requeridos: nombre, dni, email y password son obligatorios' 
      });
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'El formato del correo electrónico no es válido'
      });
    }

    // 🔐 Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const conductor = await conductorModel.createConductor(req.pool, {
      nombre,
      apellido: apellido || null,
      dni,
      email,
      password: hashedPassword, // ⬅️ importante
      telefono: telefono || null,
      url_licencia: url_licencia || null,
      estado,
      direccion: direccion || null,
      vehiculo_id
    });

    res.status(201).json({
      success: true,
      data: conductor
    });

  } catch (error) {
    console.error('Error en controlador create:', error);
    handleError(res, error);
  }
};


update = async (req, res) => {
  try {
    const conductor = await conductorModel.getConductorById(req.pool, req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }
    const updated = await conductorModel.updateConductor(req.pool, req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

deleteConductor = async (req, res) => {
  try {
    const conductor = await conductorModel.getConductorById(req.pool, req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }
    await conductorModel.deleteConductor(req.pool, req.params.id);
    res.json({ message: 'Conductor eliminado' });
  } catch (error) {
    handleError(res, error);
  }
};

getHistory = async (req, res) => {
  try {
    const conductor = await conductorModel.getConductorById(req.pool, req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }
    const historial = await conductorModel.getHistory(req.pool, req.params.id);
    res.json(historial);
  } catch (error) {
    handleError(res, error);
  }
};

getFeedback = async (req, res) => {
  try {
    const conductor = await conductorModel.getConductorById(req.pool, req.params.id);
    if (!conductor) {
      return res.status(404).json({ message: 'Conductor no encontrado' });
    }
    const feedback = await conductorModel.getFeedback(req.pool, req.params.id);
    res.json(feedback);
  } catch (error) {
    handleError(res, error);
  }
};




module.exports = {
  getAll,
  create,
  update,
  deleteConductor,
  getHistory,
  getFeedback
};
