import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import DeliveryListScreen from '../screens/home/DeliveryListScreen';
import DeliveryDetailScreen from '../screens/home/DeliveryDetailScreen';
const Stack = createNativeStackNavigator();
import JornadaScreen from '../screens/home/JornadaScreen'; // ruta según donde la crees

const HomeStack = () => {
  return (
    <Stack.Navigator>
<Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Stack.Screen name="Deliveries" component={DeliveryListScreen} options={{ title: 'Mis Entregas' }} />
      <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} options={{ title: 'Detalle de Entrega' }} />
          <Stack.Screen name="JornadaScreen" component={JornadaScreen} options={{ title: 'Jornada' }} />

    </Stack.Navigator>
  );
};

export default HomeStack;