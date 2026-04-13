import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getProgress,
  updateLessonComplete,
  updatePuzzleComplete,
  isLevelUnlocked,
  getCurrentPuzzleState,
  savePuzzleState,
  clearPuzzleState,
  type PuzzleState,
} from '../progress-store';
import { getOrCreateGuestSession } from '../guest-session';

/**
 * Mock localStorage for testing
 */
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe('Progress Store', () => {
  let localStorageMock: LocalStorageMock;

  beforeEach(() => {
    // Mock localStorage before each test
    localStorageMock = new LocalStorageMock();
    (globalThis as any).localStorage = localStorageMock as any;
  });

  afterEach(() => {
    // Clean up after each test
    localStorageMock.clear();
  });

  describe('Level Unlock Progression', () => {
    it('should have L1 unlocked by default', () => {
      const progress = getProgress();
      expect(progress.levels[1].unlocked).toBe(true);
    });

    it('should have L2 locked by default', () => {
      const progress = getProgress();
      expect(progress.levels[2].unlocked).toBe(false);
    });

    it('should have L3 locked by default', () => {
      const progress = getProgress();
      expect(progress.levels[3].unlocked).toBe(false);
    });

    it('should unlock L2 after completing L1 lesson and 1 puzzle', () => {
      // Initial state
      expect(isLevelUnlocked(2)).toBe(false);

      // Complete L1 lesson
      updateLessonComplete(1);
      expect(isLevelUnlocked(2)).toBe(false); // Not yet, need a puzzle

      // Complete L1 puzzle
      updatePuzzleComplete(1, 'puzzle-001', { timeSeconds: 120 });

      // Now L2 should be unlocked
      expect(isLevelUnlocked(2)).toBe(true);
    });

    it('should unlock L3 after completing L2 lesson and 1 puzzle', () => {
      // Set up: unlock L2 first
      updateLessonComplete(1);
      updatePuzzleComplete(1, 'puzzle-001', { timeSeconds: 120 });
      expect(isLevelUnlocked(2)).toBe(true);

      // Now work on L2
      expect(isLevelUnlocked(3)).toBe(false);

      updateLessonComplete(2);
      expect(isLevelUnlocked(3)).toBe(false); // Not yet, need a puzzle

      updatePuzzleComplete(2, 'puzzle-201', { timeSeconds: 150 });

      // Now L3 should be unlocked
      expect(isLevelUnlocked(3)).toBe(true);
    });

    it('should not unlock L2 if only lesson is completed', () => {
      updateLessonComplete(1);
      expect(isLevelUnlocked(2)).toBe(false);
    });

    it('should not unlock L2 if only puzzle is completed', () => {
      updatePuzzleComplete(1, 'puzzle-001', { timeSeconds: 120 });
      expect(isLevelUnlocked(2)).toBe(false);
    });
  });

  describe('Progress Persistence', () => {
    it('should persist progress across instances', () => {
      // First instance
      updateLessonComplete(1);
      updatePuzzleComplete(1, 'puzzle-001', { timeSeconds: 120 });

      // Verify L2 is unlocked
      expect(isLevelUnlocked(2)).toBe(true);

      // Simulate a new page load/instance by getting fresh progress
      const reloadedProgress = getProgress();

      expect(reloadedProgress.levels[1].lessonCompleted).toBe(true);
      expect(
        Object.keys(reloadedProgress.levels[1].puzzlesCompleted).length
      ).toBe(1);
      expect(reloadedProgress.levels[2].unlocked).toBe(true);
    });

    it('should handle corrupted localStorage gracefully', () => {
      // Store invalid JSON
      localStorageMock.setItem('sudoku-trainer-progress', 'invalid json{');

      // Should return default progress without crashing
      const progress = getProgress();
      expect(progress.levels[1].unlocked).toBe(true);
      expect(progress.levels[2].unlocked).toBe(false);
    });
  });

  describe('Guest Session', () => {
    it('should create a guest session on first access', () => {
      const session1 = getOrCreateGuestSession();
      expect(session1.sessionId).toBeDefined();
      expect(session1.createdAt).toBeGreaterThan(0);
      expect(session1.lastActiveAt).toBeGreaterThan(0);

      // Second call should return the same session
      const session2 = getOrCreateGuestSession();
      expect(session2.sessionId).toBe(session1.sessionId);
    });

    it('should have different session IDs for different guests', () => {
      const session1 = getOrCreateGuestSession();
      const session1Id = session1.sessionId;

      // Simulate a new guest by clearing localStorage
      localStorageMock.clear();

      const session2 = getOrCreateGuestSession();
      expect(session2.sessionId).not.toBe(session1Id);
    });
  });

  describe('Puzzle State Management', () => {
    it('should save and retrieve puzzle state', () => {
      const puzzleState: PuzzleState = {
        grid: '123456789' + '0'.repeat(72),
        candidates: {
          0: [1, 2, 3],
          1: [4, 5, 6],
        },
      };

      savePuzzleState(1, 'puzzle-001', puzzleState);
      const retrieved = getCurrentPuzzleState(1, 'puzzle-001');

      expect(retrieved).toBeDefined();
      expect(retrieved?.grid).toBe(puzzleState.grid);
      expect(retrieved?.candidates[0]).toEqual(puzzleState.candidates[0]);
    });

    it('should clear puzzle state', () => {
      const puzzleState: PuzzleState = {
        grid: '123456789' + '0'.repeat(72),
        candidates: {},
      };

      savePuzzleState(1, 'puzzle-001', puzzleState);
      expect(getCurrentPuzzleState(1, 'puzzle-001')).toBeDefined();

      clearPuzzleState(1);
      expect(getCurrentPuzzleState(1, 'puzzle-001')).toBeNull();
    });

    it('should return null for non-existent puzzle state', () => {
      const state = getCurrentPuzzleState(1, 'non-existent');
      expect(state).toBeNull();
    });

    it('should handle puzzle state with notes', () => {
      const puzzleState: PuzzleState = {
        grid: '123456789' + '0'.repeat(72),
        candidates: {},
        notes: {
          0: 'This cell must be 1',
          5: 'Needs more thought',
        },
      };

      savePuzzleState(2, 'puzzle-201', puzzleState);
      const retrieved = getCurrentPuzzleState(2, 'puzzle-201');

      expect(retrieved?.notes).toEqual(puzzleState.notes);
    });
  });

  describe('Lesson and Puzzle Completion Tracking', () => {
    it('should track lesson completion per level', () => {
      const progress1 = getProgress();
      expect(progress1.levels[1].lessonCompleted).toBe(false);

      updateLessonComplete(1);

      const progress2 = getProgress();
      expect(progress2.levels[1].lessonCompleted).toBe(true);
    });

    it('should track multiple puzzles per level', () => {
      updatePuzzleComplete(1, 'puzzle-001', { timeSeconds: 100 });
      updatePuzzleComplete(1, 'puzzle-002', { timeSeconds: 150 });
      updatePuzzleComplete(1, 'puzzle-003', { timeSeconds: 120 });

      const progress = getProgress();
      const puzzles = progress.levels[1].puzzlesCompleted;

      expect(Object.keys(puzzles).length).toBe(3);
      expect(puzzles['puzzle-001'].timeSeconds).toBe(100);
      expect(puzzles['puzzle-002'].timeSeconds).toBe(150);
      expect(puzzles['puzzle-003'].timeSeconds).toBe(120);
    });

    it('should update puzzle stats if completed again', () => {
      updatePuzzleComplete(1, 'puzzle-001', { timeSeconds: 200 });

      let progress = getProgress();
      expect(progress.levels[1].puzzlesCompleted['puzzle-001'].timeSeconds).toBe(200);

      // Complete the same puzzle again with better time
      updatePuzzleComplete(1, 'puzzle-001', { timeSeconds: 150 });

      progress = getProgress();
      expect(progress.levels[1].puzzlesCompleted['puzzle-001'].timeSeconds).toBe(150);
    });

    it('should store completion timestamp', () => {
      const before = Date.now();
      const testTime = Date.now();
      updatePuzzleComplete(1, 'puzzle-001', { timeSeconds: 100, completedAt: testTime });
      const after = Date.now();

      const progress = getProgress();
      const completedAt = progress.levels[1].puzzlesCompleted['puzzle-001'].completedAt;

      expect(completedAt).toBeGreaterThanOrEqual(before);
      expect(completedAt).toBeLessThanOrEqual(after + 100); // Allow small buffer
    });
  });

  describe('Multiple Levels Independent Progress', () => {
    it('should track progress independently for each level', () => {
      updateLessonComplete(1);
      updateLessonComplete(2);

      const progress = getProgress();
      expect(progress.levels[1].lessonCompleted).toBe(true);
      expect(progress.levels[2].lessonCompleted).toBe(true);

      // But completing L2 lesson shouldn't affect L1 unless it affects unlock
      updateLessonComplete(3);
      const progress2 = getProgress();
      expect(progress2.levels[1].lessonCompleted).toBe(true);
      expect(progress2.levels[3].lessonCompleted).toBe(true);
    });

    it('should allow completing puzzles on any unlocked level', () => {
      // Complete L1 to unlock L2
      updateLessonComplete(1);
      updatePuzzleComplete(1, 'l1-p1', { timeSeconds: 100 });

      // Now we can do L2
      updatePuzzleComplete(2, 'l2-p1', { timeSeconds: 120 });

      const progress = getProgress();
      expect(Object.keys(progress.levels[1].puzzlesCompleted).length).toBe(1);
      expect(Object.keys(progress.levels[2].puzzlesCompleted).length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle localStorage unavailable gracefully', () => {
      // Set localStorage to throw
      (globalThis as any).localStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error('Storage unavailable');
        },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      } as any;

      // Should not throw, just continue
      expect(() => {
        updateLessonComplete(1);
      }).not.toThrow();

      expect(() => {
        updatePuzzleComplete(1, 'test', { timeSeconds: 100 });
      }).not.toThrow();
    });

    it('should initialize missing level structures', () => {
      // Manually set incomplete progress
      localStorageMock.setItem(
        'sudoku-trainer-progress',
        JSON.stringify({ levels: { 1: { unlocked: true, lessonCompleted: false, puzzlesCompleted: {} } } })
      );

      const progress = getProgress();
      expect(progress.levels[2]).toBeDefined();
      expect(progress.levels[3]).toBeDefined();
    });
  });
});
