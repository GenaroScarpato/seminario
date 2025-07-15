import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { View, StyleSheet } from 'react-native';

const MapaScreen = ({ route }) => {
  const pedidos = route.params?.pedidos || [];
  const [region, setRegion] = useState(null);

  useEffect(() => {
    (async () => {
      const { coords } = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  if (!region) return null;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {pedidos.map(p => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            title={`Pedido ${p.id}`}
            pinColor={p.estado === 'entregado' ? 'green' : 'orange'}
          />
        ))}
      </MapView>
    </View>
  );
};

export default MapaScreen;
