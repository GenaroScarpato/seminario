// al inicio
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { clearSession } from '../../slices/authSlice';
import { Linking } from 'react-native';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';
import { fetchPedidos } from '../../slices/ordersSlice';
import Constants from 'expo-constants';

const { API_URL } = Constants.expoConfig.extra;
const abrirWaze = (direccion) => {
  const direccionEncoded = encodeURIComponent(direccion);
  const url = `https://waze.com/ul?q=${direccionEncoded}`;
  Linking.openURL(url);
};

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  const [activo, setActivo] = useState(false);
  const [socket, setSocket] = useState(null);
  const { pedidos, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    const checkTokenAndFetch = async () => {
      if (!user?.token || (user?.exp && user.exp < Date.now() / 1000)) {
        await dispatch(clearSession());
        return;
      }

      dispatch(fetchPedidos());
    };

    checkTokenAndFetch();
  }, [user?.token, user?.exp, dispatch]);

  const iniciarJornada = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación');
    }

    const s = io(`${API_URL}`, { transports: ['websocket'] });
    setSocket(s);
    setActivo(true);

    const intervalId = setInterval(async () => {
      const location = await Location.getCurrentPositionAsync({});
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

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'pendiente':
        return { color: '#FF9800', backgroundColor: '#FFF3E0' };
      case 'en_camino':
        return { color: '#2196F3', backgroundColor: '#E3F2FD' };
      case 'entregado':
        return { color: '#4CAF50', backgroundColor: '#E8F5E9' };
      case 'cancelado':
        return { color: '#F44336', backgroundColor: '#FFEBEE' };
      default:
        return { color: '#607D8B', backgroundColor: '#F5F5F5' };
    }
  };

  const renderPedido = ({ item }) => {
    const estadoStyle = getEstadoStyle(item.estado);
    
    return (
      <TouchableOpacity 
        style={styles.pedidoCard}
        onPress={() => navigation.navigate('DeliveryDetail', { pedido: item })}
        activeOpacity={0.7}
      >
        <View style={styles.pedidoHeader}>
          <View style={styles.pedidoIconContainer}>
            <Text style={styles.pedidoIcon}>📦</Text>
          </View>
          <View style={styles.pedidoMainInfo}>
            <Text style={styles.pedidoDireccion} numberOfLines={2}>
              {item.direccion}
            </Text>
            <View style={styles.pedidoDetailsRow}>
              <View style={styles.pedidoDetail}>
                <Text style={styles.pedidoDetailLabel}>Vol:</Text>
                <Text style={styles.pedidoDetailValue}>{item.volumen}</Text>
              </View>
              <View style={styles.pedidoDetail}>
                <Text style={styles.pedidoDetailLabel}>Peso:</Text>
                <Text style={styles.pedidoDetailValue}>{item.peso}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={[styles.estadoBadge, { backgroundColor: estadoStyle.backgroundColor }]}>
          <Text style={[styles.estadoText, { color: estadoStyle.color }]}>
            {item.estado.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user?.token) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Redirigiendo al login...</Text>
        </View>
      </View>
    );
  }

  const entregados = pedidos.filter(p => p.estado === 'entregado');
  const pendientes = pedidos.filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado');

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>¡Hola!</Text>
          <Text style={styles.userName}>{user?.nombre || 'Conductor'}</Text>
        </View>
        <View style={styles.dniContainer}>
          <Text style={styles.dniLabel}>ID:</Text>
          <Text style={styles.dniValue}>{user?.dni}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>✅</Text>
          </View>
          <View>
            <Text style={styles.statNumber}>{entregados.length}</Text>
            <Text style={styles.statLabel}>Entregados</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>🕓</Text>
          </View>
          <View>
            <Text style={styles.statNumber}>{pendientes.length}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>
      </View>

      {/* Orders Section */}
      <View style={styles.ordersSection}>
        <View style={styles.ordersSectionHeader}>
          <Text style={styles.ordersSectionTitle}>📦 Pedidos Asignados</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{pedidos.length}</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingMessage}>Cargando pedidos...</Text>
          </View>
        ) : pedidos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Sin pedidos</Text>
            <Text style={styles.emptyMessage}>No tienes pedidos asignados actualmente</Text>
          </View>
        ) : (
          <FlatList
            data={pedidos}
            renderItem={renderPedido}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* Action Button */}
      {!activo ? (
        <TouchableOpacity
          style={styles.primaryButton}
onPress={() => navigation.navigate('JornadaScreen', { pedidos, user })}

          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonIcon}>🚀</Text>
          <Text style={styles.primaryButtonText}>Iniciar Jornada</Text>
        </TouchableOpacity>
      ) : pedidos.length > 0 ? (
        <TouchableOpacity 
          style={styles.navigationButton} 
          onPress={() => abrirWaze(pedidos[0].direccion)}
          activeOpacity={0.8}
        >
          <Text style={styles.navigationButtonIcon}>📍</Text>
          <Text style={styles.navigationButtonText}>Ir al Primer Destino</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
    paddingTop: 50,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Header Styles
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#66BB6A',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B5E20',
    marginTop: 2,
  },
  dniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dniLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 4,
  },
  dniValue: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '700',
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
    lineHeight: 32,
  },
  statLabel: {
    fontSize: 12,
    color: '#66BB6A',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Orders Section
  ordersSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  ordersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F8E9',
  },
  ordersSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
  },
  totalBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 32,
    alignItems: 'center',
  },
  totalBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Pedido Cards
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  pedidoCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pedidoHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pedidoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pedidoIcon: {
    fontSize: 20,
  },
  pedidoMainInfo: {
    flex: 1,
  },
  pedidoDireccion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    lineHeight: 22,
    marginBottom: 8,
  },
  pedidoDetailsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  pedidoDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pedidoDetailLabel: {
    fontSize: 12,
    color: '#66BB6A',
    fontWeight: '600',
    marginRight: 4,
  },
  pedidoDetailValue: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '700',
  },
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Loading States
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingMessage: {
    marginLeft: 12,
    fontSize: 16,
    color: '#66BB6A',
    fontWeight: '600',
  },

  // Error State
  errorContainer: {
    alignItems: 'center',
    padding: 32,
    margin: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#66BB6A',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Action Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  navigationButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default HomeScreen;