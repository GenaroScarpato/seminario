// src/screens/Profile.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfile } from '../slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    dni: user?.dni || '',
    telefono: user?.telefono || '',
    email: user?.email || '',
    direccion: user?.direccion || '',
    url_licencia: user?.url_licencia || ''
  });

  // Update formData when user changes (after successful update)
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        dni: user.dni || '',
        telefono: user.telefono || '',
        email: user.email || '',
        direccion: user.direccion || '',
        url_licencia: user.url_licencia || ''
      });
    }
  }, [user]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: () => dispatch(logout()) }
      ]
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      Alert.alert('Error', 'El nombre y apellido son obligatorios');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'El email es obligatorio');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    try {
      
      const result = await dispatch(updateProfile(formData));
      
      if (updateProfile.fulfilled.match(result)) {
        setIsEditing(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        // Handle the error case
        console.error('Update profile failed:', result.payload);
        Alert.alert('Error', result.payload || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Error al actualizar el perfil');
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      dni: user?.dni || '',
      telefono: user?.telefono || '',
      email: user?.email || '',
      direccion: user?.direccion || '',
      url_licencia: user?.url_licencia || ''
    });
    setIsEditing(false);
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user.nombre?.charAt(0)?.toUpperCase()}{user.apellido?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Content Card */}
      <View style={styles.card}>
        {isEditing ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => handleChange('nombre', text)}
                placeholder="Ingresa tu nombre"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido *</Text>
              <TextInput
                style={styles.input}
                value={formData.apellido}
                onChangeText={(text) => handleChange('apellido', text)}
                placeholder="Ingresa tu apellido"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DNI</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.dni}
                editable={false}
                placeholder="DNI"
                placeholderTextColor="#999"
              />
              <Text style={styles.helperText}>El DNI no puede ser modificado</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={formData.telefono}
                onChangeText={(text) => handleChange('telefono', text)}
                keyboardType="phone-pad"
                placeholder="Número de teléfono"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#999"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={styles.input}
                value={formData.direccion}
                onChangeText={(text) => handleChange('direccion', text)}
                placeholder="Tu dirección"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>💾 Guardar Cambios</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.secondaryButton, isLoading && styles.buttonDisabled]} 
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>❌ Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nombre Completo</Text>
                <Text style={styles.infoValue}>{user?.nombre} {user?.apellido}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>DNI</Text>
                <Text style={styles.infoValue}>{user?.dni}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{user?.telefono || 'No especificado'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>{user?.direccion || 'No especificada'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Estado</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusDot, 
                    { backgroundColor: user?.estado === 'activo' ? '#4CAF50' : '#FF9800' }
                  ]} />
                  <Text style={styles.infoValue}>{user?.estado}</Text>
                </View>
              </View>

              {user?.vehiculo_id && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Vehículo ID</Text>
                  <Text style={styles.infoValue}>{user?.vehiculo_id}</Text>
                </View>
              )}

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Registrado desde</Text>
                <Text style={styles.infoValue}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No disponible'}
                </Text>
              </View>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleEdit}>
                <Text style={styles.primaryButtonText}>✏️ Editar Perfil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
                <Text style={styles.dangerButtonText}>🚪 Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 30,
  },
  // Estilos para modo edición
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8F5E9',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Estilos para modo visualización
  infoSection: {
    marginBottom: 30,
  },
  infoItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  // Estilos para botones
  buttonGroup: {
    gap: 16,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderWidth: 2.5,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  dangerButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 20,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});