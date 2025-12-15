import { useState, useEffect, useCallback } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setBiometrics, login } from '../store/slices/authSlice';
import { Alert } from 'react-native';
import { 
  saveBiometricCredentials, 
  getBiometricCredentials, 
  clearBiometricCredentials 
} from '../utils/storage';

const rnBiometrics = new ReactNativeBiometrics();

type BiometryType = 'FaceID' | 'TouchID' | 'Biometrics' | null;

export const useBiometrics = () => {
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType>(null);
  const [loading, setLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const { biometricsEnabled } = useAppSelector((state) => state.auth);

  useEffect(() => {
    checkBiometricsAvailability();
  }, []);

  const checkBiometricsAvailability = useCallback(async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      setBiometricsAvailable(available);
      setBiometryType(biometryType as BiometryType);
    } catch (error) {
      console.error('Biometrics check error:', error);
      setBiometricsAvailable(false);
    }
  }, []);

  const getBiometryName = useCallback(() => {
    switch (biometryType) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Biometrics':
        return 'Fingerprint';
      default:
        return 'Biometrics';
    }
  }, [biometryType]);

  const enableBiometrics = useCallback(async (email: string, password: string) => {
    if (!biometricsAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device');
      return false;
    }

    try {
      setLoading(true);

      const { publicKey } = await rnBiometrics.createKeys();

      if (publicKey) {
        // Save credentials securely using Keychain
        const saved = await saveBiometricCredentials(email, password);
        
        if (saved) {
          // Save preference to AsyncStorage (non-sensitive)
          await AsyncStorage.setItem('biometricsEnabled', 'true');
          
          dispatch(setBiometrics(true));
          Alert.alert('Success', `${getBiometryName()} enabled successfully!`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Enable biometrics error:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication');
      return false;
    } finally {
      setLoading(false);
    }
  }, [biometricsAvailable, dispatch, getBiometryName]);

  const disableBiometrics = useCallback(async () => {
    try {
      setLoading(true);

      await rnBiometrics.deleteKeys();
      await clearBiometricCredentials();
      await AsyncStorage.removeItem('biometricsEnabled');

      dispatch(setBiometrics(false));
      Alert.alert('Disabled', 'Biometric authentication has been disabled');
      return true;
    } catch (error) {
      console.error('Disable biometrics error:', error);
      Alert.alert('Error', 'Failed to disable biometric authentication');
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const authenticateWithBiometrics = useCallback(async (): Promise<boolean> => {
    if (!biometricsAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not available');
      return false;
    }

    try {
      setLoading(true);

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: `Authenticate with ${getBiometryName()}`,
        cancelButtonText: 'Cancel',
      });

      if (success) {
        // Get saved credentials from secure storage
        const credentials = await getBiometricCredentials();

        if (credentials) {
          const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email: credentials.email, 
              password: credentials.password 
            }),
          });

          const data = await response.json();

          if (response.ok && data.token) {
            dispatch(login({ user: data.user, token: data.token }));
            return true;
          } else {
            Alert.alert('Login Failed', 'Invalid credentials stored');
            return false;
          }
        } else {
          Alert.alert('Error', 'No credentials found. Please login normally first.');
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Biometric authentication failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [biometricsAvailable, dispatch, getBiometryName]);

  return {
    biometricsAvailable,
    biometricsEnabled,
    biometryType,
    loading,
    getBiometryName,
    enableBiometrics,
    disableBiometrics,
    authenticateWithBiometrics,
  };
};