// utils/storage.js
import { Platform } from 'react-native';

let SecureStore;

// Carga SecureStore solo si NO estamos en la web
if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store').default;
  } catch (error) {
    console.warn('SecureStore no disponible en esta plataforma');
  }
}

const isWeb = Platform.OS === 'web';

/**
 * Obtiene un valor del almacenamiento seguro o localStorage según la plataforma.
 * @param {string} key
 * @returns {Promise<string|null>}
 */
export const getItem = async (key) => {
  try {
    if (isWeb) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } else if (SecureStore) {
      const item = await SecureStore.getItemAsync(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  } catch (error) {
    console.warn(`Error obteniendo item ${key}:`, error);
    return null;
  }
};

/**
 * Guarda un valor en almacenamiento seguro o localStorage.
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void>}
 */
export const setItem = async (key, value) => {
  try {
    const stringValue = JSON.stringify(value);
    if (isWeb) {
      localStorage.setItem(key, stringValue);
    } else if (SecureStore) {
      await SecureStore.setItemAsync(key, stringValue);
    }
  } catch (error) {
    console.warn(`Error guardando item ${key}:`, error);
  }
};

/**
 * Elimina un valor del almacenamiento seguro o localStorage.
 * @param {string} key
 * @returns {Promise<void>}
 */
export const deleteItem = async (key) => {
  try {
    if (isWeb) {
      localStorage.removeItem(key);
    } else if (SecureStore) {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.warn(`Error eliminando item ${key}:`, error);
  }
};