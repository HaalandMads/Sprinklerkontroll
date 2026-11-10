import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { chartModel } from '../lib/capacity';
import type { MeasPoint, ReqPoint } from '../lib/db';
import { colors, space } from '../lib/theme';

export function CapacityChart({ points, reqs, height = 240 }: { points: MeasPoint[]; reqs: ReqPoint[]; height?: number }) {
  const { width } = useWindowDimensions();
  const w = Math.min(width - space.l * 2, 640);
  const shapes = chartModel(points, reqs, w, height);
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.line, paddingVertical: space.s, alignItems: 'center' }}
      accessibilityLabel="Graf over målt forsyningskurve og krav">
      <Svg width={w} height={height}>
        {shapes.map((x, i) => {
          switch (x.t) {
            case 'line': return <Line key={i} x1={x.x1} y1={x.y1} x2={x.x2} y2={x.y2} stroke={x.color} strokeWidth={x.width} strokeDasharray={x.dash} />;
            case 'path': return <Path key={i} d={x.d} fill="none" stroke={x.color} strokeWidth={x.width} strokeDasharray={x.dash} />;
            case 'circle': return <Circle key={i} cx={x.x} cy={x.y} r={x.r} fill={x.fill} stroke={x.stroke} strokeWidth={1.5} />;
            case 'rect': return <Rect key={i} x={x.x} y={x.y} width={x.w} height={x.h} fill={x.fill} stroke={x.stroke} strokeWidth={1.5} />;
            case 'text': return <SvgText key={i} x={x.x} y={x.y} fontSize={x.size} fill={x.color} textAnchor={x.anchor} fontWeight={x.bold ? '700' : '400'}>{x.text}</SvgText>;
          }
        })}
      </Svg>
    </View>
  );
}
