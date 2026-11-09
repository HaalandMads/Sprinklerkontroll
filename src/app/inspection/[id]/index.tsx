import React, { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  closeDeviation, DeviationListItem, deviationCountsByPoint, getInspection, Inspection, listCarriedDeviations,
  listDeviationsForInspection, listPointStates, PointState, reopenDeviation,
} from '../../../lib/db';
import { fmtDate } from '../../../lib/format';
import { groupByPosition, pointByCode, pointsFor, systemLabel, typeLabel } from '../../../lib/fg';
import { colors, severityOf, space } from '../../../lib/theme';
import { CloseDialog } from '../../../components/CloseDialog';
import { Button, Empty, Muted, Row, Screen, Section, SeverityTag } from '../../../components/ui';

const statusInfo = (st: string | undefined, n: number) => {
  if (n > 0 || st === 'avvik') return { label: n > 0 ? `Avvik (${n})` : 'Avvik', bg: '#C62828', fg: '#fff' };
  if (st === 'ok') return { label: 'OK', bg: colors.closed, fg: '#fff' };
  if (st === 'ia') return { label: 'Ikke aktuelt', bg: '#AEB7BF', fg: colors.ink };
  return { label: 'Ikke vurdert', bg: '#fff', fg: colors.muted };
};

export default function InspectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [insp, setInsp] = useState<Inspection | null>(null);
  const [states, setStates] = useState<Map<string, PointState>>(new Map());
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [devs, setDevs] = useState<DeviationListItem[]>([]);
  const [carried, setCarried] = useState<DeviationListItem[]>([]);
  const [closing, setClosing] = useState<DeviationListItem | null>(null);

  const load = useCallback(() => {
    (async () => {
      const i = await getInspection(id);
      setInsp(i);
      if (!i) return;
      setStates(await listPointStates(id));
      setCounts(await deviationCountsByPoint(id));
      setDevs(await listDeviationsForInspection(id));
      setCarried(await listCarriedDeviations(i));
    })();
  }, [id]);
  useFocusEffect(load);

  const groups = useMemo(() => (insp ? groupByPosition(pointsFor(insp.system, insp.type)) : []), [insp]);
  if (!insp) return <Stack.Screen options={{ title: '' }} />;
  const all = groups.flatMap((g) => g.points);
  const done = all.filter((p) => (states.get(p.code)?.status ?? '') !== '' || (counts.get(p.code) ?? 0) > 0).length;
  const extra = devs.filter((d) => !d.point_code || !all.some((p) => p.code === d.point_code));

  return (
    <Screen>
      <Stack.Screen options={{ title: `Kontroll ${fmtDate(insp.date)}`, headerRight: () => <Button label="Endre" kind="quiet" small onPress={() => router.push(`/inspection/${id}/edit`)} style={{ minHeight: 36 }} /> }} />
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink }}>{typeLabel[insp.type]}</Text>
      <Text style={{ fontSize: 15, color: colors.muted }}>{systemLabel[insp.system]}{insp.inspector ? ` · ${insp.inspector}` : ''}</Text>
      <Text style={{ fontSize: 15, color: colors.ink, marginTop: space.s }}>{done} av {all.length} kontrollpunkter vurdert · {devs.length} avvik registrert</Text>
      {insp.notes ? <Muted>{insp.notes}</Muted> : null}
      <Button label="Nytt avvik" onPress={() => router.push(`/deviation/new?inspectionId=${id}`)} style={{ marginTop: space.l }} />

      {carried.length > 0 && (
        <Section title="Avvik fra tidligere kontroller">
          <Muted>Lukk avvik som er utbedret siden sist.</Muted>
          <View style={{ height: space.s }} />
          {carried.map((d) => {
            const closedHere = d.status === 'lukket';
            return (
              <Row key={d.id} title={`A-${d.nr}  ${d.title}`}
                sub={[pointByCode(d.point_code)?.code, d.location, `Registrert ${fmtDate(d.inspection_date)}`].filter(Boolean).join(' · ')}
                left={<View style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: closedHere ? colors.closed : severityOf(d.severity).color }} />}
                onPress={() => router.push(`/deviation/${d.id}`)}
                right={closedHere
                  ? <Button label="Angre" kind="quiet" small onPress={async () => { await reopenDeviation(d.id); load(); }} />
                  : <Button label="Utbedret" kind="secondary" small onPress={() => setClosing(d)} />} />
            );
          })}
        </Section>
      )}

      <Section title="Sjekkliste etter FG-920">
        {groups.map((g) => (
          <View key={g.pos} style={{ marginBottom: space.m }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.muted, marginBottom: 6 }}>Pos. {g.pos}  {g.title}</Text>
            {g.points.map((p) => {
              const si = statusInfo(states.get(p.code)?.status, counts.get(p.code) ?? 0);
              return (
                <Row key={p.code} title={`${p.code}  ${p.title}`} onPress={() => router.push(`/inspection/${id}/point/${p.code}`)}
                  right={<View style={{ backgroundColor: si.bg, borderColor: colors.line, borderWidth: si.bg === '#fff' ? 1 : 0, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3 }}>
                    <Text style={{ color: si.fg, fontSize: 12, fontWeight: '700' }}>{si.label}</Text>
                  </View>} />
              );
            })}
          </View>
        ))}
      </Section>

      <Section title="Andre avvik i denne kontrollen">
        {extra.length === 0 ? <Empty text="Ingen avvik utenfor sjekklisten." /> : extra.map((d) => (
          <Row key={d.id} title={`A-${d.nr}  ${d.title}`} sub={pointByCode(d.point_code) ? `${d.point_code} ${pointByCode(d.point_code)!.title}` : 'Annet avvik'}
            right={<SeverityTag severity={d.severity} closed={d.status === 'lukket'} />} onPress={() => router.push(`/deviation/${d.id}`)} />
        ))}
      </Section>

      <CloseDialog visible={!!closing} title={closing ? `A-${closing.nr} ${closing.title}` : ''} onCancel={() => setClosing(null)}
        onConfirm={async (comment, date) => {
          if (!closing) return;
          await closeDeviation(closing.id, comment, date, id);
          setClosing(null);
          load();
        }} />
    </Screen>
  );
}
