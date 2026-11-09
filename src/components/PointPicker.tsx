import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FG_POINTS } from '../data/fg920';
import { positionTitle } from '../lib/fg';
import { colors, space } from '../lib/theme';
import { Button } from './ui';

/** Velg et hvilket som helst kontrollpunkt fra FG-920, eller «Annet avvik». */
export function PointPicker({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (code: string | null) => void }) {
  const [q, setQ] = useState('');
  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    return FG_POINTS.filter((p) => !t || `${p.code} ${p.title} ${positionTitle(p.pos)}`.toLowerCase().includes(t));
  }, [q]);
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={st.wrap}>
        <View style={st.head}>
          <Text style={st.title}>Velg kontrollpunkt</Text>
          <Button label="Lukk" kind="quiet" small onPress={onClose} />
        </View>
        <TextInput placeholder="Søk, for eksempel 9-2 eller stengeventil" value={q} onChangeText={setQ} style={st.search} placeholderTextColor="#8A949E" />
        <Pressable onPress={() => onPick(null)} style={st.other}>
          <Text style={st.otherText}>Annet avvik (uten kontrollpunkt)</Text>
        </Pressable>
        <FlatList
          data={items}
          keyExtractor={(p) => p.code}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable onPress={() => onPick(item.code)} style={({ pressed }) => [st.row, pressed && { backgroundColor: '#E9EDF1' }]}>
              <Text style={st.code}>{item.code}</Text>
              <View style={{ flex: 1 }}>
                <Text style={st.rowTitle}>{item.title}</Text>
                <Text style={st.rowSub}>Pos. {item.pos} {positionTitle(item.pos)}</Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surface, paddingTop: 48 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.l },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
  search: { margin: space.l, marginBottom: space.s, minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: '#fff', paddingHorizontal: space.m, fontSize: 16, color: colors.ink },
  other: { marginHorizontal: space.l, marginBottom: space.s, padding: space.m, borderRadius: 8, borderWidth: 1, borderColor: colors.accent, backgroundColor: '#fff' },
  otherText: { color: colors.accent, fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', gap: space.m, paddingHorizontal: space.l, paddingVertical: space.m, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: '#fff' },
  code: { width: 44, fontWeight: '700', color: colors.ink, fontSize: 16 },
  rowTitle: { fontSize: 16, color: colors.ink },
  rowSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
});
