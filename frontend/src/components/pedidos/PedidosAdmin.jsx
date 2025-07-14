import React, { useContext, useState } from 'react';
import PedidoTable from './PedidoTable';
import PedidoForm from './PedidoForm';
import axios from 'axios';
import { API_BASE_URL, API_ROUTES } from '@config/api';
import { OrderContext } from '../../context/OrderContext'; // Asegúrate de que la ruta sea correcta

const PedidosAdmin = () => {
  const { orders, setOrders } = useContext(OrderContext);  // Uso del contexto
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCreatePedido = async (pedidoData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}${API_ROUTES.PEDIDOS.ALL}`, pedidoData);
      setOrders([...orders, response.data]);  // Actualiza contexto
      handleCloseModal();
    } catch (error) {
      console.error('Error al crear pedido:', error);
    }
  };

  const handleUpdatePedido = async (pedidoData) => {
    try {
      const url = `${API_BASE_URL}${API_ROUTES.PEDIDOS.UPDATE.replace(':id', selectedPedido.id)}`;
      const response = await axios.put(url, pedidoData);
      setOrders(orders.map(pedido => 
        pedido.id === selectedPedido.id ? response.data : pedido
      ));  // Actualiza contexto
      handleCloseModal();
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
    }
  };

  const handleDeletePedido = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este pedido?')) return;

    try {
      await axios.delete(`${API_BASE_URL}${API_ROUTES.PEDIDOS.DELETE.replace(':id', id)}`);
      setOrders(orders.filter(pedido => pedido.id !== id));  // Actualiza contexto
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
    }
  };

 const handleEditPedido = (pedido) => {
  console.log('Pedido a editar:', pedido); // Verifica los datos en consola
  setSelectedPedido(pedido);
  setShowModal(true);
};

  const handleOpenNew = () => {
    setSelectedPedido(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedPedido(null);
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2>Pedidos</h2>
          <button 
            className="btn btn-primary" 
            onClick={handleOpenNew}
          >
            Nuevo Pedido
          </button>
        </div>
      </div>

      <PedidoTable 
        pedidos={orders} 
        onDelete={handleDeletePedido}
        onEdit={handleEditPedido}
      />

      {/* Modal */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} 
           style={{ display: showModal ? 'block' : 'none' }}
           tabIndex="-1"
           role="dialog"
           aria-labelledby="pedidoModalLabel"
           aria-hidden={!showModal}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="pedidoModalLabel">
                {selectedPedido ? 'Editar' : 'Nuevo'} Pedido
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleCloseModal}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <PedidoForm
                onSubmit={selectedPedido ? handleUpdatePedido : handleCreatePedido}
                pedido={selectedPedido}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={`modal-backdrop fade ${showModal ? 'show' : ''}`} 
           style={{ display: showModal ? 'block' : 'none' }}
      ></div>
    </div>
  );
};

export default PedidosAdmin;
