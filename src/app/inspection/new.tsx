import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { InspectionType, lastInspector, saveInspection, SystemChoice } from '../../lib/db';
import { fmtDate, parseDate, todayIso } from '../../lib/format';
import { pointsFor, systemLabel, typeLabel } from '../../lib/fg';
import { colors, space } from '../../lib/theme';
import { Button, Choice, Field, Screen } from '../../components/ui';

export default function NewInspection() {
  const { buildingId } = useLocalSearchParams<{ buildingId: string }>();
  const [system, setSystem] = useState<SystemChoice | ''>('');
  const [type, setType] = useState<InspectionType | ''>('');
  const [date, setDate] = useState(fmtDate(todayIso()));
  const [inspector, setInspector] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { lastInspector().then((n) => setInspector((x) => x || n)); }, []);

  const count = system && type ? pointsFor(system, type).length : 0;

  const start = async () => {
    if (!system) return Alert.alert('Velg anleggssystem', 'Velg hvilken standard anlegget er bygget etter.');
    if (!type) return Alert.alert('Velg kontrolltype', 'Velg 1. gangskontroll eller rutinekontroll.');
    const iso = parseDate(date);
    if (!iso) return Alert.alert('Ugyldig dato', 'Skriv datoen som DD.MM.ÅÅÅÅ.');
    setBusy(true);
    try {
      const id = await saveInspection({ building_id: buildingId, date: iso, type, system, inspector: inspector.trim(), notes: notes.trim() });
      router.replace(`/inspection/${id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Ny kontroll' }} />
      <Choice<SystemChoice | ''> label="1. Hvilket system er anlegget bygget etter?" value={system} onChange={setSystem}
        options={(['12845', '16925', 'begge'] as const).map((v) => ({ value: v, label: systemLabel[v] }))} />
      <Choice<InspectionType | ''> label="2. Hvilken kontroll skal utføres?" value={type} onChange={setType}
        options={(['forste', 'rutine'] as const).map((v) => ({ value: v, label: typeLabel[v] }))} />
      {count > 0 ? (
        <Text style={{ color: colors.muted, fontSize: 14, marginBottom: space.l }}>
          Sjekklisten får {count} kontrollpunkter etter FG-920:5.{type === 'rutine' ? ' Punkter som bare kontrolleres ved 1. gangskontroll er utelatt, men du kan likevel registrere avvik på dem.' : ''}
        </Text>
      ) : null}
      <Field label="Dato" value={date} onChangeText={setDate} placeholder="DD.MM.ÅÅÅÅ" keyboardType="numbers-and-punctuation" />
      <Field label="Kontrollør" value={inspector} onChangeText={setInspector} autoComplete="name" />
      <Field label="Notat (valgfritt)" value={notes} onChangeText={setNotes} multiline placeholder="For eksempel hvem som deltok, eller områder som ikke var tilgjengelige" />
      <Button label="Start kontrollen" onPress={start} busy={busy} />
    </Screen>
  );
}
