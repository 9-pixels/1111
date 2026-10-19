import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActionButton, Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { localDateKey, type FoodItem, type MealLog } from '@/lib/fitness';
import { buildMealPlan } from '@/lib/mealPlan';

const allowedTypes: MealLog['type'][] = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

export default function MealEditorScreen() {
  const { type: routeType } = useLocalSearchParams<{ type: string }>();
  const type = allowedTypes.find((candidate) => candidate.toLowerCase() === routeType?.toLowerCase()) ?? 'Breakfast';
  const colors = useColors();
  const { data, updateData } = useFitForge();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [error, setError] = useState('');
  const plan = buildMealPlan(data.profile?.targets ?? { calories: 0, protein: 0, carbs: 0, fats: 0, waterGlasses: 0 });
  const meals = data.meals.filter((meal) => meal.date === localDateKey() && meal.type === type);
  const foods = meals.flatMap((meal) => meal.foods);
  const suggestion = plan.find((meal) => meal.type === type);

  const saveFood = async (foodInput: Omit<FoodItem, 'id'>) => {
    const food: FoodItem = { ...foodInput, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    const currentDate = localDateKey();
    await updateData((current) => {
      const existingIndex = current.meals.findIndex((meal) => meal.date === currentDate && meal.type === type);
      if (existingIndex < 0) {
        const newMeal: MealLog = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date: currentDate,
          type,
          foods: [food],
        };
        return { ...current, meals: [...current.meals, newMeal] };
      }
      return {
        ...current,
        meals: current.meals.map((meal, index) =>
          index === existingIndex ? { ...meal, foods: [...meal.foods, food] } : meal,
        ),
      };
    });
  };

  const addFood = async () => {
    const parsedCalories = Number(calories);
    const parsedProtein = Number(protein || 0);
    const parsedCarbs = Number(carbs || 0);
    const parsedFats = Number(fats || 0);
    if (!name.trim() || !Number.isFinite(parsedCalories) || parsedCalories < 0 ||
      [parsedProtein, parsedCarbs, parsedFats].some((value) => !Number.isFinite(value) || value < 0)) {
      setError('Enter a food name and valid calories and macro amounts.');
      return;
    }
    try {
      await saveFood({ name: name.trim(), calories: parsedCalories, protein: parsedProtein, carbs: parsedCarbs, fats: parsedFats });
      setName(''); setCalories(''); setProtein(''); setCarbs(''); setFats(''); setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this food.');
    }
  };

  const addSuggestion = async () => {
    if (!suggestion) return;
    try {
      for (const food of suggestion.foods) await saveFood(food);
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not add the meal suggestion.');
    }
  };

  const removeFood = async (foodId: string) => {
    await updateData((current) => ({
      ...current,
      meals: current.meals
        .map((meal) => ({ ...meal, foods: meal.foods.filter((food) => food.id !== foodId) }))
        .filter((meal) => meal.foods.length > 0),
    }));
  };

  const input = (label: string, value: string, setValue: (next: string) => void) => (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType="decimal-pad"
        onChangeText={setValue}
        placeholder="0"
        placeholderTextColor={colors.mutedForeground}
        value={value}
        style={{ minHeight: 47, borderWidth: 1, borderColor: colors.border, borderRadius: 13, paddingHorizontal: 11, backgroundColor: colors.background, color: colors.foreground, fontFamily: 'Inter_500Medium' }}
      />
    </View>
  );

  return (
    <Page contentStyle={{ gap: 16 }}>
      <Pressable accessibilityLabel="Go back to nutrition" accessibilityRole="button" onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="arrow-left" size={21} color={colors.foreground} />
      </Pressable>
      <View style={{ gap: 8 }}>
        <Eyebrow>TODAY’S MEALS</Eyebrow>
        <Title>{type}</Title>
        <Body>Food totals are calculated from the items you log.</Body>
      </View>
      {suggestion && !foods.length ? (
        <Panel>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1 }}>SUGGESTED START</Text>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{suggestion.title}</Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 }}>Suggestion only. Nothing is added to your totals until you choose it.</Text>
          <ActionButton onPress={() => void addSuggestion()}>Add suggestion</ActionButton>
        </Panel>
      ) : null}

      <Panel>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 16 }}>Add a food</Text>
        <TextInput
          accessibilityLabel="Food name"
          onChangeText={setName}
          placeholder="Food name"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          style={{ minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 13, backgroundColor: colors.background, color: colors.foreground, fontFamily: 'Inter_500Medium' }}
          testID="food-name"
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {input('KCAL', calories, setCalories)}
          {input('PROTEIN · G', protein, setProtein)}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {input('CARBS · G', carbs, setCarbs)}
          {input('FATS · G', fats, setFats)}
        </View>
        {error ? <Text accessibilityRole="alert" style={{ color: colors.destructive, fontFamily: 'Inter_500Medium', fontSize: 12 }}>{error}</Text> : null}
        <ActionButton onPress={() => void addFood()} testID="add-food">Add food</ActionButton>
      </Panel>

      <View style={{ gap: 9 }}>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 }}>Logged foods</Text>
        {foods.length ? foods.map((food) => (
          <Panel key={food.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 13 }}>{food.name}</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 }}>
                {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fats}g
              </Text>
            </View>
            <Pressable accessibilityLabel={`Remove ${food.name}`} accessibilityRole="button" onPress={() => void removeFood(food.id)} style={{ width: 38, height: 42, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="trash-2" size={17} color={colors.destructive} />
            </Pressable>
          </Panel>
        )) : <Panel><Body>No foods logged for this meal yet.</Body></Panel>}
      </View>
    </Page>
  );
}
