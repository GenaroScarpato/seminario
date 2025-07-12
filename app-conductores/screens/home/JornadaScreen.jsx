import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
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
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, []);

  useEffect(() => {
    const startSocket = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación');
        return;
      }
      const s = io('http://192.168.0.231:3000', { transports: ['websocket'] });
      setSocket(s);
      setActivo(true);

      const intervalId = setInterval(async () => {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        s.emit('ubicacion', {
          lat: latitude,
          lng: longitude,
          dni: pedidos[0]?.dni || 'sin-dni', // ajusta si pasás dni en params
          timestamp: new Date().toISOString(),
        });
      }, 5000);

      return () => {
        clearInterval(intervalId);
        s.disconnect();
      };
    };

    startSocket();

  }, []);

  const pedidoActual = pedidos[pedidoIndex];

  const marcarEnCamino = async () => {
    try {
      await api.put(`/pedidos/${pedidoActual.id}/estado`, { estado: 'en camino' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido.');
      return;
    }
  };

  const abrirNavegacion = (app) => {
    if (!pedidoActual) return;
    const direccionEncoded = encodeURIComponent(pedidoActual.direccion);
    let url = '';
    if (app === 'waze') url = `https://waze.com/ul?q=${direccionEncoded}`;
    else url = `https://www.google.com/maps/dir/?api=1&destination=${direccionEncoded}`;

    marcarEnCamino();
    Linking.openURL(url);
  };

  const siguientePedido = () => {
    if (pedidoIndex + 1 >= pedidos.length) {
      Alert.alert('Fin de jornada', 'Terminaste todos los pedidos.');
      socket?.disconnect();
      navigation.goBack();
      return;
    }
    setPedidoIndex(pedidoIndex + 1);
  };

  const terminarJornada = () => {
    Alert.alert('Confirmar', '¿Seguro que querés terminar la jornada?', [
      { text: 'Cancelar' },
      {
        text: 'Sí, terminar',
        onPress: () => {
          socket?.disconnect();
          navigation.goBack();
        },
      },
    ]);
  };

  if (!pedidoActual) {
    return (
      <View style={styles.container}>
        <Text>No hay pedidos para esta jornada.</Text>
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

      <TouchableOpacity style={styles.button} onPress={siguientePedido}>
        <Text style={styles.buttonText}>Siguiente pedido</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={terminarJornada}>
        <Text style={styles.buttonText}>Terminar jornada</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  text: { fontSize: 18, marginBottom: 12, textAlign: 'center' },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default JornadaScreen;
