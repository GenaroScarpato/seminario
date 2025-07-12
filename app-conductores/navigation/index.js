import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import LoadingScreen from '../screens/auth/LoadingScreen';
import { checkLoginStatus } from '../slices/authSlice';
  
const RootNavigator = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);

  // Solo verificamos el estado de login al montar el componente
  useEffect(() => {
    dispatch(checkLoginStatus());
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return user?.token ? <AppStack /> : <AuthStack />;
};

export default RootNavigator;