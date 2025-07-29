import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { Linking } from 'react-native';
import { fetchPedidos } from '../../slices/ordersSlice';
import Constants from 'expo-constants';

const { API_URL } = Constants.expoConfig.extra;
const JornadaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const pedidos = route.params?.pedidos || [];
  const [pedidoIndex, setPedidoIndex] = useState(0);
  const [socket, setSocket] = useState(null);
  const [activo, setActivo] = useState(false);
  const locationSubscription = useRef(null);
  const dispatch = useDispatch();
  const user = route.params?.user;

  // Bloquear salida si no terminó la jornada
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "⚠️ Atención",
        "Debes terminar la jornada para salir.",
        [{ text: "Aceptar", onPress: () => {} }],
        { cancelable: false }
      );
      return true;
    };

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
        Alert.alert('❌ Permiso denegado', 'Necesitamos acceso a tu ubicación para el seguimiento.');
        return;
      }

      const s = io(`${API_URL}`, { transports: ['websocket'] });
      setSocket(s);
      setActivo(true);

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 120000,
          distanceInterval: 50,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          s.emit('ubicacion', {
            lat: latitude,
            lng: longitude,
            dni: user?.dni || 'conductor-desconocido', 
            timestamp: new Date().toISOString(),
          });
        }
      );
    };

    startSocketAndLocationTracking();

    return () => {
      if (locationSubscription.current) {
        if (Platform.OS !== 'web') {
          locationSubscription.current.remove();
        }
        locationSubscription.current = null;
      }

      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  const pedidoActual = pedidos[pedidoIndex];

  const marcarEnCamino = async () => {
    try {
      await api.put(`/pedidos/${pedidoActual.id}/estado`, { estado: 'en_camino' });
      dispatch(fetchPedidos());
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo actualizar el estado del pedido a "en camino".');
      console.error('Error al marcar en camino:', error);
    }
  };

  const marcarComoEntregado = async () => {
    try {
      await api.put(`/pedidos/${pedidoActual.id}/estado`, { estado: 'entregado' });
      dispatch(fetchPedidos());

      if (Platform.OS === 'web') {
        alert('✅ Pedido entregado con éxito');
        siguientePedido();
      } else {
        Alert.alert('✅ Éxito', 'Pedido marcado como entregado.', [
          { text: 'OK', onPress: siguientePedido }
        ]);
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo actualizar el estado del pedido a "entregado".');
      console.error('Error al marcar como entregado:', error);
    }
  };

  // NUEVA FUNCIÓN: Marcar como cancelado
  const marcarComoCancelado = () => {
    const opciones = [
      'Cliente no estaba en casa',
      'Cliente no respondió',
      'Dirección incorrecta',
      'Cliente rechazó el pedido',
      'Problemas de acceso',
      'Otro motivo'
    ];

    if (Platform.OS === 'web') {
      const motivo = prompt('Selecciona el motivo de cancelación:\n' + 
        opciones.map((opt, i) => `${i + 1}. ${opt}`).join('\n') + 
        '\n\nIngresa el número (1-6):');
      
      if (motivo && motivo >= 1 && motivo <= 6) {
        confirmarCancelacion(opciones[motivo - 1]);
      }
    } else {
      Alert.alert(
        '⚠️ Motivo de cancelación',
        'Selecciona el motivo por el cual no se pudo entregar:',
        [
          ...opciones.map(motivo => ({
            text: motivo,
            onPress: () => confirmarCancelacion(motivo)
          })),
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  };

  const confirmarCancelacion = async (motivo) => {
    try {
      await api.put(`/pedidos/${pedidoActual.id}/estado`, { 
        estado: 'cancelado',
        motivo_cancelacion: motivo
      });
      dispatch(fetchPedidos());

      if (Platform.OS === 'web') {
        alert(`❌ Pedido cancelado: ${motivo}`);
        siguientePedido();
      } else {
        Alert.alert('❌ Pedido Cancelado', `Motivo: ${motivo}`, [
          { text: 'OK', onPress: siguientePedido }
        ]);
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo cancelar el pedido.');
      console.error('Error al cancelar pedido:', error);
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
      Alert.alert('🎉 Fin de jornada', 'Has terminado todos los pedidos.');
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
    const quedanPendientes = pedidos.some(p => !['entregado', 'cancelado'].includes(p.estado));

    if (quedanPendientes) {
      if(Platform.OS === 'web') {
        alert('⚠️ Aún tienes pedidos sin entregar o cancelar. Completa todos antes de terminar la jornada.');
      } else {
        Alert.alert('⚠️ Atención', 'Aún tienes pedidos sin entregar o cancelar. Completa todos antes de terminar la jornada.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirmar = confirm('🛑 ¿Seguro que quieres terminar la jornada?');
      if (confirmar) {
        socket?.disconnect();
        if (locationSubscription.current) {
          locationSubscription.current.remove(); 
          locationSubscription.current = null;
        }
        navigation.goBack();
      }
    } else {
      Alert.alert('🛑 Confirmar', '¿Seguro que quieres terminar la jornada?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, terminar',
          style: 'destructive',
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

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return '#FFB800';
      case 'en_camino': return '#000000';
      case 'entregado': return '#00C851';
      case 'cancelado': return '#FF4444';
      default: return '#6B7280';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_camino': return 'En camino';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  if (!pedidoActual) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundPattern} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Sin pedidos</Text>
          <Text style={styles.emptyText}>No hay pedidos para esta jornada</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Pedido {pedidoIndex + 1} de {pedidos.length}</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${((pedidoIndex + 1) / pedidos.length) * 100}%` }]} 
              />
            </View>
          </View>
        </View>

        {/* Order Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderNumber}>#{pedidoActual.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(pedidoActual.estado) }]}>
                <Text style={styles.statusText}>{getEstadoText(pedidoActual.estado)}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>Dirección</Text>
            <Text style={styles.addressText}>{pedidoActual.direccion}</Text>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionLabel}>Navegación</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.wazeButton]} 
              onPress={() => abrirNavegacion('waze')}
            >
              <Text style={styles.buttonEmoji}>🟣</Text>
              <Text style={styles.buttonLabel}>Waze</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.mapsButton]} 
              onPress={() => abrirNavegacion('maps')}
            >
              <Text style={styles.buttonEmoji}>🗺️</Text>
              <Text style={styles.buttonLabel}>Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Update Buttons */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionLabel}>Estado del pedido</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deliveredButton]} 
              onPress={marcarComoEntregado}
            >
              <Text style={styles.buttonEmoji}>✅</Text>
              <Text style={styles.buttonLabel}>Entregado</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.problemButton]} 
              onPress={marcarComoCancelado}
            >
              <Text style={styles.buttonEmoji}>⚠️</Text>
              <Text style={styles.buttonLabel}>Problema</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* End Journey */}
        <View style={styles.endSection}>
          <TouchableOpacity 
            style={styles.endButton} 
            onPress={terminarJornada}
          >
            <Text style={styles.endButtonText}>🏁 Terminar jornada</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
    background: `
      linear-gradient(135deg, #E2E8F0 0%, #F1F5F9 25%, #FFFFFF 50%, #F1F5F9 75%, #E2E8F0 100%)
    `,
    backgroundSize: '400px 400px',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  
  // Progress Section
  progressHeader: {
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },

  // Order Card
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    marginBottom: 20,
  },
  orderIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addressSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },

  // Action Sections
  actionSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  buttonLabel: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },
  wazeButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#C7D2FE',
  },
  mapsButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  deliveredButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  problemButton: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FED7AA',
  },

  // End Section
  endSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  endButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  endButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default JornadaScreen;