import React, { useEffect, useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { getCompany, logoFile, removeLogo, setSetting, storeLogo } from '../lib/settings';
import { colors, space } from '../lib/theme';
import { Button, Field, Muted, Screen, Section } from '../components/ui';

export default function SettingsScreen() {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    getCompany().then((c) => { setName(c.name); setLogo(c.logo); });
  }, []);

  const pickLogo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled) return;
    setBusy('logo');
    try {
      setLogo(await storeLogo(res.assets[0].uri, res.assets[0].width));
    } catch (e) {
      Alert.alert('Logoen kunne ikke lagres', String(e));
    } finally {
      setBusy('');
    }
  };

  const save = async () => {
    setBusy('save');
    try {
      await setSetting('company_name', name.trim());
      router.back();
    } finally {
      setBusy('');
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Firma og logo' }} />
      <Muted>Firmanavn og logo vises øverst i rapportene for bygg og kontroller. Innstillingene lagres bare på denne telefonen.</Muted>
      <View style={{ height: space.l }} />
      <Field label="Firmanavn" value={name} onChangeText={setName} placeholder="Kontrollørens firma" autoCapitalize="words" />

      <Section title="Logo">
        {logo ? (
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: space.m, alignItems: 'center', marginBottom: space.m }}>
            <Image source={{ uri: logoFile(logo).uri }} style={{ width: '100%', height: 90 }} resizeMode="contain" accessibilityLabel="Firmalogo" />
          </View>
        ) : (
          <Text style={{ color: colors.muted, marginBottom: space.m }}>Ingen logo valgt.</Text>
        )}
        <View style={{ flexDirection: 'row', gap: space.s }}>
          <Button label={logo ? 'Bytt logo' : 'Velg logo'} kind="secondary" busy={busy === 'logo'} onPress={pickLogo} style={{ flex: 1 }} />
          {logo ? <Button label="Fjern logo" kind="secondary" onPress={async () => { await removeLogo(); setLogo(''); }} style={{ flex: 1 }} /> : null}
        </View>
        <Muted>Bruk gjerne en PNG med gjennomsiktig bakgrunn. Logoen skaleres ned til 600 piksler bredde.</Muted>
      </Section>

      <Button label="Lagre" onPress={save} busy={busy === 'save'} style={{ marginTop: space.xl }} />
    </Screen>
  );
}
