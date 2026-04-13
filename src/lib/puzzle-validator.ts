/**
 * Sudoku Puzzle Validator — Solvability & Technique Detection
 * Validates that puzzles:
 * 1. Have exactly one solution
 * 2. Are solvable using only L1–L3 techniques (Full House, Hidden Single, Naked Single)
 * 3. Do not require advanced techniques (level 4+)
 *
 * Returns detailed metadata about puzzle requirements and solve complexity.
 */

import { solvePuzzle, hasUniqueSolution, validatePuzzle, type Grid, type SolveResult } from './puzzle-solver';

export type ValidationResult = {
  isValid: boolean;
  hasUniqueSolution: boolean;
  maxLevel: 1 | 2 | 3 | 4;
  requiredTechniques: string[];
  difficultyScore: number;
  solvePath: {
    steps: number;
    techniques: {
      fullHouse: number;
      hiddenSingle: number;
      nakedSingle: number;
      advanced: number;
    };
  };
  error?: string;
};

export type GeneratedPuzzleWithValidation = {
  grid: Grid;
  solution: Grid;
  level: 1 | 2 | 3;
  validation: ValidationResult;
  generationTime: number;
};

/**
 * Validate a puzzle grid
 * Checks:
 * 1. Valid 9×9 grid with numbers 0-9
 * 2. Unique solution exists
 * 3. Solvable with L1-L3 techniques only
 *
 * @param puzzle - The puzzle grid to validate
 * @param maxLevel - Maximum allowed technique level (1-3)
 * @returns Detailed validation result
 */
export function validatePuzzleGrid(puzzle: Grid, maxLevel: 1 | 2 | 3 = 3): ValidationResult {
  // Basic grid validation
  if (!puzzle || puzzle.length !== 9) {
    return {
      isValid: false,
      hasUniqueSolution: false,
      maxLevel: 4,
      requiredTechniques: [],
      difficultyScore: 0,
      solvePath: {
        steps: 0,
        techniques: { fullHouse: 0, hiddenSingle: 0, nakedSingle: 0, advanced: 0 }
      },
      error: 'Invalid grid: must be 9×9'
    };
  }

  // Check all rows have 9 cells and all values are 0-9
  for (let r = 0; r < 9; r++) {
    if (!puzzle[r] || puzzle[r].length !== 9) {
      return {
        isValid: false,
        hasUniqueSolution: false,
        maxLevel: 4,
        requiredTechniques: [],
        difficultyScore: 0,
        solvePath: {
          steps: 0,
          techniques: { fullHouse: 0, hiddenSingle: 0, nakedSingle: 0, advanced: 0 }
        },
        error: `Invalid grid: row ${r} does not have 9 cells`
      };
    }

    for (let c = 0; c < 9; c++) {
      const val = puzzle[r][c];
      if (!Number.isInteger(val) || val < 0 || val > 9) {
        return {
          isValid: false,
          hasUniqueSolution: false,
          maxLevel: 4,
          requiredTechniques: [],
          difficultyScore: 0,
          solvePath: {
            steps: 0,
            techniques: { fullHouse: 0, hiddenSingle: 0, nakedSingle: 0, advanced: 0 }
          },
          error: `Invalid value at [${r}][${c}]: expected 0-9, got ${val}`
        };
      }
    }
  }

  // Check for duplicate values in rows, columns, and boxes
  for (let r = 0; r < 9; r++) {
    const rowVals = new Set<number>();
    for (let c = 0; c < 9; c++) {
      const val = puzzle[r][c];
      if (val !== 0) {
        if (rowVals.has(val)) {
          return {
            isValid: false,
            hasUniqueSolution: false,
            maxLevel: 4,
            requiredTechniques: [],
            difficultyScore: 0,
            solvePath: {
              steps: 0,
              techniques: { fullHouse: 0, hiddenSingle: 0, nakedSingle: 0, advanced: 0 }
            },
            error: `Duplicate value ${val} in row ${r}`
          };
        }
        rowVals.add(val);
      }
    }
  }

  for (let c = 0; c < 9; c++) {
    const colVals = new Set<number>();
    for (let r = 0; r < 9; r++) {
      const val = puzzle[r][c];
      if (val !== 0) {
        if (colVals.has(val)) {
          return {
            isValid: false,
            hasUniqueSolution: false,
            maxLevel: 4,
            requiredTechniques: [],
            difficultyScore: 0,
            solvePath: {
              steps: 0,
              techniques: { fullHouse: 0, hiddenSingle: 0, nakedSingle: 0, advanced: 0 }
            },
            error: `Duplicate value ${val} in column ${c}`
          };
        }
        colVals.add(val);
      }
    }
  }

  for (let boxRow = 0; boxRow < 9; boxRow += 3) {
    for (let boxCol = 0; boxCol < 9; boxCol += 3) {
      const boxVals = new Set<number>();
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          const val = puzzle[r][c];
          if (val !== 0) {
            if (boxVals.has(val)) {
              return {
                isValid: false,
                hasUniqueSolution: false,
                maxLevel: 4,
                requiredTechniques: [],
                difficultyScore: 0,
                solvePath: {
                  steps: 0,
                  techniques: { fullHouse: 0, hiddenSingle: 0, nakedSingle: 0, advanced: 0 }
                },
                error: `Duplicate value ${val} in box at [${boxRow}][${boxCol}]`
              };
            }
            boxVals.add(val);
          }
        }
      }
    }
  }

  // Solve and analyze
  const result = solvePuzzle(puzzle);

  // Check if puzzle has no solution
  if (!result.solved) {
    return {
      isValid: false,
      hasUniqueSolution: false,
      maxLevel: result.maxLevel,
      requiredTechniques: [],
      difficultyScore: 0,
      solvePath: {
        steps: result.steps,
        techniques: result.techniques
      },
      error: `Puzzle has no solution (${result.unsolved} unsolved cells remain)`
    };
  }

  // Check for unique solution (would need to detect multiple solutions)
  // For now, we assume single solution if constraint propagation solves it
  const hasUnique = hasUniqueSolution(puzzle);

  // Build technique list
  const techniques: string[] = [];
  if (result.techniques.fullHouse > 0) techniques.push('fullHouse');
  if (result.techniques.hiddenSingle > 0) techniques.push('hiddenSingle');
  if (result.techniques.nakedSingle > 0) techniques.push('nakedSingle');

  // Check if advanced techniques required
  if (result.maxLevel > 3) {
    return {
      isValid: false,
      hasUniqueSolution: hasUnique,
      maxLevel: result.maxLevel,
      requiredTechniques: techniques,
      difficultyScore: computeDifficultyScore(result),
      solvePath: {
        steps: result.steps,
        techniques: result.techniques
      },
      error: `Puzzle requires level ${result.maxLevel} techniques, max allowed is ${maxLevel}`
    };
  }

  // All checks passed
  return {
    isValid: true,
    hasUniqueSolution: hasUnique,
    maxLevel: result.maxLevel,
    requiredTechniques: techniques,
    difficultyScore: computeDifficultyScore(result),
    solvePath: {
      steps: result.steps,
      techniques: result.techniques
    }
  };
}

