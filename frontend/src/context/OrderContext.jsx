import React, { createContext, useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create new order
  const createOrder = async (orderData) => {
    try {
      const newOrder = await orderService.createOrder(orderData);
      setOrders([...orders, newOrder]);
      return newOrder;
    } catch (err) {
      throw err;
    }
  };

  // Update order
  const updateOrder = async (orderId, updates) => {
    try {
      const updatedOrder = await orderService.updateOrder(orderId, updates);
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      return updatedOrder;
    } catch (err) {
      throw err;
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    try {
      await orderService.deleteOrder(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (err) {
      throw err;
    }
  };

  // Geolocate address
  const geolocateAddress = async (address) => {
    try {
      return await orderService.geolocateAddress(address);
    } catch (err) {
      throw err;
    }
  };

  // Assign order to vehicle
  const assignOrderToVehicle = async (orderId, vehicleId) => {
    try {
      const updatedOrder = await orderService.assignOrderToVehicle(orderId, vehicleId);
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      return updatedOrder;
    } catch (err) {
      throw err;
    }
  };

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const value = {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    geolocateAddress,
    assignOrderToVehicle
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => {
  const context = React.useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrderContext debe ser usado dentro de un OrderProvider');
  }
  return context;
};
