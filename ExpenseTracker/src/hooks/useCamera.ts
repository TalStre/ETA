import { useState } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import {  launchCamera,  launchImageLibrary,  Asset, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import {  check,  request,  PERMISSIONS,  RESULTS, Permission } from 'react-native-permissions';

export const useCamera = () => {
  const [image, setImage] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);

  // Check and request camera permission
  const checkCameraPermission = async (): Promise<boolean> => {
    const permission = Platform.select({
      android: PERMISSIONS.ANDROID.CAMERA,
      ios: PERMISSIONS.IOS.CAMERA,
    }) as Permission;

    const result = await check(permission);

    switch (result) {
      case RESULTS.GRANTED:
        return true;
      
      case RESULTS.DENIED:
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;
      
      case RESULTS.BLOCKED:
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      
      default:
        return false;
    }
  };

  // Check and request gallery permission
  const checkGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
      const result = await check(permission);

      if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;
      }

      if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Gallery Permission Required',
          'Please enable photo library access in your device settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      return result === RESULTS.GRANTED;
    }

    // Android 13+ uses different permissions
    if (Platform.OS === 'android') {
      // Android handles gallery permissions automatically
      return true;
    }

    return true;
  };

  // Open camera
  const openCamera = async () => {
    const hasPermission = await checkCameraPermission();
    if (!hasPermission) return;

    setLoading(true);
    
    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
      includeBase64: true, // Include base64 for upload
    };

    try {
      const result = await launchCamera(options);

      if (result.didCancel) {
        console.log('User cancelled camera');
      } else if (result.errorCode) {
        Alert.alert('Camera Error', result.errorMessage || 'Failed to open camera');
      } else if (result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    } finally {
      setLoading(false);
    }
  };

  // Open gallery
  const openGallery = async () => {
    const hasPermission = await checkGalleryPermission();
    if (!hasPermission) return;

    setLoading(true);
    
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: true, // Include base64 for upload
    };

    try {
      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        console.log('User cancelled gallery');
      } else if (result.errorCode) {
        Alert.alert('Gallery Error', result.errorMessage || 'Failed to open gallery');
      } else if (result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    } finally {
      setLoading(false);
    }
  };

  // Show options to pick image source
  const showImagePickerOptions = () => {
    Alert.alert(
      'Add Receipt Photo',
      'Choose how to add your receipt',
      [
        {
          text: '📷 Take Photo',
          onPress: openCamera,
        },
        {
          text: '🖼️ Choose from Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // Remove selected image
  const removeImage = () => {
    setImage(null);
  };

  // Get base64 string for upload
  const getBase64 = (): string | undefined => {
    return image?.base64;
  };

  // Get file URI for multipart upload
  const getImageUri = (): string | undefined => {
    return image?.uri;
  };

  return {
    image,
    loading,
    openCamera,
    openGallery,
    showImagePickerOptions,
    removeImage,
    getBase64,
    getImageUri,
  };
};