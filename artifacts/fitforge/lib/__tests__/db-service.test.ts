import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FitForgeData, UserProfile, WorkoutSession, MealLog, MeasurementEntry } from '@/lib/fitness';

// ─── Mock DB client ───────────────────────────────────────────────────

/**
 * A mock of a database client (e.g. SQLite / AsyncStorage) that the
 * DB service layer is expected to wrap. The tests below define the
 * contract that the real implementation must satisfy.
 */

interface DbClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

function createMockDbClient(initialData: Record<string, string> = {}): DbClient {
  const store = new Map(Object.entries(initialData));
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    remove: vi.fn(async (key: string) => {
      store.delete(key);
    }),
    keys: vi.fn(async () => [...store.keys()]),
  };
}

// ─── Simulated DB service (to be replaced by real implementation) ─────

/**
 * This is a minimal simulation of the DB service interface.
 * The real db-service.ts should export these functions with the same signatures.
 */
const DB_KEYS = {
  PROFILE: 'fitforge:profile',
  SESSIONS: 'fitforge:sessions',
  WORKOUT_QUEUE: 'fitforge:workout-queue',
  MEALS: 'fitforge:meals',
  HYDRATION: 'fitforge:hydration',
  MEASUREMENTS: 'fitforge:measurements',
  FAVORITE_EXERCISES: 'fitforge:favorite-exercises',
  NOTIFICATIONS_ENABLED: 'fitforge:notifications-enabled',
  NOTIFICATION_SCHEDULE_IDS: 'fitforge:notification-schedule-ids',
  DARK_MODE: 'fitforge:dark-mode',
  LANGUAGE: 'fitforge:language',
} as const;

class DbService {
  constructor(private db: DbClient) {}

  async getProfile(): Promise<UserProfile | null> {
    const raw = await this.db.get(DB_KEYS.PROFILE);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.db.set(DB_KEYS.PROFILE, JSON.stringify(profile));
  }

  async getSessions(): Promise<WorkoutSession[]> {
    const raw = await this.db.get(DB_KEYS.SESSIONS);
    return raw ? (JSON.parse(raw) as WorkoutSession[]) : [];
  }

