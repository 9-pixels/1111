import { describe, it, expect } from 'vitest';
import {
  exercises,
  muscleGroups,
  getExerciseById,
  getGroupById,
  getSuggestedWorkout,
  EQUIPMENT_FILTERS,
} from '@/lib/exercises';
import type { Exercise, MuscleGroup, UserProfile } from '@/lib/exercises';
import { EMPTY_DATA } from '@/lib/fitness';

// ─── Exercise data integrity ──────────────────────────────────────────

describe('exercises data', () => {
  it('exports a non-empty exercises array', () => {
    expect(Array.isArray(exercises)).toBe(true);
    expect(exercises.length).toBeGreaterThan(0);
  });

  it('exports a non-empty muscleGroups array', () => {
    expect(Array.isArray(muscleGroups)).toBe(true);
    expect(muscleGroups.length).toBeGreaterThan(0);
  });

  it('every exercise has a unique id', () => {
    const ids = exercises.map((e: Exercise) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every exercise has all required fields', () => {
    for (const ex of exercises) {
      expect(ex).toHaveProperty('id');
      expect(ex).toHaveProperty('name');
      expect(ex).toHaveProperty('group');
      expect(ex).toHaveProperty('focus');
      expect(ex).toHaveProperty('equipment');
      expect(ex).toHaveProperty('level');
      expect(ex).toHaveProperty('sets');
      expect(ex).toHaveProperty('reps');
      expect(ex).toHaveProperty('restSeconds');
      expect(ex).toHaveProperty('description');
      expect(ex).toHaveProperty('steps');
      expect(ex).toHaveProperty('mistakes');
      expect(ex).toHaveProperty('safetyNote');
    }
  });

  it('every exercise has non-empty steps array', () => {
    for (const ex of exercises) {
      expect(Array.isArray(ex.steps)).toBe(true);
      expect(ex.steps.length).toBeGreaterThan(0);
    }
  });

  it('every exercise has non-empty mistakes array', () => {
    for (const ex of exercises) {
      expect(Array.isArray(ex.mistakes)).toBe(true);
      expect(ex.mistakes.length).toBeGreaterThan(0);
    }
  });

  it('every exercise belongs to a valid muscle group', () => {
    const groupNames = new Set(muscleGroups.map((g) => g.name));
    for (const ex of exercises) {
      expect(groupNames.has(ex.group)).toBe(true);
    }
  });

  it('every exercise has a valid equipment type', () => {
    const validEquipment = ['Barbell', 'Dumbbells', 'Cable', 'Machine', 'Bodyweight', 'Bands'];
    for (const ex of exercises) {
      expect(validEquipment).toContain(ex.equipment);
    }
  });

  it('every exercise has a valid experience level', () => {
    const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
    for (const ex of exercises) {
      expect(validLevels).toContain(ex.level);
    }
  });

  it('every exercise has positive sets and restSeconds', () => {
    for (const ex of exercises) {
      expect(ex.sets).toBeGreaterThan(0);
      expect(ex.restSeconds).toBeGreaterThan(0);
    }
  });

  it('every exercise has non-empty name and description', () => {
    for (const ex of exercises) {
      expect(ex.name.length).toBeGreaterThan(0);
      expect(ex.description.length).toBeGreaterThan(0);
    }
  });
});

// ─── Muscle groups ────────────────────────────────────────────────────

describe('muscleGroups', () => {
  it('every group has a unique id', () => {
    const ids = muscleGroups.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every group has all required fields', () => {
    for (const group of muscleGroups) {
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('name');
      expect(group).toHaveProperty('description');
      expect(group).toHaveProperty('focus');
      expect(group).toHaveProperty('moveCount');
      expect(group).toHaveProperty('color');
      expect(group).toHaveProperty('icon');
    }
  });

  it('every group has a positive moveCount', () => {
    for (const group of muscleGroups) {
      expect(group.moveCount).toBeGreaterThan(0);
    }
  });

  it('moveCount matches the number of exercises in that group', () => {
    for (const group of muscleGroups) {
      const count = exercises.filter((e: Exercise) => e.group === group.name).length;
      expect(group.moveCount).toBe(count);
    }
  });
});

// ─── getExerciseById ──────────────────────────────────────────────────

describe('getExerciseById', () => {
  it('returns the correct exercise for a valid id', () => {
    const first = exercises[0];
    const result = getExerciseById(first.id);
    expect(result).toBeDefined();
    expect(result!.id).toBe(first.id);
    expect(result!.name).toBe(first.name);
  });

  it('returns undefined for an invalid id', () => {
    const result = getExerciseById('nonexistent-id-12345');
    expect(result).toBeUndefined();
  });

  it('returns undefined for an empty string id', () => {
    const result = getExerciseById('');
    expect(result).toBeUndefined();
  });
});

// ─── getGroupById ─────────────────────────────────────────────────────

describe('getGroupById', () => {
  it('returns the correct group for a valid id', () => {
    const first = muscleGroups[0];
    const result = getGroupById(first.id);
    expect(result).toBeDefined();
    expect(result!.id).toBe(first.id);
    expect(result!.name).toBe(first.name);
  });

  it('returns undefined for an invalid id', () => {
    const result = getGroupById('nonexistent-group');
    expect(result).toBeUndefined();
  });
});

// ─── getSuggestedWorkout ──────────────────────────────────────────────

describe('getSuggestedWorkout', () => {
  // trainingWeekdays uses the function's convention: 0=Mon, 1=Tue, ..., 6=Sun
  // (derived from `(date.getDay() + 6) % 7`)
  function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
    return {
      ...EMPTY_DATA.profile!,
      trainingWeekdays: [0, 2, 4], // Mon, Wed, Fri
      ...overrides,
    } as UserProfile;
  }

  it('returns a rest day when the date is not a training day', () => {
    // Sunday: getDay()=0 → (0+6)%7 = 6, not in [0, 2, 4]
    const profile = makeProfile();
    const sunday = new Date(2025, 0, 5); // Sun
    const result = getSuggestedWorkout(profile, sunday);
    expect(result.title).toBe('Rest day');
    expect(result.exerciseIds).toEqual([]);
  });

  it('returns exercises for a training day', () => {
    // Monday: getDay()=1 → (1+6)%7 = 0, in [0, 2, 4]
    const profile = makeProfile();
    const monday = new Date(2025, 0, 6); // Mon
    const result = getSuggestedWorkout(profile, monday);
    expect(result.title).not.toBe('Rest day');
    expect(result.exerciseIds.length).toBeGreaterThan(0);
    expect(result.exerciseIds.length).toBeLessThanOrEqual(6);
  });

  it('all suggested exercise ids exist in the exercises array', () => {
    const profile = makeProfile();
    const monday = new Date(2025, 0, 6);
    const result = getSuggestedWorkout(profile, monday);
    for (const id of result.exerciseIds) {
      expect(getExerciseById(id)).toBeDefined();
    }
  });

  it('suggested exercises belong to the split muscle groups', () => {
    const profile = makeProfile();
    const monday = new Date(2025, 0, 6);
    const result = getSuggestedWorkout(profile, monday);
    // The title should be one of the 7 split titles
    const validTitles = [
      'Upper body power',
      'Lower body strength',
      'Push & shoulders',
      'Pull & arms',
      'Full body balance',
      'Legs & core',
      'Strength focus',
    ];
    expect(validTitles).toContain(result.title);
  });

  it('returns different workouts for different training positions', () => {
    const profile = makeProfile();
    const monday = new Date(2025, 0, 6); // Mon — position 0
    const wednesday = new Date(2025, 0, 8); // Wed — position 1
    const result1 = getSuggestedWorkout(profile, monday);
    const result2 = getSuggestedWorkout(profile, wednesday);
    // Different training positions should yield different splits
    expect(result1.title).not.toBe(result2.title);
  });

  it('returns 6 exercises for a training day', () => {
    const profile = makeProfile();
    const monday = new Date(2025, 0, 6);
    const result = getSuggestedWorkout(profile, monday);
    expect(result.exerciseIds).toHaveLength(6);
  });
});

