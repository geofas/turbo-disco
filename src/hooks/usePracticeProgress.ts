/**
 * usePracticeProgress Hook — Manages practice progress in localStorage
 * Tracks per-puzzle: status, best time, attempts, completion date
 * Guest mode only (no auth required)
 */

import { useState, useEffect, useCallback } from 'react';

export type PuzzleStatus = 'notStarted' | 'inProgress' | 'completed';

export interface PuzzleProgress {
  puzzleId: string; // Format: "L1-P1" (level 1, puzzle 1)
  status: PuzzleStatus;
  bestTime?: number; // in seconds
  attempts: number;
  completedAt?: number; // timestamp
  stars?: 1 | 2 | 3;
}

interface PracticeProgressState {
  [puzzleId: string]: PuzzleProgress;
}

const STORAGE_KEY = 'sudoku_practice_progress';

/**
 * Load progress from localStorage
 */
function loadProgress(): PracticeProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save progress to localStorage
 */
function saveProgress(progress: PracticeProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

/**
 * Get puzzle ID in standard format
 */
function getPuzzleId(level: number, puzzleNum: number): string {
  return `L${level}-P${puzzleNum}`;
}

export function usePracticeProgress(level: number) {
  const [progress, setProgress] = useState<PracticeProgressState>(() => loadProgress());

  // Auto-save on changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const getPuzzleProgress = useCallback((puzzleNum: number): PuzzleProgress => {
    const id = getPuzzleId(level, puzzleNum);
    return (
      progress[id] || {
        puzzleId: id,
        status: 'notStarted',
        attempts: 0
      }
    );
  }, [progress, level]);

  const startPuzzle = useCallback((puzzleNum: number): void => {
    const id = getPuzzleId(level, puzzleNum);
    setProgress((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        puzzleId: id,
        status: 'inProgress',
        attempts: (prev[id]?.attempts || 0) + 1
      }
    }));
  }, [level]);

  const completePuzzle = useCallback(
    (puzzleNum: number, solveTime: number, stars: 1 | 2 | 3): void => {
      const id = getPuzzleId(level, puzzleNum);
      setProgress((prev) => {
        const existing = prev[id];
        const newBestTime =
          existing?.bestTime && existing.bestTime < solveTime
            ? existing.bestTime
            : solveTime;

        return {
          ...prev,
          [id]: {
            puzzleId: id,
            status: 'completed',
            bestTime: newBestTime,
            attempts: (existing?.attempts || 0) + 1,
            completedAt: Date.now(),
            stars
          }
        };
      });
    },
    [level]
  );

  const getLevelStats = useCallback((): {
    total: number;
    completed: number;
    inProgress: number;
    bestTotalTime: number;
  } => {
    const levelPuzzles = Object.values(progress).filter((p) =>
      p.puzzleId.startsWith(`L${level}-`)
    );

    return {
      total: 3, // 3 puzzles per level
      completed: levelPuzzles.filter((p) => p.status === 'completed').length,
      inProgress: levelPuzzles.filter((p) => p.status === 'inProgress').length,
      bestTotalTime: levelPuzzles
        .filter((p) => p.bestTime)
        .reduce((sum, p) => sum + (p.bestTime || 0), 0)
    };
  }, [progress, level]);

  return {
    getPuzzleProgress,
    startPuzzle,
    completePuzzle,
    getLevelStats
  };
}
