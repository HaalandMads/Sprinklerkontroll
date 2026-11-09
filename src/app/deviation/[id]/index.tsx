import React, { useCallback, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  closeDeviation, deleteDeviationRows, DeviationListItem, getDeviation, listInspections, listPhotos, Photo, reopenDeviation,
} from '../../../lib/db';
import { deletePhotoFiles, photoUri } from '../../../lib/files';
import { fmtDate } from '../../../lib/format';
import { pointByCode } from '../../../lib/fg';
import { colors, severityOf, space } from '../../../lib/theme';
import { CloseDialog } from '../../../components/CloseDialog';
import { Button, Muted, Screen, SeverityTag } from '../../../components/ui';

function L({ k, v }: { k: string; v?: string | null }) {
  if (!v) return null;
  return (
    <View style={{ marginBottom: space.m }}>
      <Text style={{ fontSize: 13, color: colors.muted }}>{k}</Text>
      <Text style={{ fontSize: 16, color: colors.ink }}>{v}</Text>
    </View>
  );
}

export default function DeviationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [d, setD] = useState<DeviationListItem | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [closing, setClosing] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const { width } = useWindowDimensions();

  const load = useCallback(() => { getDeviation(id).then(setD); listPhotos(id).then(setPhotos); }, [id]);
  useFocusEffect(load);
  if (!d) return <Stack.Screen options={{ title: '' }} />;

  const p = pointByCode(d.point_code);
  const closed = d.status === 'lukket';

  const close = async (comment: string, date: string) => {
    // Knytt lukkingen til siste kontroll på bygget, hvis den er senere enn da avviket ble registrert.
    const latest = (await listInspections(d.building_id))[0];
    const inspId = latest && latest.id !== d.inspection_id ? latest.id : null;
    await closeDeviation(id, comment, date, inspId);
    setClosing(false);
    load();
  };
  const remove = () => Alert.alert('Slette avviket?', 'Avviket og bildene slettes.', [
    { text: 'Avbryt', style: 'cancel' },
    { text: 'Slett', style: 'destructive', onPress: async () => { photos.forEach(deletePhotoFiles); await deleteDeviationRows(id); router.back(); } },
  ]);

  return (
    <Screen>
      <Stack.Screen options={{ title: `Avvik A-${d.nr}`, headerRight: () => <Button label="Endre" kind="quiet" small onPress={() => router.push(`/deviation/${id}/edit`)} style={{ minHeight: 36 }} /> }} />
      <View style={{ borderLeftWidth: 6, borderLeftColor: closed ? colors.closed : severityOf(d.severity).color, paddingLeft: space.m, marginBottom: space.l }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink }}>{d.title}</Text>
        <View style={{ flexDirection: 'row', gap: space.s, marginTop: space.s }}>
          <SeverityTag severity={d.severity} />
          {closed ? <SeverityTag severity={d.severity} closed /> : null}
        </View>
      </View>
      <Pressable disabled={!p} onPress={() => p && router.push(`/info/${p.code}`)}>
        <L k="Kontrollpunkt (trykk for forklaring)" v={p ? `${p.code} ${p.title}` : 'Annet avvik'} />
      </Pressable>
      <L k="Plassering / lokasjon" v={d.location} />
      <L k="Kommentar" v={d.comment} />
      <L k="Registrert" v={fmtDate(d.inspection_date)} />
      {closed ? <L k="Lukket" v={`${fmtDate(d.closed_at)}${d.closed_comment ? ` – ${d.closed_comment}` : ''}`} /> : null}

      <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 6 }}>Bilder ({photos.length})</Text>
      {photos.length === 0 ? <Muted>Ingen bilder.</Muted> : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
          {photos.map((ph, i) => (
            <Pressable key={ph.id} onPress={() => setViewer(i)} accessibilityLabel={`Bilde ${i + 1}`}>
              <Image source={{ uri: photoUri(ph.thumb) }} style={{ width: (width - space.l * 2 - space.s * 2) / 3, aspectRatio: 1, borderRadius: 6, backgroundColor: '#DDE2E6' }} />
            </Pressable>
          ))}
        </View>
      )}

      <View style={{ marginTop: space.xl, gap: space.s }}>
        {closed
          ? <Button label="Gjenåpne avvik" kind="secondary" onPress={async () => { await reopenDeviation(id); load(); }} />
          : <Button label="Marker som utbedret" onPress={() => setClosing(true)} />}
        <Button label="Slett avvik" kind="danger" onPress={remove} style={{ marginTop: space.xl }} />
      </View>

      <CloseDialog visible={closing} title={`A-${d.nr} ${d.title}`} onCancel={() => setClosing(false)} onConfirm={close} />
      <Modal visible={viewer !== null} animationType="fade" onRequestClose={() => setViewer(null)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <ScrollView horizontal pagingEnabled contentOffset={{ x: (viewer ?? 0) * width, y: 0 }}>
            {photos.map((ph) => (
              <Image key={ph.id} source={{ uri: photoUri(ph.file) }} style={{ width, height: '100%' }} resizeMode="contain" />
            ))}
          </ScrollView>
          <Pressable onPress={() => setViewer(null)} style={{ position: 'absolute', top: 48, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ fontWeight: '700', color: colors.ink }}>Lukk</Text>
          </Pressable>
        </View>
      </Modal>
    </Screen>
  );
}
