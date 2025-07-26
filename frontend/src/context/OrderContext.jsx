import React, { createContext, useState, useEffect } from 'react';
import { API_BASE_URL, API_ROUTES } from '@config/api';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

    const fetchOrders = React.useCallback(async () => { // <--- ENVUELTO EN useCallback
    try {
      const res = await fetch(`${API_BASE_URL}${API_ROUTES.PEDIDOS.ALL}`);
      const data = await res.json();
      setOrders(data);
      console.log('✅ Pedidos actualizados:', data.length);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  }, []); // <--- Dependencia vacía para que sea estable

  useEffect(() => {
    fetchOrders(); // Llamar la función en el useEffect
  }, []);

  return (
    <OrderContext.Provider value={{ 
      orders, 
      setOrders,
     fetchOrders // <-- aquí
    }}>
      {children}
    </OrderContext.Provider>
  );
};