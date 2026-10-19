export type FitnessGoal =
  | 'Build Muscle'
  | 'Lose Fat'
  | 'General Fitness'
  | 'Strength';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type SexAtBirth = 'female' | 'male' | 'other' | 'prefer-not-to-say';

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  waterGlasses: number;
}

export interface UserProfile {
  firstName: string;
  age: number;
  sex: SexAtBirth;
  heightCm: number;
  weightKg: number;
  goal: FitnessGoal;
  level: ExperienceLevel;
  trainingDaysPerWeek: number;
  trainingWeekdays: number[];
  targets: NutritionTargets;
  onboardingComplete: boolean;
}

export interface WorkoutSet {
  exerciseId: string;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  durationSeconds: number;
  exerciseIds: string[];
  sets: WorkoutSet[];
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealLog {
  id: string;
  date: string;
  type: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  foods: FoodItem[];
}

export interface MeasurementEntry {
  id: string;
  type: 'Body weight' | 'Chest' | 'Arms' | 'Waist';
  value: number;
  unit: 'kg' | 'cm';
  date: string;
}

export interface FitForgeData {
  profile: UserProfile | null;
  sessions: WorkoutSession[];
  workoutQueue: string[];
  meals: MealLog[];
  hydration: { date: string; glasses: number };
  measurements: MeasurementEntry[];
  favoriteExerciseIds: string[];
  notificationsEnabled: boolean;
  notificationScheduleIds: string[];
  darkModeEnabled: boolean;
  language: 'English';
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const EMPTY_DATA: FitForgeData = {
  profile: null,
  sessions: [],
  workoutQueue: [],
  meals: [],
  hydration: { date: '', glasses: 0 },
  measurements: [],
  favoriteExerciseIds: [],
  notificationsEnabled: false,
  notificationScheduleIds: [],
  darkModeEnabled: true,
  language: 'English',
};

export function calculateTargets(
  age: number,
  sex: SexAtBirth,
  heightCm: number,
  weightKg: number,
  trainingDaysPerWeek: number,
  goal: FitnessGoal,
): NutritionTargets {
  const sexAdjustment = sex === 'male' ? 5 : sex === 'female' ? -161 : -78;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexAdjustment;
  const activityFactor = Math.min(1.9, 1.2 + trainingDaysPerWeek * 0.1);
  const goalAdjustment = goal === 'Build Muscle' ? 300 : goal === 'Lose Fat' ? -400 : 0;
  const calories = Math.max(1200, Math.round(bmr * activityFactor + goalAdjustment));
  const protein = Math.round(weightKg * 2.2);
  const fats = Math.round(weightKg * 0.9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4));
  const waterGlasses = Math.max(1, Math.round((weightKg * 35) / 250));
  return { calories, protein, carbs, fats, waterGlasses };
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
