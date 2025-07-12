import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const DeliveryListScreen = ({ navigation }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchDeliveries();
  }, [user]);

  const fetchDeliveries = async () => {
    try {
      setError(null);
      const response = await api.get(`/drivers/${user.dni}/deliveries`);
      
      // Agrupar entregas por fecha
      const groupedDeliveries = groupByDate(response.data);
      setDeliveries(groupedDeliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setError('Error al cargar las entregas');
      Alert.alert('Error', 'No se pudieron cargar las entregas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeliveries();
  };

  const groupByDate = (deliveries) => {
    const grouped = {};
    deliveries.forEach(delivery => {
      const date = delivery.deliveryDate 
        ? format(parseISO(delivery.deliveryDate), 'PPPP', { locale: es })
        : 'Fecha no especificada';
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(delivery);
    });
    return grouped;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'in_transit': return '#2196f3';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'failed': return '#e91e63';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'in_transit': 'En tránsito',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'failed': 'Fallido'
    };
    return statusMap[status] || status;
  };

  const renderDeliveryItem = (delivery) => (
    <TouchableOpacity
      key={delivery.id}
      style={styles.deliveryItem}
      onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: delivery.id })}
    >
      <View style={styles.deliveryContent}>
        <View style={styles.deliveryHeader}>
          <Text style={styles.deliveryId}>#{delivery.id}</Text>
          <Text 
            style={[
              styles.deliveryStatus, 
              { color: getStatusColor(delivery.status) }
            ]}
          >
            {getStatusText(delivery.status)}
          </Text>
        </View>
        
        <Text style={styles.clientName}>
          {delivery.clientName || 'Cliente no especificado'}
        </Text>
        
        {delivery.address && (
          <Text style={styles.address} numberOfLines={2}>
            📍 {delivery.address}
          </Text>
        )}
        
        {delivery.deliveryTime && (
          <Text style={styles.deliveryTime}>
            🕐 {format(parseISO(delivery.deliveryTime), 'p', { locale: es })}
          </Text>
        )}
      </View>
      
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando entregas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDeliveries}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const deliveryEntries = Object.entries(deliveries);

  if (deliveryEntries.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>No tienes entregas asignadas</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDeliveries}>
          <Text style={styles.retryButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={deliveryEntries}
        keyExtractor={([date]) => date}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item: [date, dailyDeliveries] }) => (
          <View style={styles.dateSection}>
            <Text style={styles.dateHeader}>{date}</Text>
            <View style={styles.deliveriesContainer}>
              {dailyDeliveries.map(delivery => renderDeliveryItem(delivery))}
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textTransform: 'capitalize',
  },
  deliveriesContainer: {
    gap: 8,
  },
  deliveryItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deliveryContent: {
    flex: 1,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deliveryStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  arrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeliveryListScreen;