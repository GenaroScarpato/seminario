// src/slices/ordersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchPedidos = createAsyncThunk('orders/fetchPedidos', async () => {
  const res = await api.get('/rutasAsignadas');
  return res.data;
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    pedidos: [],
    loading: false,
    error: null
  },
  reducers: {
    clearPedidos: (state) => {
      state.pedidos = [];
    },
    updateEstadoPedido: (state, action) => {
      const { id, estado } = action.payload;
      const pedido = state.pedidos.find(p => p.id === id);
      if (pedido) pedido.estado = estado;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPedidos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPedidos.fulfilled, (state, action) => {
        state.loading = false;
        state.pedidos = action.payload || [];
      })
      .addCase(fetchPedidos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearPedidos, updateEstadoPedido } = ordersSlice.actions;
export default ordersSlice.reducer;
