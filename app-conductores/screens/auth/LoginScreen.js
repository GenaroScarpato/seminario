import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { login } from '../../slices/authSlice';
import { getItem } from '../../utils/storage';
import { BlurView } from 'expo-blur'; 

const LoginScreen = () => {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const userData = await getItem('user');
        if (userData?.token && userData.exp > Date.now() / 1000) {
          // redirigir si hay sesión activa
        }
      } catch (error) {
        console.warn('Error al revisar sesión:', error);
      }
    };
    checkActiveSession();
  }, []);

  useEffect(() => {
    if (user?.token) {
      // redirigir si login ok
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!dni || !password) {
      Alert.alert('Error', 'Por favor ingresa tu DNI y contraseña');
      return;
    }
    await dispatch(login({ dni, password }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
        <ImageBackground
  source={require('../../assets/images/trucks.png')}
  style={styles.background}
  blurRadius={2}
  resizeMode="cover" // <- Esto es importante
>

        <BlurView intensity={60} tint="light" style={styles.card}>
          <Text style={styles.title}>🚛 Bienvenido Chofer</Text>

          <TextInput
            style={styles.input}
            placeholder="DNI"
            keyboardType="numeric"
            value={dni}
            onChangeText={setDni}
            placeholderTextColor="#ccc"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#ccc"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          {isLoading ? (
            <ActivityIndicator size="large" color="#00D1A0" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
              <Text style={styles.loginText}>Ingresar</Text>
            </TouchableOpacity>
          )}
        </BlurView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 background: {
  flex: 1,
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  
},

  card: {
  width: '90%',         // ✅ Se adapta a pantalla
  maxWidth: 400,        // ✅ En web no se pasa de este ancho
  padding: 30,
  borderRadius: 20,
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.3,
  shadowRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
},


 title: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#f1f1f1',
  marginBottom: 30,
  textAlign: 'center',
  textShadowColor: 'rgba(0, 0, 0, 0.6)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
},
 input: {
  width: '100%',
  height: 55, // ✅ Más alto
  marginBottom: 18,
  borderRadius: 12,
  paddingHorizontal: 20, // ✅ Más espacio
  fontSize: 18, // ✅ Más grande para leer mejor
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  backgroundColor: 'rgba(0, 0, 0, 0.25)',
  color: '#fefefe',
},

  loginButton: {
    width: '100%',
    backgroundColor: '#00D1A0',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#00D1A0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default LoginScreen;
