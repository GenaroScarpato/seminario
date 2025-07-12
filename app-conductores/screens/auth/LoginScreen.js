import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { login } from '../../slices/authSlice';
import { getItem } from '../../utils/storage';

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
          
        } else if (userData?.token) {
         
        } else {
          
        }
      } catch (error) {
        console.warn('Error checking active session:', error);
      }
    };
    checkActiveSession();
  }, []);

  // Navegación automática cuando el usuario se autentica
  useEffect(() => {
    if (user?.token) {
      
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!dni || !password) {
      Alert.alert('Error', 'Por favor ingresa tu DNI y contraseña');
      return;
    }
    
  
    
    const result = await dispatch(login({ dni, password }));
    
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View accessibilityRole="form" style={styles.formContainer}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>DNI</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu DNI"
            keyboardType="numeric"
            value={dni}
            onChangeText={setDni}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            importantForAutofill="yes"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoComplete="password"
            importantForAutofill="yes"
            textContentType="password"
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <View style={styles.buttonContainer}>
            <Button
              title="Ingresar"
              onPress={handleSubmit}
              color="#007AFF"
              disabled={isLoading}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
});

export default LoginScreen;