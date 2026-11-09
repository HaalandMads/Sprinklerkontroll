import React from 'react';
import { Text } from 'react-native';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { colors, space } from '../lib/theme';
import { Screen } from '../components/ui';

function P({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 15, lineHeight: 22, color: colors.ink, marginBottom: space.m }}>{children}</Text>;
}

export default function About() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Om appen' }} />
      <Text style={{ fontSize: 26, fontWeight: '700', color: colors.ink }}>Sprinklerkontroll</Text>
      <Text style={{ color: colors.muted, marginBottom: space.l }}>Versjon {Constants.expoConfig?.version ?? '1.0.0'} · laget av Mads Fjærem</Text>
      <P>Appen brukes til kontroll av sprinkleranlegg etter NS-EN 12845 og boligsprinkleranlegg etter NS-EN 16925. Du legger inn bygg med kontaktperson og dokumenter, gjennomfører kontroller etter FG-920:5 og registrerer avvik med bilder.</P>
      <P>Sjekklisten bygges ut fra valgt anleggssystem og kontrolltype. Ved uavhengig 1. gangskontroll kommer alle kontrollpunkter med. Ved rutinekontroll kommer bare punktene FG har merket for rutinekontroll. Andre avvik kan alltid legges til.</P>
      <P>Forklaringene til kontrollpunktene og de anbefalte kategoriene er hentet fra FG-920:5 (gyldig fra 01.11.2024). Innholdet tilhører FG. Kontrolløren skal alltid gjøre en selvstendig vurdering.</P>
      <P>Alle data lagres bare på denne telefonen. De sikkerhetskopieres ikke automatisk. Rapporter inneholder kontaktopplysninger og skal ikke deles utenfor godkjente systemer.</P>
      <P>Testversjon for intern bruk.</P>
    </Screen>
  );
}
