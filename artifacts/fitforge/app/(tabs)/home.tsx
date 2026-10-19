import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ActionButton, Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { getExerciseById, getSuggestedWorkout, muscleGroups } from '@/lib/exercises';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

export default function HomeScreen() {
  const colors = useColors();
  const { data, updateData } = useFitForge();
  const profile = data.profile;
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  const isTrainingDay = profile?.trainingWeekdays.includes((today.getDay() + 6) % 7) ?? false;
  const sessionsThisWeek = data.sessions.filter((session) => {
    const diffDays = Math.floor((today.getTime() - new Date(`${session.date}T00:00:00`).getTime()) / 86400000);
    return diffDays >= 0 && diffDays < 7;
  }).length;
  const minutesThisWeek = data.sessions
    .filter((session) => {
      const diffDays = Math.floor((today.getTime() - new Date(`${session.date}T00:00:00`).getTime()) / 86400000);
      return diffDays >= 0 && diffDays < 7;
    })
    .reduce((total, session) => total + session.durationSeconds, 0);
  const weeklyCompletion = profile?.trainingDaysPerWeek
    ? Math.min(100, Math.round((sessionsThisWeek / profile.trainingDaysPerWeek) * 100))
    : 0;
  const nextPlan = profile ? getSuggestedWorkout(profile, today) : { title: 'Your training plan', exerciseIds: [] };
  const focusMoves = nextPlan.exerciseIds.slice(0, 3).map(getExerciseById).filter((exercise) => !!exercise);
  const beginSession = async () => {
    if (!profile) return;
    if (!nextPlan.exerciseIds.length) {
      router.push('/workouts');
      return;
    }
    await updateData((current) => ({
      ...current,
      workoutQueue: current.workoutQueue.length ? current.workoutQueue : nextPlan.exerciseIds,
    }));
    router.push('/active-workout');
  };

  return (
    <Page contentStyle={{ gap: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, gap: 8 }}>
          <Eyebrow>{dateLabel}</Eyebrow>
          <Title size={26}>{greeting()}, {profile?.firstName ?? 'athlete'}</Title>
        </View>
        <Pressable
          accessibilityLabel="Open profile"
          accessibilityRole="button"
          onPress={() => router.push('/profile')}
          style={{ width: 48, height: 48, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}
          testID="home-profile-avatar"
        >
          <Text style={{ color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 21 }}>
            {profile?.firstName.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </Pressable>
      </View>

      <Panel style={{ padding: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow>YOUR NEXT SESSION</Eyebrow>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Feather name={isTrainingDay ? 'zap' : 'moon'} size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.9 }}>
              {isTrainingDay ? 'READY' : 'REST DAY'}
            </Text>
          </View>
        </View>
        <View style={{ gap: 5 }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 22 }}>
            {isTrainingDay ? nextPlan.title : 'Rest day'}
          </Text>
          <Body>
            {isTrainingDay
              ? `${nextPlan.exerciseIds.length} exercises · about ${nextPlan.exerciseIds.length * 8} min · ${profile?.goal ?? 'Personal plan'}`
              : 'Take a walk, hydrate, and give your body time to rebuild.'}
          </Body>
        </View>
        <ActionButton onPress={() => void beginSession()} testID="home-start-workout">
          {isTrainingDay ? 'Start workout' : 'Browse exercise library'}
        </ActionButton>
      </Panel>

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 }}>Your week</Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 12 }}>Real activity</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          {[
            { value: String(sessionsThisWeek), label: 'SESSIONS' },
            { value: `${(minutesThisWeek / 3600).toFixed(1)}h`, label: 'TRAINING' },
            { value: `${weeklyCompletion}%`, label: 'PLAN DONE' },
          ].map((item) => (
            <Panel key={item.label} style={{ flex: 1, padding: 14, minHeight: 88, justifyContent: 'space-between', gap: 8 }}>
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 20 }}>{item.value}</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.7 }}>{item.label}</Text>
            </Panel>
          ))}
        </View>
      </View>

      <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 }}>Explore by muscle</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/workouts')} style={{ minHeight: 40, justifyContent: 'center', paddingHorizontal: 7 }}>
              <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 12 }}>See all</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
            {muscleGroups.map((group) => (
              <Pressable
                key={group.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/group/[slug]', params: { slug: group.id } })}
                style={{ minHeight: 42, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 }}
              >
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: group.color }} />
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 11 }}>{group.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
      </View>

      {isTrainingDay ? (
        <View style={{ gap: 11 }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 }}>Today’s focus · 3 moves</Text>
          {focusMoves.map((exercise, index) => exercise ? (
            <Pressable
              key={exercise.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })}
              style={{ minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
            >
              <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 12 }}>{String(index + 1).padStart(2, '0')}</Text>
              <View style={{ flex: 1, gap: 4 }}>
                <Text numberOfLines={1} style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 13 }}>{exercise.name}</Text>
                <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 }}>{exercise.group} · {exercise.sets} sets × {exercise.reps} reps</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null)}
        </View>
      ) : (
        <Panel style={{ gap: 11 }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 }}>Rest day · recovery tips</Text>
          {['Take an easy walk or move gently', 'Drink water throughout the day', 'Make room for a full night of sleep'].map((tip) => (
            <View key={tip} style={{ flexDirection: 'row', gap: 9, alignItems: 'center' }}>
              <Feather name="check-circle" size={15} color={colors.primary} />
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 }}>{tip}</Text>
            </View>
          ))}
        </Panel>
      )}

      <Panel style={{ padding: 20, gap: 9 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 }}>Daily fuel targets</Text>
          <Feather name="activity" size={17} color={colors.primary} />
        </View>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
          {profile?.targets.calories.toLocaleString()} kcal · {profile?.targets.protein} g protein · {profile?.targets.waterGlasses} glasses water
        </Text>
      </Panel>

    </Page>
  );
}
