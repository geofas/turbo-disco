/**
 * usePuzzleSession Hook — Manages full puzzle session state
 * Tracks: puzzle, user values, timer, mistakes, hints
 * Detects completion and calculates stats
 */

import { useState, useEffect, useCallback } from 'react';
import type { Grid } from '../lib/puzzle-solver';
import { generateHint, type Hint } from '../lib/hint-engine';

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

export function usePuzzleSession(initialPuzzle: Grid, solution: Grid): UsePuzzleSessionReturn {
  const [state, setState] = useState<PuzzleSessionState>({
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

  // Check for completion
  useEffect(() => {
    if (!state.isComplete && state.isRunning) {
      const isComplete = isPuzzleComplete(state.userValues, solution);
      if (isComplete) {
        setState((prevState) => {
          const newStats: PuzzleSessionStats = {
            solveTime: prevState.timer,
            mistakes: prevState.mistakes,
            hintsUsed: prevState.hintsUsed,
            isComplete: true,
            starRating: calculateStarRating(prevState.mistakes, prevState.hintsUsed)
          };
          return {
            ...prevState,
            isComplete: true,
            isRunning: false,
            stats: newStats
          };
        });
      }
    }
  }, [state.userValues, solution, state.isComplete, state.isRunning]);

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

        return {
          ...prevState,
          userValues: newUserValues,
          hintsUsed: prevState.hintsUsed + 1,
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
  }, [initialPuzzle, solution]);

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
