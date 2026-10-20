import { Platform } from "react-native";
import { EMPTY_DATA } from "./fitness";
import type {
  FitForgeData,
  UserProfile,
  WorkoutSession,
  MealLog,
  MeasurementEntry,
} from "./fitness.ts";

// Only import db in Node.js environment (not web)
let db: any = null;
let schema: any = null;
if (Platform.OS === "ios" || Platform.OS === "android") {
  try {
    const dbModule = require("@workspace/db");
    db = dbModule.db;
    schema = dbModule;
  } catch {
    // Database not available
  }
}

export class FitForgeDb {
  private isAvailable(): boolean {
    return db !== null && schema !== null;
  }

  async loadData(userId: string): Promise<FitForgeData> {
    if (!this.isAvailable()) {
      throw new Error("Database not available on this platform");
    }
    const { eq, and, desc, inArray } = await import("drizzle-orm");
    const { users, workoutSessions, workoutSets, mealLogs, foodItems, measurements, hydrationLogs, favoriteExercises } = schema;
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userRows[0];
    if (!user) return { ...EMPTY_DATA };

    const sessionRows = await db.select().from(workoutSessions).where(eq(workoutSessions.userId, userId)).orderBy(desc(workoutSessions.date));
    const setRows = sessionRows.length > 0
      ? await db.select().from(workoutSets).where(inArray(workoutSets.sessionId, sessionRows.map(s => s.id)))
      : [];
    const setsBySession = new Map<string, typeof setRows>();
    for (const set of setRows) {
      setsBySession.set(set.sessionId, [...(setsBySession.get(set.sessionId) ?? []), set]);
    }
    const sessions: WorkoutSession[] = sessionRows.map(s => ({
      id: s.id,
      date: s.date,
      durationSeconds: s.durationSeconds,
      exerciseIds: s.exerciseIds,
      sets: (setsBySession.get(s.id) ?? []).map(set => ({ exerciseId: set.exerciseId, reps: set.reps, weightKg: set.weightKg, completed: set.completed })),
    }));

    const mealRows = await db.select().from(mealLogs).where(eq(mealLogs.userId, userId)).orderBy(desc(mealLogs.date));
    const foodRows = mealRows.length > 0
      ? await db.select().from(foodItems).where(inArray(foodItems.mealLogId, mealRows.map(m => m.id)))
      : [];
    const foodsByMeal = new Map<string, typeof foodRows>();
    for (const food of foodRows) {
      foodsByMeal.set(food.mealLogId, [...(foodsByMeal.get(food.mealLogId) ?? []), food]);
    }
    const meals: MealLog[] = mealRows.map(m => ({
      id: m.id,
      date: m.date,
      type: m.type,
      foods: (foodsByMeal.get(m.id) ?? []).map(f => ({ id: f.id, name: f.name, calories: f.calories, protein: f.protein, carbs: f.carbs, fats: f.fats })),
    }));

    const measurementRows = await db.select().from(measurements).where(eq(measurements.userId, userId)).orderBy(desc(measurements.date));
    const measurementEntries: MeasurementEntry[] = measurementRows.map(m => ({ id: m.id, type: m.type, value: m.value, unit: m.unit, date: m.date }));

    const hydrationRows = await db.select().from(hydrationLogs).where(eq(hydrationLogs.userId, userId)).orderBy(desc(hydrationLogs.date)).limit(1);
    const hydration = hydrationRows[0] ? { date: hydrationRows[0].date, glasses: hydrationRows[0].glasses } : { date: "", glasses: 0 };

    const favRows = await db.select().from(favoriteExercises).where(eq(favoriteExercises.userId, userId));

    return {
      profile: { firstName: user.firstName, age: user.age, sex: user.sex, heightCm: user.heightCm, weightKg: user.weightKg, goal: user.goal, level: user.level, trainingDaysPerWeek: user.trainingDaysPerWeek, trainingWeekdays: user.trainingWeekdays, targets: user.targets, onboardingComplete: user.onboardingComplete },
      sessions,
      workoutQueue: [],
      meals,
      hydration,
      measurements: measurementEntries,
      favoriteExerciseIds: favRows.map(f => f.exerciseId),
      notificationsEnabled: false,
      notificationScheduleIds: [],
      darkModeEnabled: user.darkModeEnabled,
      language: user.language as "English",
    };
  }

