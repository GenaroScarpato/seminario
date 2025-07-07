import React, { useState, useEffect } from 'react';

const DriverForm = ({ onSubmit, driver, vehicles = [], onError }) => {
  const [formData, setFormData] = useState({
    nombre: driver?.nombre || '',
    apellido: driver?.apellido || '',
    dni: driver?.dni || '',
    password: driver?.password || driver?.dni || '', // Usar DNI como contraseña por defecto
    telefono: driver?.telefono || '',
    email: driver?.email || '',
    licencia: driver?.licencia || '',
    estado: driver?.estado || 'disponible',
    vehiculo_id: driver?.vehiculo_id || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (driver?.vehiculo_id && vehicles.length > 0) {
      setFormData(prev => ({
        ...prev,
        vehiculo_id: driver.vehiculo_id
      }));
    }
  }, [driver, vehicles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    } else if (!/^\d{7,8}$/.test(formData.dni.trim())) {
      newErrors.dni = 'El DNI debe tener 7 u 8 dígitos';
    }
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }
    if (!formData.licencia.trim()) newErrors.licencia = 'La licencia es requerida';
if (!formData.password.trim()) {
  newErrors.password = 'La contraseña es requerida';
} else if (formData.password.length < 6) {
  newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const dataToSend = {
        ...formData,
        vehiculo_id: formData.vehiculo_id || null
      };

      await onSubmit(dataToSend);
    } catch (error) {
     const errData = error?.response?.data;
console.log('Error al enviar el formulario:', errData);

if (errData?.message) {
  setServerError(errData.message); // ✅ este es el formato que devuelve tu backend
} else if (errData?.error) {
  setServerError(errData.error);
} else if (typeof errData === 'string') {
  setServerError(errData);
} else if (typeof errData === 'object') {
  setErrors(errData);
} else {
  setServerError('Ocurrió un error inesperado.');
}


      onError?.(errData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      {serverError && (
        <div className="alert alert-danger" role="alert">
          {serverError}
        </div>
      )}

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="nombre" className="form-label">Nombre *</label>
          <input
            type="text"
            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="apellido" className="form-label">Apellido</label>
          <input
            type="text"
            className="form-control"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="dni" className="form-label">DNI *</label>
          <input
            type="text"
            className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
            id="dni"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            placeholder="Ej: 12345678"
            required
          />
          {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
        </div>


        
        <div className="col-md-6 mb-3">
          <label htmlFor="telefono" className="form-label">Teléfono</label>
          <input
            type="tel"
            className="form-control"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ej: +54 9 11 1234-5678"
          />
        </div>
        <div className="col-md-6 mb-3">
  <label htmlFor="password" className="form-label">Contraseña *</label>
  <input
    type="password"
    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
    id="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    required
  />
  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
</div>

        <div className="col-md-6 mb-3">
          <label htmlFor="email" className="form-label">Email *</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="licencia" className="form-label">Número de Licencia *</label>
          <input
            type="text"
            className={`form-control ${errors.licencia ? 'is-invalid' : ''}`}
            id="licencia"
            name="licencia"
            value={formData.licencia}
            onChange={handleChange}
            required
          />
          {errors.licencia && <div className="invalid-feedback">{errors.licencia}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="vehiculo_id" className="form-label">Vehículo Asignado</label>
          <select
            className="form-select"
            id="vehiculo_id"
            name="vehiculo_id"
            value={formData.vehiculo_id || ''}
            onChange={handleChange}
          >
            <option value="">Sin asignar</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.patente} - {vehicle.marca} {vehicle.modelo}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="estado" className="form-label">Estado *</label>
          <select
            className="form-select"
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
          >
            <option value="disponible">Disponible</option>
            <option value="ocupado">Ocupado</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="col-12 mt-4">
          <div className="col-12 mt-4 d-flex justify-content-end">
  <button
    type="submit"
    className="btn btn-primary"
    disabled={isSubmitting}
  >
    {isSubmitting ? (
      <>
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Guardando...
      </>
    ) : 'Guardar'}
  </button>
</div>

        </div>
      </div>
    </form>
  );
};

export default DriverForm;