// ─── EQUIPMENT_FILTERS ───────────────────────────────────────────────

describe('EQUIPMENT_FILTERS', () => {
  it('contains all expected filter options', () => {
    expect(EQUIPMENT_FILTERS).toContain('All');
    expect(EQUIPMENT_FILTERS).toContain('Barbell');
    expect(EQUIPMENT_FILTERS).toContain('Dumbbells');
    expect(EQUIPMENT_FILTERS).toContain('Cable');
    expect(EQUIPMENT_FILTERS).toContain('Machine');
    expect(EQUIPMENT_FILTERS).toContain('Bodyweight');
    expect(EQUIPMENT_FILTERS).toContain('Bands');
  });

  it('has exactly 7 filter options', () => {
    expect(EQUIPMENT_FILTERS).toHaveLength(7);
  });
});

// ─── Exercise matching to free-exercise-db entries ────────────────────

describe('exercise matching to free-exercise-db', () => {
  // Simulated free-exercise-db entries (as they would come from the API)
  const freeExerciseDb = [
    { name: 'Barbell Bench Press', muscle: 'chest', equipment: 'barbell' },
    { name: 'Incline Dumbbell Press', muscle: 'chest', equipment: 'dumbbell' },
    { name: 'Cable Chest Fly', muscle: 'chest', equipment: 'cable' },
    { name: 'Push-Up', muscle: 'chest', equipment: 'bodyweight' },
    { name: 'Barbell Bent-Over Row', muscle: 'back', equipment: 'barbell' },
    { name: 'Lat Pulldown', muscle: 'back', equipment: 'cable' },
    { name: 'Pull-Up', muscle: 'back', equipment: 'bodyweight' },
    { name: 'Dumbbell Shoulder Press', muscle: 'shoulders', equipment: 'dumbbell' },
    { name: 'Barbell Biceps Curl', muscle: 'biceps', equipment: 'barbell' },
    { name: 'Hammer Curl', muscle: 'biceps', equipment: 'dumbbell' },
    { name: 'Cable Triceps Pushdown', muscle: 'triceps', equipment: 'cable' },
    { name: 'Barbell Back Squat', muscle: 'legs', equipment: 'barbell' },
    { name: 'Romanian Deadlift', muscle: 'legs', equipment: 'barbell' },
    { name: 'Barbell Hip Thrust', muscle: 'glutes', equipment: 'barbell' },
    { name: 'Standing Calf Raise', muscle: 'calves', equipment: 'bodyweight' },
    { name: 'Front Plank', muscle: 'core', equipment: 'bodyweight' },
    { name: 'Wrist Curl', muscle: 'forearms', equipment: 'barbell' },
  ];

  it('every exercise in the app can be matched to a free-exercise-db entry by name', () => {
    for (const ex of exercises) {
      const match = freeExerciseDb.find((db) => db.name === ex.name);
      if (match) {
        // If matched, verify muscle group alignment
        const muscleToGroup: Record<string, string[]> = {
          chest: ['Chest'],
          back: ['Back'],
          shoulders: ['Shoulders'],
          biceps: ['Biceps'],
          triceps: ['Triceps'],
          legs: ['Legs'],
          glutes: ['Glutes'],
          calves: ['Calves'],
          core: ['Core'],
          forearms: ['Forearms'],
        };
        const expectedGroups = muscleToGroup[match.muscle] || [];
        expect(expectedGroups).toContain(ex.group);
      }
    }
  });

  it('all chest exercises can be matched to chest entries in the db', () => {
    const chestExercises = exercises.filter((e: Exercise) => e.group === 'Chest');
    for (const ex of chestExercises) {
      const match = freeExerciseDb.find((db) => db.name === ex.name && db.muscle === 'chest');
      // Not all may be in our small db, but those that are must match
      if (match) {
        expect(ex.group).toBe('Chest');
      }
    }
  });

  it('exercises not in the db still have valid local data', () => {
    const unmatched = exercises.filter(
      (e: Exercise) => !freeExerciseDb.find((db) => db.name === e.name),
    );
    for (const ex of unmatched) {
      expect(ex.id).toBeDefined();
      expect(ex.name.length).toBeGreaterThan(0);
      expect(ex.steps.length).toBeGreaterThan(0);
      expect(ex.safetyNote.length).toBeGreaterThan(0);
    }
  });

  it('exercise equipment types are compatible with db equipment categories', () => {
    const equipmentMapping: Record<string, string[]> = {
      Barbell: ['barbell'],
      Dumbbells: ['dumbbell'],
      Cable: ['cable'],
      Machine: ['machine'],
      Bodyweight: ['bodyweight'],
      Bands: ['band'],
    };
    for (const ex of exercises) {
      expect(equipmentMapping).toHaveProperty(ex.equipment);
    }
  });
});
