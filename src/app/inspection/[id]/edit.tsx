import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { deleteInspectionRows, getInspection, Inspection, listDeviationsForInspection, listPhotos, saveInspection } from '../../../lib/db';
import { deletePhotoFiles } from '../../../lib/files';
import { fmtDate, parseDate } from '../../../lib/format';
import { systemLabel, typeLabel } from '../../../lib/fg';
import { space } from '../../../lib/theme';
import { Button, Field, Muted, Screen } from '../../../components/ui';

export default function EditInspection() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [insp, setInsp] = useState<Inspection | null>(null);
  const [date, setDate] = useState('');
  const [inspector, setInspector] = useState('');
  const [notes, setNotes] = useState('');
  useEffect(() => {
    getInspection(id).then((i) => {
      if (!i) return;
      setInsp(i); setDate(fmtDate(i.date)); setInspector(i.inspector); setNotes(i.notes);
    });
  }, [id]);
  if (!insp) return <Stack.Screen options={{ title: 'Endre kontroll' }} />;

  const save = async () => {
    const iso = parseDate(date);
    if (!iso) return Alert.alert('Ugyldig dato', 'Skriv datoen som DD.MM.ÅÅÅÅ.');
    await saveInspection({ ...insp, date: iso, inspector: inspector.trim(), notes: notes.trim() }, id);
    router.back();
  };
  const remove = () => Alert.alert('Slette kontrollen?', 'Kontrollen og alle avvik som ble registrert i den, med bilder, slettes. Avvik som ble lukket i denne kontrollen beholdes.', [
    { text: 'Avbryt', style: 'cancel' },
    { text: 'Slett', style: 'destructive', onPress: async () => {
      for (const d of await listDeviationsForInspection(id)) (await listPhotos(d.id)).forEach(deletePhotoFiles);
      await deleteInspectionRows(id);
      router.dismiss(2);
    } },
  ]);

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Endre kontroll' }} />
      <Muted>{typeLabel[insp.type]} · {systemLabel[insp.system]}. Anleggssystem og kontrolltype kan ikke endres. Start en ny kontroll hvis de er feil.</Muted>
      <Field label="Dato" value={date} onChangeText={setDate} placeholder="DD.MM.ÅÅÅÅ" keyboardType="numbers-and-punctuation" />
      <Field label="Kontrollør" value={inspector} onChangeText={setInspector} />
      <Field label="Notat" value={notes} onChangeText={setNotes} multiline />
      <Button label="Lagre endringer" onPress={save} />
      <Button label="Slett kontroll" kind="danger" onPress={remove} style={{ marginTop: space.xl * 2 }} />
    </Screen>
  );
}
