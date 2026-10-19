import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActionButton, Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { calculateTargets, WEEKDAYS, type ExperienceLevel, type FitnessGoal, type SexAtBirth } from '@/lib/fitness';
import { disableTrainingReminders, enableTrainingReminders } from '@/lib/notifications';

const goals: FitnessGoal[] = ['Build Muscle', 'Lose Fat', 'General Fitness', 'Strength'];
const levels: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const sexOptions: { label: string; value: SexAtBirth }[] = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export default function ProfilePreferencesScreen() {
  const colors = useColors();
  const { data, saveProfile, updateData } = useFitForge();
  const profile = data.profile;
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [age, setAge] = useState(String(profile?.age ?? ''));
  const [sex, setSex] = useState<SexAtBirth>(profile?.sex ?? 'prefer-not-to-say');
  const [goal, setGoal] = useState<FitnessGoal>(profile?.goal ?? 'General Fitness');
  const [level, setLevel] = useState<ExperienceLevel>(profile?.level ?? 'Beginner');
  const [height, setHeight] = useState(String(profile?.heightCm ?? ''));
  const [weight, setWeight] = useState(String(profile?.weightKg ?? ''));
  const [weekdays, setWeekdays] = useState<number[]>(profile?.trainingWeekdays ?? []);
  const [error, setError] = useState('');
  if (!profile) {
    return <Page><Title>Profile setup needed</Title><ActionButton onPress={() => router.replace('/onboarding')}>Start onboarding</ActionButton></Page>;
  }

  const toggleWeekday = (index: number) => {
    setWeekdays((current) => current.includes(index) ? current.filter((day) => day !== index) : [...current, index].sort((a, b) => a - b));
  };
  const adjustDays = (delta: number) => {
    const target = Math.max(1, Math.min(7, weekdays.length + delta));
    setWeekdays((current) => {
      const next = [...current];
      if (next.length > target) return next.slice(0, target);
      for (let day = 0; next.length < target && day < 7; day += 1) {
        if (!next.includes(day)) next.push(day);
      }
      return next.sort((a, b) => a - b);
    });
  };
  const save = async () => {
    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);
    const parsedAge = Number(age);
    if (!firstName.trim() || !Number.isFinite(parsedAge) || parsedAge < 13 || parsedAge > 100 ||
      parsedHeight < 100 || parsedHeight > 230 || parsedWeight < 30 || parsedWeight > 350 || weekdays.length < 1) {
      setError('Check your name, age, height, weight, and training days.');
      return;
    }
    try {
      const nextProfile = {
        ...profile,
        firstName: firstName.trim(),
        age: parsedAge,
        sex,
        goal,
        level,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        trainingWeekdays: weekdays,
        trainingDaysPerWeek: weekdays.length,
        targets: calculateTargets(parsedAge, sex, parsedHeight, parsedWeight, weekdays.length, goal),
      };
      await saveProfile(nextProfile);
      if (data.notificationsEnabled) {
        const ids = await enableTrainingReminders(weekdays);
        await updateData((current) => ({ ...current, notificationScheduleIds: ids }));
        await disableTrainingReminders(data.notificationScheduleIds ?? []);
      }
      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save these preferences.');
    }
  };
  const selectPill = (label: string, active: boolean, onPress: () => void) => (
    <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={{ minHeight: 42, borderRadius: 13, borderWidth: 1, borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.accent : colors.background, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: active ? colors.primary : colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 11 }}>{label}</Text>
    </Pressable>
  );

  return (
    <Page contentStyle={{ gap: 17 }}>
      <Pressable accessibilityLabel="Back to profile" accessibilityRole="button" onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="arrow-left" size={21} color={colors.foreground} />
      </Pressable>
      <View style={{ gap: 8 }}>
        <Eyebrow>YOUR TRAINING</Eyebrow>
        <Title>Preferences</Title>
        <Body>Changes recalculate your daily nutrition and water targets.</Body>
      </View>
      <Panel>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14 }}>Goal</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {goals.map((item) => selectPill(item, item === goal, () => setGoal(item)))}
        </View>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14, marginTop: 4 }}>Experience</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {levels.map((item) => selectPill(item, item === level, () => setLevel(item)))}
        </View>
      </Panel>
      <Panel>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14 }}>Body details</Text>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>FIRST NAME</Text>
            <TextInput accessibilityLabel="First name" onChangeText={setFirstName} value={firstName} style={{ minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.background, color: colors.foreground, paddingHorizontal: 13, fontFamily: 'Inter_500Medium' }} />
          </View>
          <View style={{ width: 94, gap: 6 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>AGE</Text>
            <TextInput accessibilityLabel="Age" keyboardType="number-pad" onChangeText={setAge} value={age} style={{ minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.background, color: colors.foreground, paddingHorizontal: 13, fontFamily: 'Inter_500Medium' }} />
          </View>
        </View>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>SEX</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {sexOptions.map((option) => (
            <Pressable key={option.value} accessibilityRole="button" accessibilityState={{ selected: sex === option.value }} onPress={() => setSex(option.value)} style={{ minHeight: 38, borderRadius: 12, borderWidth: 1, borderColor: sex === option.value ? colors.primary : colors.border, backgroundColor: sex === option.value ? colors.accent : colors.background, paddingHorizontal: 10, justifyContent: 'center' }}>
              <Text style={{ color: sex === option.value ? colors.primary : colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>HEIGHT · CM</Text>
            <TextInput accessibilityLabel="Height in centimeters" keyboardType="decimal-pad" onChangeText={setHeight} value={height} style={{ minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.background, color: colors.foreground, paddingHorizontal: 13, fontFamily: 'Inter_500Medium' }} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>WEIGHT · KG</Text>
            <TextInput accessibilityLabel="Weight in kilograms" keyboardType="decimal-pad" onChangeText={setWeight} value={weight} style={{ minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.background, color: colors.foreground, paddingHorizontal: 13, fontFamily: 'Inter_500Medium' }} />
          </View>
        </View>
      </Panel>
      <Panel style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14 }}>Training days</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 }}>{weekdays.length} per week</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable accessibilityLabel="Fewer training days" onPress={() => adjustDays(-1)} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.foreground, fontSize: 20 }}>−</Text></Pressable>
            <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 16 }}>{weekdays.length}</Text>
            <Pressable accessibilityLabel="More training days" onPress={() => adjustDays(1)} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.foreground, fontSize: 20 }}>+</Text></Pressable>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 5 }}>
          {WEEKDAYS.map((day, index) => {
            const selected = weekdays.includes(index);
            return (
              <Pressable key={day} accessibilityRole="button" accessibilityLabel={`${day}, ${selected ? 'training day' : 'rest day'}`} accessibilityState={{ selected }} onPress={() => toggleWeekday(index)} style={{ flex: 1, minHeight: 52, borderWidth: 1, borderRadius: 13, borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.accent : colors.background, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <Text style={{ color: selected ? colors.primary : colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 11 }}>{day}</Text>
                <Text style={{ color: selected ? colors.primary : colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 8 }}>{selected ? 'TRAIN' : 'REST'}</Text>
              </Pressable>
            );
          })}
        </View>
      </Panel>
      {error ? <Text accessibilityRole="alert" style={{ color: colors.destructive, fontFamily: 'Inter_500Medium', fontSize: 12 }}>{error}</Text> : null}
      <ActionButton onPress={() => void save()} testID="save-training-preferences">Save preferences</ActionButton>
    </Page>
  );
}
