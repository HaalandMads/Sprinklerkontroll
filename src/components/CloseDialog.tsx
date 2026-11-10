import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, StyleSheet, Text, View } from 'react-native';
import { fmtDate, parseDate, todayIso } from '../lib/format';
import { colors, space } from '../lib/theme';
import { Button, Field } from './ui';

/** Dialog for å lukke et avvik som er utbedret. */
export function CloseDialog({ visible, title, onCancel, onConfirm }: {
  visible: boolean; title: string; onCancel: () => void; onConfirm: (comment: string, dateIso: string) => void;
}) {
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(fmtDate(todayIso()));
  const [err, setErr] = useState('');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}
      onShow={() => { setComment(''); setDate(fmtDate(todayIso())); setErr(''); }}>
      <KeyboardAvoidingView behavior="padding" style={st.back}>
        <View style={st.box}>
          <Text style={st.title}>Lukk avvik</Text>
          <Text style={st.sub}>{title}</Text>
          <Field label="Dato utbedret" value={date} onChangeText={setDate} placeholder="DD.MM.ÅÅÅÅ" keyboardType="numbers-and-punctuation" />
          <Field label="Kommentar (valgfritt)" value={comment} onChangeText={setComment} placeholder="Hva er gjort?" multiline />
          {err ? <Text style={st.err}>{err}</Text> : null}
          <View style={{ flexDirection: 'row', gap: space.s }}>
            <Button label="Avbryt" kind="secondary" onPress={onCancel} style={{ flex: 1 }} />
            <Button label="Lukk avvik" onPress={() => {
              const iso = parseDate(date);
              if (!iso) return setErr('Skriv datoen som DD.MM.ÅÅÅÅ.');
              onConfirm(comment.trim(), iso);
            }} style={{ flex: 1 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const st = StyleSheet.create({
  back: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: space.l },
  box: { backgroundColor: colors.surface, borderRadius: 12, padding: space.l },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 15, color: colors.muted, marginTop: 4, marginBottom: space.l },
  err: { color: colors.danger, marginBottom: space.s },
});
