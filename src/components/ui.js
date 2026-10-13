import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { colors, statusMeta } from '../theme';

export function Button({ title, onPress, loading, variant = 'primary', style, disabled }) {
  const secondary = variant === 'secondary';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={[s.btn, secondary && s.btnSecondary, (loading || disabled) && { opacity: 0.6 }, style]}
      activeOpacity={0.8}
    >
      {loading ? <ActivityIndicator color={secondary ? colors.navy : '#fff'} /> : <Text style={[s.btnText, secondary && { color: colors.navy }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

export function Input({ label, error, style, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        style={[s.input, error && { borderColor: colors.danger }, style]}
        {...props}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

export function Card({ children, style, onPress }) {
  const C = onPress ? TouchableOpacity : View;
  return <C onPress={onPress} activeOpacity={0.8} style={[s.card, style]}>{children}</C>;
}

export function StatusPill({ status }) {
  const m = statusMeta[status] || statusMeta.PENDING;
  return (
    <View style={[s.pill, { backgroundColor: m.bg }]}>
      <Text style={[s.pillText, { color: m.color }]}>{m.label}</Text>
    </View>
  );
}

export function ProgressBar({ value }) {
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${Math.min(100, value)}%` }]} />
    </View>
  );
}

export function Avatar({ name = '?', photo, size = 40 }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  if (photo) {
    
    return <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}

export function Center({ children }) {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>{children}</View>;
}

export const Loading = () => <Center><ActivityIndicator size="large" color={colors.blue} /></Center>;

const s = StyleSheet.create({
  btn: { backgroundColor: colors.blue, paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  label: { fontSize: 12, color: colors.muted, marginBottom: 4, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: colors.text },
  error: { color: colors.danger, fontSize: 12, marginTop: 3 },
  card: { backgroundColor: colors.card, borderRadius: 8, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  track: { height: 5, backgroundColor: '#e3e7ee', borderRadius: 3, overflow: 'hidden' },
  fill: { height: 5, backgroundColor: colors.blue },
});
