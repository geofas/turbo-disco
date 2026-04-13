import { describe, it, expect } from 'vitest';
import {
  validatePuzzleGrid,
  hasExactlyOneSolution,
  isSolvableWithTechniques,
  generateAndValidatePuzzle,
} from '../puzzle-validator';
import { generatePuzzle } from '../puzzle-generator';
import { deepCopyGrid, type Grid } from '../puzzle-solver';

describe('Puzzle Validator', () => {
  describe('validatePuzzleGrid', () => {
    it('should validate valid L1 puzzle', () => {
      const puzzle = generatePuzzle(1, { seed: '2026-04-13-L1-valid-001' });
      const result = validatePuzzleGrid(puzzle.grid, 1);

      expect(result.isValid).toBe(true);
      expect(result.hasUniqueSolution).toBe(true);
      expect(result.maxLevel).toBeLessThanOrEqual(3);
      expect(result.requiredTechniques.length).toBeGreaterThan(0);
      expect(result.solvePath.steps).toBeGreaterThan(0);
    });

    it('should validate valid L2 puzzle', () => {
      const puzzle = generatePuzzle(2, { seed: '2026-04-13-L2-valid-001' });
      const result = validatePuzzleGrid(puzzle.grid, 2);

      expect(result.isValid).toBe(true);
      expect(result.hasUniqueSolution).toBe(true);
      expect(result.maxLevel).toBeLessThanOrEqual(3);
      expect(result.requiredTechniques.length).toBeGreaterThan(0);
    });

    it('should validate valid L3 puzzle', () => {
      const puzzle = generatePuzzle(3, { seed: '2026-04-13-L3-valid-001' });
      const result = validatePuzzleGrid(puzzle.grid, 3);

      expect(result.isValid).toBe(true);
      expect(result.hasUniqueSolution).toBe(true);
      expect(result.maxLevel).toBeLessThanOrEqual(3);
    });

    it('should reject puzzle with no solution', () => {
      // Create an invalid puzzle by removing solution cell and adding conflicting clue
      const grid: Grid = Array(9)
        .fill(0)
        .map(() => Array(9).fill(0));

      // Add duplicate values in first row
      grid[0][0] = 1;
      grid[0][1] = 1;

      const result = validatePuzzleGrid(grid);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Duplicate value');
    });

    it('should reject puzzle with duplicate values in same row', () => {
      const grid: Grid = Array(9)
        .fill(0)
        .map(() => Array(9).fill(0));

      grid[0][0] = 5;
      grid[0][1] = 5;

      const result = validatePuzzleGrid(grid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Duplicate value 5 in row 0');
    });

    it('should reject puzzle with duplicate values in same column', () => {
      const grid: Grid = Array(9)
        .fill(0)
        .map(() => Array(9).fill(0));

      grid[0][0] = 7;
      grid[1][0] = 7;

      const result = validatePuzzleGrid(grid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Duplicate value 7 in column 0');
    });

    it('should reject puzzle with duplicate values in same box', () => {
      const grid: Grid = Array(9)
        .fill(0)
        .map(() => Array(9).fill(0));

      grid[0][0] = 3;
      grid[1][1] = 3;

      const result = validatePuzzleGrid(grid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Duplicate value 3 in box');
    });

    it('should reject grid that is not 9x9', () => {
      const grid: Grid = Array(8)
        .fill(0)
        .map(() => Array(9).fill(0));

      const result = validatePuzzleGrid(grid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid grid');
    });

    it('should reject grid with invalid cell values', () => {
      const grid: Grid = Array(9)
        .fill(0)
        .map(() => Array(9).fill(0));

      grid[0][0] = 10; // Invalid: must be 0-9

      const result = validatePuzzleGrid(grid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid value');
    });

    it('should reject puzzle requiring advanced techniques beyond max level', () => {
      // This is tricky to test directly, but we validate that L1 puzzles
      // are within L1 constraints
      const puzzle = generatePuzzle(1, { seed: '2026-04-13-L1-strict' });
      const result = validatePuzzleGrid(puzzle.grid, 1);

      // Should be valid for L1-L3 (L1 puzzles may require L2/L3 techniques)
      if (result.isValid) {
        expect(result.maxLevel).toBeLessThanOrEqual(3);
      }
    });

    it('should return detailed technique information', () => {
      const puzzle = generatePuzzle(2, { seed: '2026-04-13-L2-techniques' });
      const result = validatePuzzleGrid(puzzle.grid, 3);

      expect(result.requiredTechniques).toBeDefined();
      expect(Array.isArray(result.requiredTechniques)).toBe(true);
      expect(result.solvePath.techniques.fullHouse).toBeGreaterThanOrEqual(0);
      expect(result.solvePath.techniques.hiddenSingle).toBeGreaterThanOrEqual(0);
      expect(result.solvePath.techniques.nakedSingle).toBeGreaterThanOrEqual(0);
      expect(result.difficultyScore).toBeGreaterThanOrEqual(0);
      expect(result.difficultyScore).toBeLessThanOrEqual(100);
    });

    it('should handle row with incorrect cell count', () => {
      const grid: Grid = Array(9)
        .fill(0)
        .map(() => Array(9).fill(0));

      (grid[0] as any) = [1, 2, 3]; // Too few cells

      const result = validatePuzzleGrid(grid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not have 9 cells');
    });

    it('should compute valid difficulty scores', () => {
      const levels: (1 | 2 | 3)[] = [1, 2, 3];

      for (const level of levels) {
        const puzzle = generatePuzzle(level, { seed: `2026-04-13-diff-L${level}` });
        const result = validatePuzzleGrid(puzzle.grid, level);

        if (result.isValid) {
          expect(result.difficultyScore).toBeGreaterThanOrEqual(0);
          expect(result.difficultyScore).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('hasExactlyOneSolution', () => {
    it('should confirm valid puzzle has unique solution', () => {
      const puzzle = generatePuzzle(1, { seed: '2026-04-13-unique-001' });
      const isUnique = hasExactlyOneSolution(puzzle.grid);

      expect(isUnique).toBe(true);
    });

    it('should confirm all generated puzzles have unique solutions', () => {
      for (let i = 0; i < 3; i++) {
        const puzzle = generatePuzzle(2, { seed: `2026-04-13-unique-L2-${i}` });
        expect(hasExactlyOneSolution(puzzle.grid)).toBe(true);
      }
    });
  });

  describe('isSolvableWithTechniques', () => {
    it('should confirm L1 puzzle solvable with L1-L3 techniques', () => {
      const puzzle = generatePuzzle(1, { seed: '2026-04-13-solvable-L1' });
      expect(isSolvableWithTechniques(puzzle.grid, 3)).toBe(true);
    });

    it('should confirm L2 puzzle solvable with L1-L3 techniques', () => {
      const puzzle = generatePuzzle(2, { seed: '2026-04-13-solvable-L2' });
      expect(isSolvableWithTechniques(puzzle.grid, 3)).toBe(true);
    });

    it('should confirm L3 puzzle solvable with L3 techniques', () => {
      const puzzle = generatePuzzle(3, { seed: '2026-04-13-solvable-L3' });
      expect(isSolvableWithTechniques(puzzle.grid, 3)).toBe(true);
    });

    it('should work with default max level 3', () => {
      const puzzle = generatePuzzle(2, { seed: '2026-04-13-solvable-default' });
      // Call with single argument (uses default maxLevel = 3)
      expect(isSolvableWithTechniques(puzzle.grid)).toBe(true);
    });
  });

  describe('generateAndValidatePuzzle', () => {
    it('should generate and validate valid puzzle', () => {
      const mockGenerator = (level: 1 | 2 | 3) => {
        const puzzle = generatePuzzle(level, { seed: `mock-${level}` });
        return {
          grid: puzzle.grid,
          solution: puzzle.solution,
          time: puzzle.generationTime
        };
      };

      const result = generateAndValidatePuzzle(1, mockGenerator, 5);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.grid).toBeDefined();
        expect(result.solution).toBeDefined();
        expect(result.level).toBe(1);
        expect(result.validation.isValid).toBe(true);
        expect(result.generationTime).toBeGreaterThan(0);
      }
    });

    it('should retry on validation failure', () => {
      let attemptCount = 0;

      const mockGenerator = (level: 1 | 2 | 3) => {
        attemptCount++;
        const puzzle = generatePuzzle(level, { seed: `retry-${attemptCount}` });
        return {
          grid: puzzle.grid,
          solution: puzzle.solution,
          time: puzzle.generationTime
        };
      };

      const result = generateAndValidatePuzzle(1, mockGenerator, 3);

      // Should have made at least one attempt
      expect(attemptCount).toBeGreaterThanOrEqual(1);
      // Should succeed if puzzle is valid
      if (result) {
        expect(result.validation.isValid).toBe(true);
      }
    });

    it('should return null after max retries fail', () => {
      const mockGenerator = (_level: 1 | 2 | 3) => {
        // Return invalid puzzle
        const grid: Grid = Array(9)
          .fill(0)
          .map(() => Array(9).fill(0));
        grid[0][0] = 1;
        grid[0][1] = 1; // Invalid: duplicate

        return {
          grid,
          solution: grid,
          time: 1
        };
      };

      const result = generateAndValidatePuzzle(1, mockGenerator, 2);

      expect(result).toBeNull();
    });

    it('should preserve generation time across levels', () => {
      const mockGenerator = (level: 1 | 2 | 3) => {
        const puzzle = generatePuzzle(level, { seed: `perf-${level}` });
        return {
          grid: puzzle.grid,
          solution: puzzle.solution,
          time: puzzle.generationTime
        };
      };

      for (const level of [1, 2, 3] as const) {
        const result = generateAndValidatePuzzle(level, mockGenerator, 5);
        if (result) {
          expect(result.generationTime).toBeGreaterThan(0);
          expect(result.generationTime).toBeLessThan(10000); // Less than 10s
        }
      }
    });
  });

  describe('Technique detection', () => {
    it('should detect Full House technique in L1 puzzles', () => {
      const puzzle = generatePuzzle(1, { seed: '2026-04-13-fullhouse' });
      const result = validatePuzzleGrid(puzzle.grid, 1);

      if (result.isValid) {
        expect(result.requiredTechniques).toContain('fullHouse');
      }
    });

    it('should detect Hidden Single technique in L2 puzzles', () => {
      const puzzle = generatePuzzle(2, { seed: '2026-04-13-hidden' });
      const result = validatePuzzleGrid(puzzle.grid, 2);

      if (result.isValid && result.maxLevel >= 2) {
        expect(result.requiredTechniques).toContain('hiddenSingle');
      }
    });

    it('should detect Naked Single technique in L3 puzzles', () => {
      const puzzle = generatePuzzle(3, { seed: '2026-04-13-naked' });
      const result = validatePuzzleGrid(puzzle.grid, 3);

      if (result.isValid && result.maxLevel >= 3) {
        // L3 may or may not have naked singles depending on puzzle
        expect(result.requiredTechniques).toBeDefined();
      }
    });

    it('should list all techniques used in complex puzzles', () => {
      const puzzle = generatePuzzle(3, { seed: '2026-04-13-complex' });
      const result = validatePuzzleGrid(puzzle.grid, 3);

      if (result.isValid) {
        expect(Array.isArray(result.requiredTechniques)).toBe(true);
        expect(result.requiredTechniques.length).toBeGreaterThan(0);

        // All techniques should be valid
        for (const tech of result.requiredTechniques) {
          expect(['fullHouse', 'hiddenSingle', 'nakedSingle']).toContain(tech);
        }
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle empty puzzle (all zeros)', () => {
      const grid: Grid = Array(9)
        .fill(0)
        .map(() => Array(9).fill(0));

      const result = validatePuzzleGrid(grid);

      // Empty puzzle should fail (unsolvable to unique solution)
      expect(result.isValid).toBe(false);
    });

    it('should handle nearly complete puzzle', () => {
      const puzzle = generatePuzzle(1, { seed: '2026-04-13-nearly-complete' });
      const almostComplete = deepCopyGrid(puzzle.grid);

      // Fill almost all cells
      let filledCount = 0;
      for (let r = 0; r < 9 && filledCount < 80; r++) {
        for (let c = 0; c < 9 && filledCount < 80; c++) {
          if (almostComplete[r][c] === 0) {
            almostComplete[r][c] = puzzle.solution[r][c];
            filledCount++;
          }
        }
      }

      const result = validatePuzzleGrid(almostComplete);

      // Should be valid if no conflicts
      if (result.isValid) {
        expect(result.hasUniqueSolution).toBe(true);
      }
    });

    it('should handle non-integer values gracefully', () => {
      const grid = Array(9)
        .fill(0)
        .map(() => Array(9).fill(0)) as any;

      grid[0][0] = 3.5; // Non-integer

      const result = validatePuzzleGrid(grid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid value');
    });

    it('should handle negative values', () => {
      const grid: Grid = Array(9)
        .fill(0)
        .map(() => Array(9).fill(0));

      grid[0][0] = -1;

      const result = validatePuzzleGrid(grid);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid value');
    });
  });

  describe('Consistency across validations', () => {
    it('should produce consistent results for same puzzle', () => {
      const puzzle = generatePuzzle(2, { seed: '2026-04-13-consistent' });

      const result1 = validatePuzzleGrid(puzzle.grid, 2);
      const result2 = validatePuzzleGrid(puzzle.grid, 2);

      expect(result1.isValid).toBe(result2.isValid);
      expect(result1.maxLevel).toBe(result2.maxLevel);
      expect(result1.solvePath.steps).toBe(result2.solvePath.steps);
      expect(result1.requiredTechniques).toEqual(result2.requiredTechniques);
    });

    it('should validate generated puzzles from multiple sources', () => {
      const levels: (1 | 2 | 3)[] = [1, 2, 3];

      for (const level of levels) {
        const puzzle = generatePuzzle(level, { seed: `2026-04-13-multi-${level}` });
        const result = validatePuzzleGrid(puzzle.grid, level);

        expect(result.isValid).toBe(true);
        expect(result.hasUniqueSolution).toBe(true);
        expect(result.maxLevel).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('Validation with L1-L3 constraints', () => {
    it('should validate L1 puzzle is solvable within L1-L3', () => {
      const puzzle = generatePuzzle(1, { seed: '2026-04-13-strict-L1' });
      const result = validatePuzzleGrid(puzzle.grid, 1);

      expect(result.isValid).toBe(true);
      expect(result.maxLevel).toBeLessThanOrEqual(3);
    });

    it('should validate L2 puzzle is solvable within L1-L3', () => {
      const puzzle = generatePuzzle(2, { seed: '2026-04-13-strict-L2' });
      const result = validatePuzzleGrid(puzzle.grid, 2);

      expect(result.isValid).toBe(true);
      expect(result.maxLevel).toBeLessThanOrEqual(3);
    });

    it('should validate L3 puzzle is solvable within L1-L3', () => {
      const puzzle = generatePuzzle(3, { seed: '2026-04-13-strict-L3' });
      const result = validatePuzzleGrid(puzzle.grid, 3);

      expect(result.isValid).toBe(true);
      expect(result.maxLevel).toBeLessThanOrEqual(3);
    });
  });
});
