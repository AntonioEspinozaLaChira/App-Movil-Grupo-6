import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore usa Keychain (iOS) y Keystore (Android). En web no existe: se cae a localStorage.
const web = Platform.OS === 'web';
export const secureGet = async (k) => (web ? localStorage.getItem(k) : SecureStore.getItemAsync(k));
export const secureSet = async (k, v) => (web ? localStorage.setItem(k, v) : SecureStore.setItemAsync(k, v));
export const secureDel = async (k) => (web ? localStorage.removeItem(k) : SecureStore.deleteItemAsync(k));
