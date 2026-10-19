import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { localDateKey } from '@/lib/fitness';

function ProgressRing({ percent }: { percent: number }) {
  const colors = useColors();
  const radius = 39;
  const circumference = 2 * Math.PI * radius;
  return (
    <View style={{ width: 104, height: 104, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={104} height={104} viewBox="0 0 104 104" style={{ position: 'absolute' }}>
        <Circle cx="52" cy="52" r={radius} stroke={colors.border} strokeWidth={8} fill="none" />
        <Circle
          cx="52" cy="52" r={radius} stroke={colors.primary} strokeWidth={8}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - percent / 100)}
          strokeLinecap="round" fill="none" rotation="-90" origin="52, 52"
        />
      </Svg>
      <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 20 }}>{percent}%</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const colors = useColors();
  const { data } = useFitForge();
  const now = new Date();
  const thisMonthSessions = data.sessions.filter((session) => {
    const date = new Date(`${session.date}T00:00:00`);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const exercisesThisMonth = thisMonthSessions.reduce((count, session) => {
    const sessionSets = session.sets ?? [];
    const completedExercises = new Set(sessionSets.filter((set) => set.completed).map((set) => set.exerciseId));
    return count + (sessionSets.length ? completedExercises.size : session.exerciseIds.length);
  }, 0);
  const monthlyGoal = Math.max(1, (data.profile?.trainingDaysPerWeek ?? 0) * 4);
  const monthlyPercent = Math.min(100, Math.round((thisMonthSessions.length / monthlyGoal) * 100));
  const weekBars = useMemo(() => {
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const key = localDateKey(date);
      const seconds = data.sessions
        .filter((session) => session.date === key)
        .reduce((total, session) => total + session.durationSeconds, 0);
      return { key, seconds, label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index], isToday: key === localDateKey(now) };
    });
  }, [data.sessions, now]);
  const maxSeconds = Math.max(1, ...weekBars.map((bar) => bar.seconds));
  const measures = (['Body weight', 'Chest', 'Arms', 'Waist'] as const).map((type) => {
    const entries = data.measurements.filter((entry) => entry.type === type).sort((a, b) => b.date.localeCompare(a.date));
    return { type, latest: entries[0], previous: entries[1] };
  });

  return (
    <Page contentStyle={{ gap: 19 }}>
      <View style={{ gap: 8 }}>
        <Eyebrow>KEEP SHOWING UP</Eyebrow>
        <Title>Your progress</Title>
        <Body>Small wins stack into serious strength.</Body>
      </View>
      <Panel style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 }}>
        <View style={{ gap: 8, flex: 1 }}>
          <Eyebrow>THIS MONTH</Eyebrow>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 31 }}>{exercisesThisMonth}</Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 12 }}>exercises completed</Text>
        </View>
        <ProgressRing percent={monthlyPercent} />
      </Panel>
      <Panel style={{ gap: 17 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 }}>Weekly consistency</Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 }}>Training time</Text>
        </View>
        <View style={{ height: 120, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
          {weekBars.map((bar) => (
            <View key={bar.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 9, height: '100%' }}>
              <View style={{ width: '100%', maxWidth: 34, height: bar.seconds ? Math.max(13, 76 * (bar.seconds / maxSeconds)) : 7, borderRadius: 8, backgroundColor: bar.isToday ? colors.primary : bar.seconds ? colors.secondary : colors.border }} />
              <Text style={{ color: bar.isToday ? colors.primary : colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 10 }}>{bar.label}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 }}>
          Bars show saved workout time for each day. Empty days start at zero.
        </Text>
      </Panel>
      <View style={{ gap: 11 }}>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 }}>Body measurements</Text>
        {measures.map(({ type, latest, previous }) => {
          const change = latest && previous ? latest.value - previous.value : null;
          const unit = type === 'Body weight' ? 'kg' : 'cm';
          const positiveIsGood = type === 'Chest' || type === 'Arms';
          const improved = change === null ? false : positiveIsGood ? change >= 0 : change <= 0;
          const changeColor = change === null ? colors.mutedForeground : improved ? colors.primary : colors.destructive;
          return (
            <Pressable
              key={type}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/measurement/[type]', params: { type } })}
              testID={`measurement-${type.toLowerCase().replace(/\s+/g, '-')}`}
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
            >
              <Panel style={{ minHeight: 74, flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>{type}</Text>
                  <Text style={{ color: changeColor, fontFamily: 'Inter_500Medium', fontSize: 11 }}>
                    {change === null ? 'Add your first measurement' : `${change > 0 ? '+' : ''}${change.toFixed(1)} ${unit} since last entry`}
                  </Text>
                </View>
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 16, marginRight: 6 }}>
                  {latest ? `${latest.value} ${unit}` : '—'}
                </Text>
                <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
              </Panel>
            </Pressable>
          );
        })}
      </View>
    </Page>
  );
}
