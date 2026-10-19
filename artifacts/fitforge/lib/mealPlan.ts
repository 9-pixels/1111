import type { FoodItem, MealLog } from '@/lib/fitness';
import type { NutritionTargets } from '@/lib/fitness';

const mealTemplates: Array<{ type: MealLog['type']; icon: string; title: string }> = [
  {
    type: 'Breakfast',
    icon: 'coffee-outline',
    title: 'Greek yogurt, oats & berries',
  },
  {
    type: 'Lunch',
    icon: 'bowl-mix',
    title: 'Chicken rice power bowl',
  },
  {
    type: 'Snack',
    icon: 'fruit-cherries',
    title: 'Protein shake & banana',
  },
  {
    type: 'Dinner',
    icon: 'silverware-fork-knife',
    title: 'Salmon, potatoes & greens',
  },
];

const mealRatios = [0.22, 0.31, 0.15, 0.32];

export function buildMealPlan(targets: NutritionTargets) {
  return mealTemplates.map((meal, index) => {
    const ratio = mealRatios[index];
    const food: Omit<FoodItem, 'id'> = {
      name: meal.title,
      calories: Math.round(targets.calories * ratio),
      protein: Math.round(targets.protein * ratio),
      carbs: Math.round(targets.carbs * ratio),
      fats: Math.round(targets.fats * ratio),
    };
    return { ...meal, foods: [food] };
  });
}
