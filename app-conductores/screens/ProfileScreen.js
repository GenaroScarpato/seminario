// src/screens/Profile.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

const Profile = () => {
  

  const user = useSelector((state) => state.auth.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      <Text style={styles.subtitle}>Nombre: {user?.nombre}</Text>
      <Text style={styles.subtitle}>DNI: {user?.dni}</Text>
      
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 40,
  },
});
