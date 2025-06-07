import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DriverForm from '../../components/drivers/DriverForm';
import { toast } from 'react-toastify';

const CreateDriver = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await axios.post('http://localhost:3001/api/conductores', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      
      toast.success('Conductor creado exitosamente');
      navigate('/conductores');
    } catch (error) {
      console.error('Error al crear el conductor:', error);
      const errorMessage = error.response?.data?.error || 'Error al crear el conductor';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h2>Nuevo Conductor</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <DriverForm 
                onSubmit={handleSubmit} 
                onError={(error) => setError(error)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDriver;
