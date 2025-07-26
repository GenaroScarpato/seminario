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
      case 'pendiente': return '#ffc107';
      case 'en_camino': return '#17a2b8';
      case 'entregado': return '#28a745';
      case 'cancelado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'pendiente': return '⏳ Pendiente';
      case 'en_camino': return '🚚 En camino';
      case 'entregado': return '✅ Entregado';
      case 'cancelado': return '❌ Cancelado';
      default: return estado;
    }
  };

  if (!pedidoActual) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No hay pedidos</Text>
          <Text style={styles.emptyText}>No hay pedidos para esta jornada.</Text>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>🔙 Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      {/* Header con progreso */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Pedido {pedidoIndex + 1} de {pedidos.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((pedidoIndex + 1) / pedidos.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Card del pedido */}
      <View style={styles.pedidoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.pedidoId}>Pedido #{pedidoActual.id}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(pedidoActual.estado) }]}>
            <Text style={styles.estadoText}>{getEstadoText(pedidoActual.estado)}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.direccionContainer}>
            <Text style={styles.direccionLabel}>📍 Dirección:</Text>
            <Text style={styles.direccionText}>{pedidoActual.direccion}</Text>
          </View>
        </View>
      </View>

      {/* Botones de navegación */}
      <View style={styles.navigationSection}>
        <Text style={styles.sectionTitle}>🗺️ Navegación</Text>
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.wazeButton]} 
            onPress={() => abrirNavegacion('waze')}
          >
            <Text style={styles.buttonText}>🟣 Waze</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.mapsButton]} 
            onPress={() => abrirNavegacion('maps')}
          >
            <Text style={styles.buttonText}>📱 Google Maps</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>🎯 Acciones del Pedido</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.deliveredButton]} 
          onPress={marcarComoEntregado}
        >
          <Text style={styles.buttonText}>✅ Marcar como Entregado</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={marcarComoCancelado}
        >
          <Text style={styles.buttonText}>❌ No se pudo entregar</Text>
        </TouchableOpacity>
      </View>

      {/* Botón terminar jornada */}
      <View style={styles.endSection}>
        <TouchableOpacity 
          style={[styles.button, styles.endWorkdayButton]} 
          onPress={terminarJornada}
        >
          <Text style={styles.buttonText}>🛑 Terminar Jornada</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  pedidoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pedidoId: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  direccionContainer: {
    marginBottom: 8,
  },
  direccionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  direccionText: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 22,
  },
  navigationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionsSection: {
    marginBottom: 24,
  },
  endSection: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 20,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  wazeButton: {
    backgroundColor: '#33ccff',
    flex: 1,
  },
  mapsButton: {
    backgroundColor: '#4285f4',
    flex: 1,
  },
  deliveredButton: {
    backgroundColor: '#28a745',
    paddingVertical: 18,
  },
  cancelButton: {
    backgroundColor: '#fd7e14',
    paddingVertical: 18,
  },
  endWorkdayButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});

export default JornadaScreen;