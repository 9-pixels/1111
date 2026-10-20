import { pgTable, uuid, text, integer, timestamp, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: text("first_name").notNull(),
  age: integer("age").notNull(),
  sex: text("sex", { enum: ["female", "male", "other", "prefer-not-to-say"] }).notNull(),
  heightCm: real("height_cm").notNull(),
  weightKg: real("weight_kg").notNull(),
  goal: text("goal", { enum: ["Build Muscle", "Lose Fat", "General Fitness", "Strength"] }).notNull(),
  level: text("level", { enum: ["Beginner", "Intermediate", "Advanced"] }).notNull(),
  trainingDaysPerWeek: integer("training_days_per_week").notNull(),
  trainingWeekdays: jsonb("training_weekdays").$type<number[]>().notNull(),
  targets: jsonb("targets").$type<{
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    waterGlasses: number;
  }>().notNull(),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  darkModeEnabled: boolean("dark_mode_enabled").default(true).notNull(),
  language: text("language").default("English").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── Workout Sessions ────────────────────────────────────────────────────────

export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  durationSeconds: integer("duration_seconds").notNull(),
  exerciseIds: jsonb("exercise_ids").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({ id: true, createdAt: true });
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type WorkoutSession = typeof workoutSessions.$inferSelect;

// ─── Workout Sets ────────────────────────────────────────────────────────────

export const workoutSets = pgTable("workout_sets", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => workoutSessions.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").notNull(),
  reps: integer("reps").notNull(),
  weightKg: real("weight_kg").notNull().default(0),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkoutSetSchema = createInsertSchema(workoutSets).omit({ id: true, createdAt: true });
export type InsertWorkoutSet = z.infer<typeof insertWorkoutSetSchema>;
export type WorkoutSet = typeof workoutSets.$inferSelect;

// ─── Meal Logs ───────────────────────────────────────────────────────────────

export const mealLogs = pgTable("meal_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  type: text("type", { enum: ["Breakfast", "Lunch", "Snack", "Dinner"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMealLogSchema = createInsertSchema(mealLogs).omit({ id: true, createdAt: true });
export type InsertMealLog = z.infer<typeof insertMealLogSchema>;
export type MealLog = typeof mealLogs.$inferSelect;

// ─── Food Items ──────────────────────────────────────────────────────────────

export const foodItems = pgTable("food_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  mealLogId: uuid("meal_log_id").notNull().references(() => mealLogs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fats: real("fats").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({ id: true, createdAt: true });
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodItem = typeof foodItems.$inferSelect;

// ─── Measurements ────────────────────────────────────────────────────────────

export const measurements = pgTable("measurements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["Body weight", "Chest", "Arms", "Waist"] }).notNull(),
  value: real("value").notNull(),
  unit: text("unit", { enum: ["kg", "cm"] }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMeasurementSchema = createInsertSchema(measurements).omit({ id: true, createdAt: true });
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;
export type Measurement = typeof measurements.$inferSelect;

// ─── Hydration ───────────────────────────────────────────────────────────────

export const hydrationLogs = pgTable("hydration_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  glasses: integer("glasses").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHydrationLogSchema = createInsertSchema(hydrationLogs).omit({ id: true, createdAt: true });
export type InsertHydrationLog = z.infer<typeof insertHydrationLogSchema>;
export type HydrationLog = typeof hydrationLogs.$inferSelect;

// ─── Favorite Exercises ──────────────────────────────────────────────────────

export const favoriteExercises = pgTable("favorite_exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFavoriteExerciseSchema = createInsertSchema(favoriteExercises).omit({ id: true, createdAt: true });
export type InsertFavoriteExercise = z.infer<typeof insertFavoriteExerciseSchema>;
export type FavoriteExercise = typeof favoriteExercises.$inferSelect;
