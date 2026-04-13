/**
 * Progress Store
 *
 * localStorage-backed progress tracking for the Sudoku Trainer.
 * Tracks per-level progress: unlocked status, lessons completed, puzzles completed.
 *
 * Unlock progression:
 * - L1 is always unlocked
 * - L2 unlocks after L1 lesson is completed AND at least 1 puzzle is completed
 * - L3 unlocks after L2 lesson is completed AND at least 1 puzzle is completed
 */

const STORAGE_KEY = 'sudoku-trainer-progress';

export interface PuzzleStats {
  timeSeconds: number;
  completed: boolean;
  completedAt: number; // timestamp in ms
}

export interface PuzzleState {
  grid: string; // serialized 81-char string
  candidates: Record<number, number[]>; // per-cell candidate tracking (as arrays since JSON doesn't support Sets)
  notes?: Record<number, string>; // optional user notes
}

export interface LevelProgress {
  unlocked: boolean;
  lessonCompleted: boolean;
  puzzlesCompleted: Record<string, PuzzleStats>; // puzzleId -> stats
  currentPuzzleState?: PuzzleState;
}

export interface Progress {
  levels: Record<number, LevelProgress>;
}

const DEFAULT_PROGRESS: Progress = {
  levels: {
    1: {
      unlocked: true, // L1 always unlocked
      lessonCompleted: false,
      puzzlesCompleted: {},
    },
    2: {
      unlocked: false,
      lessonCompleted: false,
      puzzlesCompleted: {},
    },
    3: {
      unlocked: false,
      lessonCompleted: false,
      puzzlesCompleted: {},
    },
  },
};

/**
 * Initialize default progress structure for a given level
 */
function initializeLevelProgress(level: number): LevelProgress {
  return {
    unlocked: level === 1, // Only L1 starts unlocked
    lessonCompleted: false,
    puzzlesCompleted: {},
  };
}

/**
 * Get the current progress from localStorage.
 * Returns default progress if none exists.
 */
export function getProgress(): Progress {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return structuredClone(DEFAULT_PROGRESS);
    }
    const parsed = JSON.parse(data) as Progress;

    // Ensure all required levels exist
    for (let i = 1; i <= 3; i++) {
      if (!parsed.levels[i]) {
        parsed.levels[i] = initializeLevelProgress(i);
      }
    }

    return parsed;
  } catch {
    return structuredClone(DEFAULT_PROGRESS);
  }
}

/**
 * Save progress to localStorage
 */
function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // If localStorage fails, continue without persisting
  }
}

/**
 * Mark a lesson as completed for a given level.
 * Automatically checks and applies unlock progression.
 */
export function updateLessonComplete(level: number): void {
  const progress = getProgress();

  if (!progress.levels[level]) {
    progress.levels[level] = initializeLevelProgress(level);
  }

  progress.levels[level].lessonCompleted = true;

  // Check unlock conditions
  applyUnlockProgression(progress);

  saveProgress(progress);
}

/**
 * Mark a puzzle as completed for a given level.
 * Automatically checks and applies unlock progression.
 */
export function updatePuzzleComplete(
  level: number,
  puzzleId: string,
  stats: {
    timeSeconds: number;
    completedAt?: number;
  }
): void {
  const progress = getProgress();

  if (!progress.levels[level]) {
    progress.levels[level] = initializeLevelProgress(level);
  }

  progress.levels[level].puzzlesCompleted[puzzleId] = {
    timeSeconds: stats.timeSeconds,
    completed: true,
    completedAt: stats.completedAt ?? Date.now(),
  };

  // Check unlock conditions
  applyUnlockProgression(progress);

  saveProgress(progress);
}

/**
 * Apply unlock progression logic:
 * - L2 unlocks if L1 lesson completed AND at least 1 puzzle completed
 * - L3 unlocks if L2 lesson completed AND at least 1 puzzle completed
 */
function applyUnlockProgression(progress: Progress): void {
  // L2 unlock
  if (!progress.levels[2].unlocked) {
    const l1 = progress.levels[1];
    if (
      l1.lessonCompleted &&
      Object.keys(l1.puzzlesCompleted).length > 0
    ) {
      progress.levels[2].unlocked = true;
    }
  }

  // L3 unlock
  if (!progress.levels[3].unlocked) {
    const l2 = progress.levels[2];
    if (
      l2.lessonCompleted &&
      Object.keys(l2.puzzlesCompleted).length > 0
    ) {
      progress.levels[3].unlocked = true;
    }
  }
}

/**
 * Check if a specific level is unlocked
 */
export function isLevelUnlocked(level: number): boolean {
  const progress = getProgress();
  return progress.levels[level]?.unlocked ?? false;
}

/**
 * Get the current puzzle state for a level/puzzle pair
 */
export function getCurrentPuzzleState(
  level: number,
  _puzzleId: string
): PuzzleState | null {
  const progress = getProgress();
  return progress.levels[level]?.currentPuzzleState ?? null;
}

/**
 * Save the current puzzle state for a level/puzzle pair
 */
export function savePuzzleState(
  level: number,
  _puzzleId: string,
  state: PuzzleState
): void {
  const progress = getProgress();

  if (!progress.levels[level]) {
    progress.levels[level] = initializeLevelProgress(level);
  }

  progress.levels[level].currentPuzzleState = state;

  saveProgress(progress);
}

/**
 * Clear the current puzzle state (e.g., when starting a new puzzle)
 */
export function clearPuzzleState(level: number): void {
  const progress = getProgress();

  if (progress.levels[level]) {
    delete progress.levels[level].currentPuzzleState;
    saveProgress(progress);
  }
}
