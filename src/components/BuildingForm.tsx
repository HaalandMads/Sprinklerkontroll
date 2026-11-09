import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import type { BuildingInput } from '../lib/db';
import { Button, Field, Screen } from './ui';

const empty: BuildingInput = { title: '', street: '', postal_code: '', city: '', contact_name: '', contact_phone: '', contact_email: '' };

export function BuildingForm({ initial, onSave, saveLabel }: { initial?: BuildingInput; onSave: (b: BuildingInput) => Promise<void>; saveLabel: string }) {
  const [b, setB] = useState<BuildingInput>(initial ?? empty);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof BuildingInput) => (v: string) => setB((x) => ({ ...x, [k]: v }));

  const save = async () => {
    if (!b.title.trim()) return Alert.alert('Mangler overskrift', 'Skriv inn et navn på bygget.');
    if (b.postal_code && !/^\d{4}$/.test(b.postal_code.trim())) return Alert.alert('Ugyldig postnummer', 'Postnummeret skal ha fire siffer.');
    if (b.contact_email && !/^\S+@\S+\.\S+$/.test(b.contact_email.trim())) return Alert.alert('Ugyldig e-post', 'Sjekk e-postadressen.');
    setBusy(true);
    try {
      const t = (x: string) => x.trim();
      await onSave({ title: t(b.title), street: t(b.street), postal_code: t(b.postal_code), city: t(b.city), contact_name: t(b.contact_name), contact_phone: t(b.contact_phone), contact_email: t(b.contact_email) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Field label="Overskrift" value={b.title} onChangeText={set('title')} placeholder="For eksempel Kvitberget 6, BEKO-hallen" />
      <Field label="Gatenavn og nummer" value={b.street} onChangeText={set('street')} autoComplete="street-address" />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 110 }}>
          <Field label="Postnummer" value={b.postal_code} onChangeText={set('postal_code')} keyboardType="number-pad" maxLength={4} />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Sted" value={b.city} onChangeText={set('city')} />
        </View>
      </View>
      <Field label="Kontaktperson" value={b.contact_name} onChangeText={set('contact_name')} autoComplete="name" />
      <Field label="Mobilnummer" value={b.contact_phone} onChangeText={set('contact_phone')} keyboardType="phone-pad" autoComplete="tel" />
      <Field label="E-post" value={b.contact_email} onChangeText={set('contact_email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Button label={saveLabel} onPress={save} busy={busy} style={{ marginTop: 8 }} />
    </Screen>
  );
}
