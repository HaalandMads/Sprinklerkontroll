import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { evaluate, parseNum } from '../lib/capacity';
import type { CapacityInput } from '../lib/db';
import { fmtDate, parseDate, todayIso } from '../lib/format';
import { colors, space } from '../lib/theme';
import { CapacityChart } from './CapacityChart';
import { Button, Field, Screen, Section } from './ui';

type Row = { q: string; p: string };
type ReqRow = { label: string; q: string; p: string };
const num = (n: number) => (Number.isFinite(n) ? String(n).replace('.', ',') : '');
const fmt = (n: number, d = 2) => n.toFixed(d).replace('.', ',');

export function CapacityForm({ buildingId, initial, saveLabel, onSave, onDelete }: {
  buildingId: string; initial?: CapacityInput; saveLabel: string; onSave: (c: CapacityInput) => Promise<void>; onDelete?: () => void;
}) {
  const [date, setDate] = useState(fmtDate(initial?.date ?? todayIso()));
  const [location, setLocation] = useState(initial?.location ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [rows, setRows] = useState<Row[]>(initial?.points.length ? initial.points.map((x) => ({ q: num(x.q), p: num(x.p) })) : [{ q: '0', p: '' }, { q: '', p: '' }]);
  const [reqs, setReqs] = useState<ReqRow[]>(initial?.reqs.length ? initial.reqs.map((x) => ({ label: x.label, q: num(x.q), p: num(x.p) })) : [{ label: 'Ugunstigste areal', q: '', p: '' }]);
  const [busy, setBusy] = useState(false);

  const points = useMemo(() => rows.map((r) => ({ q: parseNum(r.q), p: parseNum(r.p) })).filter((x) => Number.isFinite(x.q) && Number.isFinite(x.p)), [rows]);
  const reqPts = useMemo(() => reqs.map((r) => ({ label: r.label.trim(), q: parseNum(r.q), p: parseNum(r.p) })).filter((x) => Number.isFinite(x.q) && Number.isFinite(x.p)), [reqs]);
  const ev = evaluate(points, reqPts);

  const setRow = (i: number, k: keyof Row, v: string) => setRows((x) => x.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const setReq = (i: number, k: keyof ReqRow, v: string) => setReqs((x) => x.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const save = async () => {
    const iso = parseDate(date);
    if (!iso) return Alert.alert('Ugyldig dato', 'Skriv datoen som DD.MM.ÅÅÅÅ.');
    if (points.length < 1) return Alert.alert('Mangler målinger', 'Legg inn minst ett målepunkt.');
    setBusy(true);
    try {
      await onSave({ building_id: buildingId, date: iso, location: location.trim(), notes: notes.trim(), points, reqs: reqPts });
    } finally {
      setBusy(false);
    }
  };

  const statusColor = ev.status === 'innenfor' ? colors.closed : ev.status === 'utenfor' ? '#C62828' : colors.muted;
  return (
    <Screen>
      <Field label="Dato" value={date} onChangeText={setDate} placeholder="DD.MM.ÅÅÅÅ" keyboardType="numbers-and-punctuation" />
      <Field label="Målested" value={location} onChangeText={setLocation} placeholder="For eksempel C-manometer, kontrollventilsett 1" hint="Kravet og målingene må gjelde samme sted." />

      <Section title="Minstekrav fra dokumentasjonen">
        <Text style={st.hint}>Fra hydraulisk beregning eller skilt ved kontrollventilsettet. Legg gjerne inn både ugunstigste areal og Qmax (gunstigste areal).</Text>
        {reqs.map((r, i) => (
          <View key={i} style={st.card}>
            <TextInput value={r.label} onChangeText={(v) => setReq(i, 'label', v)} placeholder="Navn på kravet" style={[st.input, { marginBottom: space.s }]} placeholderTextColor="#8A949E" />
            <View style={st.row}>
              <TextInput value={r.q} onChangeText={(v) => setReq(i, 'q', v)} placeholder="Vannmengde l/min" keyboardType="decimal-pad" style={[st.input, { flex: 1 }]} placeholderTextColor="#8A949E" />
              <TextInput value={r.p} onChangeText={(v) => setReq(i, 'p', v)} placeholder="Trykk bar" keyboardType="decimal-pad" style={[st.input, { flex: 1 }]} placeholderTextColor="#8A949E" />
              {reqs.length > 1 ? <Pressable onPress={() => setReqs((x) => x.filter((_, j) => j !== i))} style={st.del}><Text style={st.delText}>×</Text></Pressable> : null}
            </View>
          </View>
        ))}
        <Button label="Legg til krav" kind="secondary" small onPress={() => setReqs((x) => [...x, { label: x.length === 1 ? 'Qmax (gunstigste areal)' : '', q: '', p: '' }])} />
      </Section>

      <Section title="Målinger">
        <Text style={st.hint}>Vannmengde og trykk målt samtidig. Start med statisk trykk ved 0 l/min. Flere punkter gir sikrere kurve.</Text>
        <View style={st.row}>
          <Text style={[st.colHead, { flex: 1 }]}>Vannmengde (l/min)</Text>
          <Text style={[st.colHead, { flex: 1 }]}>Trykk (bar)</Text>
          <View style={{ width: 36 }} />
        </View>
        {rows.map((r, i) => (
          <View key={i} style={[st.row, { marginBottom: space.s }]}>
            <TextInput value={r.q} onChangeText={(v) => setRow(i, 'q', v)} keyboardType="decimal-pad" style={[st.input, { flex: 1 }]} placeholder="l/min" placeholderTextColor="#8A949E" />
            <TextInput value={r.p} onChangeText={(v) => setRow(i, 'p', v)} keyboardType="decimal-pad" style={[st.input, { flex: 1 }]} placeholder="bar" placeholderTextColor="#8A949E" />
            <Pressable onPress={() => setRows((x) => x.filter((_, j) => j !== i))} style={st.del} disabled={rows.length <= 1}><Text style={st.delText}>×</Text></Pressable>
          </View>
        ))}
        <Button label="Legg til målepunkt" kind="secondary" small onPress={() => setRows((x) => [...x, { q: '', p: '' }])} />
      </Section>

      <Section title="Resultat">
        <View style={[st.status, { borderColor: statusColor }]}>
          <Text style={[st.statusText, { color: statusColor }]}>
            {ev.status === 'innenfor' ? 'Innenfor kravet' : ev.status === 'utenfor' ? 'Utenfor kravet' : 'Ikke nok data'}
          </Text>
          <Text style={st.msg}>{ev.message}</Text>
          {ev.results.map((r, i) => (
            <Text key={i} style={st.msg}>
              {r.label || 'Krav'}: {fmt(r.q, 0)} l/min ved {fmt(r.p)} bar. Tilgjengelig {fmt(r.available)} bar, margin {r.margin >= 0 ? '+' : ''}{fmt(r.margin)} bar{r.extrapolated ? ' (ekstrapolert)' : ''}.
            </Text>
          ))}
          {ev.fit ? <Text style={st.small}>Kurve: p = {fmt(ev.fit.p0)} − k·Q^1,85, tilpasset {ev.fit.n} målepunkter.</Text> : null}
        </View>
        <CapacityChart points={points} reqs={reqPts} />
        <Text style={st.small}>Blå linje: målt forsyningskurve (stiplet utenfor målt område). Punkter: målinger. Firkanter: krav, grønn innenfor og rød utenfor.</Text>
      </Section>

      <Field label="Notat" value={notes} onChangeText={setNotes} multiline placeholder="Utstyr, åpne ventiler, avtale med vannverket" />
      <Button label={saveLabel} onPress={save} busy={busy} />
      {onDelete ? <Button label="Slett måling" kind="danger" onPress={onDelete} style={{ marginTop: space.xl * 2 }} /> : null}
    </Screen>
  );
}

const st = StyleSheet.create({
  hint: { fontSize: 13, color: colors.muted, marginBottom: space.s },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: space.m, marginBottom: space.s },
  row: { flexDirection: 'row', gap: space.s, alignItems: 'center' },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.card, paddingHorizontal: space.m, fontSize: 16, color: colors.ink },
  colHead: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 4 },
  del: { width: 36, height: 48, alignItems: 'center', justifyContent: 'center' },
  delText: { fontSize: 22, color: colors.danger, fontWeight: '700' },
  status: { borderWidth: 2, borderRadius: 8, padding: space.m, marginBottom: space.m, backgroundColor: colors.card },
  statusText: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  msg: { fontSize: 14, color: colors.ink, marginTop: 4, lineHeight: 20 },
  small: { fontSize: 12, color: colors.muted, marginTop: 6 },
});
