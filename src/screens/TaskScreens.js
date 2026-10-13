import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Card, Button, StatusPill, Loading, Avatar } from '../components/ui';
import { useApi } from '../hooks';
import { api } from '../api';
import { colors, statusMeta } from '../theme';

const FILTERS = [['ALL', 'Todas'], ['PENDING', 'Pendientes'], ['IN_PROGRESS', 'En curso'], ['DONE', 'Hechas']];
const NEXT = { PENDING: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'PENDING' };

export function TasksScreen({ route, navigation }) {
  const { projectId } = route.params;
  const { data, setData, loading, reload } = useApi(() => api.getTasks(projectId), [projectId]);
  const [filter, setFilter] = useState('ALL');
  if (loading) return <Loading />;
  const list = (data || []).filter((t) => filter === 'ALL' || t.status === filter);

  // Avance rápido: tocar la píldora de estado pasa PENDING → IN_PROGRESS → DONE.
  const advance = async (t) => {
    const status = NEXT[t.status];
    setData((d) => d.map((x) => (x.id === t.id ? { ...x, status } : x)));
    try { await api.setTaskStatus(t.id, status); }
    catch (e) { Alert.alert('Error', e.message); reload(); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.tabs}>
        {FILTERS.map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => setFilter(k)} style={[s.tab, filter === k && s.tabOn]}>
            <Text style={{ color: filter === k ? '#fff' : colors.text, fontSize: 12, fontWeight: '600' }}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.tip}>Toca el estado para avanzarlo: PENDING → IN_PROGRESS → DONE.</Text>
      <FlatList
        data={list} keyExtractor={(i) => String(i.id)} contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshing={false} onRefresh={reload}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.muted, marginTop: 30 }}>Sin tareas</Text>}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('TaskDetail', { id: item.id })}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '700', color: colors.text, flex: 1, paddingRight: 8 }}>{item.title}</Text>
              <TouchableOpacity onPress={() => advance(item)}><StatusPill status={item.status} /></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <Avatar name={item.assignee.name} size={22} />
              <Text style={s.meta}>  {item.assignee.name} · Vence {item.due} · {item.code}</Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

export function TaskDetailScreen({ route }) {
  const { data: t, setData, loading } = useApi(() => api.getTask(route.params.id), [route.params.id]);
  const [saving, setSaving] = useState(false);
  if (loading || !t) return <Loading />;

  const change = async (status) => {
    if (status === t.status) return;
    setSaving(true);
    try { await api.setTaskStatus(t.id, status); setData({ ...t, status }); }
    catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ backgroundColor: colors.navy, padding: 20 }}>
        <Text style={{ color: '#9fb4cf', fontSize: 11 }}>{t.project.name} · {t.code}</Text>
        <Text style={{ color: '#fff', fontSize: 21, fontWeight: '800', marginVertical: 8 }}>{t.title}</Text>
        <StatusPill status={t.status} />
      </View>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {[['RESPONSABLE', t.assignee.name], ['VENCE', t.due], ['PRIORIDAD', t.priority], ['ESTIMADO', `${t.hours} h`]].map(([k, v]) => (
            <View key={k} style={{ flex: 1 }}><Text style={s.k}>{k}</Text><Text style={s.v}>{v}</Text></View>
          ))}
        </View>
        <Text style={{ color: colors.text, lineHeight: 20, marginBottom: 20 }}>{t.description}</Text>
        <Text style={s.k}>CAMBIAR ESTADO</Text>
        <View style={{ flexDirection: 'row' }}>
          {Object.keys(statusMeta).map((st) => (
            <TouchableOpacity key={st} disabled={saving} onPress={() => change(st)} style={[s.st, t.status === st && s.stOn]}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: t.status === st ? '#fff' : colors.text }}>{st}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 12, paddingBottom: 4 },
  tab: { paddingVertical: 7, paddingHorizontal: 11, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, marginRight: 6 },
  tabOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  tip: { fontSize: 11, color: colors.blue, paddingHorizontal: 16, paddingVertical: 8 },
  meta: { color: colors.muted, fontSize: 11 },
  k: { fontSize: 10, color: colors.muted, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  v: { color: colors.text, fontWeight: '600', fontSize: 12 },
  st: { flex: 1, padding: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', alignItems: 'center', marginRight: 6, marginTop: 6, borderRadius: 6 },
  stOn: { backgroundColor: colors.blue, borderColor: colors.blue },
});
