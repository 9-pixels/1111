import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActionButton, Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import ExerciseCard from '@/components/ExerciseCard';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { EQUIPMENT_FILTERS, exercises, getGroupById } from '@/lib/exercises';

export default function MuscleGroupScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const group = getGroupById(slug);
  const colors = useColors();
  const { data, updateData } = useFitForge();
  const [query, setQuery] = useState('');
  const [equipment, setEquipment] = useState<(typeof EQUIPMENT_FILTERS)[number]>('All');
  const [showFilters, setShowFilters] = useState(false);
  const entries = useMemo(
    () =>
      exercises.filter((exercise) => {
        const matchesGroup = exercise.group === group?.name;
        const matchesQuery = `${exercise.name} ${exercise.focus} ${exercise.equipment}`.toLowerCase().includes(query.toLowerCase());
        const matchesEquipment = equipment === 'All' || exercise.equipment === equipment;
        return matchesGroup && matchesQuery && matchesEquipment;
      }),
    [group?.name, query, equipment],
  );

  if (!group) {
    return (
      <Page>
        <Eyebrow>EXERCISE LIBRARY</Eyebrow>
        <Title>Group not found</Title>
        <Body>This muscle group is not part of the exercise library.</Body>
        <ActionButton onPress={() => router.back()}>Go back</ActionButton>
      </Page>
    );
  }

  return (
    <Page contentStyle={{ gap: 17 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable accessibilityLabel="Back to muscle groups" accessibilityRole="button" onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="arrow-left" size={21} color={colors.foreground} />
        </Pressable>
        <Pressable accessibilityLabel="Back to muscle groups" accessibilityRole="button" onPress={() => router.replace('/workouts')} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="grid" size={20} color={colors.primary} />
        </Pressable>
      </View>
      <View style={{ gap: 8 }}>
        <Eyebrow>EXERCISE LIBRARY</Eyebrow>
        <Title>{group.name}</Title>
        <Body>{group.description}</Body>
      </View>
      <Panel style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 17 }}>
        <View style={{ width: 48, height: 48, borderRadius: 15, backgroundColor: `${group.color}20`, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="activity" size={22} color={group.color} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{group.name} library</Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 }}>{group.description} · {group.moveCount} exercises</Text>
        </View>
      </Panel>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View style={{ flex: 1, height: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9 }}>
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            accessibilityLabel="Search exercises in this muscle group"
            onChangeText={setQuery}
            placeholder="Search exercises"
            placeholderTextColor={colors.mutedForeground}
            style={{ flex: 1, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 13 }}
            value={query}
            testID="group-search"
          />
        </View>
        <Pressable accessibilityLabel="Toggle equipment filters" accessibilityRole="button" onPress={() => setShowFilters((value) => !value)} style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
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
      <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 16 }}>{entries.length} exercises to explore</Text>
      {entries.length ? entries.map((exercise) => {
        const saved = data.favoriteExerciseIds.includes(exercise.id);
        return (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            saved={saved}
            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })}
            onBookmark={() => void updateData((current) => ({
              ...current,
              favoriteExerciseIds: saved
                ? current.favoriteExerciseIds.filter((id) => id !== exercise.id)
                : [...current.favoriteExerciseIds, exercise.id],
            }))}
          />
        );
      }) : (
        <Panel>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 }}>No exercises match</Text>
          <Body>Try another search or equipment filter.</Body>
        </Panel>
      )}
    </Page>
  );
}
