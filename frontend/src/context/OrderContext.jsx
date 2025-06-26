import React, { createContext, useState, useEffect } from 'react';
import { API_BASE_URL, API_ROUTES } from '@config/api';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}${API_ROUTES.PEDIDOS.ALL}`);
        const data = await res.json();

        setOrders(data);
      } catch (error) {
        console.error('Error cargando pedidos:', error);
      }
    };
    fetchOrders();
  }, []);

  return (
    <OrderContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
