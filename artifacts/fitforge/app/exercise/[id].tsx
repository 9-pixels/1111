import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActionButton, Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { getExerciseById, getGroupById } from '@/lib/exercises';

function StatTile({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <Panel style={{ flex: 1, padding: 14, gap: 6 }}>
      <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8 }}>{label}</Text>
      <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 16 }}>{value}</Text>
    </Panel>
  );
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = getExerciseById(id);
  const group = exercise ? getGroupById(exercise.group.toLowerCase().replace(/[^a-z0-9]+/g, '-')) : undefined;
  const colors = useColors();
  const { data, updateData } = useFitForge();
  const [notice, setNotice] = useState('');
  const saved = data.favoriteExerciseIds.includes(id);

  if (!exercise) {
    return (
      <Page>
        <Eyebrow>EXERCISE LIBRARY</Eyebrow>
        <Title>Exercise not found</Title>
        <Body>This movement is not in the current FitForge library.</Body>
        <ActionButton onPress={() => router.back()}>Go back</ActionButton>
      </Page>
    );
  }

  const toggleSaved = () => {
    void updateData((current) => ({
      ...current,
      favoriteExerciseIds: saved
        ? current.favoriteExerciseIds.filter((exerciseId) => exerciseId !== exercise.id)
        : [...current.favoriteExerciseIds, exercise.id],
    }));
  };
  const addToQueue = async () => {
    try {
      await updateData((current) => ({
        ...current,
        workoutQueue: current.workoutQueue.includes(exercise.id)
          ? current.workoutQueue
          : [...current.workoutQueue, exercise.id],
      }));
      setNotice('Added to today’s workout.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not add this exercise.');
    }
  };

  return (
    <Page contentStyle={{ gap: 17 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="arrow-left" size={21} color={colors.foreground} />
        </Pressable>
        <Pressable accessibilityLabel={saved ? 'Remove from saved exercises' : 'Save exercise'} accessibilityRole="button" onPress={toggleSaved} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="bookmark" size={20} color={saved ? colors.primary : colors.foreground} />
        </Pressable>
      </View>

      <Panel style={{ minHeight: 186, justifyContent: 'center', alignItems: 'center', padding: 22, gap: 13 }}>
        <View style={{ width: 68, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: `${group?.color ?? colors.primary}22` }}>
          <Feather name="play" size={28} color={group?.color ?? colors.primary} />
        </View>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 16, textAlign: 'center' }}>{exercise.name}</Text>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center' }}>
          Exercise-specific video demo not supplied
        </Text>
      </Panel>
      <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11, textAlign: 'center' }}>
        Follow the written cues below · slow and controlled
      </Text>

      <View style={{ gap: 8 }}>
        <Eyebrow>{exercise.group.toUpperCase()} · {exercise.focus.toUpperCase()}</Eyebrow>
        <Title size={30}>{exercise.name}</Title>
        <Body>{exercise.description}</Body>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <StatTile label="SETS" value={String(exercise.sets)} />
        <StatTile label="REPS" value={exercise.reps} />
        <StatTile label="REST" value={`${exercise.restSeconds} sec`} />
      </View>

      <Panel>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 }}>How to do it</Text>
        {exercise.steps.map((step, index) => (
          <View key={step} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 11 }}>{String(index + 1).padStart(2, '0')}</Text>
            </View>
            <Text style={{ flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 }}>{step}</Text>
          </View>
        ))}
      </Panel>

      <Panel>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 }}>Common mistakes</Text>
        {exercise.mistakes.map((mistake) => (
          <View key={mistake} style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start' }}>
            <Feather name="x" size={16} color={colors.destructive} style={{ marginTop: 2 }} />
            <Text style={{ flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 }}>{mistake}</Text>
          </View>
        ))}
      </Panel>

      <Panel style={{ borderColor: '#ff7e9333' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Feather name="alert-triangle" size={16} color="#ff7e93" />
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 }}>Safety note</Text>
        </View>
        <Body>{exercise.safetyNote}</Body>
      </Panel>

      {notice ? <Text accessibilityRole="alert" style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>{notice}</Text> : null}
      <ActionButton onPress={addToQueue} testID="add-to-today-workout">Add to today’s workout</ActionButton>
      <ActionButton secondary onPress={() => router.push({ pathname: '/active-workout', params: { exerciseId: exercise.id } })} testID="start-this-exercise">Start this exercise</ActionButton>
    </Page>
  );
}
