import React, { useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ActionButton, Body, Eyebrow, Panel, Title } from '@/components/FitForgeUI';
import { useColors } from '@/hooks/useColors';
import { calculateTargets, WEEKDAYS, type ExperienceLevel, type FitnessGoal, type SexAtBirth, type UserProfile } from '@/lib/fitness';
import { useFitForge } from '@/context/FitForgeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const steps = ['YOUR NAME', 'ABOUT YOU', 'YOUR GOAL', 'EXPERIENCE', 'YOUR WEEK', 'YOUR PLAN'];
const goals: FitnessGoal[] = ['Build Muscle', 'Lose Fat', 'General Fitness', 'Strength'];
const experienceOptions = [
  { label: 'Less than 1 year', level: 'Beginner' as const, detail: 'Build consistent foundations' },
  { label: '1–3 years', level: 'Intermediate' as const, detail: 'Ready for structured progression' },
  { label: '3+ years', level: 'Advanced' as const, detail: 'Train with focused intent' },
];
const sexOptions: { label: string; value: SexAtBirth }[] = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

function FormField({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType = 'default',
  testID,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric';
  testID?: string;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === 'default' ? 'words' : 'none'}
        keyboardType={keyboardType === 'numeric' ? 'decimal-pad' : 'default'}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="done"
        testID={testID}
        value={value}
        style={{
          minHeight: 54,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          paddingHorizontal: 16,
          color: colors.foreground,
          fontFamily: 'Inter_500Medium',
          fontSize: 16,
        }}
      />
    </View>
  );
}

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveProfile } = useFitForge();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<SexAtBirth | null>(null);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [goal, setGoal] = useState<FitnessGoal | null>(null);
  const [level, setLevel] = useState<ExperienceLevel | null>(null);
  const [trainingDays, setTrainingDays] = useState(4);
  const [trainingWeekdays, setTrainingWeekdays] = useState<number[]>([0, 2, 4, 5]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const parsedAge = Number(age);
  const parsedHeight = Number(heightCm);
  const parsedWeight = Number(weightKg);
  const targets = useMemo(() => {
    if (!sex || !goal || !parsedAge || !parsedHeight || !parsedWeight) return null;
    return calculateTargets(parsedAge, sex, parsedHeight, parsedWeight, trainingDays, goal);
  }, [sex, goal, parsedAge, parsedHeight, parsedWeight, trainingDays]);

  const validateStep = () => {
    if (step === 0 && !firstName.trim()) return 'Enter your first name to continue.';
    if (step === 1) {
      if (!sex) return 'Choose an option for sex to calculate your starting targets.';
      if (![parsedAge, parsedHeight, parsedWeight].every(Number.isFinite)) return 'Enter age, height, and weight using numbers.';
      if (parsedAge < 13 || parsedAge > 100) return 'Enter an age between 13 and 100.';
      if (parsedHeight < 100 || parsedHeight > 230) return 'Enter a height between 100 and 230 cm.';
      if (parsedWeight < 30 || parsedWeight > 350) return 'Enter a weight between 30 and 350 kg.';
    }
    if (step === 2 && !goal) return 'Choose the goal you want to work toward.';
    if (step === 3 && !level) return 'Choose the experience range that fits you.';
    if (step === 4 && trainingWeekdays.length !== trainingDays) {
      return `Select exactly ${trainingDays} training ${trainingDays === 1 ? 'day' : 'days'}.`;
    }
    return '';
  };

  const next = () => {
    Keyboard.dismiss();
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep((current) => Math.min(5, current + 1));
  };

  const finish = async () => {
    const validationError = validateStep();
    if (validationError || !sex || !goal || !level || !targets) {
      setError(validationError || 'Complete each step to calculate your plan.');
      return;
    }
    const profile: UserProfile = {
      firstName: firstName.trim(),
      age: parsedAge,
      sex,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      goal,
      level,
      trainingDaysPerWeek: trainingDays,
      trainingWeekdays: [...trainingWeekdays].sort((a, b) => a - b),
      targets,
      onboardingComplete: true,
    };
    setSaving(true);
    setError('');
    try {
      await saveProfile(profile);
      router.replace('/home');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Your profile could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const toggleWeekday = (day: number) => {
    setTrainingWeekdays((current) => {
      if (current.includes(day)) return current.filter((value) => value !== day);
      if (current.length >= trainingDays) return current;
      return [...current, day];
    });
    setError('');
  };

  const selectionStyle = (selected: boolean) => ({
    backgroundColor: selected ? colors.accent : colors.background,
    borderColor: selected ? colors.primary : colors.border,
  });

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
        paddingHorizontal: 22,
        paddingTop: insets.top + 18,
        paddingBottom: insets.bottom + 30,
        gap: 20,
      }}
      bottomOffset={72}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {steps.map((label, index) => (
            <View
              key={label}
              accessibilityLabel={`Step ${index + 1} of ${steps.length}`}
              style={{
                width: index === step ? 22 : 7,
                height: 7,
                borderRadius: 8,
                backgroundColor: index <= step ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>
          {step + 1} / {steps.length}
        </Text>
      </View>

      <View style={{ gap: 9 }}>
        <Eyebrow>{step === 5 ? 'YOUR STARTING POINT' : 'FITFORGE · GETTING TO KNOW YOU'}</Eyebrow>
        <Title size={step === 5 ? 34 : 31}>
          {[
            'Let’s make this personal.',
            'A little about your body.',
            'What are you working toward?',
            'Where are you starting from?',
            'Build your training week.',
            'Your plan, built around you.',
          ][step]}
        </Title>
        <Body>
          {step === 0
            ? 'Tell us a little about yourself so FitForge can make every session count.'
            : step === 5
              ? 'These are your daily starting targets. You can adjust them any time in Profile.'
              : 'Your answers help FitForge set a useful starting point. You can update your details later.'}
        </Body>
      </View>

      {step === 0 && (
        <Panel>
          <FormField label="FIRST NAME" value={firstName} placeholder="Your name" onChangeText={setFirstName} testID="onboarding-first-name" />
        </Panel>
      )}

      {step === 1 && (
        <Panel>
          <FormField label="AGE" value={age} placeholder="Years" keyboardType="numeric" onChangeText={setAge} testID="onboarding-age" />
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 12, marginTop: 4 }}>SEX</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {sexOptions.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: sex === option.value }}
                onPress={() => setSex(option.value)}
                style={[{ minHeight: 46, paddingHorizontal: 13, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, selectionStyle(sex === option.value)]}
              >
                <Text style={{ color: sex === option.value ? colors.primary : colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          <FormField label="HEIGHT" value={heightCm} placeholder="cm" keyboardType="numeric" onChangeText={setHeightCm} testID="onboarding-height" />
          <FormField label="CURRENT BODY WEIGHT" value={weightKg} placeholder="kg" keyboardType="numeric" onChangeText={setWeightKg} testID="onboarding-weight" />
        </Panel>
      )}

      {step === 2 && (
        <View style={{ gap: 10 }}>
          {goals.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: goal === option }}
              onPress={() => setGoal(option)}
              style={[{ minHeight: 61, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17, borderWidth: 1, borderRadius: 18 }, selectionStyle(goal === option)]}
            >
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>{option}</Text>
              <Text style={{ color: goal === option ? colors.primary : colors.mutedForeground, fontSize: 18 }}>{goal === option ? '●' : '○'}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {step === 3 && (
        <View style={{ gap: 10 }}>
          {experienceOptions.map((option) => (
            <Pressable
              key={option.level}
              accessibilityRole="button"
              accessibilityState={{ selected: level === option.level }}
              onPress={() => setLevel(option.level)}
              style={[{ minHeight: 84, padding: 16, borderWidth: 1, borderRadius: 18, gap: 6 }, selectionStyle(level === option.level)]}
            >
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{option.label}</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>{option.detail} · {option.level}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {step === 4 && (
        <Panel>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 }}>Training days</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 }}>Choose 1 to 7 days per week</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable accessibilityLabel="Fewer training days" accessibilityRole="button" testID="training-days-minus" onPress={() => {
                const nextDays = Math.max(1, trainingDays - 1);
                setTrainingDays(nextDays);
                setTrainingWeekdays((current) => current.slice(0, nextDays));
              }} style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.foreground, fontSize: 23 }}>−</Text>
              </Pressable>
              <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 18, minWidth: 15, textAlign: 'center' }}>{trainingDays}</Text>
              <Pressable accessibilityLabel="More training days" accessibilityRole="button" testID="training-days-plus" onPress={() => setTrainingDays((days) => Math.min(7, days + 1))} style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.foreground, fontSize: 23 }}>+</Text>
              </Pressable>
            </View>
          </View>
          <View style={{ gap: 10, marginTop: 5 }}>
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Tap the days you’ll train</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 5 }}>
              {WEEKDAYS.map((day, index) => {
                const selected = trainingWeekdays.includes(index);
                return (
                  <Pressable
                    key={day}
                    accessibilityRole="button"
                    accessibilityLabel={`${day}, ${selected ? 'training day' : 'rest day'}`}
                    accessibilityState={{ selected }}
                    onPress={() => toggleWeekday(index)}
                    style={[{ flex: 1, minHeight: 56, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 3 }, selectionStyle(selected)]}
                  >
                    <Text style={{ color: selected ? colors.primary : colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 12 }}>{day}</Text>
                    <Text style={{ color: selected ? colors.primary : colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 8 }}>{selected ? 'TRAIN' : 'REST'}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 }}>
              {trainingWeekdays.length} of {trainingDays} training days selected
            </Text>
          </View>
        </Panel>
      )}

      {step === 5 && (
        <Panel style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1 }}>DAILY ENERGY</Text>
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 36 }}>{targets?.calories.toLocaleString() ?? '—'} <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>kcal</Text></Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.accent }}>
              <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 11 }}>{goal?.toUpperCase()}</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 3 }} />
          {[
            ['Protein', `${targets?.protein ?? '—'} g`],
            ['Carbohydrates', `${targets?.carbs ?? '—'} g`],
            ['Fats', `${targets?.fats ?? '—'} g`],
            ['Water', `${targets?.waterGlasses ?? '—'} glasses`],
          ].map(([label, value]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 14 }}>{label}</Text>
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{value}</Text>
            </View>
          ))}
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, marginTop: 3 }}>
            Estimates use the Mifflin–St Jeor equation and your weekly training schedule. They are a starting point, not medical advice.
          </Text>
        </Panel>
      )}

      {error ? (
        <Text accessibilityRole="alert" style={{ color: colors.destructive, fontFamily: 'Inter_500Medium', fontSize: 13 }}>{error}</Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
        {step > 0 && (
          <ActionButton secondary onPress={() => { setError(''); setStep((current) => current - 1); }} style={{ minWidth: 112 }} testID="onboarding-back">
            Back
          </ActionButton>
        )}
        {step < 5 ? (
          <ActionButton onPress={next} style={{ flex: 1 }} testID="onboarding-next">
            Next
          </ActionButton>
        ) : (
          <ActionButton onPress={finish} disabled={saving || !targets} style={{ flex: 1 }} testID="onboarding-finish">
            {saving ? 'Saving your plan…' : 'Let’s go'}
          </ActionButton>
        )}
      </View>

      {step === 1 && !sex ? (
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center', fontSize: 11 }}>
          You can choose “Prefer not to say”; a neutral estimate will be used.
        </Text>
      ) : null}
    </KeyboardAwareScrollViewCompat>
  );
}
