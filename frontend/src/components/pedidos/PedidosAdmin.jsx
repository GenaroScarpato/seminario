import React, { useState, useEffect } from 'react';
import PedidoTable from './PedidoTable';
import PedidoForm from './PedidoForm';
import axios from 'axios';

const PedidosAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get('/api/pedidos');
      setPedidos(response.data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleCreatePedido = async (pedidoData) => {
    try {
      const response = await axios.post('/api/pedidos', pedidoData);
      setPedidos([...pedidos, response.data]);
      handleCloseModal();
    } catch (error) {
      console.error('Error al crear pedido:', error);
    }
  };

  const handleUpdatePedido = async (pedidoData) => {
    try {
      const response = await axios.put(`/api/pedidos/${selectedPedido.id}`, pedidoData);
      setPedidos(pedidos.map(pedido => 
        pedido.id === selectedPedido.id ? response.data : pedido
      ));
      handleCloseModal();
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
    }
  };

  const handleDeletePedido = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este pedido?')) return;

    try {
      await axios.delete(`/api/pedidos/${id}`);
      setPedidos(pedidos.filter(pedido => pedido.id !== id));
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
    }
  };

  const handleEditPedido = (pedido) => {
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
        pedidos={pedidos} 
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