  async saveProfile(userId: string, profile: UserProfile): Promise<void> {
    if (!this.isAvailable()) throw new Error("Database not available");
    const { users } = schema;
    const { eq } = await import("drizzle-orm");
    await db.insert(users).values({ id: userId, firstName: profile.firstName, age: profile.age, sex: profile.sex, heightCm: profile.heightCm, weightKg: profile.weightKg, goal: profile.goal, level: profile.level, trainingDaysPerWeek: profile.trainingDaysPerWeek, trainingWeekdays: profile.trainingWeekdays, targets: profile.targets, onboardingComplete: profile.onboardingComplete, updatedAt: new Date() }).onConflictDoUpdate({ target: users.id, set: { firstName: profile.firstName, age: profile.age, sex: profile.sex, heightCm: profile.heightCm, weightKg: profile.weightKg, goal: profile.goal, level: profile.level, trainingDaysPerWeek: profile.trainingDaysPerWeek, trainingWeekdays: profile.trainingWeekdays, targets: profile.targets, onboardingComplete: profile.onboardingComplete, updatedAt: new Date() } });
  }

  async saveWorkoutSession(userId: string, session: WorkoutSession): Promise<void> {
    if (!this.isAvailable()) throw new Error("Database not available");
    const { workoutSessions, workoutSets } = schema;
    const { eq } = await import("drizzle-orm");
    await db.transaction(async tx => {
      await tx.insert(workoutSessions).values({ id: session.id, userId, date: session.date, durationSeconds: session.durationSeconds, exerciseIds: session.exerciseIds }).onConflictDoUpdate({ target: workoutSessions.id, set: { userId, date: session.date, durationSeconds: session.durationSeconds, exerciseIds: session.exerciseIds } });
      await tx.delete(workoutSets).where(eq(workoutSets.sessionId, session.id));
      if (session.sets.length > 0) {
        await tx.insert(workoutSets).values(session.sets.map(set => ({ sessionId: session.id, exerciseId: set.exerciseId, reps: set.reps, weightKg: set.weightKg, completed: set.completed })));
      }
    });
  }

  async saveMealLog(userId: string, meal: MealLog): Promise<void> {
    if (!this.isAvailable()) throw new Error("Database not available");
    const { mealLogs, foodItems } = schema;
    const { eq } = await import("drizzle-orm");
    await db.transaction(async tx => {
      await tx.insert(mealLogs).values({ id: meal.id, userId, date: meal.date, type: meal.type }).onConflictDoUpdate({ target: mealLogs.id, set: { userId, date: meal.date, type: meal.type } });
      await tx.delete(foodItems).where(eq(foodItems.mealLogId, meal.id));
      if (meal.foods.length > 0) {
        await tx.insert(foodItems).values(meal.foods.map(food => ({ mealLogId: meal.id, name: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fats: food.fats })));
      }
    });
  }

  async saveMeasurement(userId: string, measurement: MeasurementEntry): Promise<void> {
    if (!this.isAvailable()) throw new Error("Database not available");
    const { measurements } = schema;
    await db.insert(measurements).values({ id: measurement.id, userId, type: measurement.type, value: measurement.value, unit: measurement.unit, date: measurement.date }).onConflictDoUpdate({ target: measurements.id, set: { userId, type: measurement.type, value: measurement.value, unit: measurement.unit, date: measurement.date } });
  }

  async saveHydration(userId: string, date: string, glasses: number): Promise<void> {
    if (!this.isAvailable()) throw new Error("Database not available");
    const { hydrationLogs } = schema;
    const { eq, and } = await import("drizzle-orm");
    await db.transaction(async tx => {
      await tx.delete(hydrationLogs).where(and(eq(hydrationLogs.userId, userId), eq(hydrationLogs.date, date)));
      await tx.insert(hydrationLogs).values({ userId, date, glasses });
    });
  }

  async resetAllData(userId: string): Promise<void> {
    if (!this.isAvailable()) throw new Error("Database not available");
    const { users } = schema;
    const { eq } = await import("drizzle-orm");
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const fitForgeDb = new FitForgeDb();