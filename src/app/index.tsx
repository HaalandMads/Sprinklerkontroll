import React, { useCallback, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { BuildingListItem, listBuildings } from '../lib/db';
import { exportAndShare } from '../lib/transfer';
import { fmtDate } from '../lib/format';
import { colors, severities, space } from '../lib/theme';
import { Button, Empty, Row, Screen, s } from '../components/ui';

export default function Buildings() {
  const [items, setItems] = useState<BuildingListItem[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const backup = async () => {
    setBusy(true);
    try { await exportAndShare('database'); } catch (e) { Alert.alert('Eksporten feilet', String(e)); } finally { setBusy(false); }
  };
  const load = useCallback(() => { listBuildings(q).then(setItems); }, [q]);
  useFocusEffect(load);

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Sprinklerkontroll', headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <Button label="Firma" kind="quiet" small onPress={() => router.push('/settings')} style={{ minHeight: 36 }} />
          <Button label="Om" kind="quiet" small onPress={() => router.push('/about')} style={{ minHeight: 36 }} />
        </View>
      ) }} />
      <Button label="Nytt bygg" onPress={() => router.push('/building/new')} />
      <View style={{ flexDirection: 'row', gap: space.s, marginTop: space.s }}>
        <Button label="Importer" kind="secondary" small onPress={() => router.push('/import')} style={{ flex: 1 }} />
        <Button label="Sikkerhetskopi av alt" kind="secondary" small busy={busy} onPress={backup} style={{ flex: 1 }} />
      </View>
      <TextInput value={q} onChangeText={setQ} placeholder="Søk etter bygg, adresse eller sted" placeholderTextColor="#8A949E" style={[s.input, { marginVertical: space.l }]} />
      {items.length === 0 ? (
        <Empty text={q ? 'Ingen bygg passer søket.' : 'Ingen bygg ennå. Legg inn det første bygget for å starte en kontroll.'} />
      ) : items.map((b) => {
        const counts = { stor: b.open_stor, middels: b.open_middels, liten: b.open_liten, merknad: b.open_merknad } as Record<string, number>;
        const addr = [b.street, [b.postal_code, b.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
        return (
          <Row key={b.id} title={b.title}
            sub={[addr, b.last_inspection ? `Sist kontrollert ${fmtDate(b.last_inspection)}` : 'Ikke kontrollert'].filter(Boolean).join('\n')}
            onPress={() => router.push(`/building/${b.id}`)}
            right={
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {severities.filter((sv) => counts[sv.key] > 0).map((sv) => (
                  <View key={sv.key} style={{ minWidth: 26, height: 26, borderRadius: 13, backgroundColor: sv.color, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}
                    accessibilityLabel={`${counts[sv.key]} åpne avvik, ${sv.label}`}>
                    <Text style={{ color: sv.text, fontWeight: '700', fontSize: 13 }}>{counts[sv.key]}</Text>
                  </View>
                ))}
              </View>
            } />
        );
      })}
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: space.xl, textAlign: 'center' }}>Sprinklerkontroll · laget av Mads Fjærem</Text>
    </Screen>
  );
}
