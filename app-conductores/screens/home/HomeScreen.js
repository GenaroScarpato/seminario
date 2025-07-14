// al inicio
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { clearSession } from '../../slices/authSlice';
import { Linking } from 'react-native';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';

const abrirWaze = (direccion) => {
  const direccionEncoded = encodeURIComponent(direccion);
  const url = `https://waze.com/ul?q=${direccionEncoded}`;
  Linking.openURL(url);
};

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activo, setActivo] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const checkTokenAndFetch = async () => {
      setLoading(true);
      try {
        if (!user?.token || (user?.exp && user.exp < Date.now() / 1000)) {
          await dispatch(clearSession());
          return;
        }
        const res = await api.get('/rutasAsignadas');
        setPedidos(res.data || []);
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          await dispatch(clearSession());
        } else {
          setError(err.message || 'Error al cargar pedidos');
          setPedidos([]);
        }
      } finally {
        setLoading(false);
      }
    };

    checkTokenAndFetch();
  }, [user?.token, user?.exp, dispatch]);

  const iniciarJornada = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación');
    }

    const s = io('http://192.168.0.231:3000', { transports: ['websocket'] });
    setSocket(s);
    setActivo(true);

    const intervalId = setInterval(async () => {
      const location = await Location.getCurrentPositionAsync({});
      console.log('📍 Ubicación recibida:', location);
      const { latitude, longitude } = location.coords;

      s.emit('ubicacion', {
        lat: latitude,
        lng: longitude,
        dni: user.dni,
        timestamp: new Date().toISOString(),
      });
    }, 5000);

    return () => {
      clearInterval(intervalId);
      s.disconnect();
    };
  };

  const renderPedido = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('DeliveryDetail', { pedido: item })}>
      <View style={styles.pedidoItem}>
        <Text style={styles.pedidoDireccion}>{item.direccion}</Text>
        <Text style={styles.pedidoInfo}>Volumen: {item.volumen} | Peso: {item.peso}</Text>
        <Text style={styles.pedidoEstado}>Estado: {item.estado}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!user?.token) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Redirigiendo al login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hola, {user?.nombre || 'Conductor'}</Text>
        <Text style={styles.subtitle}>DNI: {user?.dni}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Pedidos asignados</Text>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.cardCount}>{pedidos.length}</Text>
            {pedidos.length === 0 ? (
              <Text style={styles.cardMessage}>No tienes pedidos asignados actualmente</Text>
            ) : (
              <FlatList
                data={pedidos}
                renderItem={renderPedido}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </>
        )}
      </View>

      {!activo ? (
           <TouchableOpacity
      style={styles.botonIniciar}
      onPress={() => navigation.navigate('JornadaScreen', { pedidos })}
    >
      <Text style={styles.botonTexto}>🚀 Iniciar jornada</Text>
    </TouchableOpacity>
      ) : pedidos.length > 0 ? (
        <TouchableOpacity style={styles.botonIniciar} onPress={() => abrirWaze(pedidos[0].direccion)}>
          <Text style={styles.botonTexto}>📍 Ir al primer destino</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f9f9f9' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 18, textAlign: 'center', color: '#666' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 20,
    flex: 1,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#444' },
  cardCount: { fontSize: 40, fontWeight: 'bold', color: '#007AFF', marginVertical: 8, textAlign: 'center' },
  cardMessage: { marginTop: 12, fontSize: 14, color: '#999', textAlign: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  errorBox: { backgroundColor: '#ffebee', padding: 12, borderRadius: 8, marginVertical: 12 },
  errorText: { color: '#d32f2f', textAlign: 'center', fontSize: 14 },
  pedidoItem: { backgroundColor: '#f2f2f2', padding: 12, borderRadius: 10, marginBottom: 10 },
  pedidoDireccion: { fontWeight: 'bold', marginBottom: 4, color: '#333' },
  pedidoInfo: { color: '#555' },
  pedidoEstado: { color: '#007AFF', marginTop: 4, fontWeight: '600' },
  botonIniciar: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    marginVertical: 16,
    alignItems: 'center',
  },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default HomeScreen;
