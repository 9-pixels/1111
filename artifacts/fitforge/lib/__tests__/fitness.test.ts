import { describe, it, expect } from 'vitest';
import { calculateTargets, localDateKey } from '@/lib/fitness';

// ─── calculateTargets ────────────────────────────────────────────────

describe('calculateTargets', () => {
  // ── Sex-based BMR differences ──
  it('produces higher calories for males than females with identical stats', () => {
    const male = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    const female = calculateTargets(30, 'female', 175, 80, 3, 'General Fitness');
    expect(male.calories).toBeGreaterThan(female.calories);
  });

  it('applies -161 adjustment for females', () => {
    // BMR = 10*80 + 6.25*175 - 5*30 + (-161) = 800 + 1093.75 - 150 - 161 = 1582.75
    // TDEE = 1582.75 * (1.2 + 3*0.1) = 1582.75 * 1.5 = 2374.125
    // No goal adjustment → 2374
    const result = calculateTargets(30, 'female', 175, 80, 3, 'General Fitness');
    expect(result.calories).toBe(2374);
  });

  it('applies +5 adjustment for males', () => {
    // BMR = 10*80 + 6.25*175 - 5*30 + 5 = 800 + 1093.75 - 150 + 5 = 1748.75
    // TDEE = 1748.75 * 1.5 = 2623.125 → 2623
    const result = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    expect(result.calories).toBe(2623);
  });

  it('applies -78 adjustment for "other" sex', () => {
    const male = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    const other = calculateTargets(30, 'other', 175, 80, 3, 'General Fitness');
    // Difference should be 5 - (-78) = 83 calories in BMR, scaled by activity factor
    expect(male.calories).toBeGreaterThan(other.calories);
  });

  it('applies -78 adjustment for "prefer-not-to-say" sex', () => {
    const male = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    const pnts = calculateTargets(30, 'prefer-not-to-say', 175, 80, 3, 'General Fitness');
    expect(male.calories).toBeGreaterThan(pnts.calories);
  });

  // ── Goal adjustments ──
  it('adds 300 calories for Build Muscle', () => {
    const base = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    const bulk = calculateTargets(30, 'male', 175, 80, 3, 'Build Muscle');
    expect(bulk.calories).toBe(base.calories + 300);
  });

  it('subtracts 400 calories for Lose Fat', () => {
    const base = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    const cut = calculateTargets(30, 'male', 175, 80, 3, 'Lose Fat');
    expect(cut.calories).toBe(base.calories - 400);
  });

  it('applies no goal adjustment for General Fitness', () => {
    const result = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    // Just verify it matches the manual calculation
    expect(result.calories).toBe(2623);
  });

  it('applies no goal adjustment for Strength', () => {
    const result = calculateTargets(30, 'male', 175, 80, 3, 'Strength');
    expect(result.calories).toBe(2623);
  });

  // ── Training days / activity factor ──
  it('increases calories with more training days', () => {
    const low = calculateTargets(30, 'male', 175, 80, 1, 'General Fitness');
    const high = calculateTargets(30, 'male', 175, 80, 6, 'General Fitness');
    expect(high.calories).toBeGreaterThan(low.calories);
  });

  it('caps activity factor at 1.9', () => {
    // At 7 training days: 1.2 + 7*0.1 = 1.9 (capped)
    // At 10 training days: 1.2 + 10*0.1 = 2.2 → capped to 1.9
    const seven = calculateTargets(30, 'male', 175, 80, 7, 'General Fitness');
    const ten = calculateTargets(30, 'male', 175, 80, 10, 'General Fitness');
    expect(seven.calories).toBe(ten.calories);
  });

  // ── Macros ──
  it('calculates protein as 2.2g per kg body weight', () => {
    const result = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    expect(result.protein).toBe(Math.round(80 * 2.2)); // 176
  });

  it('calculates fats as 0.9g per kg body weight', () => {
    const result = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    expect(result.fats).toBe(Math.round(80 * 0.9)); // 72
  });

  it('calculates carbs from remaining calories', () => {
    const result = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    // carbs = (calories - protein*4 - fats*9) / 4
    const expectedCarbs = Math.max(0, Math.round((result.calories - result.protein * 4 - result.fats * 9) / 4));
    expect(result.carbs).toBe(expectedCarbs);
  });

  it('never returns negative carbs', () => {
    // Very low calorie scenario
    const result = calculateTargets(80, 'female', 150, 40, 0, 'Lose Fat');
    expect(result.carbs).toBeGreaterThanOrEqual(0);
  });

  // ── Water ──
  it('calculates water glasses based on body weight', () => {
    const result = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    // waterGlasses = max(1, round((80 * 35) / 250)) = max(1, round(11.2)) = 11
    expect(result.waterGlasses).toBe(11);
  });

  it('returns minimum 1 glass of water', () => {
    const result = calculateTargets(30, 'male', 175, 10, 3, 'General Fitness');
    // (10 * 35) / 250 = 1.4 → round = 1
    expect(result.waterGlasses).toBe(1);
  });

  // ── Edge cases ──
  it('enforces minimum 1200 calories', () => {
    // Very small elderly person with aggressive cut
    const result = calculateTargets(90, 'female', 140, 40, 0, 'Lose Fat');
    expect(result.calories).toBeGreaterThanOrEqual(1200);
  });

  it('returns an object with all required NutritionTargets fields', () => {
    const result = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    expect(result).toHaveProperty('calories');
    expect(result).toHaveProperty('protein');
    expect(result).toHaveProperty('carbs');
    expect(result).toHaveProperty('fats');
    expect(result).toHaveProperty('waterGlasses');
  });

  it('all returned values are numbers', () => {
    const result = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    expect(typeof result.calories).toBe('number');
    expect(typeof result.protein).toBe('number');
    expect(typeof result.carbs).toBe('number');
    expect(typeof result.fats).toBe('number');
    expect(typeof result.waterGlasses).toBe('number');
  });

  it('calories is always a positive integer', () => {
    const result = calculateTargets(30, 'male', 175, 80, 3, 'General Fitness');
    expect(Number.isInteger(result.calories)).toBe(true);
    expect(result.calories).toBeGreaterThan(0);
  });
});

// ─── localDateKey ─────────────────────────────────────────────────────

describe('localDateKey', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const key = localDateKey(new Date(2025, 0, 15)); // Jan 15, 2025
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formats single-digit months with leading zero', () => {
    const key = localDateKey(new Date(2025, 0, 5)); // Jan 5, 2025
    expect(key).toBe('2025-01-05');
  });

  it('formats single-digit days with leading zero', () => {
    const key = localDateKey(new Date(2025, 11, 9)); // Dec 9, 2025
    expect(key).toBe('2025-12-09');
  });

  it('handles month boundaries correctly', () => {
    expect(localDateKey(new Date(2025, 0, 1))).toBe('2025-01-01');
    expect(localDateKey(new Date(2025, 11, 31))).toBe('2025-12-31');
  });

  it('handles leap year Feb 29', () => {
    const key = localDateKey(new Date(2024, 1, 29)); // Feb 29, 2024
    expect(key).toBe('2024-02-29');
  });

  it('uses current date when no argument is provided', () => {
    const key = localDateKey();
    const now = new Date();
    const expected = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
    expect(key).toBe(expected);
  });

  it('returns consistent results for the same date object', () => {
    const date = new Date(2025, 5, 15);
    expect(localDateKey(date)).toBe(localDateKey(date));
  });
});
