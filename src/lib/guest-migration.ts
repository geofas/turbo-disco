/**
 * Guest to Signup Migration
 *
 * Handles migration of guest progress data to Supabase when a user signs up.
 * Reads all progress from localStorage and writes to Supabase tables.
 */

import { getSupabaseOrThrow } from './supabase';
import { getProgress } from './progress-store';
import { getGuestSession } from './guest-session';
import type { Progress } from './progress-store';
import type { Json } from '../types/database';

/**
 * Migrate guest progress to Supabase after successful signup
 * This function:
 * 1. Reads all progress from localStorage
 * 2. Writes user_progress, puzzle_attempts records to Supabase
 * 3. Clears localStorage progress data (keeps guest session ID for reference)
 */
export async function migrateGuestProgress(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseOrThrow();
    const guestSession = getGuestSession();
    const progress = getProgress();

    if (!guestSession) {
      console.warn('No guest session found, nothing to migrate');
      return;
    }

    // Prepare data to migrate
    const migrationData = prepareMigrationData(progress, userId);

    // Insert progress record
    if (migrationData.progressRecord) {
      const { error: progressError } = await supabase
        .from('progress')
        .insert([migrationData.progressRecord]);

      if (progressError) {
        throw new Error(`Failed to insert progress: ${progressError.message}`);
      }
    }

    // Insert puzzle attempts
    if (migrationData.puzzleAttempts.length > 0) {
      const { error: attemptsError } = await supabase
        .from('puzzle_attempts')
        .insert(migrationData.puzzleAttempts);

      if (attemptsError) {
        throw new Error(
          `Failed to insert puzzle attempts: ${attemptsError.message}`
        );
      }
    }

    // Record that guest progress was migrated
    const { error: migrationError } = await supabase
      .from('guest_progress')
      .insert([
        {
          guest_session_id: guestSession.sessionId,
          migrated_to_user_id: userId,
          level_completed: getHighestCompletedLevel(progress),
          puzzle_attempts_json: migrationData.puzzleAttempts as unknown as Json,
        },
      ]);

    if (migrationError) {
      console.warn('Failed to record migration log:', migrationError.message);
      // Don't throw, this is just logging
    }

    // Clear localStorage progress (but keep guest session ID for reference)
    clearLocalStorageProgress();
  } catch (error) {
    console.error('Error migrating guest progress:', error);
    throw error;
  }
}

interface MigrationData {
  progressRecord: {
    user_id: string;
    current_level: number;
    level_completed: number;
  } | null;
  puzzleAttempts: Array<{
    user_id: string;
    level: number;
    puzzle_id: string;
    completed: boolean;
    solve_time_seconds: number | null;
    hints_used: number | null;
    mistakes: number | null;
    submitted_at: string | null;
  }>;
}

/**
 * Prepare data for migration from localStorage format to Supabase schema
 */
function prepareMigrationData(progress: Progress, userId: string): MigrationData {
  const puzzleAttempts: MigrationData['puzzleAttempts'] = [];
  let currentLevel = 1;
  let levelCompleted = 0;

  // Find the highest unlocked level (current), and highest completed level
  for (const [levelStr, levelProgress] of Object.entries(progress.levels)) {
    const level = parseInt(levelStr, 10);

    if (levelProgress.unlocked) {
      currentLevel = level;
    }

    if (levelProgress.lessonCompleted) {
      levelCompleted = Math.max(levelCompleted, level);
    }

    // Convert puzzle completions to puzzle_attempts records
    for (const [puzzleId, stats] of Object.entries(
      levelProgress.puzzlesCompleted
    )) {
      puzzleAttempts.push({
        user_id: userId,
        level,
        puzzle_id: puzzleId,
        completed: stats.completed,
        solve_time_seconds: stats.timeSeconds,
        hints_used: null, // Not tracked in localStorage
        mistakes: null, // Not tracked in localStorage
        submitted_at: new Date(stats.completedAt).toISOString(),
      });
    }
  }

  const progressRecord = {
    user_id: userId,
    current_level: currentLevel,
    level_completed: levelCompleted,
  };

  return {
    progressRecord,
    puzzleAttempts,
  };
}

/**
 * Get the highest completed level from progress
 */
function getHighestCompletedLevel(progress: Progress): number {
  let highest = 0;
  for (const [levelStr, levelProgress] of Object.entries(progress.levels)) {
    if (levelProgress.lessonCompleted) {
      highest = Math.max(highest, parseInt(levelStr, 10));
    }
  }
  return highest;
}

/**
 * Clear localStorage progress data after successful migration
 * Keeps guest session ID for reference
 */
function clearLocalStorageProgress(): void {
  try {
    localStorage.removeItem('sudoku-trainer-progress');
  } catch (error) {
    console.error('Failed to clear progress from localStorage:', error);
  }
}
