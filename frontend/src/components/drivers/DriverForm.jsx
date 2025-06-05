import React, { useState } from 'react';

const DriverForm = ({ onSubmit, driver, vehicles }) => {
  const [formData, setFormData] = useState({
    nombre: driver?.nombre || '',
    dni: driver?.dni || '',
    telefono: driver?.telefono || '',
    email: driver?.email || '',
    estado: driver?.estado || 'activo',
    vehiculo_asignado: driver?.vehiculo_asignado || null,
    licencia: null
  });

  const [file, setFile] = useState(driver?.licencia || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setFormData(prev => ({
        ...prev,
        licencia: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="nombre" className="form-label">Nombre Completo *</label>
          <input
            type="text"
            className="form-control"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="dni" className="form-label">DNI *</label>
          <input
            type="text"
            className="form-control"
            id="dni"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="telefono" className="form-label">Teléfono *</label>
          <input
            type="tel"
            className="form-control"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="email" className="form-label">Email *</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
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
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="vehiculo" className="form-label">Vehículo Asignado</label>
          <select
            className="form-select"
            id="vehiculo"
            name="vehiculo_asignado"
            value={formData.vehiculo_asignado || ''}
            onChange={(e) => {
              const value = e.target.value;
              setFormData(prev => ({
                ...prev,
                vehiculo_asignado: value ? parseInt(value) : null
              }));
            }}
          >
            <option value="">Sin vehículo</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.patente} - {vehicle.marca} {vehicle.modelo}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-12 mb-3">
          <label htmlFor="licencia" className="form-label">Licencia de Conducir (PDF)</label>
          <input
            type="file"
            className="form-control"
            id="licencia"
            accept=".pdf"
            onChange={handleFileChange}
          />
          {file && (
            <div className="mt-2">
              <p className="mb-1">Archivo seleccionado: {file.name}</p>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => {
                  setFile(null);
                  setFormData(prev => ({
                    ...prev,
                    licencia: null
                  }));
                }}
              >
                Remover archivo
              </button>
            </div>
          )}
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            {driver ? 'Actualizar' : 'Crear'} Conductor
          </button>
        </div>
      </div>
    </form>
  );
};

export default DriverForm;
