import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { api, setToken, setUnauthorizedHandler } from '../api';
import { secureGet, secureSet, secureDel } from '../storage';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const saveSession = async (token, u) => {
    setToken(token);
    await secureSet('token', token);
    await secureSet('bioToken', token); // permite reingresar con biometría tras cerrar sesión
    setUser(u);
  };

  const signOut = useCallback(async () => {
    setToken(null);
    await secureDel('token');
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(signOut);
    (async () => {
      try {
        const hw = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricAvailable(hw && enrolled);
      } catch {}
      // Restaura la sesión guardada de forma segura.
      try {
        const token = await secureGet('token');
        if (token) {
          setToken(token);
          const { user: u } = await api.validateSession();
          setUser(u);
        }
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [signOut]);

  const signIn = async (email, password) => {
    const { token, user: u } = await api.login(email, password);
    await saveSession(token, u);
    await secureSet('lastEmail', email);
  };

  // Inicio con biometría: requiere haber iniciado sesión antes (token guardado).
  const signInBiometric = async () => {
    const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'Ingresa a WebStrategy' });
    if (!r.success) throw new Error('Autenticación biométrica cancelada');
    const token = await secureGet('bioToken');
    if (!token) throw new Error('Inicia sesión con tu contraseña una vez para activar la biometría');
    setToken(token);
    const { user: u } = await api.validateSession();
    setUser(u);
  };

  const register = async (data) => {
    const { token, user: u } = await api.register(data);
    await saveSession(token, u);
  };

  const refreshProfile = async () => setUser(await api.getProfile());
  const updateProfile = async (data) => setUser(await api.updateProfile(data));

  return (
    <AuthContext.Provider value={{ user, loading, biometricAvailable, signIn, signInBiometric, register, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
