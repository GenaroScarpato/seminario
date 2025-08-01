import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LogoutScreen from '../screens/auth/LogoutScreen';
const Tab = createBottomTabNavigator();

const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1b5e20',       // Verde oscuro (activo)
        tabBarInactiveTintColor: '#81c784',     // Verde medio (inactivo)
        tabBarStyle: {
          backgroundColor: '#e8f5e9',            // Fondo del tab (verde claro)
          borderTopColor: '#c8e6c9',             // Borde superior suave
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen name="Homes" component={HomeStack} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Report" component={ReportScreen} options={{ title: 'Reportar' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Tab.Screen name="Logout" component={LogoutScreen} options={{ title: 'Cerrar Sesión' }} />
    </Tab.Navigator>
  );
};

export default AppStack;