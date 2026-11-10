import React, { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  Building, CapacityTest, deleteBuildingRows, DeviationListItem, Doc, InspectionListItem, addDocRow, deleteDocRow, getBuilding,
  listCapacityTests, listDeviationsForBuilding, listDocs, listInspections, listPhotosForBuilding,
} from '../../../lib/db';
import { evaluate } from '../../../lib/capacity';
import { deleteDocumentFile, deletePhotoFiles, openDocument, storeDocument } from '../../../lib/files';
import { fmtDate, fmtSize, uid } from '../../../lib/format';
import { pointByCode, systemLabel, typeLabel } from '../../../lib/fg';
import { printReport, shareCsv, sharePdf } from '../../../lib/report';
import { exportAndShare } from '../../../lib/transfer';
import { colors, severities, severityOf, space } from '../../../lib/theme';
import { Button, Choice, Empty, Muted, Row, Screen, Section, SeverityTag } from '../../../components/ui';

type Tab = 'oversikt' | 'avvik' | 'kapasitet' | 'dokumenter';
type Filter = 'apen' | 'lukket' | 'alle';

const capStatus = (t: CapacityTest) => {
  const ev = evaluate(t.points, t.reqs);
  return ev.status === 'innenfor' ? { label: 'Innenfor', color: colors.closed } : ev.status === 'utenfor' ? { label: 'Utenfor', color: '#C62828' } : { label: 'Ufullstendig', color: '#6B7B8C' };
};

