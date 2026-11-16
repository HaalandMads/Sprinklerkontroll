import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

// Web: nettleseren håndterer tastaturet selv, så et vanlig rullefelt holder.
export function KeyboardScroll({ bottomOffset: _bottomOffset, ...rest }: ScrollViewProps & { bottomOffset?: number }) {
  return <ScrollView {...rest} />;
}
