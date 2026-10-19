import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActionButton, Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { getExerciseById, getSuggestedWorkout } from '@/lib/exercises';
import { localDateKey, type WorkoutSet } from '@/lib/fitness';
import { showWorkoutInterstitial } from '@/components/Ads';

export default function ActiveWorkoutScreen() {
  const colors = useColors();
  const { data, updateData } = useFitForge();
  const params = useLocalSearchParams<{ exerciseId?: string }>();
  const suggested = data.profile ? getSuggestedWorkout(data.profile) : { title: 'Training session', exerciseIds: [] };
  const exerciseIds = useMemo(
    () => params.exerciseId ? [params.exerciseId] : data.workoutQueue.length ? data.workoutQueue : suggested.exerciseIds,
    [params.exerciseId, data.workoutQueue, suggested.exerciseIds],
  );
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startAt = useRef(Date.now());
  const currentExercise = getExerciseById(exerciseIds[exerciseIndex] ?? '');
  const [setsByExercise, setSetsByExercise] = useState<Record<string, WorkoutSet[]>>(() =>
    Object.fromEntries(exerciseIds.map((exerciseId) => {
      const exercise = getExerciseById(exerciseId);
      return [
        exerciseId,
        Array.from({ length: exercise?.sets ?? 3 }, () => ({
          exerciseId,
          reps: Number(exercise?.reps.match(/\d+/)?.[0] ?? 8),
          weightKg: 0,
          completed: false,
        })),
      ];
    })),
  );
  const currentSets = currentExercise ? setsByExercise[currentExercise.id] ?? [] : [];
  const completedSetCount = Object.values(setsByExercise).flat().filter((set) => set.completed).length;
  const elapsedLabel = `${Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startAt.current) / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (restSeconds <= 0) return;
    const interval = setInterval(() => setRestSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(interval);
  }, [restSeconds > 0]);

  const updateSet = (exerciseId: string, index: number, patch: Partial<WorkoutSet>) => {
    setSetsByExercise((current) => ({
      ...current,
      [exerciseId]: current[exerciseId].map((set, setIndex) =>
        setIndex === index ? { ...set, ...patch } : set,
      ),
    }));
  };

  const finishWorkout = async () => {
    if (!completedSetCount) return;
    const session = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: localDateKey(),
      durationSeconds: Math.max(60, elapsedSeconds),
      exerciseIds: [...exerciseIds],
      sets: Object.values(setsByExercise).flat(),
    };
    try {
      await updateData((current) => ({
        ...current,
        sessions: [...current.sessions, session],
        workoutQueue: [],
      }));
      await showWorkoutInterstitial();
      Alert.alert('Session saved', 'Strong work. Your progress has been updated.');
      router.replace('/home');
    } catch (error) {
      Alert.alert('Could not save workout', error instanceof Error ? error.message : 'Try again.');
    }
  };

  if (!currentExercise) {
    return (
      <Page contentStyle={{ justifyContent: 'center', flexGrow: 1 }}>
        <Eyebrow>YOUR SESSION</Eyebrow>
        <Title>No workout ready</Title>
        <Body>Choose a training day and add exercises before you start a session.</Body>
        <ActionButton onPress={() => router.replace('/workouts')}>Browse workouts</ActionButton>
      </Page>
    );
  }

  return (
    <Page contentStyle={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable accessibilityLabel="Exit workout" accessibilityRole="button" onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>
          {exerciseIndex + 1} / {exerciseIds.length} · {elapsedLabel}
        </Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={{ gap: 8 }}>
        <Eyebrow>ACTIVE WORKOUT</Eyebrow>
        <Title size={28}>{currentExercise.name}</Title>
        <Body>{currentExercise.group} · {currentExercise.focus}</Body>
      </View>

      <Panel style={{ minHeight: 144, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Feather name="activity" size={32} color={colors.primary} />
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14 }}>Slow, controlled repetitions</Text>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center' }}>
          Video demo not supplied · use the exercise form cues
        </Text>
      </Panel>

      <Panel style={{ padding: 15, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 3 }}>
          <Text style={{ width: 40, color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 9 }}>SET</Text>
          <Text style={{ flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 9, textAlign: 'center' }}>REPS</Text>
          <Text style={{ flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 9, textAlign: 'center' }}>WEIGHT (KG)</Text>
          <Text style={{ width: 50, color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 9, textAlign: 'center' }}>DONE</Text>
        </View>
        {currentSets.map((set, index) => (
          <View key={`${currentExercise.id}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={{ width: 35, color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 13 }}>0{index + 1}</Text>
            <TextInput
              accessibilityLabel={`Set ${index + 1} reps`}
              keyboardType="number-pad"
              onChangeText={(value) => updateSet(currentExercise.id, index, { reps: Number(value) || 0 })}
              selectTextOnFocus
              value={String(set.reps)}
              style={{ flex: 1, height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.background, color: colors.foreground, fontFamily: 'Inter_600SemiBold', textAlign: 'center' }}
            />
            <TextInput
              accessibilityLabel={`Set ${index + 1} weight in kilograms`}
              keyboardType="decimal-pad"
              onChangeText={(value) => updateSet(currentExercise.id, index, { weightKg: Number(value) || 0 })}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              selectTextOnFocus
              value={set.weightKg ? String(set.weightKg) : ''}
              style={{ flex: 1, height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.background, color: colors.foreground, fontFamily: 'Inter_600SemiBold', textAlign: 'center' }}
            />
            <Pressable
              accessibilityLabel={set.completed ? `Mark set ${index + 1} incomplete` : `Complete set ${index + 1}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: set.completed }}
              onPress={() => {
                updateSet(currentExercise.id, index, { completed: !set.completed });
                if (!set.completed) setRestSeconds(currentExercise.restSeconds);
              }}
              style={{ width: 50, height: 42, alignItems: 'center', justifyContent: 'center' }}
              testID={`complete-set-${index + 1}`}
            >
              <View style={{ width: 24, height: 24, borderRadius: 8, borderWidth: 1, borderColor: set.completed ? colors.primary : colors.border, backgroundColor: set.completed ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {set.completed ? <Feather name="check" size={15} color={colors.primaryForeground} /> : null}
              </View>
            </Pressable>
          </View>
        ))}
      </Panel>

      {restSeconds > 0 && (
        <Panel style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 }}>
          <Feather name="clock" size={19} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 }}>Rest · {Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, '0')}</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 }}>Recover before the next set.</Text>
          </View>
          <Pressable onPress={() => setRestSeconds((value) => value + 15)} accessibilityRole="button" style={{ minHeight: 38, paddingHorizontal: 10, justifyContent: 'center' }}>
            <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 11 }}>+15s</Text>
          </Pressable>
          <Pressable onPress={() => setRestSeconds(0)} accessibilityRole="button" style={{ minHeight: 38, paddingHorizontal: 7, justifyContent: 'center' }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 11 }}>Skip</Text>
          </Pressable>
        </Panel>
      )}

      <Panel style={{ flexDirection: 'row', gap: 10, padding: 15 }}>
        <Feather name="info" size={15} color={colors.primary} />
        <Body style={{ flex: 1 }}>Take the full rest time between sets. Quality reps are the goal.</Body>
      </Panel>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {exerciseIndex > 0 && (
          <ActionButton secondary onPress={() => setExerciseIndex((index) => index - 1)} style={{ flex: 1 }}>Previous</ActionButton>
        )}
        {exerciseIndex < exerciseIds.length - 1 ? (
          <ActionButton onPress={() => { setExerciseIndex((index) => index + 1); setRestSeconds(0); }} style={{ flex: 1 }}>Next exercise</ActionButton>
        ) : (
          <ActionButton disabled={!completedSetCount} onPress={() => void finishWorkout()} style={{ flex: 1 }} testID="finish-workout">Finish workout</ActionButton>
        )}
      </View>
    </Page>
  );
}
