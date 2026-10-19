import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActionButton, Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useColors } from '@/hooks/useColors';
import { useFitForge } from '@/context/FitForgeContext';
import { buildMealPlan } from '@/lib/mealPlan';

export default function MealPlanScreen() {
  const colors = useColors();
  const { data, updateData } = useFitForge();
  const mealPlan = buildMealPlan(data.profile?.targets ?? { calories: 0, protein: 0, carbs: 0, fats: 0, waterGlasses: 0 });
  const addMeal = async (meal: (typeof mealPlan)[number]) => {
    const date = new Date();
    const today = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
    const foodItems = meal.foods.map((food) => ({ ...food, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }));
    await updateData((current) => ({
      ...current,
      meals: [
        ...current.meals,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: today, type: meal.type, foods: foodItems },
      ],
    }));
    router.back();
  };

  return (
    <Page contentStyle={{ gap: 16 }}>
      <Pressable accessibilityLabel="Go back to nutrition" accessibilityRole="button" onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="arrow-left" size={21} color={colors.foreground} />
      </Pressable>
      <View style={{ gap: 8 }}>
        <Eyebrow>FUEL THE WORK</Eyebrow>
        <Title>Simple meal plan</Title>
        <Body>These are optional examples, not pre-logged food. Add one to include it in today’s totals.</Body>
      </View>
      {mealPlan.map((meal) => (
        <Panel key={meal.type}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name={meal.icon as never} size={19} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 10 }}>{meal.type.toUpperCase()}</Text>
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14 }}>{meal.title}</Text>
            </View>
          </View>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 }}>
            {meal.foods[0].calories} kcal · {meal.foods[0].protein}g protein · {meal.foods[0].carbs}g carbs · {meal.foods[0].fats}g fats
          </Text>
          <ActionButton secondary onPress={() => void addMeal(meal)}>Add to today</ActionButton>
        </Panel>
      ))}
    </Page>
  );
}