  async saveSessions(sessions: WorkoutSession[]): Promise<void> {
    await this.db.set(DB_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  async getWorkoutQueue(): Promise<string[]> {
    const raw = await this.db.get(DB_KEYS.WORKOUT_QUEUE);
    return raw ? (JSON.parse(raw) as string[]) : [];
  }

  async saveWorkoutQueue(queue: string[]): Promise<void> {
    await this.db.set(DB_KEYS.WORKOUT_QUEUE, JSON.stringify(queue));
  }

  async getMeals(): Promise<MealLog[]> {
    const raw = await this.db.get(DB_KEYS.MEALS);
    return raw ? (JSON.parse(raw) as MealLog[]) : [];
  }

  async saveMeals(meals: MealLog[]): Promise<void> {
    await this.db.set(DB_KEYS.MEALS, JSON.stringify(meals));
  }

  async getHydration(): Promise<{ date: string; glasses: number }> {
    const raw = await this.db.get(DB_KEYS.HYDRATION);
    return raw ? JSON.parse(raw) : { date: '', glasses: 0 };
  }

  async saveHydration(hydration: { date: string; glasses: number }): Promise<void> {
    await this.db.set(DB_KEYS.HYDRATION, JSON.stringify(hydration));
  }

  async getMeasurements(): Promise<MeasurementEntry[]> {
    const raw = await this.db.get(DB_KEYS.MEASUREMENTS);
    return raw ? (JSON.parse(raw) as MeasurementEntry[]) : [];
  }

  async saveMeasurements(measurements: MeasurementEntry[]): Promise<void> {
    await this.db.set(DB_KEYS.MEASUREMENTS, JSON.stringify(measurements));
  }

  async getFavoriteExerciseIds(): Promise<string[]> {
    const raw = await this.db.get(DB_KEYS.FAVORITE_EXERCISES);
    return raw ? (JSON.parse(raw) as string[]) : [];
  }

  async saveFavoriteExerciseIds(ids: string[]): Promise<void> {
    await this.db.set(DB_KEYS.FAVORITE_EXERCISES, JSON.stringify(ids));
  }

  async getNotificationsEnabled(): Promise<boolean> {
    const raw = await this.db.get(DB_KEYS.NOTIFICATIONS_ENABLED);
    return raw === 'true';
  }

  async saveNotificationsEnabled(enabled: boolean): Promise<void> {
    await this.db.set(DB_KEYS.NOTIFICATIONS_ENABLED, String(enabled));
  }

  async getDarkModeEnabled(): Promise<boolean> {
    const raw = await this.db.get(DB_KEYS.DARK_MODE);
    return raw === 'true';
  }

  async saveDarkModeEnabled(enabled: boolean): Promise<void> {
    await this.db.set(DB_KEYS.DARK_MODE, String(enabled));
  }

  async getLanguage(): Promise<'English'> {
    const raw = await this.db.get(DB_KEYS.LANGUAGE);
    return (raw as 'English') || 'English';
  }

  async saveLanguage(lang: 'English'): Promise<void> {
    await this.db.set(DB_KEYS.LANGUAGE, lang);
  }

  async getAllData(): Promise<FitForgeData> {
    const [
      profile,
      sessions,
      workoutQueue,
      meals,
      hydration,
      measurements,
      favoriteExerciseIds,
      notificationsEnabled,
      darkModeEnabled,
      language,
    ] = await Promise.all([
      this.getProfile(),
      this.getSessions(),
      this.getWorkoutQueue(),
      this.getMeals(),
      this.getHydration(),
      this.getMeasurements(),
      this.getFavoriteExerciseIds(),
      this.getNotificationsEnabled(),
      this.getDarkModeEnabled(),
      this.getLanguage(),
    ]);
    return {
      profile,
      sessions,
      workoutQueue,
      meals,
      hydration,
      measurements,
      favoriteExerciseIds,
      notificationsEnabled,
      notificationScheduleIds: [],
      darkModeEnabled,
      language,
    };
  }
}

// ─── Tests ────────────────────────────────────────────────────────────

describe('DbService', () => {
  let db: DbClient;
  let service: DbService;

  const sampleProfile: UserProfile = {
    firstName: 'Test',
    age: 25,
    sex: 'male',
    heightCm: 180,
    weightKg: 85,
    goal: 'Build Muscle',
    level: 'Intermediate',
    trainingDaysPerWeek: 4,
    trainingWeekdays: [1, 2, 4, 5],
    targets: { calories: 2800, protein: 187, carbs: 300, fats: 77, waterGlasses: 10 },
    onboardingComplete: true,
  };

  const sampleSession: WorkoutSession = {
    id: 'session-1',
    date: '2025-01-15',
    durationSeconds: 3600,
    exerciseIds: ['chest-barbell-bench-press', 'back-barbell-bent-over-row'],
    sets: [
      { exerciseId: 'chest-barbell-bench-press', reps: 8, weightKg: 80, completed: true },
      { exerciseId: 'chest-barbell-bench-press', reps: 8, weightKg: 80, completed: false },
    ],
  };

  const sampleMeal: MealLog = {
    id: 'meal-1',
    date: '2025-01-15',
    type: 'Lunch',
    foods: [{ id: 'food-1', name: 'Chicken Rice', calories: 500, protein: 40, carbs: 50, fats: 10 }],
  };

  const sampleMeasurement: MeasurementEntry = {
    id: 'meas-1',
    type: 'Body weight',
    value: 85,
    unit: 'kg',
    date: '2025-01-15',
  };

  beforeEach(() => {
    db = createMockDbClient();
    service = new DbService(db);
  });

  // ── Profile ──
  describe('profile', () => {
    it('returns null when no profile is stored', async () => {
      const result = await service.getProfile();
      expect(result).toBeNull();
    });

    it('saves and retrieves a profile', async () => {
      await service.saveProfile(sampleProfile);
      const result = await service.getProfile();
      expect(result).toEqual(sampleProfile);
    });

    it('overwrites an existing profile', async () => {
      await service.saveProfile(sampleProfile);
      const updated = { ...sampleProfile, firstName: 'Updated' };
      await service.saveProfile(updated);
      const result = await service.getProfile();
      expect(result!.firstName).toBe('Updated');
    });

    it('calls db.set with the correct key', async () => {
      await service.saveProfile(sampleProfile);
      expect(db.set).toHaveBeenCalledWith(DB_KEYS.PROFILE, JSON.stringify(sampleProfile));
    });
  });

  // ── Sessions ──
  describe('sessions', () => {
    it('returns empty array when no sessions stored', async () => {
      const result = await service.getSessions();
      expect(result).toEqual([]);
    });

    it('saves and retrieves sessions', async () => {
      const sessions = [sampleSession];
      await service.saveSessions(sessions);
      const result = await service.getSessions();
      expect(result).toEqual(sessions);
    });

    it('persists multiple sessions', async () => {
      const sessions = [sampleSession, { ...sampleSession, id: 'session-2' }];
      await service.saveSessions(sessions);
      const result = await service.getSessions();
      expect(result).toHaveLength(2);
    });
  });

  // ── Workout queue ──
  describe('workoutQueue', () => {
    it('returns empty array when no queue stored', async () => {
      const result = await service.getWorkoutQueue();
      expect(result).toEqual([]);
    });

    it('saves and retrieves the workout queue', async () => {
      const queue = ['chest-barbell-bench-press', 'back-lat-pulldown'];
      await service.saveWorkoutQueue(queue);
      const result = await service.getWorkoutQueue();
      expect(result).toEqual(queue);
    });
  });

  // ── Meals ──
  describe('meals', () => {
    it('returns empty array when no meals stored', async () => {
      const result = await service.getMeals();
      expect(result).toEqual([]);
    });

    it('saves and retrieves meals', async () => {
      const meals = [sampleMeal];
      await service.saveMeals(meals);
      const result = await service.getMeals();
      expect(result).toEqual(meals);
    });
  });

  // ── Hydration ──
  describe('hydration', () => {
    it('returns default when no hydration stored', async () => {
      const result = await service.getHydration();
      expect(result).toEqual({ date: '', glasses: 0 });
    });

    it('saves and retrieves hydration', async () => {
      const hydration = { date: '2025-01-15', glasses: 8 };
      await service.saveHydration(hydration);
      const result = await service.getHydration();
      expect(result).toEqual(hydration);
    });
  });

  // ── Measurements ──
  describe('measurements', () => {
    it('returns empty array when no measurements stored', async () => {
      const result = await service.getMeasurements();
      expect(result).toEqual([]);
    });

    it('saves and retrieves measurements', async () => {
      const measurements = [sampleMeasurement];
      await service.saveMeasurements(measurements);
      const result = await service.getMeasurements();
      expect(result).toEqual(measurements);
    });
  });

  // ── Favorite exercises ──
  describe('favoriteExerciseIds', () => {
    it('returns empty array when no favorites stored', async () => {
      const result = await service.getFavoriteExerciseIds();
      expect(result).toEqual([]);
    });

    it('saves and retrieves favorite exercise ids', async () => {
      const ids = ['chest-barbell-bench-press', 'legs-barbell-back-squat'];
      await service.saveFavoriteExerciseIds(ids);
      const result = await service.getFavoriteExerciseIds();
      expect(result).toEqual(ids);
    });
  });

  // ── Notifications ──
  describe('notificationsEnabled', () => {
    it('returns false when not set', async () => {
      const result = await service.getNotificationsEnabled();
      expect(result).toBe(false);
    });

    it('saves and retrieves notifications enabled', async () => {
      await service.saveNotificationsEnabled(true);
      const result = await service.getNotificationsEnabled();
      expect(result).toBe(true);
    });
  });

  // ── Dark mode ──
  describe('darkModeEnabled', () => {
    it('returns false when not set', async () => {
      const result = await service.getDarkModeEnabled();
      expect(result).toBe(false);
    });

    it('saves and retrieves dark mode enabled', async () => {
      await service.saveDarkModeEnabled(true);
      const result = await service.getDarkModeEnabled();
      expect(result).toBe(true);
    });
  });

  // ── Language ──
  describe('language', () => {
    it('returns English as default', async () => {
      const result = await service.getLanguage();
      expect(result).toBe('English');
    });

    it('saves and retrieves language', async () => {
      await service.saveLanguage('English');
      const result = await service.getLanguage();
      expect(result).toBe('English');
    });
  });

  // ── getAllData ──
  describe('getAllData', () => {
    it('returns a complete FitForgeData object', async () => {
      await service.saveProfile(sampleProfile);
      await service.saveSessions([sampleSession]);
      await service.saveWorkoutQueue(['ex-1']);
      await service.saveMeals([sampleMeal]);
      await service.saveHydration({ date: '2025-01-15', glasses: 8 });
      await service.saveMeasurements([sampleMeasurement]);
      await service.saveFavoriteExerciseIds(['ex-1']);
      await service.saveNotificationsEnabled(true);
      await service.saveDarkModeEnabled(false);
      await service.saveLanguage('English');

      const result = await service.getAllData();
      expect(result.profile).toEqual(sampleProfile);
      expect(result.sessions).toHaveLength(1);
      expect(result.workoutQueue).toEqual(['ex-1']);
      expect(result.meals).toHaveLength(1);
      expect(result.hydration).toEqual({ date: '2025-01-15', glasses: 8 });
      expect(result.measurements).toHaveLength(1);
      expect(result.favoriteExerciseIds).toEqual(['ex-1']);
      expect(result.notificationsEnabled).toBe(true);
      expect(result.darkModeEnabled).toBe(false);
      expect(result.language).toBe('English');
      expect(result.notificationScheduleIds).toEqual([]);
    });

    it('returns default empty data when db is empty', async () => {
      const result = await service.getAllData();
      expect(result.profile).toBeNull();
      expect(result.sessions).toEqual([]);
      expect(result.workoutQueue).toEqual([]);
      expect(result.meals).toEqual([]);
      expect(result.hydration).toEqual({ date: '', glasses: 0 });
      expect(result.measurements).toEqual([]);
      expect(result.favoriteExerciseIds).toEqual([]);
      expect(result.notificationsEnabled).toBe(false);
      expect(result.notificationScheduleIds).toEqual([]);
      expect(result.darkModeEnabled).toBe(false);
      expect(result.language).toBe('English');
    });
  });

  // ── Error handling ──
  describe('error handling', () => {
    it('propagates db.get errors', async () => {
      (db.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('DB read error'));
      await expect(service.getProfile()).rejects.toThrow('DB read error');
    });

    it('propagates db.set errors', async () => {
      (db.set as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('DB write error'));
      await expect(service.saveProfile(sampleProfile)).rejects.toThrow('DB write error');
    });

    it('handles corrupted JSON gracefully', async () => {
      (db.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce('not valid json');
      await expect(service.getProfile()).rejects.toThrow();
    });
  });

  // ── Data isolation ──
  describe('data isolation', () => {
    it('different DbService instances with different clients are isolated', async () => {
      const db2 = createMockDbClient();
      const service2 = new DbService(db2);

      await service.saveProfile(sampleProfile);
      const result2 = await service2.getProfile();
      expect(result2).toBeNull();
    });
  });
});