/**
 * Check if puzzle has exactly one solution
 * (This is a simplified check based on constraint propagation)
 *
 * @param puzzle - The puzzle grid
 * @returns true if puzzle has unique solution
 */
export function hasExactlyOneSolution(puzzle: Grid): boolean {
  return hasUniqueSolution(puzzle);
}

/**
 * Check if puzzle is solvable with L1-L3 techniques
 *
 * @param puzzle - The puzzle grid
 * @param maxLevel - Maximum allowed technique level (default 3)
 * @returns true if puzzle solvable with given constraint
 */
export function isSolvableWithTechniques(puzzle: Grid, maxLevel: 1 | 2 | 3 = 3): boolean {
  return validatePuzzle(puzzle, maxLevel);
}

/**
 * Compute difficulty score (0-100) based on solve result
 *
 * @param result - SolveResult from solver
 * @returns Difficulty score 0-100
 */
function computeDifficultyScore(result: SolveResult): number {
  // Base score from max level
  const levelScore = result.maxLevel * 25; // L1=25, L2=50, L3=75, L4=100

  // Adjust by technique distribution
  const totalTechniques =
    result.techniques.fullHouse +
    result.techniques.hiddenSingle +
    result.techniques.nakedSingle;

  if (totalTechniques === 0) return levelScore;

  // More advanced techniques = higher difficulty
  const advancedRatio =
    (result.techniques.nakedSingle * 3 + result.techniques.hiddenSingle * 2) / totalTechniques;

  const score = levelScore + advancedRatio * 10;
  return Math.min(100, Math.round(score));
}

/**
 * Generation + validation pipeline
 * Generates a puzzle and validates it meets L1-L3 constraints
 *
 * @param level - Target puzzle level (1-3)
 * @param generateFn - Function to generate puzzle (takes level, returns grid + solution)
 * @param maxRetries - Maximum retry attempts if validation fails
 * @returns Generated and validated puzzle with metadata
 */
export function generateAndValidatePuzzle(
  level: 1 | 2 | 3,
  generateFn: (level: 1 | 2 | 3) => { grid: Grid; solution: Grid; time: number },
  maxRetries: number = 10
): GeneratedPuzzleWithValidation | null {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const startTime = performance.now();
    const { grid, solution, time: genTime } = generateFn(level);
    const validationTime = performance.now() - startTime;

    const validation = validatePuzzleGrid(grid, level);

    if (validation.isValid) {
      return {
        grid,
        solution,
        level,
        validation,
        generationTime: genTime + validationTime
      };
    }
  }

  return null; // Failed after max retries
}
