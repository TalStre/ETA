import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './src/store/store';
import { queryClient } from './src/config/queryClient';
import AppNavigator from './src/navigation/AppNavigator';
import { getToken, getUser } from './src/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreSession } from './src/store/slices/authSlice';

const AppContent = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreUserSession();
  }, []);

  const restoreUserSession = async () => {
    try {
      const token = await getToken();
      const user = await getUser();
      const biometricsEnabled = await AsyncStorage.getItem('biometricsEnabled');

      if (token && user) {
        store.dispatch(
          restoreSession({
            user,
            token,
            biometricsEnabled: biometricsEnabled === 'true',
          })
        );
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <AppNavigator />;
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default App;