import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import store from './store';
import RootNavigator from './navigation';
import { setApiNavigation, setTokenGetter } from './services/api';
import { setupResponseInterceptor } from './services/authInterceptor';

// Configurar el interceptor de respuesta una sola vez
setupResponseInterceptor();

// Configurar el getter del token para romper el ciclo de dependencias
setTokenGetter(() => {
  const state = store.getState();
  return state.auth.user;
});

export default function App() {
  const navigationRef = React.useRef();

  // Configuramos la navegación global cuando esté lista (opcional)
  const onReady = () => {
    setApiNavigation(navigationRef.current);
  };

  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef} onReady={onReady}>
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
};