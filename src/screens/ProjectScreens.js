import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, Alert, TextInput, StyleSheet } from 'react-native';
import { Card, Button, Input, StatusPill, ProgressBar, Loading, Avatar } from '../components/ui';
import { useApi } from '../hooks';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export function ProjectsScreen({ navigation }) {
  const { user } = useAuth();
  const { data, loading, reload } = useApi(() => api.getProjects());
  const [q, setQ] = useState('');
  if (loading) return <Loading />;
  const list = (data || []).filter((p) => `${p.name} ${p.client}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <TextInput value={q} onChangeText={setQ} placeholder="Buscar proyecto o cliente" placeholderTextColor={colors.muted} style={s.search} />
        {user.role === 'LEADER' && <Button title="+ Nuevo proyecto" onPress={() => navigation.navigate('NewProject')} style={{ marginTop: 10 }} />}
      </View>
      <FlatList
        data={list} keyExtractor={(i) => String(i.id)} contentContainerStyle={{ padding: 16 }}
        refreshing={false} onRefresh={reload}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.muted, marginTop: 30 }}>Sin proyectos</Text>}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('ProjectDetail', { id: item.id })}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontWeight: '700', color: colors.text, flex: 1, paddingRight: 8 }}>{item.name}</Text>
              <StatusPill status={item.status} />
            </View>
            <Text style={s.meta}>{item.client} · {item.code}</Text>
            <View style={{ marginVertical: 8 }}><ProgressBar value={item.progress} /></View>
            <Text style={s.meta}>{item.progress}% avance · {item.openTasks} abiertas · {item.team.length} personas</Text>
          </Card>
        )}
      />
    </View>
  );
}

export function ProjectDetailScreen({ route, navigation }) {
  const { data: p, loading } = useApi(() => api.getProject(route.params.id), [route.params.id]);
  if (loading || !p) return <Loading />;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.hero}>
        <Text style={s.heroSub}>{p.client} · Código {p.code}</Text>
        <Text style={s.heroTitle}>{p.name}</Text>
      </View>
      <View style={{ padding: 16 }}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={s.k}>AVANCE</Text><Text style={{ color: colors.blue, fontWeight: '800', fontSize: 20 }}>{p.progress}%</Text>
          </View>
          <ProgressBar value={p.progress} />
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            <View style={{ flex: 1 }}><Text style={s.k}>INICIO</Text><Text style={s.v}>{p.start}</Text></View>
            <View style={{ flex: 1 }}><Text style={s.k}>ENTREGA</Text><Text style={s.v}>{p.end || '—'}</Text></View>
          </View>
        </Card>
        <Text style={s.desc}>{p.description}</Text>
        <Text style={s.section}>EQUIPO</Text>
        {p.team.map((u) => (
          <View key={u.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Avatar name={u.name} photo={u.photo} size={32} /><Text style={{ marginLeft: 10, color: colors.text }}>{u.name}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Button title="Ver tareas" style={{ flex: 1, marginRight: 8 }} onPress={() => navigation.navigate('Tasks', { projectId: p.id, name: p.name })} />
          <Button title="Abrir chat" variant="secondary" style={{ flex: 1 }} onPress={() => navigation.navigate('Chat', { projectId: p.id, name: p.name })} />
        </View>
      </View>
    </ScrollView>
  );
}

export function NewProjectScreen({ navigation }) {
  const [f, setF] = useState({ name: '', client: '', end: '', description: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (f.name.trim().length < 3) return Alert.alert('Falta el nombre', 'Ingresa el nombre del proyecto.');
    if (f.end && !/^\d{4}-\d{2}-\d{2}$/.test(f.end)) return Alert.alert('Fecha no válida', 'Usa el formato AAAA-MM-DD.');
    setLoading(true);
    try { await api.createProject(f); navigation.goBack(); }
    catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Input label="Nombre del proyecto" value={f.name} onChangeText={set('name')} autoCapitalize="sentences" />
      <Input label="Cliente" value={f.client} onChangeText={set('client')} autoCapitalize="words" />
      <Input label="Fecha de entrega (AAAA-MM-DD)" value={f.end} onChangeText={set('end')} />
      <Input label="Descripción" value={f.description} onChangeText={set('description')} multiline style={{ minHeight: 90, textAlignVertical: 'top' }} autoCapitalize="sentences" />
      <Button title="Crear proyecto" onPress={save} loading={loading} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  search: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 11 },
  meta: { color: colors.muted, fontSize: 11 },
  hero: { backgroundColor: colors.navy, padding: 20 },
  heroSub: { color: '#9fb4cf', fontSize: 11 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 6 },
  k: { fontSize: 10, color: colors.muted, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  v: { color: colors.text, fontWeight: '600' },
  desc: { color: colors.text, lineHeight: 20, marginBottom: 16 },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.text, marginBottom: 10 },
});
