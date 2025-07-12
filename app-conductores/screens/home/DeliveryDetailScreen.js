import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DeliveryDetailScreen = ({ route }) => {
  const { pedido } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedido #{pedido.id}</Text>
      <Text style={styles.label}>Dirección:</Text>
      <Text style={styles.value}>{pedido.direccion}</Text>

      <Text style={styles.label}>Estado:</Text>
      <Text style={styles.value}>{pedido.estado}</Text>

      <Text style={styles.label}>Volumen:</Text>
      <Text style={styles.value}>{pedido.volumen} m³</Text>

      <Text style={styles.label}>Peso:</Text>
      <Text style={styles.value}>{pedido.peso} kg</Text>

      <Text style={styles.label}>Programado para:</Text>
      <Text style={styles.value}>{new Date(pedido.scheduled_at).toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
});

export default DeliveryDetailScreen;
