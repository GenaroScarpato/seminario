import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { clearSession } from '../slices/authSlice';
import { getItem } from '../utils/storage';

const TokenRefreshHandler = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const checkToken = async () => {
      if (!user?.token) return;
      
      const isExpired = user.exp && user.exp < Date.now() / 1000;
      if (isExpired) {
        await dispatch(clearSession());
        if (navigation.isReady()) {
          navigation.navigate('Login'); // Usa navigate en lugar de replace
        }
      }
    };

    const interval = setInterval(checkToken, 60000);
    checkToken(); // Verificación inmediata
    
    return () => clearInterval(interval);
  }, [user?.token, user?.exp, dispatch, navigation]);

  return null;
};

export default TokenRefreshHandler;