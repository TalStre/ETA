import * as Keychain from 'react-native-keychain';

// Keys for different data
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const BIOMETRIC_EMAIL_KEY = 'biometric_email';
const BIOMETRIC_PASSWORD_KEY = 'biometric_password';

/**
 * Save authentication token securely
 */
export const saveToken = async (token: string): Promise<boolean> => {
  try {
    await Keychain.setGenericPassword(TOKEN_KEY, token, {
      service: TOKEN_KEY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

/**
 * Retrieve authentication token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: TOKEN_KEY,
    });
    
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Save user data securely
 */
export const saveUser = async (user: any): Promise<boolean> => {
  try {
    const userString = JSON.stringify(user);
    await Keychain.setGenericPassword(USER_KEY, userString, {
      service: USER_KEY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

/**
 * Retrieve user data
 */
export const getUser = async (): Promise<any | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: USER_KEY,
    });
    
    if (credentials) {
      return JSON.parse(credentials.password);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

/**
 * Save biometric credentials securely
 */
export const saveBiometricCredentials = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    // Save email
    await Keychain.setGenericPassword(BIOMETRIC_EMAIL_KEY, email, {
      service: BIOMETRIC_EMAIL_KEY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    // Save password
    await Keychain.setGenericPassword(BIOMETRIC_PASSWORD_KEY, password, {
      service: BIOMETRIC_PASSWORD_KEY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    return true;
  } catch (error) {
    console.error('Error saving biometric credentials:', error);
    return false;
  }
};

/**
 * Retrieve biometric credentials
 */
export const getBiometricCredentials = async (): Promise<{
  email: string;
  password: string;
} | null> => {
  try {
    const emailCreds = await Keychain.getGenericPassword({
      service: BIOMETRIC_EMAIL_KEY,
    });
    const passwordCreds = await Keychain.getGenericPassword({
      service: BIOMETRIC_PASSWORD_KEY,
    });

    if (emailCreds && passwordCreds) {
      return {
        email: emailCreds.password,
        password: passwordCreds.password,
      };
    }
    return null;
  } catch (error) {
    console.error('Error retrieving biometric credentials:', error);
    return null;
  }
};

/**
 * Clear all stored credentials (on logout)
 */
export const clearAllCredentials = async (): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({ service: TOKEN_KEY });
    await Keychain.resetGenericPassword({ service: USER_KEY });
    await Keychain.resetGenericPassword({ service: BIOMETRIC_EMAIL_KEY });
    await Keychain.resetGenericPassword({ service: BIOMETRIC_PASSWORD_KEY });
    return true;
  } catch (error) {
    console.error('Error clearing credentials:', error);
    return false;
  }
};

/**
 * Clear only biometric credentials
 */
export const clearBiometricCredentials = async (): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({ service: BIOMETRIC_EMAIL_KEY });
    await Keychain.resetGenericPassword({ service: BIOMETRIC_PASSWORD_KEY });
    return true;
  } catch (error) {
    console.error('Error clearing biometric credentials:', error);
    return false;
  }
};