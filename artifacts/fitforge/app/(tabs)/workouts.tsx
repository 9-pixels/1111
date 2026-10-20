import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActionButton, Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import ExerciseCard from '@/components/ExerciseCard';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { EQUIPMENT_FILTERS, exercises, getSuggestedWorkout, muscleGroups } from '@/lib/exercises';

export default function WorkoutsScreen() {
  const colors = useColors();
  const { data, updateData } = useFitForge();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [equipment, setEquipment] = useState<(typeof EQUIPMENT_FILTERS)[number]>('All');
  const searchResults = useMemo(
    () =>
      exercises.filter((exercise) => {
        const matchesQuery = !query.trim() || `${exercise.name} ${exercise.group} ${exercise.focus} ${exercise.equipment}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return matchesQuery && (equipment === 'All' || exercise.equipment === equipment);
      }),
    [query, equipment],
  );
  const startWorkout = async () => {
    if (!data.profile) return;
    const plan = getSuggestedWorkout(data.profile);
    if (!plan.exerciseIds.length) {
      router.push('/home');
      return;
    }
    await updateData((current) => ({
      ...current,
      workoutQueue: current.workoutQueue.length ? current.workoutQueue : plan.exerciseIds,
    }));
    router.push('/active-workout');
  };

  return (
    <Page contentStyle={{ gap: 17 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <View style={{ flex: 1, gap: 8 }}>
          <Eyebrow>TRAIN SMARTER</Eyebrow>
          <Title>Workouts</Title>
        </View>
        <Pressable
          accessibilityLabel="Start today's workout"
          accessibilityRole="button"
          onPress={() => void startWorkout()}
          style={{ width: 50, height: 50, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}
          testID="workouts-start-today"
        >
          <Feather name="play" size={19} color={colors.primaryForeground} />
        </Pressable>
      </View>
      <Body>Choose a muscle to see every exercise, variation, and setup in one place.</Body>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View style={{ flex: 1, height: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9 }}>
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            accessibilityLabel="Search all exercises"
            onChangeText={setQuery}
            placeholder="Search exercises"
            placeholderTextColor={colors.mutedForeground}
            style={{ flex: 1, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 13 }}
            value={query}
            testID="exercise-search"
          />
        </View>
        <Pressable accessibilityLabel="Show exercise search filters" accessibilityRole="button" onPress={() => setShowFilters((current) => !current)} style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="sliders" size={18} color={showFilters ? colors.primary : colors.foreground} />
        </Pressable>
      </View>
      {showFilters && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {EQUIPMENT_FILTERS.map((filter) => {
            const active = equipment === filter;
            return (
              <Pressable key={filter} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setEquipment(filter)} style={{ minHeight: 38, borderRadius: 13, borderWidth: 1, borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.accent : colors.card, paddingHorizontal: 13, justifyContent: 'center' }}>
                <Text style={{ color: active ? colors.primary : colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 11 }}>{filter}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {query.trim() || equipment !== 'All' ? (
        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 16 }}>
            {searchResults.length} matching exercises
          </Text>
          {searchResults.length ? searchResults.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onPress={() => router.push(`/exercise/${exercise.id}`)}
            />
          )) : (
            <Panel><Body>No exercises match “{query}”. Try another name or muscle group.</Body></Panel>
          )}
        </View>
      ) : (
        <>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 2 }}>Muscle groups</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {muscleGroups.map((group) => (
              <Pressable
                key={group.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/group/[slug]', params: { slug: group.id } })}
                testID={`muscle-group-${group.id}`}
                style={({ pressed }) => ({
                  flexGrow: 1,
                  flexBasis: '46%',
                  minWidth: 145,
                  minHeight: 151,
                  padding: 14,
                  gap: 11,
                  borderRadius: 21,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.78 : 1,
                })}
              >
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${group.color}20`, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={group.icon} size={18} color={group.color} />
                </View>
                <View style={{ gap: 4, flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14 }}>{group.name}</Text>
                  <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15 }}>{group.description}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: group.color, fontFamily: 'Inter_700Bold', fontSize: 10 }}>{group.moveCount} moves</Text>
                  <Feather name="arrow-up-right" size={14} color={group.color} />
                </View>
              </Pressable>
            ))}
          </View>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 12, textAlign: 'center', marginVertical: 4 }}>
            155 movements · curated FitForge library
          </Text>
        </>
      )}
    </Page>
  );
}
