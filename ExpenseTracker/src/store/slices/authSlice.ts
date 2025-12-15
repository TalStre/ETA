import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveToken, saveUser, clearAllCredentials } from '../../utils/storage';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  biometricsEnabled: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  biometricsEnabled: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Save to secure storage (async operations don't block Redux)
      saveToken(action.payload.token);
      saveUser(action.payload.user);
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.biometricsEnabled = false;
      
      // Clear secure storage
      clearAllCredentials();
    },
    
    setBiometrics: (state, action: PayloadAction<boolean>) => {
      state.biometricsEnabled = action.payload;
    },
    
    // Restore session from secure storage
    restoreSession: (state, action: PayloadAction<{ user: User; token: string; biometricsEnabled: boolean }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.biometricsEnabled = action.payload.biometricsEnabled;
    },
  },
});

export const { login, logout, setBiometrics, restoreSession } = authSlice.actions;
export default authSlice.reducer;