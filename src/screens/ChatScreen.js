import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Loading } from '../components/ui';
import { api } from '../api';
import { subscribeToProject } from '../api/socket';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const hhmm = (iso) => new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

export default function ChatScreen({ route }) {
  const { projectId } = route.params;
  const { user } = useAuth();
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState('');

  const addMsg = useCallback((m) => setMsgs((prev) => (prev && !prev.some((x) => x.id === m.id) ? [m, ...prev] : prev)), []);

  useEffect(() => {
    let off;
    api.getMessages(projectId).then((list) => {
      setMsgs([...list].reverse()); // la lista es "inverted": el más reciente va primero
      off = subscribeToProject(projectId, addMsg);
    });
    return () => off?.();
  }, [projectId, addMsg]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    try { addMsg(await api.sendMessage(projectId, t)); } catch { setText(t); }
  };

  if (!msgs) return <Loading />;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={s.status}><View style={s.dot} /><Text style={{ color: '#fff', fontSize: 11 }}>Sala de proyecto · WebSocket en línea</Text></View>
      <FlatList
        inverted data={msgs} keyExtractor={(m) => String(m.id)} contentContainerStyle={{ padding: 14 }}
        renderItem={({ item }) => {
          const mine = item.userId === user.id;
          return (
            <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              <View style={[s.bubble, mine && s.mine]}>
                <Text style={{ color: mine ? '#fff' : colors.text }}>{item.text}</Text>
              </View>
              <Text style={s.time}>{mine ? '' : `${item.user.name} · `}{hhmm(item.at)}</Text>
            </View>
          );
        }}
      />
      <View style={s.bar}>
        <TextInput value={text} onChangeText={setText} placeholder="Escribe un mensaje" placeholderTextColor={colors.muted} style={s.input} onSubmitEditing={send} returnKeyType="send" />
        <TouchableOpacity onPress={send} style={s.send}><Ionicons name="send" size={18} color="#fff" /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  status: { backgroundColor: colors.blue, paddingVertical: 6, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#7dffa8', marginRight: 8 },
  bubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, padding: 10, borderRadius: 6, maxWidth: '82%' },
  mine: { backgroundColor: colors.navy, borderColor: colors.navy },
  time: { fontSize: 10, color: colors.muted, marginTop: 3 },
  bar: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: colors.border },
  input: { flex: 1, backgroundColor: colors.bg, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 9 },
  send: { backgroundColor: colors.blue, width: 42, borderRadius: 6, marginLeft: 8, alignItems: 'center', justifyContent: 'center' },
});
