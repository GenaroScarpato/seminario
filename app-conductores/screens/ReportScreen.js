import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,ScrollView,TextInput,TouchableOpacity,Alert,Platform,ActivityIndicator,Modal,KeyboardAvoidingView,Pressable,FlatList} from 'react-native';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux'; // Add this import
import api from '../services/api';

const ReportScreen = () => {
  // Get user from Redux store instead of local storage
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    tipo: '',
    mensaje: '',
    gravedad: 1,
    ubicacion: null
  });
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTipoModal, setShowTipoModal] = useState(false);

  const tiposReporte = [
    { label: '🚗 Problema con el vehículo', value: 'vehiculo' },
    { label: '🛣️ Problema de tráfico', value: 'trafico' },
    { label: '📦 Problema con pedido', value: 'pedido' },
    { label: '🚧 Obstáculo en la ruta', value: 'obstaculo' },
    { label: '⚠️ Accidente', value: 'accidente' },
    { label: '🔧 Problema técnico', value: 'tecnico' },
    { label: '📞 Problema de comunicación', value: 'comunicacion' },
    { label: '🏥 Emergencia', value: 'emergencia' },
    { label: '🔄 Otro', value: 'otro' }
  ];

  const nivelesGravedad = [
    { label: 'Baja (1)', value: 1, color: '#28a745' },
    { label: 'Media (2)', value: 2, color: '#ffc107' },
    { label: 'Alta (3)', value: 3, color: '#fd7e14' },
    { label: 'Crítica (4)', value: 4, color: '#dc3545' },
    { label: 'Emergencia (5)', value: 5, color: '#6f42c1' }
  ];

  useEffect(() => {
  
    
    // Check if user is not loaded yet
    if (!user && !authLoading) {
      Alert.alert(
        'Error de sesión',
        'No se pudo cargar la información del usuario. Por favor, inicia sesión nuevamente.',
        [{ text: 'OK' }]
      );
    }
  }, [user, authLoading]);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu ubicación para crear el reporte.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const { latitude, longitude } = location.coords;
      
      setFormData(prev => ({
        ...prev,
        ubicacion: {
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString()
        }
      }));

      Alert.alert(
        'Ubicación obtenida',
        `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Error de ubicación',
        'No se pudo obtener tu ubicación. Verifica que tengas GPS activado.',
        [{ text: 'OK' }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const validateForm = () => {
    if (!user?.id) {
      Alert.alert('Error', 'Usuario no válido. Por favor, inicia sesión nuevamente.');
      return false;
    }
    
    if (!formData.tipo) {
      Alert.alert('Error', 'Por favor selecciona un tipo de reporte');
      return false;
    }
    
    if (!formData.mensaje.trim()) {
      Alert.alert('Error', 'Por favor describe el problema');
      return false;
    }
    
    if (!formData.ubicacion) {
      Alert.alert('Error', 'Por favor obtén tu ubicación actual');
      return false;
    }
    
    return true;
  };

  const submitReport = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const reportData = {
        conductor_id: user.id, // Now this should have a valid ID
        tipo: formData.tipo,
        mensaje: formData.mensaje.trim(),
        latitud: formData.ubicacion?.lat,
        longitud: formData.ubicacion?.lng,
        gravedad: formData.gravedad
      };

     

      const response = await api.post('/reportes', reportData);

      if (response.data.mensaje) {
        setShowSuccessModal(true);
        setFormData({
          tipo: '',
          mensaje: '',
          gravedad: 1,
          ubicacion: null
        });
      } else {
        Alert.alert('Error', response.data.message || 'Error al enviar el reporte');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error al enviar el reporte. Verifica tu conexión.'
      );
    } finally {
      setLoading(false);
    }
  };

  const TipoReporteModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showTipoModal}
      onRequestClose={() => setShowTipoModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.tipoModalContent}>
          <Text style={styles.modalTitle}>Seleccionar Tipo de Reporte</Text>
          <FlatList
            data={tiposReporte}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.tipoItem}
                onPress={() => {
                  setFormData(prev => ({ ...prev, tipo: item.value }));
                  setShowTipoModal(false);
                }}
              >
                <Text style={styles.tipoItemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowTipoModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const SuccessModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showSuccessModal}
      onRequestClose={() => setShowSuccessModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>✅ Reporte Enviado</Text>
          <Text style={styles.modalMessage}>
            Tu reporte ha sido enviado exitosamente. Será revisado por nuestro equipo.
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setShowSuccessModal(false)}
          >
            <Text style={styles.modalButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={{ marginTop: 10, color: '#6c757d' }}>Cargando...</Text>
      </View>
    );
  }

  // Show error if no user
  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={styles.title}>⚠️ Error de Sesión</Text>
        <Text style={styles.subtitle}>
          No se pudo cargar la información del usuario. Por favor, inicia sesión nuevamente.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>📋 Nuevo Reporte</Text>
        <Text style={styles.subtitle}>
          Describe el problema que estás experimentando
        </Text>

        <View style={styles.form}>
          {/* Tipo de reporte */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Reporte *</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowTipoModal(true)}
            >
              <Text style={[styles.selectorButtonText, !formData.tipo && styles.placeholderText]}>
                {formData.tipo 
                  ? tiposReporte.find(t => t.value === formData.tipo)?.label 
                  : 'Seleccionar tipo de reporte'
                }
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción del Problema *</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Describe detalladamente el problema que estás experimentando..."
              placeholderTextColor="#999"
              value={formData.mensaje}
              onChangeText={(text) => setFormData(prev => ({ ...prev, mensaje: text }))}
            />
          </View>

          {/* Nivel de gravedad */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nivel de Gravedad *</Text>
            <View style={styles.gravedadContainer}>
              {nivelesGravedad.map(nivel => (
                <Pressable
                  key={nivel.value}
                  style={[
                    styles.gravedadButton,
                    { backgroundColor: nivel.color },
                    formData.gravedad === nivel.value && styles.gravedadButtonSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, gravedad: nivel.value }))}
                >
                  <Text style={styles.gravedadButtonText}>{nivel.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Ubicación */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ubicación Actual *</Text>
            <TouchableOpacity
              style={[styles.locationButton, formData.ubicacion && styles.locationButtonSuccess]}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.locationButtonText}>
                  {formData.ubicacion ? '📍 Ubicación Obtenida' : '📍 Obtener Ubicación'}
                </Text>
              )}
            </TouchableOpacity>
            {formData.ubicacion && (
              <Text style={styles.locationInfo}>
                Lat: {formData.ubicacion.lat.toFixed(6)}, Lng: {formData.ubicacion.lng.toFixed(6)}
              </Text>
            )}
          </View>

          {/* Botón de envío */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={submitReport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>📤 Enviar Reporte</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TipoReporteModal />
      <SuccessModal />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#e8f5e9',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  picker: {
    height: 50,
  },
  selectorButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  selectorArrow: {
    fontSize: 12,
    color: '#6c757d',
  },
  tipoModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  tipoItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tipoItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  modalCloseButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    textAlignVertical: 'top',
    minHeight: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gravedadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gravedadButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: '45%',
    alignItems: 'center',
  },
  gravedadButtonSelected: {
    transform: [{ scale: 1.05 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  gravedadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  locationButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  locationButtonSuccess: {
    backgroundColor: '#28a745',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportScreen;