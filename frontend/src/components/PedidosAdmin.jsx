import React from 'react';
import { Outlet } from 'react-router-dom';
import OrderTable from './orders/OrderTable';
import OrderForm from './orders/OrderForm';

const PedidosAdmin = () => {
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-8">
            <OrderTable />
          </div>
          <div className="col-md-4">
            <OrderForm />
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default PedidosAdmin;
