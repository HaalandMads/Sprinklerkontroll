import React from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { colors, severityOf, space, touch } from '../lib/theme';

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  if (!scroll) return <View style={[s.screen, { paddingBottom: insets.bottom }]}>{children}</View>;
  return (
    <KeyboardAwareScrollView style={s.screen} bottomOffset={32} contentContainerStyle={{ padding: space.l, paddingBottom: space.xl + insets.bottom }} keyboardShouldPersistTaps="handled">
      {children}
    </KeyboardAwareScrollView>
  );
}

type BtnProps = { label: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'danger' | 'quiet'; disabled?: boolean; busy?: boolean; style?: ViewStyle; small?: boolean };
export function Button({ label, onPress, kind = 'primary', disabled, busy, style, small }: BtnProps) {
  const bg = kind === 'primary' ? colors.accent : kind === 'danger' ? colors.danger : colors.card;
  const fg = kind === 'primary' || kind === 'danger' ? '#fff' : kind === 'quiet' ? colors.accent : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        { backgroundColor: bg, borderColor: kind === 'secondary' ? colors.line : bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        kind === 'quiet' && { borderColor: 'transparent', backgroundColor: 'transparent' },
        style,
      ]}>
      {busy ? <ActivityIndicator color={fg} /> : <Text style={[s.btnText, { color: fg }, small && { fontSize: 14 }]}>{label}</Text>}
    </Pressable>
  );
}

export function Field({ label, hint, ...rest }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ marginBottom: space.m }}>
      <Text style={s.label}>{label}</Text>
      <TextInput placeholderTextColor="#8A949E" style={[s.input, rest.multiline && { minHeight: 96, textAlignVertical: 'top' }]} {...rest} />
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Choice<T extends string>({ label, value, options, onChange }: {
  label?: string; value: T; options: { value: T; label: string; color?: string; text?: string }[]; onChange: (v: T) => void;
}) {
  return (
    <View style={{ marginBottom: space.m }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={s.choiceRow}>
        {options.map((o) => {
          const on = o.value === value;
          const bg = on ? o.color ?? colors.accent : colors.card;
          return (
            <Pressable key={o.value} onPress={() => onChange(o.value)} accessibilityRole="radio" accessibilityState={{ selected: on }}
              style={[s.choice, { backgroundColor: bg, borderColor: on ? bg : colors.line }]}>
              <Text style={[s.choiceText, { color: on ? o.text ?? '#fff' : colors.ink }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Section({ title, right, children }: { title: string; right?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <View style={{ marginTop: space.xl }}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Row({ title, sub, onPress, left, right }: { title: string; sub?: string; onPress?: () => void; left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.row, pressed && onPress ? { backgroundColor: '#E9EDF1' } : null]}>
      {left}
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

export function SeverityTag({ severity, closed }: { severity: string; closed?: boolean }) {
  const sv = severityOf(severity);
  return (
    <View style={[s.tag, { backgroundColor: closed ? colors.closed : sv.color }]}>
      <Text style={[s.tagText, { color: closed ? '#fff' : sv.text }]}>{closed ? 'Lukket' : sv.label}</Text>
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return <Text style={s.empty}>{text}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={s.muted}>{children}</Text>;
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  btn: { minHeight: touch, borderRadius: 8, borderWidth: 1, paddingHorizontal: space.l, alignItems: 'center', justifyContent: 'center' },
  btnSmall: { minHeight: 40, paddingHorizontal: space.m },
  btnText: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  hint: { fontSize: 13, color: colors.muted, marginTop: 4 },
  input: { minHeight: touch, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.card, paddingHorizontal: space.m, paddingVertical: 10, fontSize: 16, color: colors.ink },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  choice: { minHeight: 44, paddingHorizontal: space.m, borderRadius: 8, borderWidth: 1, justifyContent: 'center' },
  choiceText: { fontSize: 15, fontWeight: '600' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.s },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: space.m, marginBottom: space.s, minHeight: touch },
  rowTitle: { fontSize: 16, fontWeight: '600', color: colors.ink },
  rowSub: { fontSize: 14, color: colors.muted, marginTop: 2 },
  tag: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '700' },
  empty: { color: colors.muted, fontSize: 15, paddingVertical: space.m },
  muted: { color: colors.muted, fontSize: 14 },
});
