/**
 * Tests for usePuzzleSession hook
 * Tests timer, mistakes, completion detection, star rating, and hints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePuzzleSession } from '../usePuzzleSession';
import type { Grid } from '../../lib/puzzle-solver';

// Create a simple test puzzle (8 filled cells per row/column/box)
function createTestPuzzle(): { puzzle: Grid; solution: Grid } {
  const puzzle: Grid = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];

  const solution: Grid = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ];

  return { puzzle, solution };
}

describe('usePuzzleSession', () => {
  let testPuzzle: { puzzle: Grid; solution: Grid };

  beforeEach(() => {
    testPuzzle = createTestPuzzle();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with correct state', () => {
    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    expect(result.current.state.timer).toBe(0);
    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.mistakes).toBe(0);
    expect(result.current.state.hintsUsed).toBe(0);
    expect(result.current.state.isComplete).toBe(false);
  });

  it('should start timer when puzzle begins', () => {
    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    expect(result.current.state.isRunning).toBe(true);
    expect(result.current.state.timer).toBe(0);

    // Advance timer by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.state.timer).toBe(5);
  });

  it('should count mistakes when wrong value entered', () => {
    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    // Enter a wrong value at [0][2] (solution is 4)
    act(() => {
      result.current.enterValue(0, 2, 9);
    });

    expect(result.current.state.mistakes).toBe(1);

    // Enter another wrong value
    act(() => {
      result.current.enterValue(1, 1, 8);
    });

    expect(result.current.state.mistakes).toBe(2);
  });

  it('should not count mistakes when correct value entered', () => {
    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    // Enter correct value at [0][2] (solution is 4)
    act(() => {
      result.current.enterValue(0, 2, 4);
    });

    expect(result.current.state.mistakes).toBe(0);
  });

  it('should not count mistakes when clearing a cell', () => {
    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    // Enter wrong value
    act(() => {
      result.current.enterValue(0, 2, 9);
    });

    expect(result.current.state.mistakes).toBe(1);

    // Clear the cell (value 0)
    act(() => {
      result.current.enterValue(0, 2, 0);
    });

    // Should still be 1 mistake (clearing doesn't undo the mistake)
    expect(result.current.state.mistakes).toBe(1);
  });

  it('should detect completion when grid matches solution', async () => {
    // Use real timers for this test since we're not testing timer behavior
    vi.useRealTimers();

    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    // Fill in all empty cells with correct values
    const emptyCells = [
      [0, 2, 4], [0, 3, 6], [0, 4, 7], [0, 5, 8], [0, 6, 9], [0, 7, 1], [0, 8, 2],
      [1, 1, 7], [1, 2, 2], [1, 6, 3], [1, 7, 4], [1, 8, 8],
      [2, 0, 1], [2, 3, 3], [2, 4, 4], [2, 5, 2], [2, 6, 5], [2, 8, 7],
      [3, 1, 5], [3, 2, 9], [3, 3, 7], [3, 5, 1], [3, 6, 4], [3, 7, 2],
      [4, 1, 2], [4, 2, 6], [4, 4, 5], [4, 6, 7], [4, 7, 9],
      [5, 1, 1], [5, 2, 3], [5, 3, 9], [5, 5, 4], [5, 6, 8], [5, 7, 5],
      [6, 0, 9], [6, 2, 1], [6, 3, 5], [6, 4, 3], [6, 5, 7], [6, 8, 4],
      [7, 0, 2], [7, 1, 8], [7, 2, 7], [7, 6, 6], [7, 7, 3],
      [8, 0, 3], [8, 1, 4], [8, 2, 5], [8, 3, 2], [8, 5, 6], [8, 6, 1]
    ];

    act(() => {
      emptyCells.forEach(([row, col, value]) => {
        result.current.enterValue(row, col, value);
      });
    });

    // Wait for state update
    await waitFor(() => {
      expect(result.current.state.isComplete).toBe(true);
    }, { timeout: 10000 });

    expect(result.current.state.stats.isComplete).toBe(true);
    expect(result.current.state.isRunning).toBe(false);

    // Restore fake timers for other tests
    vi.useFakeTimers();
  }, 15000);

  it('should calculate 3-star rating for perfect solve', async () => {
    // Use real timers for this test since we're not testing timer behavior
    vi.useRealTimers();

    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    // Fill with no mistakes or hints
    const emptyCells = [
      [0, 2, 4], [0, 3, 6], [0, 4, 7], [0, 5, 8], [0, 6, 9], [0, 7, 1], [0, 8, 2],
      [1, 1, 7], [1, 2, 2], [1, 6, 3], [1, 7, 4], [1, 8, 8],
      [2, 0, 1], [2, 3, 3], [2, 4, 4], [2, 5, 2], [2, 6, 5], [2, 8, 7],
      [3, 1, 5], [3, 2, 9], [3, 3, 7], [3, 5, 1], [3, 6, 4], [3, 7, 2],
      [4, 1, 2], [4, 2, 6], [4, 4, 5], [4, 6, 7], [4, 7, 9],
      [5, 1, 1], [5, 2, 3], [5, 3, 9], [5, 5, 4], [5, 6, 8], [5, 7, 5],
      [6, 0, 9], [6, 2, 1], [6, 3, 5], [6, 4, 3], [6, 5, 7], [6, 8, 4],
      [7, 0, 2], [7, 1, 8], [7, 2, 7], [7, 6, 6], [7, 7, 3],
      [8, 0, 3], [8, 1, 4], [8, 2, 5], [8, 3, 2], [8, 5, 6], [8, 6, 1]
    ];

    act(() => {
      emptyCells.forEach(([row, col, value]) => {
        result.current.enterValue(row, col, value);
      });
    });

    await waitFor(() => {
      expect(result.current.state.isComplete).toBe(true);
    }, { timeout: 10000 });

    expect(result.current.state.stats.starRating).toBe(3);

    // Restore fake timers for other tests
    vi.useFakeTimers();
  }, 15000);

  it('should calculate 2-star rating for good solve', async () => {
    // Use real timers for this test since we're not testing timer behavior
    vi.useRealTimers();

    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    // Make some mistakes first
    act(() => {
      result.current.enterValue(0, 2, 9); // wrong
      result.current.enterValue(0, 2, 4); // correct
    });

    const emptyCells = [
      [0, 3, 6], [0, 4, 7], [0, 5, 8], [0, 6, 9], [0, 7, 1], [0, 8, 2],
      [1, 1, 7], [1, 2, 2], [1, 6, 3], [1, 7, 4], [1, 8, 8],
      [2, 0, 1], [2, 3, 3], [2, 4, 4], [2, 5, 2], [2, 6, 5], [2, 8, 7],
      [3, 1, 5], [3, 2, 9], [3, 3, 7], [3, 5, 1], [3, 6, 4], [3, 7, 2],
      [4, 1, 2], [4, 2, 6], [4, 4, 5], [4, 6, 7], [4, 7, 9],
      [5, 1, 1], [5, 2, 3], [5, 3, 9], [5, 5, 4], [5, 6, 8], [5, 7, 5],
      [6, 0, 9], [6, 2, 1], [6, 3, 5], [6, 4, 3], [6, 5, 7], [6, 8, 4],
      [7, 0, 2], [7, 1, 8], [7, 2, 7], [7, 6, 6], [7, 7, 3],
      [8, 0, 3], [8, 1, 4], [8, 2, 5], [8, 3, 2], [8, 5, 6], [8, 6, 1]
    ];

    act(() => {
      emptyCells.forEach(([row, col, value]) => {
        result.current.enterValue(row, col, value);
      });
    });

    await waitFor(() => {
      expect(result.current.state.isComplete).toBe(true);
    }, { timeout: 10000 });

    expect(result.current.state.stats.starRating).toBe(2);

    // Restore fake timers for other tests
    vi.useFakeTimers();
  }, 15000);

  it('should calculate 1-star rating for difficult solve', async () => {
    vi.useRealTimers();

    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    // Make multiple mistakes
    act(() => {
      result.current.enterValue(0, 2, 9); // wrong (correct: 4)
      result.current.enterValue(0, 3, 5); // wrong (correct: 6)
      result.current.enterValue(0, 5, 1); // wrong (correct: 8)
      result.current.enterValue(0, 2, 4); // correct
      result.current.enterValue(0, 3, 6); // correct
      result.current.enterValue(0, 5, 8); // correct
    });

    const emptyCells = [
      [0, 5, 8], [0, 6, 9], [0, 7, 1], [0, 8, 2],
      [1, 1, 7], [1, 2, 2], [1, 6, 3], [1, 7, 4], [1, 8, 8],
      [2, 0, 1], [2, 3, 3], [2, 4, 4], [2, 5, 2], [2, 6, 5], [2, 8, 7],
      [3, 1, 5], [3, 2, 9], [3, 3, 7], [3, 5, 1], [3, 6, 4], [3, 7, 2],
      [4, 1, 2], [4, 2, 6], [4, 4, 5], [4, 6, 7], [4, 7, 9],
      [5, 1, 1], [5, 2, 3], [5, 3, 9], [5, 5, 4], [5, 6, 8], [5, 7, 5],
      [6, 0, 9], [6, 2, 1], [6, 3, 5], [6, 4, 3], [6, 5, 7], [6, 8, 4],
      [7, 0, 2], [7, 1, 8], [7, 2, 7], [7, 6, 6], [7, 7, 3],
      [8, 0, 3], [8, 1, 4], [8, 2, 5], [8, 3, 2], [8, 5, 6], [8, 6, 1]
    ];

    act(() => {
      emptyCells.forEach(([row, col, value]) => {
        result.current.enterValue(row, col, value);
      });
    });

    await waitFor(() => {
      expect(result.current.state.isComplete).toBe(true);
    }, { timeout: 10000 });

    expect(result.current.state.stats.starRating).toBe(1);

    // Restore fake timers for other tests
    vi.useFakeTimers();
  }, 15000);

  it('should provide hint progression: row -> cell -> value', () => {
    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    // First hint: row
    act(() => {
      result.current.useHint();
    });

    expect(result.current.state.currentHint?.type).toBe('row');
    expect(result.current.state.currentHint?.row).toBeDefined();
    expect(result.current.state.hintsUsed).toBe(1);
    expect(result.current.state.hintCount).toBe(1);

    // Second hint: cell
    act(() => {
      result.current.useHint();
    });

    expect(result.current.state.currentHint?.type).toBe('cell');
    expect(result.current.state.currentHint?.row).toBeDefined();
    expect(result.current.state.currentHint?.col).toBeDefined();
    expect(result.current.state.hintsUsed).toBe(2);
    expect(result.current.state.hintCount).toBe(2);

    // Third hint: value
    act(() => {
      result.current.useHint();
    });

    expect(result.current.state.currentHint?.type).toBe('value');
    expect(result.current.state.currentHint?.row).toBeDefined();
    expect(result.current.state.currentHint?.col).toBeDefined();
    expect(result.current.state.currentHint?.value).toBeDefined();
    expect(result.current.state.hintsUsed).toBe(3);
    expect(result.current.state.hintCount).toBe(3);
  });

  it('should pause and resume timer', () => {
    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.state.timer).toBe(3);

    act(() => {
      result.current.pauseTimer();
    });

    expect(result.current.state.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should still be 3 (timer paused)
    expect(result.current.state.timer).toBe(3);

    act(() => {
      result.current.resumeTimer();
    });

    expect(result.current.state.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.state.timer).toBe(5);
  });

  it('should reset puzzle to initial state', () => {
    const { result } = renderHook(() =>
      usePuzzleSession(testPuzzle.puzzle, testPuzzle.solution)
    );

    act(() => {
      result.current.startPuzzle();
    });

    act(() => {
      result.current.enterValue(0, 2, 9);
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.state.timer).toBeGreaterThan(0);
    expect(result.current.state.mistakes).toBe(1);

    act(() => {
      result.current.resetPuzzle();
    });

    expect(result.current.state.timer).toBe(0);
    expect(result.current.state.mistakes).toBe(0);
    expect(result.current.state.hintsUsed).toBe(0);
    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.isComplete).toBe(false);
  });
});
