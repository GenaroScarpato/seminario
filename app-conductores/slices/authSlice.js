// slices/authSlice.js
// Define el "slice" de Redux para la autenticación, incluyendo el estado,
// las acciones asíncronas (thunks) y los reducers.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'; // Importa createSlice y createAsyncThunk
import api from '../services/api'; // Importa la instancia de Axios configurada
import { getItem, setItem, deleteItem } from '../utils/storage'; // Importa las funciones de almacenamiento
import { jwtDecode } from 'jwt-decode';

// Estado inicial de la autenticación
const initialState = {
  user: null, // Almacena la información del usuario logueado
  isLoading: true, // Indica si se está realizando alguna operación de autenticación (ej. login, verificación)
  error: null, // Almacena cualquier mensaje de error
};

export const checkLoginStatus = createAsyncThunk(
  'auth/checkLoginStatus',
  async (_, thunkAPI) => {
    try {
      const userData = await getItem('user');
      
      if (!userData) {
        return null; // Resuelve con null si no hay usuario
      }
      
      // userData ya viene parseado desde getItem(), no necesitamos JSON.parse()
      const user = userData;
      
      // Verifica si el token ha expirado
      if (user?.exp && user.exp < Date.now() / 1000) {
      
        await deleteItem('user');
        return null;
      }
      // Devuelve el usuario solo si tiene token
      return user?.token ? user : null;
    } catch (error) {
      console.error('Error en checkLoginStatus:', error);
      await deleteItem('user');
      return null; // Importante: siempre resuelve, no rechaces
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ dni, password }, thunkAPI) => {
    try {
      const response = await api.post('/auth/login', { dni, password });
      
      const userRaw = response.data.user || response.data.driver;

     if (!response.data.token || !userRaw) {
  return thunkAPI.rejectWithValue('Respuesta del servidor inválida');
}

      // Combinar token con datos del usuario
      const userData = {
         ...userRaw,
        token: response.data.token,
        iat: jwtDecode(response.data.token).iat,
        exp: jwtDecode(response.data.token).exp
      };

      // Guardar en AsyncStorage
      await setItem('user', userData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.msg || 
        error.message || 
        'Error en el login'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await deleteItem('user');
  await deleteItem('token'); // Si lo guardaste por separado
});

/**
 * Thunk para limpiar la sesión (usado por interceptor).
 * Elimina los datos del usuario del almacenamiento seguro.
 */
export const clearSession = createAsyncThunk(
  'auth/clearSession',
  async (_, { dispatch }) => {
    await deleteItem('user');
    await deleteItem('token'); // Si lo guardaste por separado
    return null; // Retorna null para limpiar el estado
  }
);
// Add this with your other thunks in authSlice.js
// Add this with your other thunks in authSlice.js
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const user = state.auth.user;
      
      if (!user?.token || !user?.id) {
        return thunkAPI.rejectWithValue('No autenticado o ID de usuario no válido');
      }

      console.log('Updating user ID:', user.id);
      console.log('Profile data:', profileData);

      // Use the user ID in the URL path instead of 'actualizar'
      const response = await api.put(`/conductores/${user.id}`, profileData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      console.log('Update response:', response.data);

      // Update the stored user data with the response
      const updatedUser = {
        ...user,
        ...response.data,
        token: user.token, // Preserve the original token
        iat: user.iat,     // Preserve JWT timestamp
        exp: user.exp      // Preserve JWT expiration
      };

      await setItem('user', updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Error al actualizar perfil'
      );
    }
  }
);
// --- SLICE ---
// Crea el slice de Redux para la autenticación.
const authSlice = createSlice({
  name: 'auth', // Nombre del slice
  initialState, // Estado inicial definido arriba
  reducers: {
    // Los "reducers" aquí son para acciones síncronas.
  },
  // "extraReducers" maneja las acciones generadas por createAsyncThunk.
  extraReducers: (builder) => {
    builder
      // --- checkLoginStatus ---
      .addCase(checkLoginStatus.pending, (state) => {
        // Cuando checkLoginStatus está pendiente, se establece isLoading a true
        state.isLoading = true;
      })
      .addCase(checkLoginStatus.fulfilled, (state, action) => {
        // Cuando checkLoginStatus es exitoso, se guarda el usuario y se pone isLoading a false
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(checkLoginStatus.rejected, (state) => {
        // Cuando checkLoginStatus falla, se limpia el usuario y se pone isLoading a false
        state.user = null;
        state.isLoading = false;
      })

      // --- login ---
      .addCase(login.pending, (state) => {
        // Cuando el login está pendiente, se establece isLoading a true y se limpia cualquier error anterior
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        // Cuando el login es exitoso, se guarda el usuario y se pone isLoading a false
        state.user = action.payload;
        state.isLoading = false;
        state.error = null; // Se limpia cualquier error
      })
      .addCase(login.rejected, (state, action) => {
        // Cuando el login falla, se limpia el usuario, se pone isLoading a false y se guarda el error
        state.user = null;
        state.isLoading = false;
        state.error = action.payload; // El error es el payload que devolvimos con rejectWithValue
      })

      // --- logout ---
      .addCase(logout.fulfilled, (state) => {
        // Cuando el logout es exitoso, se limpia el usuario, se pone isLoading a false y se limpia cualquier error
        state.user = null;
        state.isLoading = false;
        state.error = null;
      })

      // --- clearSession ---
      .addCase(clearSession.pending, (state) => {
        // Mientras se limpia la sesión, mantener isLoading en true
        state.isLoading = true;
      })
      .addCase(clearSession.fulfilled, (state) => {
        // Cuando clearSession es exitoso, se limpia completamente el estado
        state.user = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(clearSession.rejected, (state) => {
        // En caso de error al limpiar sesión, igual limpiar el estado
        state.user = null;
        state.isLoading = false;
        state.error = null;
      })
      // Add this to your extraReducers in authSlice.js
.addCase(updateProfile.pending, (state) => {
  state.isLoading = true;
  state.error = null;
})
.addCase(updateProfile.fulfilled, (state, action) => {
  state.user = action.payload;
  state.isLoading = false;
  state.error = null;
})
.addCase(updateProfile.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
});
      
  },
});

// Exporta el reducer generado por el slice para ser combinado en el store de Redux
export default authSlice.reducer;