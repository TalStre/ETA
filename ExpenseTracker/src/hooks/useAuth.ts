import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login as loginAction, logout as logoutAction } from '../store/slices/authSlice';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, biometricsEnabled } = useAppSelector(
    (state) => state.auth
  );

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const response = await fetch('http://10.0.2.2:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (response.ok && data.token) {
          dispatch(loginAction({ user: data.user, token: data.token }));
          return { success: true, user: data.user };
        } else {
          return { 
            success: false, 
            error: data.message || 'Invalid credentials' 
          };
        }
      } catch (error) {
        console.error('Login error:', error);
        return { 
          success: false, 
          error: 'Unable to connect to server' 
        };
      }
    },
    [dispatch]
  );

  // Register function
  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        // Step 1: Register
        const registerResponse = await fetch('http://10.0.2.2:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
          return { 
            success: false, 
            error: registerData.message || 'Registration failed' 
          };
        }

        // Step 2: Auto-login after registration
        const loginResponse = await fetch('http://10.0.2.2:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok && loginData.token) {
          dispatch(loginAction({ user: loginData.user, token: loginData.token }));
          return { success: true, user: loginData.user };
        }

        return { 
          success: false, 
          error: 'Registration succeeded but auto-login failed' 
        };
      } catch (error) {
        console.error('Register error:', error);
        return { 
          success: false, 
          error: 'Unable to connect to server' 
        };
      }
    },
    [dispatch]
  );

  // Logout function
  const logout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logoutAction());
          },
        },
      ]
    );
  }, [dispatch]);

  // Logout without confirmation
  const logoutSilent = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    biometricsEnabled,
    login,
    register,
    logout,
    logoutSilent,
  };
};