export default function BuildingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [b, setB] = useState<Building | null>(null);
  const [devs, setDevs] = useState<DeviationListItem[]>([]);
  const [insps, setInsps] = useState<InspectionListItem[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [caps, setCaps] = useState<CapacityTest[]>([]);
  const [tab, setTab] = useState<Tab>('oversikt');
  const [filter, setFilter] = useState<Filter>('apen');
  const [withClosed, setWithClosed] = useState<'nei' | 'ja'>('nei');
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    getBuilding(id).then(setB);
    listDeviationsForBuilding(id).then(setDevs);
    listInspections(id).then(setInsps);
    listDocs(id).then(setDocs);
    listCapacityTests(id).then(setCaps);
  }, [id]);
  useFocusEffect(load);

  const addDocs = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
    if (res.canceled) return;
    setBusy('doc');
    try {
      for (const a of res.assets) {
        const { file, size } = await storeDocument(a.uri, a.name);
        await addDocRow({ id: uid(), building_id: id, name: a.name, file, mime: a.mimeType ?? null, size: a.size ?? size });
      }
      load();
    } catch (e) {
      Alert.alert('Dokumentet kunne ikke lagres', String(e));
    } finally {
      setBusy('');
    }
  };
  const removeDoc = (d: Doc) => Alert.alert('Slette dokument?', d.name, [
    { text: 'Avbryt', style: 'cancel' },
    { text: 'Slett', style: 'destructive', onPress: async () => { deleteDocumentFile(d.file); await deleteDocRow(d.id); load(); } },
  ]);
  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try { await fn(); } catch (e) { Alert.alert('Noe gikk galt', String(e)); } finally { setBusy(''); }
  };
  const removeBuilding = () => Alert.alert('Slette bygget?', 'Bygget, alle kontroller, avvik, kapasitetsmålinger, bilder og dokumenter slettes fra telefonen. Dette kan ikke angres.', [
    { text: 'Avbryt', style: 'cancel' },
    { text: 'Slett alt', style: 'destructive', onPress: async () => {
      (await listPhotosForBuilding(id)).forEach(deletePhotoFiles);
      (await listDocs(id)).forEach((d) => deleteDocumentFile(d.file));
      await deleteBuildingRows(id);
      router.back();
    } },
  ]);

  if (!b) return <Stack.Screen options={{ title: '' }} />;
  const addr = [b.street, [b.postal_code, b.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const open = devs.filter((d) => d.status === 'apen');
  const shown = devs.filter((d) => filter === 'alle' || d.status === filter);
  const tabs: { key: Tab; label: string }[] = [
    { key: 'oversikt', label: 'Oversikt' },
    { key: 'avvik', label: `Avvik (${open.length})` },
    { key: 'kapasitet', label: 'Kapasitet' },
    { key: 'dokumenter', label: `Dok. (${docs.length})` },
  ];

  return (
    <Screen>
      <Stack.Screen options={{ title: b.title, headerRight: () => <Button label="Endre" kind="quiet" small onPress={() => router.push(`/building/${id}/edit`)} style={{ minHeight: 36 }} /> }} />
      <View style={st.tabs} accessibilityRole="tablist">
        {tabs.map((t) => {
          const on = t.key === tab;
          return (
            <Pressable key={t.key} onPress={() => setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}
              style={[st.tab, on && st.tabOn]}>
              <Text style={[st.tabText, on && st.tabTextOn]} numberOfLines={1}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'oversikt' && (
        <View>
          {addr ? <Text style={{ fontSize: 16, color: colors.ink }}>{addr}</Text> : null}
          <View style={{ marginTop: space.s, gap: 4 }}>
            {b.contact_name ? <Text style={{ fontSize: 15, color: colors.ink }}>{b.contact_name}</Text> : null}
            {b.contact_phone ? <Text style={{ fontSize: 15, color: colors.accent }} onPress={() => Linking.openURL(`tel:${b.contact_phone.replace(/\s/g, '')}`)}>{b.contact_phone}</Text> : null}
            {b.contact_email ? <Text style={{ fontSize: 15, color: colors.accent }} onPress={() => Linking.openURL(`mailto:${b.contact_email}`)}>{b.contact_email}</Text> : null}
          </View>
          <Button label="Start ny kontroll" onPress={() => router.push(`/inspection/new?buildingId=${id}`)} style={{ marginTop: space.l }} />

          <Section title="Status">
            <Row title={`${open.length} åpne avvik`} onPress={() => setTab('avvik')}
              sub={open.length ? severities.map((s) => `${s.label} ${open.filter((d) => d.severity === s.key).length}`).join(' · ') : 'Ingen åpne avvik'}
              right={<Text style={{ color: colors.accent, fontWeight: '600' }}>Vis</Text>} />
            <Row title="Kapasitetsmåling" onPress={() => setTab('kapasitet')}
              sub={caps[0] ? `Siste ${fmtDate(caps[0].date)}${caps[0].location ? ` · ${caps[0].location}` : ''}` : 'Ingen målinger'}
              right={caps[0] ? <View style={[st.chip, { backgroundColor: capStatus(caps[0]).color }]}><Text style={st.chipText}>{capStatus(caps[0]).label}</Text></View>
                : <Text style={{ color: colors.accent, fontWeight: '600' }}>Vis</Text>} />
          </Section>

          <Section title="Kontroller">
            {insps.length === 0 ? <Empty text="Ingen kontroller ennå." /> : insps.map((i) => (
              <Row key={i.id} title={`${fmtDate(i.date)}  ${typeLabel[i.type] ?? i.type}`}
                sub={`${systemLabel[i.system] ?? i.system}${i.inspector ? ` · ${i.inspector}` : ''}\n${i.new_count} nye avvik · ${i.closed_count} lukket`}
                onPress={() => router.push(`/inspection/${i.id}`)} />
            ))}
          </Section>

          <Section title="Avviksoversikt">
            <Choice<'nei' | 'ja'> label="Ta med lukkede avvik" value={withClosed} onChange={setWithClosed} options={[{ value: 'nei', label: 'Nei, bare åpne' }, { value: 'ja', label: 'Ja' }]} />
            <View style={{ flexDirection: 'row', gap: space.s, flexWrap: 'wrap' }}>
              <Button label="Del PDF" busy={busy === 'pdf'} onPress={() => run('pdf', () => sharePdf(id, withClosed === 'ja'))} style={{ flexGrow: 1 }} />
              <Button label="Skriv ut" kind="secondary" busy={busy === 'print'} onPress={() => run('print', () => printReport(id, withClosed === 'ja'))} style={{ flexGrow: 1 }} />
              <Button label="Del CSV" kind="secondary" busy={busy === 'csv'} onPress={() => run('csv', () => shareCsv(id, withClosed === 'ja'))} style={{ flexGrow: 1 }} />
            </View>
            <Muted>PDF-en tar også med kapasitetsmålingene. Oversikten inneholder kontaktopplysninger og skal bare deles innenfor godkjente systemer.</Muted>
          </Section>

          <Section title="Deling og sikkerhetskopi">
            <Button label="Eksporter bygget med all historikk" kind="secondary" busy={busy === 'export'} onPress={() => run('export', () => exportAndShare('building', id))} />
            <Muted>Lager én fil med bygget, kontroller, avvik med bilder, kapasitetsmålinger og dokumenter. Den kan importeres på en annen telefon. Filen inneholder kontaktopplysninger.</Muted>
          </Section>

          <Button label="Slett bygg" kind="danger" onPress={removeBuilding} style={{ marginTop: space.xl * 2 }} />
        </View>
      )}

      {tab === 'avvik' && (
        <View>
          <Choice<Filter> value={filter} onChange={setFilter} options={[{ value: 'apen', label: `Åpne (${open.length})` }, { value: 'lukket', label: 'Lukkede' }, { value: 'alle', label: 'Alle' }]} />
          {shown.length === 0 ? <Empty text={filter === 'apen' ? 'Ingen åpne avvik.' : 'Ingen avvik å vise.'} /> : shown.map((d) => {
            const p = pointByCode(d.point_code);
            return (
              <Row key={d.id} title={`A-${d.nr}  ${d.title}`}
                sub={[p ? `${p.code} ${p.title}` : 'Annet avvik', d.location, `Registrert ${fmtDate(d.inspection_date)}${d.status === 'lukket' ? ` · lukket ${fmtDate(d.closed_at)}` : ''}`].filter(Boolean).join('\n')}
                left={<View style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: d.status === 'lukket' ? colors.closed : severityOf(d.severity).color }} />}
                right={<SeverityTag severity={d.severity} closed={d.status === 'lukket'} />}
                onPress={() => router.push(`/deviation/${d.id}`)} />
            );
          })}
        </View>
      )}

      {tab === 'kapasitet' && (
        <View>
          <Button label="Ny kapasitetsmåling" onPress={() => router.push(`/capacity/new?buildingId=${id}`)} />
          <Muted>Legg inn målt trykk og vannmengde og minstekravet fra dokumentasjonen. Appen sammenligner og viser graf.</Muted>
          <View style={{ height: space.m }} />
          {caps.length === 0 ? <Empty text="Ingen kapasitetsmålinger ennå." /> : caps.map((t) => {
            const cs = capStatus(t);
            return (
              <Row key={t.id} title={fmtDate(t.date)} sub={[t.location, `${t.points.length} målepunkter · ${t.reqs.length} krav`].filter(Boolean).join('\n')}
                right={<View style={[st.chip, { backgroundColor: cs.color }]}><Text style={st.chipText}>{cs.label}</Text></View>}
                onPress={() => router.push(`/capacity/${t.id}`)} />
            );
          })}
        </View>
      )}

      {tab === 'dokumenter' && (
        <View>
          <Button label="Legg til dokument" busy={busy === 'doc'} onPress={addDocs} />
          <View style={{ height: space.m }} />
          {docs.length === 0 ? <Empty text="Ingen dokumenter. Legg til tegninger, beregninger eller FDV." /> : docs.map((d) => (
            <Row key={d.id} title={d.name} sub={[fmtSize(d.size), `lagt til ${fmtDate(d.added_at.slice(0, 10))}`].filter(Boolean).join(' · ')}
              onPress={() => openDocument(d.file, d.mime).catch((e) => Alert.alert('Kunne ikke åpne', String(e)))}
              right={<Button label="Slett" kind="quiet" small onPress={() => removeDoc(d)} />} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: '#E3E7EB', borderRadius: 10, padding: 3, marginBottom: space.l },
  tab: { flex: 1, minHeight: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  tabOn: { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  tabTextOn: { color: colors.ink },
  chip: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3 },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
