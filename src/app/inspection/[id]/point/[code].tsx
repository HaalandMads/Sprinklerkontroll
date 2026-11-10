import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { DeviationListItem, getInspection, Inspection, listDeviationsForPoint, listPointStates, PointStatus, setPointState } from '../../../../lib/db';
import { pointByCode, pointsFor } from '../../../../lib/fg';
import { colors, space } from '../../../../lib/theme';
import { PointInfo } from '../../../../components/PointInfo';
import { Button, Choice, Empty, Field, Row, Screen, Section, SeverityTag } from '../../../../components/ui';

export default function PointScreen() {
  const { id, code } = useLocalSearchParams<{ id: string; code: string }>();
  const point = pointByCode(code);
  const [insp, setInsp] = useState<Inspection | null>(null);
  const [status, setStatus] = useState<PointStatus>('');
  const [note, setNote] = useState('');
  const [devs, setDevs] = useState<DeviationListItem[]>([]);

  const load = useCallback(() => {
    (async () => {
      setInsp(await getInspection(id));
      const st = (await listPointStates(id)).get(code);
      setStatus(st?.status ?? '');
      setNote(st?.note ?? '');
      setDevs(await listDeviationsForPoint(id, code));
    })();
  }, [id, code]);
  useFocusEffect(load);

  if (!point || !insp) return <Stack.Screen options={{ title: code }} />;

  const changeStatus = async (v: PointStatus) => { setStatus(v); await setPointState(id, code, v, note); };
  const list = pointsFor(insp.system, insp.type);
  const idx = list.findIndex((p) => p.code === code);
  const prev = idx > 0 ? list[idx - 1] : undefined;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined;
  const go = async (target: string) => {
    await setPointState(id, code, status, note);
    router.replace(`/inspection/${id}/point/${target}`);
  };
  const nav = (
    <View style={{ flexDirection: 'row', gap: space.s, marginBottom: space.m }}>
      <Button label={prev ? `‹  ${prev.code}` : 'Første punkt'} kind="secondary" small disabled={!prev} onPress={() => prev && go(prev.code)} style={{ flex: 1 }} />
      <Text style={{ alignSelf: 'center', color: colors.muted, fontSize: 13 }}>{idx >= 0 ? `${idx + 1} av ${list.length}` : ''}</Text>
      <Button label={next ? `${next.code}  ›` : 'Siste punkt'} kind="secondary" small disabled={!next} onPress={() => next && go(next.code)} style={{ flex: 1 }} />
    </View>
  );
  const newDev = (tpl?: number) => router.push(`/deviation/new?inspectionId=${id}&point=${code}${tpl !== undefined ? `&tpl=${tpl}` : ''}`);

  return (
    <Screen>
      <Stack.Screen options={{ title: `Kontrollpunkt ${point.code}` }} />
      {nav}
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: space.m }}>{point.code} {point.title}</Text>
      <Choice<PointStatus> label="Status" value={status} onChange={changeStatus} options={[
        { value: '', label: 'Ikke vurdert' },
        { value: 'ok', label: 'OK', color: colors.closed },
        { value: 'avvik', label: 'Avvik', color: '#C62828' },
        { value: 'ia', label: 'Ikke aktuelt', color: '#AEB7BF', text: colors.ink },
      ]} />
      <Field label="Notat til punktet" value={note} onChangeText={setNote} onBlur={() => setPointState(id, code, status, note)} multiline placeholder="For eksempel hva som er kontrollert" />

      <Section title={`Avvik på punktet (${devs.length})`} right={<Button label="Nytt avvik" small onPress={() => newDev()} />}>
        {devs.length === 0 ? <Empty text="Ingen avvik registrert på dette punktet." /> : devs.map((d) => (
          <Row key={d.id} title={`A-${d.nr}  ${d.title}`} sub={d.location || undefined}
            right={<SeverityTag severity={d.severity} closed={d.status === 'lukket'} />} onPress={() => router.push(`/deviation/${d.id}`)} />
        ))}
      </Section>

      <Section title="Forklaring fra FG-920">
        <PointInfo point={point} system={insp.system} onUseTemplate={(_, i) => newDev(i)} />
      </Section>
      <View style={{ height: space.l }} />
      {nav}
    </Screen>
  );
}
