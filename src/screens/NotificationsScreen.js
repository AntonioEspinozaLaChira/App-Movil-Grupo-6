import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Loading } from '../components/ui';
import { useApi } from '../hooks';
import { api } from '../api';
import { colors } from '../theme';

export default function NotificationsScreen() {
  const { data, loading, reload } = useApi(() => api.getNotifications());
  if (loading) return <Loading />;
  return (
    <FlatList
      style={{ backgroundColor: colors.bg }} data={data} keyExtractor={(i) => String(i.id)} contentContainerStyle={{ padding: 16 }}
      refreshing={false} onRefresh={reload}
      renderItem={({ item }) => (
        <View style={[s.item, item.unread && s.unread]}>
          <Text style={{ color: colors.text }}>{item.text}</Text>
          <Text style={s.meta}>{item.ref} · {item.ago}</Text>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  item: { backgroundColor: '#fff', borderLeftWidth: 3, borderLeftColor: colors.border, padding: 12, marginBottom: 8, borderRadius: 4 },
  unread: { backgroundColor: colors.blueLight, borderLeftColor: colors.blue },
  meta: { fontSize: 10, color: colors.muted, marginTop: 6, letterSpacing: 0.5 },
});
