const Joi = require('joi');

const vehicleSchema = Joi.object({
  patente: Joi.string()
    .pattern(/^(?:[A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/)
    .required()
    .messages({
      'string.pattern.base': 'La patente debe tener formato AAA123 o AA123AA (solo mayúsculas)',
      'any.required': 'La patente es requerida'
    }),
  marca: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'any.required': 'La marca es requerida'
    }),
  modelo: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'any.required': 'El modelo es requerido'
    }),
  anio: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      'number.min': 'El año debe ser mayor o igual a 1900',
      'number.max': 'El año no puede ser mayor al año actual',
      'any.required': 'El año es requerido'
    }),
  tipo: Joi.string()
    .valid('auto', 'camioneta', 'moto')
    .required()
    .messages({
      'any.required': 'El tipo es requerido'
    }),
  capacidad: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'La capacidad debe ser mayor o igual a 0'
    }),
  estado: Joi.string()
    .valid('disponible', 'en_servicio', 'mantenimiento', 'inactivo')
    .default('disponible')
    .messages({
      'any.only': 'El estado debe ser uno de: disponible, en_servicio, mantenimiento, inactivo'
    })
});

module.exports = vehicleSchema;
