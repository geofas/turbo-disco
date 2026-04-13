/**
 * Supabase Progress Sync
 *
 * Handles reading/writing progress to Supabase for authenticated users.
 * Falls back to localStorage (progress-store.ts) for guest users.
 */

import { getSupabaseClient } from './supabase';
import type { Progress, LevelProgress, PuzzleStats } from './progress-store';
import type { Json } from '../types/database';

/**
 * Load progress from Supabase for the current authenticated user.
 * Returns null if not authenticated or if no progress record exists.
 */
export async function loadProgressFromSupabase(userId: string): Promise<Progress | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  // Reconstruct Progress from Supabase data
  const levelsJson = (data.levels_json as unknown ?? {}) as Record<string, LevelProgress>;
  const levels: Record<number, LevelProgress> = {};

  // Ensure levels 1-3 always exist
  for (let i = 1; i <= 3; i++) {
    const saved = levelsJson[String(i)];
    levels[i] = saved ?? {
      unlocked: i === 1,
      lessonCompleted: false,
      puzzlesCompleted: {},
    };
  }

  return { levels };
}

/**
 * Save full progress to Supabase (upsert).
 */
export async function saveProgressToSupabase(
  userId: string,
  progress: Progress
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  // Calculate summary fields
  let currentLevel = 1;
  let levelCompleted = 0;

  for (const [levelStr, lp] of Object.entries(progress.levels)) {
    const lvl = parseInt(levelStr, 10);
    if (lp.unlocked) currentLevel = Math.max(currentLevel, lvl);
    if (lp.lessonCompleted) levelCompleted = Math.max(levelCompleted, lvl);
  }

  // Strip currentPuzzleState from levels_json (too large for DB, keep in localStorage)
  const cleanLevels: Record<string, Omit<LevelProgress, 'currentPuzzleState'>> = {};
  for (const [k, v] of Object.entries(progress.levels)) {
    const { currentPuzzleState: _cps, ...rest } = v;
    void _cps;
    cleanLevels[k] = rest;
  }

  const { error } = await supabase
    .from('progress')
    .upsert(
      {
        user_id: userId,
        current_level: currentLevel,
        level_completed: levelCompleted,
        levels_json: cleanLevels as unknown as Json,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Failed to save progress to Supabase:', error.message);
    return false;
  }

  return true;
}

/**
 * Record a puzzle attempt in Supabase.
 */
export async function recordPuzzleAttempt(
  userId: string,
  level: number,
  puzzleId: string,
  stats: PuzzleStats & { hintsUsed?: number; mistakes?: number }
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('puzzle_attempts')
    .insert({
      user_id: userId,
      level,
      puzzle_id: puzzleId,
      completed: stats.completed,
      solve_time_seconds: stats.timeSeconds,
      hints_used: stats.hintsUsed ?? null,
      mistakes: stats.mistakes ?? null,
      submitted_at: new Date(stats.completedAt).toISOString(),
    });

  if (error) {
    console.error('Failed to record puzzle attempt:', error.message);
    return false;
  }

  return true;
}
