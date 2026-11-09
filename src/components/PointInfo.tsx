import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FgAvvik, FgPoint } from '../data/fg920';
import { categoryLabel, positionTitle, refsFor } from '../lib/fg';
import type { SystemChoice } from '../lib/db';
import { colors, severities, space } from '../lib/theme';

const catColor = (c: string) => severities.find((x) => x.key === c)?.color ?? '#3B3B3B';
const catText = (c: string) => severities.find((x) => x.key === c)?.text ?? '#FFFFFF';

/** Forklaring til et kontrollpunkt slik det står i FG-920:5, veiledningsskjema A-2. */
export function PointInfo({ point, system = 'begge', onUseTemplate }: { point: FgPoint; system?: SystemChoice; onUseTemplate?: (a: FgAvvik, index: number) => void }) {
  const showBolig = system !== '12845' && point.bolig.length > 0;
  return (
    <View>
      <Text style={st.pos}>Pos. {point.pos} {positionTitle(point.pos)}</Text>
      <Text style={st.title}>{point.code} {point.title}</Text>
      <Text style={st.meta}>{refsFor(point, system)}</Text>
      <Text style={st.meta}>
        Kontrolleres ved: {[point.first ? 'uavhengig 1. gangskontroll' : null, point.routine ? 'rutinekontroll' : null].filter(Boolean).join(' og ')}
      </Text>

      {point.scope.length > 0 && (
        <>
          <Text style={st.h}>Dette skal kontrolleres</Text>
          {point.scope.map((x, i) => <Text key={i} style={st.li}>•  {x}</Text>)}
        </>
      )}
      {showBolig && (
        <>
          <Text style={st.h}>Særskilt for bolig</Text>
          {point.bolig.map((x, i) => <Text key={i} style={st.li}>•  {x}</Text>)}
        </>
      )}
      {point.avvik.length > 0 && (
        <>
          <Text style={st.h}>Typiske avvik og anbefalt kategori</Text>
          {onUseTemplate ? <Text style={st.note}>Trykk på et avvik for å registrere det med foreslått kategori.</Text> : null}
          {point.avvik.map((a, i) => (
            <Pressable key={i} disabled={!onUseTemplate} onPress={() => onUseTemplate?.(a, i)}
              style={({ pressed }) => [st.av, pressed && { backgroundColor: '#E9EDF1' }]}>
              <Text style={st.avText}>{a.text}</Text>
              <View style={st.cats}>
                {a.cats.length === 0 ? <Text style={st.note}>Se kommentar</Text> : a.cats.map((c) => (
                  <View key={c} style={[st.cat, { backgroundColor: catColor(c) }]}>
                    <Text style={[st.catText, { color: catText(c) }]}>{categoryLabel[c]}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
        </>
      )}
      {point.trekk ? (
        <>
          <Text style={st.h}>Maksimalt trekk</Text>
          <Text style={st.body}>{point.trekk.split('|').map((x) => x.trim()).join('   ·   ')}</Text>
        </>
      ) : null}
      {point.comment ? (
        <>
          <Text style={st.h}>Kommentar</Text>
          <Text style={st.body}>{point.comment}</Text>
        </>
      ) : null}
      <Text style={st.source}>Kilde: FG-920:5, veiledningsskjema side {point.page}. Kontrolløren skal gjøre en selvstendig vurdering.</Text>
    </View>
  );
}

const st = StyleSheet.create({
  pos: { color: colors.muted, fontSize: 14 },
  title: { color: colors.ink, fontSize: 20, fontWeight: '700', marginTop: 2 },
  meta: { color: colors.muted, fontSize: 14, marginTop: 4 },
  h: { color: colors.ink, fontSize: 16, fontWeight: '700', marginTop: space.l, marginBottom: space.s },
  li: { color: colors.ink, fontSize: 15, lineHeight: 21, marginBottom: 3 },
  body: { color: colors.ink, fontSize: 15, lineHeight: 21 },
  note: { color: colors.muted, fontSize: 13, marginBottom: 6 },
  av: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: space.m, marginBottom: 6 },
  avText: { color: colors.ink, fontSize: 15, lineHeight: 20 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  cat: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  catText: { fontSize: 12, fontWeight: '700' },
  source: { color: colors.muted, fontSize: 12, marginTop: space.l },
});
