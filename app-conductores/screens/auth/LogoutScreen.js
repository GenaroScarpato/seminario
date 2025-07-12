// LogoutScreen.js
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { deleteItem } from '../../utils/storage';
import { clearSession } from '../../slices/authSlice';

const LogoutScreen = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const logout = async () => {
      try {
        await deleteItem('user');
        await dispatch(clearSession()).unwrap();
        // No manejar navegación manual - el RootNavigator se encargará
      } catch (error) {
        console.error('Error durante el logout:', error);
        // En caso de error, también limpiar sesión
        dispatch(clearSession());
      }
    };
    logout();
  }, [dispatch]);

  return null;
};

export default LogoutScreen;