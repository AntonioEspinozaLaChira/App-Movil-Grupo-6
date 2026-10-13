import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, ProgressBar, Loading } from '../components/ui';
import { useApi } from '../hooks';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const Metric = ({ n, label, dark }) => (
  <View style={[s.metric, dark && { backgroundColor: colors.navy }]}>
    <Text style={[s.n, dark && { color: '#fff' }]}>{n}</Text>
    <Text style={[s.l, dark && { color: '#9fb4cf' }]}>{label}</Text>
  </View>
);

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const m = useApi(() => api.getMetrics());
  const p = useApi(() => api.getProjects());
  if (m.loading || p.loading) return <Loading />;
  const metrics = m.data;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => { m.reload(); p.reload(); }} />}>
      <Text style={s.hi}>Hola, {user.name.split(' ')[0]}</Text>
      <Text style={s.role}>{user.role === 'LEADER' ? 'Jefe de proyecto' : 'Colaborador'}</Text>
      {metrics && (
        <>
          <View style={s.grid}>
            <Metric n={metrics.projects} label="PROYECTOS ASIGNADOS" dark />
            <Metric n={metrics.pending} label="TAREAS PENDIENTES" />
          </View>
          <View style={s.grid}>
            <Metric n={metrics.inProgress} label="EN CURSO" />
            <Metric n={metrics.done} label="COMPLETADAS" />
          </View>
        </>
      )}
      <View style={s.sectionRow}>
        <Text style={s.section}>MIS PROYECTOS</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProjectsTab')}><Text style={{ color: colors.blue, fontSize: 12 }}>Ver todos</Text></TouchableOpacity>
      </View>
      {(p.data || []).slice(0, 4).map((pr) => (
        <Card key={pr.id} onPress={() => navigation.navigate('ProjectsTab', { screen: 'ProjectDetail', params: { id: pr.id } })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontWeight: '700', color: colors.text, flex: 1 }}>{pr.name}</Text>
            <Text style={{ color: colors.blue, fontWeight: '700' }}>{pr.progress}%</Text>
          </View>
          <ProgressBar value={pr.progress} />
          <Text style={s.meta}>{pr.client} · {pr.openTasks} tareas abiertas</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hi: { fontSize: 22, fontWeight: '800', color: colors.text },
  role: { color: colors.muted, fontSize: 12, marginBottom: 14 },
  grid: { flexDirection: 'row', marginBottom: 10 },
  metric: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, padding: 16, marginHorizontal: 4, borderRadius: 6 },
  n: { fontSize: 34, fontWeight: '800', color: colors.text },
  l: { fontSize: 9, letterSpacing: 1, color: colors.muted, fontWeight: '700', marginTop: 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 10 },
  section: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: colors.text },
  meta: { color: colors.muted, fontSize: 11, marginTop: 8 },
});
