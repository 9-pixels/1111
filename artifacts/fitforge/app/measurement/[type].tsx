import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { ActionButton, Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { localDateKey, type MeasurementEntry } from '@/lib/fitness';

const allowedTypes = ['Body weight', 'Chest', 'Arms', 'Waist'] as const;

export default function MeasurementScreen() {
  const { type: routeType } = useLocalSearchParams<{ type: string }>();
  const type = allowedTypes.find((candidate) => candidate === routeType) ?? 'Body weight';
  const unit = type === 'Body weight' ? 'kg' : 'cm';
  const colors = useColors();
  const { data, updateData } = useFitForge();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const entries = useMemo(
    () => data.measurements.filter((entry) => entry.type === type).sort((a, b) => a.date.localeCompare(b.date)),
    [data.measurements, type],
  );

  const addMeasurement = async () => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError(`Enter a valid measurement in ${unit}.`);
      return;
    }
    const entry: MeasurementEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      value: parsed,
      unit,
      date: localDateKey(),
    };
    try {
      await updateData((current) => ({ ...current, measurements: [...current.measurements, entry] }));
      setValue('');
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this measurement.');
    }
  };

  const chartPoints = useMemo(() => {
    const recent = entries.slice(-8);
    if (recent.length < 2) return '';
    const min = Math.min(...recent.map((entry) => entry.value));
    const max = Math.max(...recent.map((entry) => entry.value));
    const spread = max === min ? 1 : max - min;
    return recent.map((entry, index) => `${16 + (index * 268) / Math.max(1, recent.length - 1)},${90 - ((entry.value - min) / spread) * 64}`).join(' ');
  }, [entries]);

  return (
    <Page contentStyle={{ gap: 18 }}>
      <Pressable accessibilityLabel="Go back to progress" accessibilityRole="button" onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="arrow-left" size={21} color={colors.foreground} />
      </Pressable>
      <View style={{ gap: 8 }}>
        <Eyebrow>BODY MEASUREMENTS</Eyebrow>
        <Title>{type}</Title>
        <Body>Record a new value and review the history saved on this device.</Body>
      </View>

      <Panel>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 16 }}>Log a measurement</Text>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <TextInput
            accessibilityLabel={`${type} in ${unit}`}
            keyboardType="decimal-pad"
            onChangeText={setValue}
            placeholder={`Value in ${unit}`}
            placeholderTextColor={colors.mutedForeground}
            value={value}
            style={{ flex: 1, minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: 15, paddingHorizontal: 14, backgroundColor: colors.background, color: colors.foreground, fontFamily: 'Inter_500Medium', fontSize: 15 }}
            testID="measurement-value"
          />
          <Pressable accessibilityRole="button" onPress={() => void addMeasurement()} style={{ minWidth: 72, minHeight: 52, backgroundColor: colors.primary, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }} testID="measurement-save">
            <Text style={{ color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 13 }}>Save</Text>
          </Pressable>
        </View>
        {error ? <Text accessibilityRole="alert" style={{ color: colors.destructive, fontFamily: 'Inter_500Medium', fontSize: 12 }}>{error}</Text> : null}
      </Panel>

      <Panel style={{ gap: 13 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 16 }}>History</Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 }}>{entries.length} entries · {unit}</Text>
        </View>
        <View style={{ height: 142, borderRadius: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          {entries.length >= 2 ? (
            <Svg width="100%" height={125} viewBox="0 0 300 110">
              <Polyline points={chartPoints} fill="none" stroke={colors.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              {chartPoints.split(' ').map((point, index) => {
                const [cx, cy] = point.split(',').map(Number);
                return <Circle key={`${point}-${index}`} cx={cx} cy={cy} r={4} fill={colors.primary} />;
              })}
            </Svg>
          ) : (
            <Body>{entries.length ? 'Add one more entry to see a trend line.' : 'Your chart will appear after you add measurements.'}</Body>
          )}
        </View>
        {entries.slice().reverse().map((entry) => (
          <View key={entry.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 }}>{entry.date}</Text>
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 13 }}>{entry.value} {entry.unit}</Text>
          </View>
        ))}
      </Panel>
    </Page>
  );
}
