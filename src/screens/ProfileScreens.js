import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input, Card, Avatar } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { colors } from '../theme';

const roleName = { LEADER: 'Jefe de proyecto', MEMBER: 'Colaborador / miembro' };

export function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={s.head}>
        <Avatar name={user.name} photo={user.photo} size={64} />
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={s.name}>{user.name}</Text>
          <Text style={s.mail}>{user.email}</Text>
          <Text style={s.role}>{roleName[user.role]}</Text>
        </View>
      </View>
      <Card>
        <Text style={s.k}>TELÉFONO</Text>
        <Text style={s.v}>{user.phone || '—'}</Text>
        <Text style={[s.k, { marginTop: 12 }]}>NOTIFICACIONES</Text>
        <Text style={s.v}>{user.notifications ? 'Activadas' : 'Desactivadas'}</Text>
      </Card>
      <Card>
        <Text style={s.k}>SESIÓN</Text>
        <Text style={s.v}>Token JWT · cifrado en el dispositivo (Keychain / Keystore)</Text>
      </Card>
      <Button title="Editar perfil" onPress={() => navigation.navigate('EditProfile')} />
      <Button title="Cambiar contraseña" variant="secondary" style={{ marginTop: 10 }} onPress={() => navigation.navigate('ChangePassword')} />
      <Button title="Cerrar sesión" variant="secondary" style={{ marginTop: 10 }} onPress={signOut} />
    </ScrollView>
  );
}

export function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [photo, setPhoto] = useState(user.photo);
  const [notif, setNotif] = useState(user.notifications);
  const [loading, setLoading] = useState(false);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos.');
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    if (!r.canceled) setPhoto(r.assets[0].uri);
  };

  const save = async () => {
    if (name.trim().length < 3) return Alert.alert('Nombre no válido', 'Ingresa tu nombre completo.');
    if (phone && !/^\d{9}$/.test(phone)) return Alert.alert('Teléfono no válido', 'Debe tener 9 dígitos.');
    setLoading(true);
    try { await updateProfile({ name: name.trim(), phone, photo, notifications: notif }); navigation.goBack(); }
    catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={pick} style={{ alignItems: 'center', marginBottom: 20 }}>
        <Avatar name={name} photo={photo} size={88} />
        <Text style={{ color: colors.blue, fontWeight: '600', marginTop: 8 }}>Subir foto de perfil</Text>
      </TouchableOpacity>
      <Input label="Nombre completo" value={name} onChangeText={setName} autoCapitalize="words" />
      <Input label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="number-pad" maxLength={9} />
      <View style={s.row}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>Recibir notificaciones</Text>
        <Switch value={notif} onValueChange={setNotif} trackColor={{ true: colors.blue }} />
      </View>
      <Button title="Guardar cambios" onPress={save} loading={loading} />
    </ScrollView>
  );
}

export function ChangePasswordScreen({ navigation }) {
  const [cur, setCur] = useState('');
  const [nw, setNw] = useState('');
  const [conf, setConf] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (nw.length < 6) return Alert.alert('Contraseña débil', 'Mínimo 6 caracteres.');
    if (nw !== conf) return Alert.alert('No coinciden', 'La confirmación no coincide con la nueva contraseña.');
    setLoading(true);
    try {
      await api.changePassword(cur, nw);
      Alert.alert('Listo', 'Tu contraseña fue actualizada.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Input label="Contraseña actual" value={cur} onChangeText={setCur} secureTextEntry />
      <Input label="Nueva contraseña" value={nw} onChangeText={setNw} secureTextEntry />
      <Input label="Confirmar nueva contraseña" value={conf} onChangeText={setConf} secureTextEntry />
      <Button title="Actualizar contraseña" onPress={save} loading={loading} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  head: { backgroundColor: colors.navy, borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  name: { color: '#fff', fontSize: 18, fontWeight: '700' },
  mail: { color: '#9fb4cf', fontSize: 12, marginTop: 2 },
  role: { color: '#fff', fontSize: 11, marginTop: 6, opacity: 0.85 },
  k: { fontSize: 10, color: colors.muted, letterSpacing: 1, fontWeight: '700' },
  v: { color: colors.text, marginTop: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
});
