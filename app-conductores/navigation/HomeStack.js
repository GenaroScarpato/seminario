import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import DeliveryDetailScreen from '../screens/home/DeliveryDetailScreen';
import JornadaScreen from '../screens/home/JornadaScreen';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, 
        headerStyle: {
          backgroundColor: '#1b5e20',  // Color de fondo del header
        },
        headerTintColor: '#fff',       // Color del texto y botones
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} options={{ title: 'Detalle de Entrega' }} />
      <Stack.Screen name="JornadaScreen" component={JornadaScreen} options={{ title: 'Jornada' }} />
    </Stack.Navigator>
  );
};

export default HomeStack;
