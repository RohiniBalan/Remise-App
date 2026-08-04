import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Polyline, Circle, Rect, Line, Text as SvgText } from 'react-native-svg';
import { CustomerColors, FontSizes } from '../../styles/theme';

// Small dependency-light chart components. No new packages needed —
// react-native-svg ships as a peer dependency of lucide-react-native,
// which this app already uses throughout.

const HEIGHT = 200;
const LEFT_PADDING = 44; // room for y-axis value labels
const RIGHT_PADDING = 12;
const TOP_PADDING = 16;
const BOTTOM_PADDING = 28; // room for x-axis labels
const TICK_COUNT = 4; // 5 gridlines: 0..max

function formatAxisValue(n: number): string {
  if (n >= 100000) return `${+(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (n >= 1000) return `${+(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(Math.round(n));
}

function buildTicks(max: number): number[] {
  const ticks = [];
  for (let i = 0; i <= TICK_COUNT; i++) ticks.push(Math.round((max * i) / TICK_COUNT));
  return ticks;
}

// Thin out x-axis labels so they don't overlap when there are many points.
function xLabelIndices(count: number, maxLabels = 6): number[] {
  if (count <= maxLabels) return Array.from({ length: count }, (_, i) => i);
  const step = Math.ceil(count / maxLabels);
  const idxs: number[] = [];
  for (let i = 0; i < count; i += step) idxs.push(i);
  if (idxs[idxs.length - 1] !== count - 1) idxs.push(count - 1);
  return idxs;
}

function YAxis({ max, plotLeft, plotRight, plotBottom, plotTop }: { max: number; plotLeft: number; plotRight: number; plotBottom: number; plotTop: number }) {
  const ticks = buildTicks(max);
  return (
    <>
      {ticks.map((t, i) => {
        const y = plotBottom - (t / max) * (plotBottom - plotTop);
        return (
          <React.Fragment key={i}>
            <Line
              x1={plotLeft}
              y1={y}
              x2={plotRight}
              y2={y}
              stroke="#F0F0F0"
              strokeWidth={1}
            />
            <SvgText x={plotLeft - 8} y={y + 3} fontSize={9} fill="#9CA3AF" textAnchor="end">
              {formatAxisValue(t)}
            </SvgText>
          </React.Fragment>
        );
      })}
    </>
  );
}

export function MiniLineChart({ data }: { data: { label: string; revenue: number; topProduct?: string }[] }) {
  const [width, setWidth] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  if (!data.length) return <EmptyChart onLayout={onLayout} />;

  const max = Math.max(1, ...data.map(d => d.revenue));
  const plotLeft = LEFT_PADDING;
  const plotRight = Math.max(plotLeft + 1, width - RIGHT_PADDING);
  const plotTop = TOP_PADDING;
  const plotBottom = HEIGHT - BOTTOM_PADDING;
  const innerW = Math.max(1, plotRight - plotLeft);
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = plotLeft + i * step;
    const y = plotBottom - (d.revenue / max) * (plotBottom - plotTop);
    return { x, y, d };
  });
  const labelIdxs = new Set(xLabelIndices(data.length));

  return (
    <View onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          <YAxis max={max} plotLeft={plotLeft} plotRight={plotRight} plotBottom={plotBottom} plotTop={plotTop} />
          <Line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="#E5E7EB" strokeWidth={1} />
          <Polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#0d9488" strokeWidth={2} />
          {points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={activeIdx === i ? 5 : 3} fill="#0d9488" onPress={() => setActiveIdx(activeIdx === i ? null : i)} />
          ))}
          {points.map((p, i) =>
            labelIdxs.has(i) ? (
              <SvgText key={`lbl-${i}`} x={p.x} y={HEIGHT - 10} fontSize={8} fill="#9CA3AF" textAnchor="middle">
                {p.d.label.length > 8 ? `${p.d.label.slice(0, 7)}…` : p.d.label}
              </SvgText>
            ) : null,
          )}
        </Svg>
      )}
      {activeIdx !== null && points[activeIdx] && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipLabel}>{points[activeIdx].d.label}</Text>
          <Text style={styles.tooltipValue}>revenue: ₹{points[activeIdx].d.revenue.toLocaleString('en-IN')}</Text>
          {points[activeIdx].d.topProduct ? <Text style={styles.tooltipSub}>Top product: {points[activeIdx].d.topProduct}</Text> : null}
        </View>
      )}
    </View>
  );
}

export function MiniBarChart({ data, dataKey = 'revenue' }: { data: { month?: string; label?: string; revenue: number; topProduct?: string }[]; dataKey?: string }) {
  const [width, setWidth] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  if (!data.length) return <EmptyChart onLayout={onLayout} />;

  const max = Math.max(1, ...data.map(d => d.revenue));
  const plotLeft = LEFT_PADDING;
  const plotRight = Math.max(plotLeft + 1, width - RIGHT_PADDING);
  const plotTop = TOP_PADDING;
  const plotBottom = HEIGHT - BOTTOM_PADDING;
  const innerW = Math.max(1, plotRight - plotLeft);
  const barW = Math.min(40, innerW / data.length - 8);
  const gap = data.length > 1 ? (innerW - barW * data.length) / (data.length - 1) : 0;

  return (
    <View onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          <YAxis max={max} plotLeft={plotLeft} plotRight={plotRight} plotBottom={plotBottom} plotTop={plotTop} />
          <Line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="#E5E7EB" strokeWidth={1} />
          {data.map((d, i) => {
            const h = (d.revenue / max) * (plotBottom - plotTop);
            const x = plotLeft + i * (barW + gap);
            const y = plotBottom - h;
            const label = d.month || d.label || '';
            return (
              <React.Fragment key={i}>
                <Rect
                  x={x} y={y} width={barW} height={h} rx={4}
                  fill={activeIdx === i ? '#0f766e' : '#0d9488'}
                  onPress={() => setActiveIdx(activeIdx === i ? null : i)}
                />
                <SvgText x={x + barW / 2} y={HEIGHT - 10} fontSize={8} fill="#9CA3AF" textAnchor="middle">
                  {label.length > 8 ? `${label.slice(0, 7)}…` : label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      )}
      {activeIdx !== null && data[activeIdx] && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipLabel}>{data[activeIdx].month || data[activeIdx].label}</Text>
          <Text style={styles.tooltipValue}>revenue: ₹{data[activeIdx].revenue.toLocaleString('en-IN')}</Text>
          {data[activeIdx].topProduct ? <Text style={styles.tooltipSub}>Top product: {data[activeIdx].topProduct}</Text> : null}
        </View>
      )}
    </View>
  );
}

function EmptyChart({ onLayout }: { onLayout: (e: LayoutChangeEvent) => void }) {
  return (
    <View onLayout={onLayout} style={{ height: HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#9CA3AF', fontSize: FontSizes.sm }}>No data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: { marginTop: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  tooltipLabel: { fontSize: 11, fontWeight: '700', color: '#374151' },
  tooltipValue: { fontSize: 11, color: CustomerColors.teal700, fontWeight: '600', marginTop: 2 },
  tooltipSub: { fontSize: 10, color: '#6B7280', marginTop: 2 },
});
