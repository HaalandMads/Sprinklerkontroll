import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router, Stack } from 'expo-router';
import { fmtDate } from '../lib/format';
import { importPackage, ImportResult, Package, Policy, readPackage, scopeLabel } from '../lib/transfer';
import { colors, space } from '../lib/theme';
import { Button, Choice, Muted, Screen, Section } from '../components/ui';

export default function ImportScreen() {
  const [pkg, setPkg] = useState<Package | null>(null);
  const [policy, setPolicy] = useState<Policy>('fil');
  const [busy, setBusy] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream', '*/*'], copyToCacheDirectory: true });
    if (res.canceled) return;
    setBusy('les'); setResult(null);
    try {
      setPkg(await readPackage(res.assets[0].uri));
    } catch (e) {
      setPkg(null);
      Alert.alert('Kunne ikke lese filen', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy('');
    }
  };

  const run = async () => {
    if (!pkg) return;
    setBusy('import');
    try {
      setResult(await importPackage(pkg, policy));
    } catch (e) {
      Alert.alert('Importen feilet', `${e instanceof Error ? e.message : String(e)}\n\nIngenting i databasen ble endret.`);
    } finally {
      setBusy('');
    }
  };

  const c = pkg?.manifest.counts;
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Importer' }} />
      <Muted>Velg en eksportfil fra Sprinklerkontroll, for eksempel fra OneDrive, e-post eller Teams. Den kan inneholde hele databasen, ett bygg med all historikk eller én kontroll.</Muted>
      <Button label={pkg ? 'Velg en annen fil' : 'Velg fil'} onPress={pick} busy={busy === 'les'} style={{ marginTop: space.l }} />

      {pkg && c ? (
        <Section title="Innhold i filen">
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: space.m }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>{scopeLabel[pkg.manifest.scope]}</Text>
            <Text style={{ fontSize: 15, color: colors.ink, marginTop: 2 }}>{pkg.manifest.label}</Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 6 }}>
              Laget {fmtDate(pkg.manifest.created_at.slice(0, 10))}{pkg.manifest.app_version ? ` med versjon ${pkg.manifest.app_version}` : ''}
            </Text>
            <Text style={{ fontSize: 14, color: colors.ink, marginTop: 6, lineHeight: 20 }}>
              {c.buildings} bygg · {c.inspections} kontroller · {c.deviations} avvik · {c.photos} bilder{'\n'}
              {c.capacity_tests} kapasitetsmålinger · {c.documents} dokumenter
            </Text>
          </View>
          <Choice<Policy> label="Hvis noe finnes både i filen og på telefonen" value={policy} onChange={setPolicy} options={[
            { value: 'fil', label: 'Bruk det som er i filen' },
            { value: 'behold', label: 'Behold det på telefonen' },
          ]} />
          <Muted>Nye bygg, kontroller og avvik legges alltid til. Ingenting slettes. Får et nytt avvik samme nummer som et eksisterende, får det neste ledige nummer.</Muted>
          <Button label="Importer" onPress={run} busy={busy === 'import'} style={{ marginTop: space.l }} />
        </Section>
      ) : null}

      {result ? (
        <Section title="Ferdig">
          <Text style={{ fontSize: 15, color: colors.ink, lineHeight: 22 }}>
            {result.added} nye rader lagt til, {result.updated} oppdatert{result.skipped ? `, ${result.skipped} beholdt uendret` : ''}.{'\n'}
            {result.files} filer (bilder og dokumenter) lagret.
            {result.renumbered ? `\n${result.renumbered} avvik fikk nytt nummer fordi nummeret var i bruk.` : ''}
          </Text>
          <Button label="Til byggene" onPress={() => router.dismissTo('/')} style={{ marginTop: space.l }} />
        </Section>
      ) : null}
    </Screen>
  );
}
