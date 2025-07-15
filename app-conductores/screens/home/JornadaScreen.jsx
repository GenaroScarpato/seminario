import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler ,  Platform} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { Linking } from 'react-native';


const JornadaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const pedidos = route.params?.pedidos || [];

  const [pedidoIndex, setPedidoIndex] = useState(0);
  const [socket, setSocket] = useState(null);
  const [activo, setActivo] = useState(false);
  const locationSubscription = useRef(null); // Ref para almacenar la suscripción de ubicación

  // Bloquear salida si no terminó la jornada
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Atención",
        "Debes terminar la jornada para salir.",
        [{ text: "Aceptar", onPress: () => {} }],
        { cancelable: false }
      );
      return true; // Bloquea botón atrás
    };

// Ahora:
const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
return () => {
  if (subscription) {
    subscription.remove();
  }
};
  }, []);

  useEffect(() => {
    const startSocketAndLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación.');
        return;
      }

      // Inicializar conexión de socket
      const s = io('http://192.168.0.231:3000', { transports: ['websocket'] });
      setSocket(s);
      setActivo(true);

      // Empezar a observar la ubicación con intervalos especificados
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // Alta precisión para mejores coordenadas
          timeInterval: 120000, // Actualizar cada 2 minutos (120,000 ms)
          distanceInterval: 50, // Actualizar si se movió al menos 50 metros
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          // Emitir datos de ubicación al servidor
          s.emit('ubicacion', {
            lat: latitude,
            lng: longitude,
            dni: pedidos[0]?.dni || 'sin-dni', // Ajustar si el DNI se pasa en los parámetros
            timestamp: new Date().toISOString(),
          });
        }
      );
    };

    startSocketAndLocationTracking();

    // Función de limpieza para el efecto
    return () => {
      // Limpiar suscripción de ubicación
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      // Desconectar socket
      if (socket) {
        socket.disconnect();
      }
    };
  }, []); // El array de dependencias vacío significa que este efecto se ejecuta una vez al montar y se limpia al desmontar

  const pedidoActual = pedidos[pedidoIndex];
  


  // Función para marcar el pedido como "en camino"
  const marcarEnCamino = async () => {
    try {
      await api.put(`/pedidos/${pedidoActual.id}/estado`, { estado: 'en_camino' });
      // Opcional: Actualizar el estado local del pedido si es necesario
      // setPedidos(prevPedidos => prevPedidos.map(p => p.id === pedidoActual.id ? { ...p, estado: 'en camino' } : p));
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido a "en camino".');
      console.error('Error al marcar en camino:', error); // Para depuración
    }
  };

  // NUEVA FUNCIÓN: Marcar pedido como "entregado"
const marcarComoEntregado = async () => {
  try {
    await api.put(`/pedidos/${pedidoActual.id}/estado`, { estado: 'entregado' });

    // Detectar si es web y evitar Alert.alert
    if (Platform.OS === 'web') {
      alert('Pedido entregado con éxito'); // alert nativa de navegador
      siguientePedido(); // llamar directamente
    } else {
      Alert.alert('Éxito', 'Pedido marcado como entregado.', [
        { text: 'OK', onPress: siguientePedido }
      ]);
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo actualizar el estado del pedido a "entregado".');
    console.error('Error al marcar como entregado:', error);
  }
};


  const abrirNavegacion = (app) => {
    if (!pedidoActual) return;
    const direccionEncoded = encodeURIComponent(pedidoActual.direccion);
    let url = '';
    if (app === 'waze') url = `https://waze.com/ul?q=${direccionEncoded}`;
    else url = `https://www.google.com/maps/dir/?api=1&destination=${direccionEncoded}`;

    marcarEnCamino(); // Marca el pedido como "en camino" al iniciar la navegación
    Linking.openURL(url);
  };

  const siguientePedido = () => {
    if (pedidoIndex + 1 >= pedidos.length) {
      Alert.alert('Fin de jornada', 'Has terminado todos los pedidos.');
      socket?.disconnect();
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      navigation.goBack();
      return;
    }
    setPedidoIndex(pedidoIndex + 1);
  };

  const terminarJornada = () => {
  const quedanPendientes = pedidos.some(p => p.estado !== 'entregado');

  if (quedanPendientes) {
    Alert.alert('Atención', 'Aún tienes pedidos sin entregar. Completa todos antes de terminar la jornada.');
    return;
  }

  if (Platform.OS === 'web') {
    const confirmar = confirm('¿Seguro que quieres terminar la jornada?');
    if (confirmar) {
      socket?.disconnect();
      if (locationSubscription.current) {
   locationSubscription.current.remove(); 
  locationSubscription.current = null;
}

      navigation.goBack();
    }
  } else {
    Alert.alert('Confirmar', '¿Seguro que quieres terminar la jornada?', [
      { text: 'Cancelar' },
      {
        text: 'Sí, terminar',
        onPress: () => {
          socket?.disconnect();
          if (locationSubscription.current) {
            locationSubscription.current.remove();
          }
          navigation.goBack();
        },
      },
    ]);
  }
};

  if (!pedidoActual) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No hay pedidos para esta jornada.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Pedido {pedidoActual.id}</Text>
      <Text style={styles.text}>Dirección: {pedidoActual.direccion}</Text>
      <Text style={styles.text}>Estado: {pedidoActual.estado}</Text>

      <TouchableOpacity style={styles.button} onPress={() => abrirNavegacion('waze')}>
        <Text style={styles.buttonText}>Ir con Waze</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => abrirNavegacion('maps')}>
        <Text style={styles.buttonText}>Ir con Google Maps</Text>
      </TouchableOpacity>

      {/* NUEVO BOTÓN: Marcar como Entregado */}
      <TouchableOpacity style={[styles.button, styles.deliveredButton]} onPress={marcarComoEntregado}>
        <Text style={styles.buttonText}>✅ Marcar como Entregado</Text>
      </TouchableOpacity>

      

      <TouchableOpacity style={[styles.button, styles.endWorkdayButton]} onPress={terminarJornada}>
        <Text style={styles.buttonText}>🛑 Terminar jornada</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  text: { fontSize: 18, marginBottom: 12, textAlign: 'center', color: '#555' },
  button: {
    backgroundColor: '#007AFF', // Azul para botones de navegación
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000', // Sombra para efecto "copado"
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deliveredButton: {
    backgroundColor: '#28a745', // Verde para "Entregado"
    marginTop: 20, // Más espacio arriba para destacarlo
    paddingVertical: 16, // Un poco más alto
    fontSize: 18, // Texto un poco más grande
  },
  endWorkdayButton: {
    backgroundColor: '#dc3545', // Rojo para "Terminar jornada"
    marginTop: 20,
  }
});

export default JornadaScreen;
