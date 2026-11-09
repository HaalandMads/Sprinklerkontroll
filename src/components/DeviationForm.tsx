import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { DeviationInput } from '../lib/db';
import { pointByCode, suggestedSeverity } from '../lib/fg';
import { deletePhotoFiles, photoUri, storePhoto } from '../lib/files';
import { colors, severities, Severity, space } from '../lib/theme';
import { PointInfo } from './PointInfo';
import { PointPicker } from './PointPicker';
import { Button, Choice, Field, Screen } from './ui';

export const MAX_PHOTOS = 10;
export type PhotoItem = { id: string; file: string; thumb: string; isNew?: boolean };

type Props = {
  initial: DeviationInput;
  initialPhotos: PhotoItem[];
  saveLabel: string;
  onSave: (d: DeviationInput, photos: PhotoItem[], removed: PhotoItem[]) => Promise<void>;
};

export function DeviationForm({ initial, initialPhotos, saveLabel, onSave }: Props) {
  const [d, setD] = useState<DeviationInput>(initial);
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [removed, setRemoved] = useState<PhotoItem[]>([]);
  const [picker, setPicker] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [working, setWorking] = useState(false);
  const saved = useRef(false);
  const photosRef = useRef(photos);
  useEffect(() => { photosRef.current = photos; }, [photos]);

  // Bilder som er tatt, men aldri lagret på avviket, slettes når skjermen lukkes.
  useEffect(() => () => {
    if (!saved.current) photosRef.current.filter((p) => p.isNew).forEach(deletePhotoFiles);
  }, []);

  const point = pointByCode(d.point_code);
  const set = (k: keyof DeviationInput) => (v: string) => setD((x) => ({ ...x, [k]: v }));

  const add = async (source: 'camera' | 'library') => {
    const left = MAX_PHOTOS - photos.length;
    if (left <= 0) return Alert.alert('Maks 10 bilder', 'Fjern et bilde før du legger til et nytt.');
    let res: ImagePicker.ImagePickerResult;
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return Alert.alert('Kamera er ikke tillatt', 'Gi appen tilgang til kameraet i innstillingene på telefonen.');
      res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 });
    } else {
      res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: left, quality: 0.9 });
    }
    if (res.canceled) return;
    setWorking(true);
    try {
      const stored: PhotoItem[] = [];
      for (const a of res.assets.slice(0, left)) {
        const p = await storePhoto(a.uri, a.width);
        stored.push({ ...p, isNew: true });
      }
      setPhotos((x) => [...x, ...stored].slice(0, MAX_PHOTOS));
    } catch (e) {
      Alert.alert('Bildet kunne ikke lagres', String(e));
    } finally {
      setWorking(false);
    }
  };

  const remove = (p: PhotoItem) => {
    setPhotos((x) => x.filter((y) => y.id !== p.id));
    if (p.isNew) deletePhotoFiles(p);
    else setRemoved((r) => [...r, p]);
  };

  const save = async () => {
    if (!d.title.trim()) return Alert.alert('Mangler overskrift', 'Skriv en kort overskrift for avviket.');
    setBusy(true);
    try {
      await onSave({ ...d, title: d.title.trim(), location: d.location.trim(), comment: d.comment.trim() }, photos, removed);
      saved.current = true;
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={st.label}>Kontrollpunkt</Text>
      <View style={st.pointBox}>
        <Text style={st.pointText}>{point ? `${point.code} ${point.title}` : 'Annet avvik (uten kontrollpunkt)'}</Text>
        <View style={{ flexDirection: 'row', gap: space.s, marginTop: space.s }}>
          <Button label="Velg kontrollpunkt" kind="secondary" small onPress={() => setPicker(true)} />
          {point ? <Button label={showInfo ? 'Skjul forklaring' : 'Vis forklaring'} kind="quiet" small onPress={() => setShowInfo((v) => !v)} /> : null}
        </View>
      </View>

      {point && point.avvik.length > 0 && !showInfo ? (
        <View style={{ marginBottom: space.m }}>
          <Text style={st.label}>Typiske avvik etter FG-920</Text>
          {point.avvik.map((a, i) => (
            <Pressable key={i} onPress={() => setD((x) => ({ ...x, title: a.text, severity: suggestedSeverity(a.cats) }))}
              style={({ pressed }) => [st.tpl, pressed && { backgroundColor: '#E9EDF1' }]}>
              <Text style={st.tplText}>{a.text}</Text>
            </Pressable>
          ))}
          <Text style={st.hint}>Trykk for å bruke teksten og FGs anbefalte kategori. Du kan endre begge.</Text>
        </View>
      ) : null}
      {point && showInfo ? (
        <View style={st.info}>
          <PointInfo point={point} onUseTemplate={(a) => { setD((x) => ({ ...x, title: a.text, severity: suggestedSeverity(a.cats) })); setShowInfo(false); }} />
        </View>
      ) : null}

      <Field label="Overskrift" value={d.title} onChangeText={set('title')} placeholder="Kort beskrivelse av avviket" multiline />
      <Field label="Plassering / lokasjon" value={d.location} onChangeText={set('location')} placeholder="For eksempel 2. etasje, korridor ved trapp B" />
      <Field label="Kommentar" value={d.comment} onChangeText={set('comment')} placeholder="Detaljer, mål, hjemmel" multiline />
      <Choice<Severity> label="Alvorlighetsgrad (FG-920)" value={d.severity} onChange={(v) => setD((x) => ({ ...x, severity: v }))}
        options={severities.map((s) => ({ value: s.key, label: s.label, color: s.color, text: s.text }))} />

      <Text style={st.label}>Bilder ({photos.length} av {MAX_PHOTOS})</Text>
      <View style={st.grid}>
        {photos.map((p) => (
          <View key={p.id} style={st.thumbWrap}>
            <Image source={{ uri: photoUri(p.thumb) }} style={st.thumb} />
            <Pressable onPress={() => remove(p)} style={st.del} accessibilityLabel="Fjern bilde" hitSlop={8}>
              <Text style={st.delText}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: space.s, marginBottom: space.l }}>
        <Button label="Ta bilde" onPress={() => add('camera')} busy={working} disabled={photos.length >= MAX_PHOTOS} style={{ flex: 1 }} kind="secondary" />
        <Button label="Velg fra galleri" onPress={() => add('library')} disabled={working || photos.length >= MAX_PHOTOS} style={{ flex: 1 }} kind="secondary" />
      </View>

      <Button label={saveLabel} onPress={save} busy={busy} disabled={working} />
      <PointPicker visible={picker} onClose={() => setPicker(false)} onPick={(code) => { setD((x) => ({ ...x, point_code: code })); setPicker(false); setShowInfo(false); }} />
    </Screen>
  );
}

const st = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  hint: { fontSize: 13, color: colors.muted, marginTop: 2 },
  pointBox: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: space.m, marginBottom: space.m },
  pointText: { fontSize: 16, fontWeight: '600', color: colors.ink },
  tpl: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: space.m, marginBottom: 6 },
  tplText: { fontSize: 15, color: colors.ink },
  info: { backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.line, padding: space.m, marginBottom: space.m },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s, marginBottom: space.s },
  thumbWrap: { width: 96, height: 96 },
  thumb: { width: 96, height: 96, borderRadius: 6, backgroundColor: '#DDE2E6' },
  del: { position: 'absolute', top: -6, right: -6, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  delText: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: -2 },
});
