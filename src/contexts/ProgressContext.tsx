import { createContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
  getProgress,
  updateLessonComplete,
  updatePuzzleComplete,
  isLevelUnlocked,
  getCurrentPuzzleState,
  savePuzzleState,
  clearPuzzleState,
  type Progress,
  type PuzzleState,
} from '../lib/progress-store';
import {
  loadProgressFromSupabase,
  saveProgressToSupabase,
  recordPuzzleAttempt,
} from '../lib/supabase-progress';
import { useAuth } from './useAuth';

export interface ProgressContextType {
  progress: Progress | null;
  isLoading: boolean;

  // Progress mutation methods
  completeLessonForLevel: (level: number) => void;
  completePuzzleForLevel: (
    level: number,
    puzzleId: string,
    timeSeconds: number
  ) => void;

  // Query methods
  isLevelUnlocked: (level: number) => boolean;
  getLessonCompleted: (level: number) => boolean;
  getPuzzlesCompleted: (level: number) => number;

  // Puzzle state management
  getPuzzleState: (level: number, puzzleId: string) => PuzzleState | null;
  savePuzzleState: (level: number, puzzleId: string, state: PuzzleState) => void;
  clearPuzzleState: (level: number) => void;
}

// eslint-disable-next-line react-refresh/only-export-components -- context must be co-located with provider
export const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

interface ProgressProviderProps {
  children: ReactNode;
}

/**
 * Merge Supabase progress with localStorage progress.
 * Supabase is the source of truth for completed items,
 * but localStorage may have newer in-progress puzzle state.
 */
function mergeProgress(remote: Progress, local: Progress): Progress {
  const merged: Progress = { levels: {} };

  // Gather all level keys from both sources
  const allLevels = new Set([
    ...Object.keys(remote.levels).map(Number),
    ...Object.keys(local.levels).map(Number),
  ]);

  for (const level of allLevels) {
    const r = remote.levels[level];
    const l = local.levels[level];

    if (!r && !l) continue;
    if (!r) { merged.levels[level] = l; continue; }
    if (!l) { merged.levels[level] = r; continue; }

    // Merge: take the "more progressed" state
    merged.levels[level] = {
      unlocked: r.unlocked || l.unlocked,
      lessonCompleted: r.lessonCompleted || l.lessonCompleted,
      puzzlesCompleted: { ...r.puzzlesCompleted, ...l.puzzlesCompleted },
      // Keep localStorage puzzle state (not stored in Supabase)
      currentPuzzleState: l.currentPuzzleState,
    };
  }

  return merged;
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isGuest, isLoading: authLoading } = useAuth();

  // Track userId in a ref so fire-and-forget callbacks always have latest value
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = user?.id ?? null;

  // Load progress: from Supabase if authenticated, localStorage otherwise
  useEffect(() => {
    // Don't load until auth has resolved
    if (authLoading) return;

    let cancelled = false;

    const loadProgress = async () => {
      setIsLoading(true);
      try {
        const localProgress = getProgress();

        if (!isGuest && user?.id) {
          // Authenticated: load from Supabase, merge with local
          const remoteProgress = await loadProgressFromSupabase(user.id);
          if (cancelled) return;

          if (remoteProgress) {
            const merged = mergeProgress(remoteProgress, localProgress);
            setProgress(merged);

            // Persist the merged result back to both stores
            // (localStorage gets the merged state immediately)
            try {
              localStorage.setItem('sudoku-trainer-progress', JSON.stringify(merged));
            } catch {
              // localStorage write failed — not critical
            }

            // Push merged state back to Supabase (fire-and-forget)
            saveProgressToSupabase(user.id, merged).catch((err) =>
              console.error('Failed to sync merged progress to Supabase:', err)
            );
          } else {
            // No remote progress — use local (first login or migration already ran)
            setProgress(localProgress);

            // Seed Supabase with local progress (fire-and-forget)
            saveProgressToSupabase(user.id, localProgress).catch((err) =>
              console.error('Failed to seed Supabase progress:', err)
            );
          }
        } else {
          // Guest mode: localStorage only
          setProgress(localProgress);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
        // Fallback to localStorage
        setProgress(getProgress());
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadProgress();

    return () => { cancelled = true; };
  }, [authLoading, isGuest, user?.id]);

  /**
   * Fire-and-forget save to Supabase.
   * Reads the latest progress from localStorage (which was just updated)
   * and pushes it to Supabase. Never blocks the UI.
   */
  const syncToSupabase = useCallback(() => {
    const userId = userIdRef.current;
    if (!userId) return;

    const latest = getProgress();
    saveProgressToSupabase(userId, latest).catch((err) =>
      console.error('Supabase progress sync failed:', err)
    );
  }, []);

  const completeLessonForLevel = useCallback((level: number) => {
    // Write to localStorage immediately
    updateLessonComplete(level);
    // Reload and set state
    const updated = getProgress();
    setProgress(updated);
    // Sync to Supabase (fire-and-forget)
    syncToSupabase();
  }, [syncToSupabase]);

  const completePuzzleForLevel = useCallback((
    level: number,
    puzzleId: string,
    timeSeconds: number
  ) => {
    const completedAt = Date.now();

    // Write to localStorage immediately
    updatePuzzleComplete(level, puzzleId, { timeSeconds, completedAt });
    // Reload and set state
    const updated = getProgress();
    setProgress(updated);

    // Sync full progress to Supabase (fire-and-forget)
    syncToSupabase();

    // Also record the individual puzzle attempt (fire-and-forget)
    const userId = userIdRef.current;
    if (userId) {
      recordPuzzleAttempt(userId, level, puzzleId, {
        timeSeconds,
        completed: true,
        completedAt,
      }).catch((err) =>
        console.error('Failed to record puzzle attempt:', err)
      );
    }
  }, [syncToSupabase]);

  const getLessonCompleted = useCallback((level: number): boolean => {
    return progress?.levels[level]?.lessonCompleted ?? false;
  }, [progress]);

  const getPuzzlesCompleted = useCallback((level: number): number => {
    return Object.keys(progress?.levels[level]?.puzzlesCompleted ?? {}).length;
  }, [progress]);

  const getPuzzleStateLocal = useCallback((
    level: number,
    puzzleId: string
  ): PuzzleState | null => {
    return getCurrentPuzzleState(level, puzzleId);
  }, []);

  const savePuzzleStateLocal = useCallback((
    level: number,
    puzzleId: string,
    state: PuzzleState
  ) => {
    savePuzzleState(level, puzzleId, state);
    // Reload to reflect changes
    const updated = getProgress();
    setProgress(updated);
    // Note: puzzle state stays in localStorage only (too large / too frequent for Supabase)
  }, []);

  const clearPuzzleStateLocal = useCallback((level: number) => {
    clearPuzzleState(level);
    const updated = getProgress();
    setProgress(updated);
  }, []);

  const value: ProgressContextType = {
    progress,
    isLoading,
    completeLessonForLevel,
    completePuzzleForLevel,
    isLevelUnlocked,
    getLessonCompleted,
    getPuzzlesCompleted,
    getPuzzleState: getPuzzleStateLocal,
    savePuzzleState: savePuzzleStateLocal,
    clearPuzzleState: clearPuzzleStateLocal,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

// useProgress hook moved to ./useProgress.ts for react-refresh compatibility
