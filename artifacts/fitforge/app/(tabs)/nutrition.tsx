import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { localDateKey } from '@/lib/fitness';

const mealTypes = [
  { type: 'Breakfast', icon: 'coffee', suggestion: 'Greek yogurt, oats & berries' },
  { type: 'Lunch', icon: 'bowl-mix', suggestion: 'Chicken rice power bowl' },
  { type: 'Snack', icon: 'fruit-cherries', suggestion: 'Protein shake & banana' },
  { type: 'Dinner', icon: 'silverware-fork-knife', suggestion: 'Salmon, potatoes & greens' },
] as const;

function CalorieRing({ percent }: { percent: number }) {
  const colors = useColors();
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  return (
    <View style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={96} height={96} viewBox="0 0 96 96" style={{ position: 'absolute' }}>
        <Circle cx="48" cy="48" r={radius} stroke={colors.border} strokeWidth={7} fill="none" />
        <Circle
          cx="48" cy="48" r={radius} stroke={colors.primary} strokeWidth={7}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - percent / 100)}
          strokeLinecap="round" fill="none"
          transform="rotate(-90, 48, 48)"
        />
      </Svg>
      <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 }}>{percent}%</Text>
    </View>
  );
}

export default function NutritionScreen() {
  const colors = useColors();
  const { data, updateData } = useFitForge();
  const today = localDateKey();
  const targets = data.profile?.targets ?? { calories: 0, protein: 0, carbs: 0, fats: 0, waterGlasses: 0 };
  const todaysMeals = data.meals.filter((meal) => meal.date === today);
  const totals = useMemo(
    () =>
      todaysMeals.flatMap((meal) => meal.foods).reduce(
        (sum, food) => ({
          calories: sum.calories + food.calories,
          protein: sum.protein + food.protein,
          carbs: sum.carbs + food.carbs,
          fats: sum.fats + food.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
      ),
    [todaysMeals],
  );
  const consumedGlasses = data.hydration.date === today ? data.hydration.glasses : 0;
  const caloriePercent = targets.calories ? Math.min(100, Math.round((totals.calories / targets.calories) * 100)) : 0;
  const macros = [
    { label: 'Protein', value: totals.protein, target: targets.protein, color: colors.primary },
    { label: 'Carbs', value: totals.carbs, target: targets.carbs, color: '#67d7ff' },
    { label: 'Fats', value: totals.fats, target: targets.fats, color: '#ffbd66' },
  ];
  const addWater = async (delta: number) => {
    await updateData((current) => ({
      ...current,
      hydration: {
        date: today,
        glasses: Math.max(0, (current.hydration.date === today ? current.hydration.glasses : 0) + delta),
      },
    }));
  };

  return (
    <Page contentStyle={{ gap: 19 }}>
      <View style={{ gap: 8 }}>
        <Eyebrow>FUEL THE WORK</Eyebrow>
        <Title>Nutrition</Title>
        <Body>Simple targets for stronger sessions.</Body>
      </View>
      <Panel style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 19 }}>
        <View style={{ flex: 1, gap: 7 }}>
          <Eyebrow>DAILY CALORIES</Eyebrow>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 27 }}>
            {totals.calories.toLocaleString()} <Text style={{ color: colors.mutedForeground, fontSize: 13, fontFamily: 'Inter_500Medium' }}>of {targets.calories.toLocaleString()} kcal</Text>
          </Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 }}>Food logged today</Text>
        </View>
        <CalorieRing percent={caloriePercent} />
      </Panel>

      <View style={{ flexDirection: 'row', gap: 9 }}>
        {macros.map((macro) => {
          const percent = macro.target ? Math.min(100, (macro.value / macro.target) * 100) : 0;
          return (
            <Panel key={macro.label} style={{ flex: 1, padding: 13, gap: 9 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: macro.color }} />
                <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>{macro.label}</Text>
              </View>
              <Text numberOfLines={1} style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 }}>{macro.value}g <Text style={{ color: colors.mutedForeground, fontSize: 10, fontFamily: 'Inter_500Medium' }}>of {macro.target}g</Text></Text>
              <View style={{ height: 5, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' }}>
                <View style={{ height: 5, width: `${percent}%`, backgroundColor: macro.color, borderRadius: 4 }} />
              </View>
            </Panel>
          );
        })}
      </View>

      <View style={{ gap: 11 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 }}>Today’s meals</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/meal-plan')} style={{ minHeight: 42, justifyContent: 'center', paddingHorizontal: 8 }}>
            <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 12 }}>See plan</Text>
          </Pressable>
        </View>
        {mealTypes.map(({ type, icon, suggestion }) => {
          const foods = todaysMeals.filter((meal) => meal.type === type).flatMap((meal) => meal.foods);
          const calories = foods.reduce((sum, food) => sum + food.calories, 0);
          return (
            <Pressable key={type} accessibilityRole="button" onPress={() => router.push({ pathname: '/meal/[type]', params: { type } })} testID={`meal-${type.toLowerCase()}`}>
              <Panel style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <MaterialCommunityIcons name={icon as never} size={19} color={colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14 }}>{type}</Text>
                  <Text numberOfLines={1} style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 }}>
                    {foods.length ? `${foods.length} ${foods.length === 1 ? 'food' : 'foods'} logged` : suggestion}
                  </Text>
                </View>
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 12, marginRight: 8 }}>{calories} kcal</Text>
                <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
              </Panel>
            </Pressable>
          );
        })}
      </View>

      <Panel style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="droplet" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 }}>Hydration</Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 }}>{consumedGlasses} of {targets.waterGlasses} glasses today</Text>
        </View>
        {consumedGlasses > 0 && (
          <Pressable accessibilityLabel="Undo one glass of water" accessibilityRole="button" onPress={() => void addWater(-1)} style={{ minHeight: 42, paddingHorizontal: 8, justifyContent: 'center' }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 11 }}>Undo</Text>
          </Pressable>
        )}
        <Pressable accessibilityLabel="Add a glass of water" accessibilityRole="button" onPress={() => void addWater(1)} style={{ minHeight: 40, minWidth: 70, paddingHorizontal: 12, borderRadius: 13, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' }} testID="add-water">
          <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 12 }}>+ Add</Text>
        </Pressable>
      </Panel>
    </Page>
  );
}
