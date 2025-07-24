import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

const DeliveryDetailScreen = ({ route }) => {
  const { pedido } = route.params;

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return '#ffc107';
      case 'en_camino': return '#17a2b8';
      case 'entregado': return '#28a745';
      case 'cancelado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return '⏳';
      case 'en_camino': return '🚚';
      case 'entregado': return '✅';
      case 'cancelado': return '❌';
      default: return '📦';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCoordinates = (lat, lng) => {
    if (!lat || !lng) return 'No disponible';
    return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
  };

  const openMaps = () => {
    if (pedido.lat && pedido.lng) {
      const url = `https://www.google.com/maps?q=${pedido.lat},${pedido.lng}`;
      Linking.openURL(url);
    } else if (pedido.direccion) {
      const encodedAddress = encodeURIComponent(pedido.direccion);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(url);
    }
  };

  const callClient = () => {
    if (pedido.cliente_telefono) {
      Linking.openURL(`tel:${pedido.cliente_telefono}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(pedido.estado) }]}>
            <Text style={styles.estadoText}>
              {getEstadoIcon(pedido.estado)} {pedido.estado || 'Sin estado'}
            </Text>
          </View>
        </View>
      </View>

      {/* Cliente Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>👤 Información del Cliente</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{pedido.cliente_nombre || 'No especificado'}</Text>
        </View>
        {pedido.cliente_telefono && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Teléfono:</Text>
            <TouchableOpacity onPress={callClient} style={styles.phoneContainer}>
              <Text style={styles.phoneText}>📞 {pedido.cliente_telefono}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Dirección y Ubicación */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📍 Ubicación</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Dirección:</Text>
          <Text style={styles.value}>{pedido.direccion || 'No especificada'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Coordenadas:</Text>
          <Text style={styles.value}>{formatCoordinates(pedido.lat, pedido.lng)}</Text>
        </View>
        {(pedido.lat && pedido.lng) || pedido.direccion ? (
          <TouchableOpacity style={styles.mapsButton} onPress={openMaps}>
            <Text style={styles.mapsButtonText}>🗺️ Abrir en Maps</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Detalles del Pedido */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📦 Detalles del Pedido</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>⚖️</Text>
            <Text style={styles.detailLabel}>Peso</Text>
            <Text style={styles.detailValue}>{pedido.peso || '0'} kg</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📐</Text>
            <Text style={styles.detailLabel}>Volumen</Text>
            <Text style={styles.detailValue}>{pedido.volumen || '0'} m³</Text>
          </View>
        </View>
      </View>

      {/* Fechas */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📅 Información de Fechas</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Programado para:</Text>
          <Text style={styles.value}>{formatDate(pedido.scheduled_at)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Creado:</Text>
          <Text style={styles.value}>{formatDate(pedido.created_at)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Última actualización:</Text>
          <Text style={styles.value}>{formatDate(pedido.updated_at)}</Text>
        </View>
      </View>

      {/* Timeline Visual */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>⏱️ Cronología</Text>
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelinePoint, { backgroundColor: '#28a745' }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Pedido Creado</Text>
              <Text style={styles.timelineDate}>{formatDate(pedido.created_at)}</Text>
            </View>
          </View>
          
          {pedido.scheduled_at && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelinePoint, { backgroundColor: '#ffc107' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Programado para</Text>
                <Text style={styles.timelineDate}>{formatDate(pedido.scheduled_at)}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelinePoint, { backgroundColor: getEstadoColor(pedido.estado) }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Estado Actual</Text>
              <Text style={styles.timelineDate}>
                {getEstadoIcon(pedido.estado)} {pedido.estado || 'Sin estado'}
              </Text>
              <Text style={styles.timelineSubtitle}>{formatDate(pedido.updated_at)}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pedidoId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  estadoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
    width: 120,
    marginRight: 8,
  },
  value: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
    lineHeight: 22,
  },
  phoneContainer: {
    flex: 1,
  },
  phoneText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  mapsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  mapsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: '#212529',
    fontWeight: 'bold',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    position: 'relative',
  },
  timelinePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 15,
    color: '#212529',
    marginBottom: 2,
  },
  timelineSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});

export default DeliveryDetailScreen;