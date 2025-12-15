import { useState, useEffect, useCallback } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission, PermissionStatus } from 'react-native-permissions';

type PermissionType = 'camera' | 'photos' | 'location' | 'microphone';

const PERMISSION_MAP: Record<PermissionType, Permission> = {
  camera: Platform.select({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  }) as Permission,
  photos: Platform.select({
    android: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  }) as Permission,
  location: Platform.select({
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  }) as Permission,
  microphone: Platform.select({
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    ios: PERMISSIONS.IOS.MICROPHONE,
  }) as Permission,
};

const PERMISSION_NAMES: Record<PermissionType, string> = {
  camera: 'Camera',
  photos: 'Photo Library',
  location: 'Location',
  microphone: 'Microphone',
};

export const usePermissions = (permissionType: PermissionType) => {
  const [status, setStatus] = useState<PermissionStatus>(RESULTS.UNAVAILABLE);
  const [loading, setLoading] = useState(false);

  const permission = PERMISSION_MAP[permissionType];
  const permissionName = PERMISSION_NAMES[permissionType];

  // Check permission status
  const checkPermission = useCallback(async () => {
    try {
      const result = await check(permission);
      setStatus(result);
      return result;
    } catch (error) {
      console.error('Check permission error:', error);
      return RESULTS.UNAVAILABLE;
    }
  }, [permission]);

  // Request permission
  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      const result = await request(permission);
      setStatus(result);
      
      if (result === RESULTS.BLOCKED) {
        Alert.alert(
          `${permissionName} Permission Required`,
          `Please enable ${permissionName} access in your device settings`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
      
      return result;
    } catch (error) {
      console.error('Request permission error:', error);
      return RESULTS.UNAVAILABLE;
    } finally {
      setLoading(false);
    }
  }, [permission, permissionName]);

  // Check and request if needed
  const checkAndRequest = useCallback(async (): Promise<boolean> => {
    const currentStatus = await checkPermission();

    switch (currentStatus) {
      case RESULTS.GRANTED:
        return true;

      case RESULTS.DENIED:
        const requestResult = await requestPermission();
        return requestResult === RESULTS.GRANTED;

      case RESULTS.BLOCKED:
        Alert.alert(
          `${permissionName} Permission Required`,
          `Please enable ${permissionName} access in your device settings`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;

      default:
        return false;
    }
  }, [checkPermission, requestPermission, permissionName]);

  // Check on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const isGranted = status === RESULTS.GRANTED;
  const isDenied = status === RESULTS.DENIED;
  const isBlocked = status === RESULTS.BLOCKED;

  return {
    status,
    isGranted,
    isDenied,
    isBlocked,
    loading,
    check: checkPermission,
    request: requestPermission,
    checkAndRequest,
  };
};