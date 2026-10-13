import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../components/ui';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e.trim());

function AuthShell({ title, subtitle, children }) {
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={s.hero}>
          <Text style={s.brand}>WEBSTRATEGY S.A.C.</Text>
          <Text style={s.title}>{title}</Text>
          <Text style={s.sub}>{subtitle}</Text>
        </View>
        <View style={{ padding: 20 }}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function LoginScreen({ navigation }) {
  const { signIn, signInBiometric, biometricAvailable } = useAuth();
  const [email, setEmail] = useState('ana.rojas@webstrategy.pe');
  const [password, setPassword] = useState('123456');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = {};
    if (!emailOk(email)) e.email = 'Ingresa un correo válido';
    if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try { await signIn(email, password); }
    catch (err) { Alert.alert('No se pudo iniciar sesión', err.message); }
    finally { setLoading(false); }
  };

  const bio = async () => {
    try { await signInBiometric(); } catch (err) { Alert.alert('Biometría', err.message); }
  };

  return (
    <AuthShell title={'Gestión de\nproyectos internos'} subtitle="Plataforma multiplataforma · iOS y Android">
      <Input label="Correo corporativo" value={email} onChangeText={setEmail} keyboardType="email-address" error={errors.email} />
      <Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
      <Button title="Iniciar sesión" onPress={submit} loading={loading} />
      {biometricAvailable && (
        <TouchableOpacity onPress={bio} style={s.bio}>
          <Ionicons name="finger-print" size={26} color={colors.blue} />
          <Text style={{ color: colors.blue, fontWeight: '600', marginLeft: 8 }}>Ingresar con biometría</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Forgot')} style={s.link}><Text style={s.linkText}>¿Olvidaste tu contraseña?</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.link}><Text style={s.linkText}>Crear una cuenta</Text></TouchableOpacity>
      <Text style={s.hint}>Demo: ana.rojas@webstrategy.pe / 123456 (Jefe de proyecto){'\n'}luis.paredes@webstrategy.pe / 123456 (Miembro)</Text>
    </AuthShell>
  );
}

export function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [role, setRole] = useState('MEMBER');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    const e = {};
    if (f.name.trim().length < 3) e.name = 'Ingresa tu nombre completo';
    if (!emailOk(f.email)) e.email = 'Correo no válido';
    if (f.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (f.password !== f.confirm) e.confirm = 'Las contraseñas no coinciden';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try { await register({ name: f.name.trim(), email: f.email.trim(), password: f.password, role }); }
    catch (err) { Alert.alert('No se pudo registrar', err.message); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Crear cuenta" subtitle="Registro de usuarios del sistema">
      <Input label="Nombre completo" value={f.name} onChangeText={set('name')} autoCapitalize="words" error={errors.name} />
      <Input label="Correo corporativo" value={f.email} onChangeText={set('email')} keyboardType="email-address" error={errors.email} />
      <Input label="Contraseña" value={f.password} onChangeText={set('password')} secureTextEntry error={errors.password} />
      <Input label="Confirmar contraseña" value={f.confirm} onChangeText={set('confirm')} secureTextEntry error={errors.confirm} />
      <Text style={s.roleLabel}>Tipo de usuario</Text>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {[['MEMBER', 'Colaborador'], ['LEADER', 'Jefe de proyecto']].map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => setRole(k)} style={[s.role, role === k && s.roleOn]}>
            <Text style={{ color: role === k ? '#fff' : colors.text, fontWeight: '600' }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Registrarme" onPress={submit} loading={loading} />
      <TouchableOpacity onPress={() => navigation.goBack()} style={s.link}><Text style={s.linkText}>Ya tengo cuenta</Text></TouchableOpacity>
    </AuthShell>
  );
}

export function ForgotScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!emailOk(email)) return Alert.alert('Correo no válido', 'Ingresa tu correo corporativo.');
    setLoading(true);
    try {
      
      await api.forgotPassword(email.trim());
      Alert.alert('Revisa tu correo', 'Si el correo existe, te enviamos un enlace para restaurar tu contraseña.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Recuperar contraseña" subtitle="Restaura el acceso a tu cuenta">
      <Input label="Correo corporativo" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Button title="Enviar enlace" onPress={submit} loading={loading} />
      <TouchableOpacity onPress={() => navigation.goBack()} style={s.link}><Text style={s.linkText}>Volver</Text></TouchableOpacity>
    </AuthShell>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: colors.navy, paddingTop: 70, paddingBottom: 32, paddingHorizontal: 20 },
  brand: { color: '#9fb4cf', fontSize: 11, letterSpacing: 2, marginBottom: 10 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  sub: { color: '#9fb4cf', marginTop: 8, fontSize: 12 },
  link: { alignItems: 'center', marginTop: 16 },
  linkText: { color: colors.blue, fontWeight: '600' },
  bio: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  hint: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 28, lineHeight: 17 },
  roleLabel: { fontSize: 12, color: colors.muted, marginBottom: 6, fontWeight: '600' },
  role: { flex: 1, padding: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 6, alignItems: 'center', backgroundColor: '#fff', marginRight: 8 },
  roleOn: { backgroundColor: colors.navy, borderColor: colors.navy },
});
