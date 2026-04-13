import { describe, it, expect } from 'vitest';
import {
  generatePuzzle,
  generatePuzzles,
  generatePuzzlesWithSeeds,
  generateGrid,
  createPuzzle,
  hashSeed
} from '../puzzle-generator';
import { deepCopyGrid } from '../puzzle-solver';

describe('Puzzle Generator', () => {
  describe('hashSeed', () => {
    it('should hash string seeds to numbers consistently', () => {
      const seed1 = hashSeed('2026-04-13-L1-001');
      const seed2 = hashSeed('2026-04-13-L1-001');
      expect(seed1).toBe(seed2);
    });

    it('should produce different hashes for different seeds', () => {
      const seed1 = hashSeed('2026-04-13-L1-001');
      const seed2 = hashSeed('2026-04-13-L1-002');
      expect(seed1).not.toBe(seed2);
    });

    it('should produce non-negative integers', () => {
      const seed = hashSeed('test-seed');
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(seed)).toBe(true);
    });

    it('should handle empty strings', () => {
      const seed = hashSeed('');
      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThanOrEqual(0);
    });

    it('should handle special characters', () => {
      const seed = hashSeed('!@#$%^&*()');
      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generatePuzzle - Old API (numeric seed)', () => {
    it('should generate valid puzzles with numeric seed', () => {
      const puzzle = generatePuzzle(1000, 1);
      expect(puzzle.grid).toBeDefined();
      expect(puzzle.solution).toBeDefined();
      expect(puzzle.level).toBe(1);
      expect(puzzle.difficulty).toBeGreaterThanOrEqual(0);
      expect(puzzle.difficulty).toBeLessThanOrEqual(100);
      expect(puzzle.filledCells).toBeGreaterThan(0);
      expect(puzzle.filledCells).toBeLessThanOrEqual(81);
    });

    it('should generate puzzles for all levels', () => {
      const levels: [1, 2, 3] = [1, 2, 3];
      for (const level of levels) {
        const puzzle = generatePuzzle(2000, level);
        expect(puzzle.level).toBe(level);
      }
    });

    it('should be deterministic with same numeric seed', () => {
      const puzzle1 = generatePuzzle(5000, 2);
      const puzzle2 = generatePuzzle(5000, 2);

      // Same seed should produce same puzzle
      expect(puzzle1.grid).toEqual(puzzle2.grid);
      expect(puzzle1.solution).toEqual(puzzle2.solution);
      expect(puzzle1.filledCells).toBe(puzzle2.filledCells);
    });

    it('should produce different puzzles with different numeric seeds', () => {
      const puzzle1 = generatePuzzle(6000, 2);
      const puzzle2 = generatePuzzle(6001, 2);

      // Different seeds should (very likely) produce different puzzles
      expect(puzzle1.grid).not.toEqual(puzzle2.grid);
    });
  });

  describe('generatePuzzle - New API (string seed)', () => {
    it('should generate valid puzzles with string seed', () => {
      const puzzle = generatePuzzle(1, { seed: '2026-04-13-L1-001' });
      expect(puzzle.grid).toBeDefined();
      expect(puzzle.solution).toBeDefined();
      expect(puzzle.level).toBe(1);
      expect(puzzle.filledCells).toBeGreaterThan(0);
    });

    it('should be deterministic with same string seed', () => {
      const seed = '2026-04-13-L1-001';
      const puzzle1 = generatePuzzle(1, { seed });
      const puzzle2 = generatePuzzle(1, { seed });

      // Same string seed should produce same puzzle
      expect(puzzle1.grid).toEqual(puzzle2.grid);
      expect(puzzle1.solution).toEqual(puzzle2.solution);
      expect(puzzle1.filledCells).toBe(puzzle2.filledCells);
    });

    it('should produce different puzzles with different string seeds', () => {
      const puzzle1 = generatePuzzle(2, { seed: '2026-04-13-L2-001' });
      const puzzle2 = generatePuzzle(2, { seed: '2026-04-13-L2-002' });

      // Different seeds should (very likely) produce different puzzles
      expect(puzzle1.grid).not.toEqual(puzzle2.grid);
    });

    it('should generate random puzzles when no seed provided', () => {
      const puzzle1 = generatePuzzle(1);
      const puzzle2 = generatePuzzle(1);

      // Without seed, puzzles should be different (with very high probability)
      // Note: There's a tiny chance they could be the same by random chance,
      // but it's astronomically unlikely
      expect(puzzle1.grid).not.toEqual(puzzle2.grid);
    });

    it('should support all difficulty levels with string seeds', () => {
      const levels: [1, 2, 3] = [1, 2, 3];
      for (const level of levels) {
        const puzzle = generatePuzzle(level, { seed: `test-level-${level}` });
        expect(puzzle.level).toBe(level);
      }
    });
  });

  describe('generatePuzzles', () => {
    it('should generate multiple puzzles', () => {
      const puzzles = generatePuzzles(1, 5);
      expect(puzzles).toHaveLength(5);
      expect(puzzles.every(p => p.level === 1)).toBe(true);
    });

    it('should generate different puzzles in batch', () => {
      const puzzles = generatePuzzles(2, 3);
      // All puzzles should be different (with very high probability)
      const grids = puzzles.map(p => JSON.stringify(p.grid));
      const uniqueGrids = new Set(grids);
      expect(uniqueGrids.size).toBeGreaterThan(1);
    });
  });

  describe('generatePuzzlesWithSeeds', () => {
    it('should generate multiple seeded puzzles', () => {
      const puzzles = generatePuzzlesWithSeeds(1, '2026-04-13-L1', 5);
      expect(puzzles).toHaveLength(5);
      expect(puzzles.every(p => p.level === 1)).toBe(true);
    });

    it('should generate deterministic puzzles with predictable seeds', () => {
      const puzzles1 = generatePuzzlesWithSeeds(2, '2026-04-13-L2', 3);
      const puzzles2 = generatePuzzlesWithSeeds(2, '2026-04-13-L2', 3);

      // Same seed prefix should produce identical puzzle batches
      for (let i = 0; i < 3; i++) {
        expect(puzzles1[i].grid).toEqual(puzzles2[i].grid);
        expect(puzzles1[i].filledCells).toBe(puzzles2[i].filledCells);
      }
    });

    it('should produce different puzzles across seed sequence', () => {
      const puzzles = generatePuzzlesWithSeeds(3, '2026-04-13-L3', 5);

      // Each puzzle in the sequence should be different
      const grids = puzzles.map(p => JSON.stringify(p.grid));
      const uniqueGrids = new Set(grids);
      expect(uniqueGrids.size).toBe(5);
    });

    it('should use proper seed padding', () => {
      const puzzles = generatePuzzlesWithSeeds(1, '2026-04-13-L1', 3);

      // Verify that puzzles are different (padding ensures different seeds)
      expect(puzzles[0].grid).not.toEqual(puzzles[1].grid);
      expect(puzzles[1].grid).not.toEqual(puzzles[2].grid);
    });
  });

  describe('generateGrid', () => {
    it('should generate valid grids', () => {
      const grid = generateGrid(3000);

      // Check grid is 9x9
      expect(grid).toHaveLength(9);
      expect(grid.every(row => row.length === 9)).toBe(true);

      // Check all values are 1-9
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          expect(grid[r][c]).toBeGreaterThanOrEqual(1);
          expect(grid[r][c]).toBeLessThanOrEqual(9);
        }
      }
    });

    it('should be deterministic with same seed', () => {
      const grid1 = generateGrid(4000);
      const grid2 = generateGrid(4000);
      expect(grid1).toEqual(grid2);
    });

    it('should produce different grids with different seeds', () => {
      const grid1 = generateGrid(4001);
      const grid2 = generateGrid(4002);
      expect(grid1).not.toEqual(grid2);
    });
  });

  describe('createPuzzle', () => {
    it('should create puzzles with proper cell counts', () => {
      const grid = generateGrid(5000);
      const puzzle = createPuzzle(grid, 1, 5000);

      // For level 1: should have 45-50 filled cells
      expect(puzzle.reduce((sum, row) => sum + row.filter(cell => cell !== 0).length, 0)).toBeGreaterThanOrEqual(45);
      expect(puzzle.reduce((sum, row) => sum + row.filter(cell => cell !== 0).length, 0)).toBeLessThanOrEqual(50);
    });

    it('should be deterministic with same seed', () => {
      const grid = generateGrid(6000);
      const puzzle1 = createPuzzle(deepCopyGrid(grid), 2, 6000);
      const puzzle2 = createPuzzle(deepCopyGrid(grid), 2, 6000);

      expect(puzzle1).toEqual(puzzle2);
    });
  });

  describe('Determinism across API calls', () => {
    it('string seed hash should match numeric seed generation', () => {
      const stringSeeds = ['puzzle-001', 'puzzle-002', 'puzzle-003'];
      const puzzles1 = stringSeeds.map(seed => generatePuzzle(1, { seed }));

      // Regenerate with same string seeds
      const puzzles2 = stringSeeds.map(seed => generatePuzzle(1, { seed }));

      // All should match exactly
      for (let i = 0; i < stringSeeds.length; i++) {
        expect(puzzles1[i].grid).toEqual(puzzles2[i].grid);
        expect(puzzles1[i].solution).toEqual(puzzles2[i].solution);
      }
    });

    it('should maintain backward compatibility with numeric API', () => {
      const seed = 7000;
      const puzzle1 = generatePuzzle(seed, 1);
      const puzzle2 = generatePuzzle(seed, 1);

      expect(puzzle1.grid).toEqual(puzzle2.grid);
      expect(puzzle1.solution).toEqual(puzzle2.solution);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long seed strings', () => {
      const longSeed = 'a'.repeat(1000);
      const puzzle = generatePuzzle(1, { seed: longSeed });
      expect(puzzle.grid).toBeDefined();
    });

    it('should handle unicode in seed strings', () => {
      const seed = '2026-04-13-🧩-001';
      const puzzle = generatePuzzle(1, { seed });
      expect(puzzle.grid).toBeDefined();
    });

    it('generatePuzzle with invalid arguments should throw', () => {
      // @ts-expect-error Testing invalid arguments
      expect(() => generatePuzzle('invalid')).toThrow();
    });
  });

  describe('Puzzle properties', () => {
    it('should generate puzzles with expected technique names', () => {
      const puzzle = generatePuzzle(1, { seed: '2026-04-13-techniques' });
      expect(Array.isArray(puzzle.techniques)).toBe(true);
      expect(
        puzzle.techniques.every(t => ['fullHouse', 'hiddenSingle', 'nakedSingle'].includes(t))
      ).toBe(true);
    });

    it('should have valid generation time', () => {
      const puzzle = generatePuzzle(1, { seed: '2026-04-13-perf' });
      expect(puzzle.generationTime).toBeGreaterThan(0);
      expect(puzzle.generationTime).toBeLessThan(10000); // Less than 10 seconds
    });

    it('should have difficulty score in valid range', () => {
      const puzzle = generatePuzzle(2, { seed: '2026-04-13-diff' });
      expect(puzzle.difficulty).toBeGreaterThanOrEqual(0);
      expect(puzzle.difficulty).toBeLessThanOrEqual(100);
    });
  });
});
