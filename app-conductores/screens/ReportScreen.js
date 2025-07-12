// src/screens/Report.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Report = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Reportes</Text>
    </View>
  );
};

export default Report;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
