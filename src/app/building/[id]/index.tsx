import React, { useCallback, useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  Building, deleteBuildingRows, DeviationListItem, Doc, InspectionListItem, addDocRow, deleteDocRow, getBuilding,
  listDeviationsForBuilding, listDocs, listInspections, listPhotosForBuilding,
} from '../../../lib/db';
import { deleteDocumentFile, deletePhotoFiles, openDocument, storeDocument } from '../../../lib/files';
import { fmtDate, fmtSize, uid } from '../../../lib/format';
import { pointByCode, systemLabel, typeLabel } from '../../../lib/fg';
import { printReport, shareCsv, sharePdf } from '../../../lib/report';
import { colors, severityOf, space } from '../../../lib/theme';
import { Button, Choice, Empty, Muted, Row, Screen, Section, SeverityTag } from '../../../components/ui';

type Filter = 'apen' | 'lukket' | 'alle';

export default function BuildingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [b, setB] = useState<Building | null>(null);
  const [devs, setDevs] = useState<DeviationListItem[]>([]);
  const [insps, setInsps] = useState<InspectionListItem[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [filter, setFilter] = useState<Filter>('apen');
  const [withClosed, setWithClosed] = useState<'nei' | 'ja'>('nei');
  const [busy, setBusy] = useState<string>('');

  const load = useCallback(() => {
    getBuilding(id).then(setB);
    listDeviationsForBuilding(id).then(setDevs);
    listInspections(id).then(setInsps);
    listDocs(id).then(setDocs);
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

  const removeBuilding = () => Alert.alert('Slette bygget?', 'Bygget, alle kontroller, avvik, bilder og dokumenter slettes fra telefonen. Dette kan ikke angres.', [
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
  const shown = devs.filter((d) => filter === 'alle' || d.status === filter);
  const openCount = devs.filter((d) => d.status === 'apen').length;

  return (
    <Screen>
      <Stack.Screen options={{ title: b.title, headerRight: () => <Button label="Endre" kind="quiet" small onPress={() => router.push(`/building/${id}/edit`)} style={{ minHeight: 36 }} /> }} />
      {addr ? <Text style={{ fontSize: 16, color: colors.ink }}>{addr}</Text> : null}
      <View style={{ marginTop: space.s, gap: 4 }}>
        {b.contact_name ? <Text style={{ fontSize: 15, color: colors.ink }}>{b.contact_name}</Text> : null}
        {b.contact_phone ? <Text style={{ fontSize: 15, color: colors.accent }} onPress={() => Linking.openURL(`tel:${b.contact_phone.replace(/\s/g, '')}`)}>{b.contact_phone}</Text> : null}
        {b.contact_email ? <Text style={{ fontSize: 15, color: colors.accent }} onPress={() => Linking.openURL(`mailto:${b.contact_email}`)}>{b.contact_email}</Text> : null}
      </View>

      <Button label="Start ny kontroll" onPress={() => router.push(`/inspection/new?buildingId=${id}`)} style={{ marginTop: space.l }} />

      <Section title={`Avvik (${openCount} åpne)`}>
        <Choice<Filter> value={filter} onChange={setFilter} options={[{ value: 'apen', label: 'Åpne' }, { value: 'lukket', label: 'Lukkede' }, { value: 'alle', label: 'Alle' }]} />
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
      </Section>

      <Section title="Kontroller">
        {insps.length === 0 ? <Empty text="Ingen kontroller ennå." /> : insps.map((i) => (
          <Row key={i.id} title={`${fmtDate(i.date)}  ${typeLabel[i.type] ?? i.type}`}
            sub={`${systemLabel[i.system] ?? i.system}${i.inspector ? ` · ${i.inspector}` : ''}\n${i.new_count} nye avvik · ${i.closed_count} lukket`}
            onPress={() => router.push(`/inspection/${i.id}`)} />
        ))}
      </Section>

      <Section title="Dokumenter" right={<Button label="Legg til" small kind="secondary" busy={busy === 'doc'} onPress={addDocs} />}>
        {docs.length === 0 ? <Empty text="Ingen dokumenter. Legg til tegninger, beregninger eller FDV." /> : docs.map((d) => (
          <Row key={d.id} title={d.name} sub={[fmtSize(d.size), `lagt til ${fmtDate(d.added_at.slice(0, 10))}`].filter(Boolean).join(' · ')}
            onPress={() => openDocument(d.file, d.mime).catch((e) => Alert.alert('Kunne ikke åpne', String(e)))}
            right={<Button label="Slett" kind="quiet" small onPress={() => removeDoc(d)} />} />
        ))}
      </Section>

      <Section title="Avviksoversikt">
        <Choice<'nei' | 'ja'> label="Ta med lukkede avvik" value={withClosed} onChange={setWithClosed} options={[{ value: 'nei', label: 'Nei, bare åpne' }, { value: 'ja', label: 'Ja' }]} />
        <View style={{ flexDirection: 'row', gap: space.s, flexWrap: 'wrap' }}>
          <Button label="Del PDF" busy={busy === 'pdf'} onPress={() => run('pdf', () => sharePdf(id, withClosed === 'ja'))} style={{ flexGrow: 1 }} />
          <Button label="Skriv ut" kind="secondary" busy={busy === 'print'} onPress={() => run('print', () => printReport(id, withClosed === 'ja'))} style={{ flexGrow: 1 }} />
          <Button label="Del CSV" kind="secondary" busy={busy === 'csv'} onPress={() => run('csv', () => shareCsv(id, withClosed === 'ja'))} style={{ flexGrow: 1 }} />
        </View>
        <Muted>Oversikten inneholder kontaktopplysninger. Del den bare innenfor godkjente systemer.</Muted>
      </Section>

      <Button label="Slett bygg" kind="danger" onPress={removeBuilding} style={{ marginTop: space.xl * 2 }} />
    </Screen>
  );
}
