/**
 * usePuzzleSession Hook — Manages full puzzle session state
 * Tracks: puzzle, user values, timer, mistakes, hints
 * Detects completion and calculates stats
 */

import { useState, useEffect, useCallback } from 'react';
import type { Grid } from '../lib/puzzle-solver';
import { generateHint, type Hint } from '../lib/hint-engine';
import { savePuzzleState, clearPuzzleState, type PuzzleState } from '../lib/progress-store';

export interface PuzzleSessionStats {
  solveTime: number; // in seconds
  mistakes: number;
  hintsUsed: number;
  isComplete: boolean;
  starRating: 1 | 2 | 3; // 3 = perfect, 2 = good, 1 = struggled
}

interface PuzzleSessionState {
  puzzle: Grid;
  solution: Grid;
  userValues: Grid;
  timer: number; // in seconds
  isRunning: boolean;
  mistakes: number;
  hintsUsed: number;
  isComplete: boolean;
  stats: PuzzleSessionStats;
  currentHint: Hint | null;
  hintCount: number;
}

interface UsePuzzleSessionReturn {
  state: PuzzleSessionState;
  startPuzzle: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  enterValue: (row: number, col: number, value: number) => void;
  useHint: () => void;
  resetPuzzle: () => void;
}

/**
 * Calculate star rating based on mistakes and hints
 */
function calculateStarRating(mistakes: number, hintsUsed: number): 1 | 2 | 3 {
  if (mistakes === 0 && hintsUsed === 0) return 3; // Perfect
  if (mistakes <= 2 && hintsUsed <= 1) return 2; // Good
  return 1; // Struggled
}

/**
 * Check if a value is correct (matches solution)
 */
function isValueCorrect(_grid: Grid, solution: Grid, row: number, col: number, value: number): boolean {
  return solution[row][col] === value;
}

/**
 * Check if puzzle is complete (all cells filled correctly)
 */
