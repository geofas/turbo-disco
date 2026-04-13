import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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

interface ProgressContextType {
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

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

interface ProgressProviderProps {
  children: ReactNode;
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const loaded = getProgress();
      setProgress(loaded);
    } catch (error) {
      console.error('Failed to load progress:', error);
      setProgress(getProgress()); // Use default
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeLessonForLevel = (level: number) => {
    updateLessonComplete(level);
    // Reload progress to ensure unlock conditions are applied
    const updated = getProgress();
    setProgress(updated);
  };

  const completePuzzleForLevel = (
    level: number,
    puzzleId: string,
    timeSeconds: number
  ) => {
    updatePuzzleComplete(level, puzzleId, {
      timeSeconds,
      completedAt: Date.now(),
    });
    // Reload progress to ensure unlock conditions are applied
    const updated = getProgress();
    setProgress(updated);
  };

  const getLessonCompleted = (level: number): boolean => {
    return progress?.levels[level]?.lessonCompleted ?? false;
  };

  const getPuzzlesCompleted = (level: number): number => {
    return Object.keys(progress?.levels[level]?.puzzlesCompleted ?? {})
      .length;
  };

  const getPuzzleState = (
    level: number,
    puzzleId: string
  ): PuzzleState | null => {
    return getCurrentPuzzleState(level, puzzleId);
  };

  const savePuzzleStateLocal = (
    level: number,
    puzzleId: string,
    state: PuzzleState
  ) => {
    savePuzzleState(level, puzzleId, state);
    // Reload to reflect changes
    const updated = getProgress();
    setProgress(updated);
  };

  const clearPuzzleStateLocal = (level: number) => {
    clearPuzzleState(level);
    const updated = getProgress();
    setProgress(updated);
  };

  const value: ProgressContextType = {
    progress,
    isLoading,
    completeLessonForLevel,
    completePuzzleForLevel,
    isLevelUnlocked,
    getLessonCompleted,
    getPuzzlesCompleted,
    getPuzzleState,
    savePuzzleState: savePuzzleStateLocal,
    clearPuzzleState: clearPuzzleStateLocal,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

/**
 * Hook to access progress context
 */
export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