function isPuzzleComplete(userValues: Grid, solution: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (userValues[r][c] !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
}

export function usePuzzleSession(
  initialPuzzle: Grid,
  solution: Grid,
  level?: number,
  puzzleNumber?: number,
  savedState?: PuzzleState | null
): UsePuzzleSessionReturn {
  // Use saved state if available, otherwise initialize fresh
  const [state, setState] = useState<PuzzleSessionState>({
    puzzle: initialPuzzle,
    solution,
    userValues: savedState?.userValues ?? initialPuzzle.map((row) => [...row]),
    timer: savedState?.timer ?? 0,
    isRunning: false,
    mistakes: savedState?.mistakes ?? 0,
    hintsUsed: savedState?.hintsUsed ?? 0,
    isComplete: false,
    stats: {
      solveTime: 0,
      mistakes: savedState?.mistakes ?? 0,
      hintsUsed: savedState?.hintsUsed ?? 0,
      isComplete: false,
      starRating: 3
    },
    currentHint: null,
    hintCount: 0
  });

  // Sync state when puzzle data changes (handles initial dummy → real puzzle transition)
  useEffect(() => {
    setState({
      puzzle: initialPuzzle,
      solution,
      userValues: savedState?.userValues ?? initialPuzzle.map((row) => [...row]),
      timer: savedState?.timer ?? 0,
      isRunning: false,
      mistakes: savedState?.mistakes ?? 0,
      hintsUsed: savedState?.hintsUsed ?? 0,
      isComplete: false,
      stats: {
        solveTime: 0,
        mistakes: savedState?.mistakes ?? 0,
        hintsUsed: savedState?.hintsUsed ?? 0,
        isComplete: false,
        starRating: 3,
      },
      currentHint: null,
      hintCount: 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPuzzle, solution]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (state.isRunning) {
      interval = setInterval(() => {
        setState((prevState) => ({
          ...prevState,
          timer: prevState.timer + 1
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state.isRunning]);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!level || !puzzleNumber) return; // Don't save if level/puzzleNumber not provided

    const interval = setInterval(() => {
      if (state.isRunning && !state.isComplete) {
        // Convert candidates Set to array format for JSON serialization
        const candidatesToSave: Record<string, number[]> = {};
        // Note: We'll need to get candidates from the grid component since they're not stored here
        // For now, we'll pass an empty object - the grid component will handle local candidate state

        const puzzleState: PuzzleState = {
          userValues: state.userValues,
          candidates: candidatesToSave,
          timer: state.timer,
          mistakes: state.mistakes,
          hintsUsed: state.hintsUsed
        };

        savePuzzleState(level, puzzleNumber.toString(), puzzleState);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [state.userValues, state.timer, state.mistakes, state.hintsUsed, state.isRunning, state.isComplete, level, puzzleNumber]);

  // Auto-save on beforeunload
  useEffect(() => {
    if (!level || !puzzleNumber) return;

    const handleBeforeUnload = () => {
      if (!state.isComplete) {
        const candidatesToSave: Record<string, number[]> = {};
        const puzzleState: PuzzleState = {
          userValues: state.userValues,
          candidates: candidatesToSave,
          timer: state.timer,
          mistakes: state.mistakes,
          hintsUsed: state.hintsUsed
        };
        savePuzzleState(level, puzzleNumber.toString(), puzzleState);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.userValues, state.timer, state.mistakes, state.hintsUsed, state.isComplete, level, puzzleNumber]);

  const startPuzzle = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      isRunning: true
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      isRunning: false
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      isRunning: true
    }));
  }, []);

  const enterValue = useCallback((row: number, col: number, value: number) => {
    setState((prevState) => {
      if (!prevState.isRunning || prevState.isComplete) return prevState;

      // Skip if this is a given cell
      if (prevState.puzzle[row][col] !== 0) return prevState;

      const newUserValues = prevState.userValues.map((r) => [...r]);
      newUserValues[row][col] = value;

      // Check if value is correct
      const isCorrect = value === 0 || isValueCorrect(newUserValues, solution, row, col, value);
      const newMistakes = !isCorrect && value !== 0 ? prevState.mistakes + 1 : prevState.mistakes;

      // Check for completion in the same setState call to avoid race conditions
      if (value !== 0 && isPuzzleComplete(newUserValues, solution)) {
        const newStats: PuzzleSessionStats = {
          solveTime: prevState.timer,
          mistakes: newMistakes,
          hintsUsed: prevState.hintsUsed,
          isComplete: true,
          starRating: calculateStarRating(newMistakes, prevState.hintsUsed)
        };
        return {
          ...prevState,
          userValues: newUserValues,
          mistakes: newMistakes,
          isComplete: true,
          isRunning: false,
          stats: newStats
        };
      }

      return {
        ...prevState,
        userValues: newUserValues,
        mistakes: newMistakes
      };
    });
  }, [solution]);

  const useHint = useCallback(() => {
    setState((prevState) => {
      if (!prevState.isRunning || prevState.isComplete) return prevState;

      const hint = generateHint(prevState.userValues, solution, prevState.hintCount);

      // If hint suggests a value, auto-fill it
      if (hint && hint.type === 'value' && hint.row !== undefined && hint.col !== undefined && hint.value) {
        const newUserValues = prevState.userValues.map((r) => [...r]);
        newUserValues[hint.row][hint.col] = hint.value;
        const newHintsUsed = prevState.hintsUsed + 1;

        // Check for completion in the same setState call
        if (isPuzzleComplete(newUserValues, solution)) {
          const newStats: PuzzleSessionStats = {
            solveTime: prevState.timer,
            mistakes: prevState.mistakes,
            hintsUsed: newHintsUsed,
            isComplete: true,
            starRating: calculateStarRating(prevState.mistakes, newHintsUsed)
          };
          return {
            ...prevState,
            userValues: newUserValues,
            hintsUsed: newHintsUsed,
            hintCount: prevState.hintCount + 1,
            currentHint: hint,
            isComplete: true,
            isRunning: false,
            stats: newStats
          };
        }

        return {
          ...prevState,
          userValues: newUserValues,
          hintsUsed: newHintsUsed,
          hintCount: prevState.hintCount + 1,
          currentHint: hint
        };
      }

      return {
        ...prevState,
        hintsUsed: prevState.hintsUsed + 1,
        hintCount: prevState.hintCount + 1,
        currentHint: hint
      };
    });
  }, [solution]);

  const resetPuzzle = useCallback(() => {
    // Clear saved state when resetting
    if (level && puzzleNumber) {
      clearPuzzleState(level);
    }
    setState({
      puzzle: initialPuzzle,
      solution,
      userValues: initialPuzzle.map((row) => [...row]),
      timer: 0,
      isRunning: false,
      mistakes: 0,
      hintsUsed: 0,
      isComplete: false,
      stats: {
        solveTime: 0,
        mistakes: 0,
        hintsUsed: 0,
        isComplete: false,
        starRating: 3
      },
      currentHint: null,
      hintCount: 0
    });
  }, [initialPuzzle, solution, level, puzzleNumber]);

  return {
    state,
    startPuzzle,
    pauseTimer,
    resumeTimer,
    enterValue,
    useHint,
    resetPuzzle
  };
}
