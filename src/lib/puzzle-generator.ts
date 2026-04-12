/**
 * Sudoku Puzzle Generator — Deterministic Grid & Puzzle Creation
 * Generates valid, technique-tagged sudoku puzzles for levels 1–3
 *
 * Pipeline:
 * 1. Generate complete grid from seed (permutations of canonical grid)
 * 2. Create puzzle by removing cells symmetrically
 * 3. Validate solvability with L1–L3 techniques only
 */

import { solvePuzzle, deepCopyGrid, validatePuzzle, SolveResult, Grid } from './puzzle-solver';

export type Puzzle = {
  grid: Grid;
  solution: Grid;
  level: 1 | 2 | 3;
  difficulty: number; // 0–100, higher = harder
  filledCells: number;
  techniques: string[];
  generationTime: number;
};

// Difficulty parameters for each level
const difficultyParams = {
  1: { minFilled: 45, maxFilled: 50, name: 'Full House' },
  2: { minFilled: 35, maxFilled: 40, name: 'Hidden Single' },
  3: { minFilled: 30, maxFilled: 35, name: 'Naked Single' }
};

/**
 * Canonical valid sudoku grid (starting point for all generations)
 */
function getCanonicalGrid(): Grid {
  return [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 1, 5, 6, 4, 8, 9, 7],
    [5, 6, 4, 8, 9, 7, 2, 3, 1],
    [8, 9, 7, 2, 3, 1, 5, 6, 4],
    [3, 1, 2, 6, 4, 5, 9, 7, 8],
    [6, 4, 5, 9, 7, 8, 3, 1, 2],
    [9, 7, 8, 3, 1, 2, 6, 4, 5]
  ];
}

/**
 * Seeded random number generator (0 to 1)
 */
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

/**
 * Shuffle array deterministically using seed
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Relabel digits in grid according to a permutation
 */
function relabelDigits(grid: Grid, digitMap: number[]): Grid {
  const result = deepCopyGrid(grid);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (result[r][c] !== 0) {
        result[r][c] = digitMap[result[r][c] - 1];
      }
    }
  }
  return result;
}

/**
 * Swap two rows
 */
function swapRows(grid: Grid, r1: number, r2: number): Grid {
  const result = deepCopyGrid(grid);
  [result[r1], result[r2]] = [result[r2], result[r1]];
  return result;
}

/**
 * Swap two columns
 */
function swapCols(grid: Grid, c1: number, c2: number): Grid {
  const result = deepCopyGrid(grid);
  for (let r = 0; r < 9; r++) {
    [result[r][c1], result[r][c2]] = [result[r][c2], result[r][c1]];
  }
  return result;
}

/**
 * Permute rows within a band (0-2, 3-5, 6-8)
 */
function permuteRowsInBand(grid: Grid, band: number, rowIndices: number[]): Grid {
  let result = deepCopyGrid(grid);
  const bandStart = band * 3;
  for (let i = 0; i < 3; i++) {
    if (bandStart + i !== rowIndices[i]) {
      result = swapRows(result, bandStart + i, rowIndices[i]);
    }
  }
  return result;
}

/**
 * Permute columns within a stack (0-2, 3-5, 6-8)
 */
function permuteColsInStack(grid: Grid, stack: number, colIndices: number[]): Grid {
  let result = deepCopyGrid(grid);
  const stackStart = stack * 3;
  for (let i = 0; i < 3; i++) {
    if (stackStart + i !== colIndices[i]) {
      result = swapCols(result, stackStart + i, colIndices[i]);
    }
  }
  return result;
}

/**
 * Generate complete valid grid from seed
 * Uses deterministic transformations on canonical grid
 */
export function generateGrid(seed: number): Grid {
  let grid = getCanonicalGrid();

  // 1. Relabel digits
  const digitMap = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], seed);
  grid = relabelDigits(grid, digitMap);

  // 2. Permute rows within each band
  for (let band = 0; band < 3; band++) {
    const rows = seededShuffle([0, 1, 2], seed + band + 1);
    grid = permuteRowsInBand(grid, band, rows.map(i => band * 3 + i));
  }

  // 3. Permute columns within each stack
  for (let stack = 0; stack < 3; stack++) {
    const cols = seededShuffle([0, 1, 2], seed + stack + 100);
    grid = permuteColsInStack(grid, stack, cols.map(i => stack * 3 + i));
  }

  return grid;
}

/**
 * Get random integer in range [min, max] inclusive, seeded
 */
function seededRandomInt(seed: number, min: number, max: number): number {
  const rand = seededRandom(seed, min + max);
  return Math.floor(rand * (max - min + 1)) + min;
}

/**
 * Count filled cells in grid
 */
function countFilled(grid: Grid): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) count++;
    }
  }
  return count;
}

/**
 * Get list of filled cells, shuffled — these are candidates for removal.
 * Called with a complete grid; returns filled cells to be removed one by one.
 */
function getFilledCellsShuffled(grid: Grid, seed: number): Array<[number, number]> {
  const filled: Array<[number, number]> = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) {
        filled.push([r, c]);
      }
    }
  }
  return seededShuffle(filled, seed);
}

/**
 * Create puzzle by removing cells symmetrically
 * Uses 180° rotational symmetry
 * Removes cells until target filled count is reached, ensuring unique solution
 */
export function createPuzzle(grid: Grid, level: 1 | 2 | 3, seed: number): Grid {
  const targetFilled = seededRandomInt(seed, difficultyParams[level].minFilled, difficultyParams[level].maxFilled);
  let puzzle = deepCopyGrid(grid);
  const candidates = getFilledCellsShuffled(grid, seed);

  for (const [row, col] of candidates) {
    if (puzzle[row][col] === 0) continue; // Already removed

    const symRow = 8 - row;
    const symCol = 8 - col;

    // Save state in case we need to revert
    const saved = deepCopyGrid(puzzle);

    // Try removing symmetric pair
    puzzle[row][col] = 0;
    if (symRow !== row || symCol !== col) {
      puzzle[symRow][symCol] = 0;
    }

    // Validate the puzzle still has unique solution
    const result = solvePuzzle(puzzle);

    // If removal breaks solvability, revert
    if (!result.solved) {
      puzzle = saved;
    }

    // Stop when we reach target filled cells
    if (countFilled(puzzle) <= targetFilled) break;
  }

  return puzzle;
}

/**
 * Compute difficulty score (0–100)
 * Based on technique distribution and cell count
 */
function computeDifficulty(result: SolveResult, level: 1 | 2 | 3): number {
  let score = level * 25; // Base: L1=25, L2=50, L3=75

  // Adjust by cell count (fewer filled = harder)
  const filledRatio = countFilled(result.solution!) / 81; // solution is set after solve
  score = Math.min(100, Math.max(0, score + (50 - filledRatio * 100)));

  return Math.round(score);
}

/**
 * Map technique names
 */
function getTechniqueNames(result: SolveResult): string[] {
  const techs: string[] = [];
  if (result.techniques.fullHouse > 0) techs.push('fullHouse');
  if (result.techniques.hiddenSingle > 0) techs.push('hiddenSingle');
  if (result.techniques.nakedSingle > 0) techs.push('nakedSingle');
  return techs;
}

/**
 * Main puzzle generation function
 * Generates a valid, technique-tagged puzzle
 * Performance target: < 1 second
 */
export function generatePuzzle(seed: number, level: 1 | 2 | 3): Puzzle {
  const startTime = performance.now();
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const attemptSeed = seed + attempt;

    // Stage 1: Generate complete grid
    const grid = generateGrid(attemptSeed);

    // Stage 2: Create puzzle by removing cells
    const puzzleGrid = createPuzzle(grid, level, attemptSeed);

    // Stage 3: Validate solvability with L1–L3 techniques
    const result = solvePuzzle(puzzleGrid);

    if (result.solved && result.maxLevel <= level) {
      // Success!
      const generationTime = performance.now() - startTime;
      return {
        grid: puzzleGrid,
        solution: grid,
        level,
        difficulty: computeDifficulty(result, level),
        filledCells: countFilled(puzzleGrid),
        techniques: getTechniqueNames(result),
        generationTime
      };
    }
  }

  // Fallback: return what we have after max attempts (should rarely happen)
  const grid = generateGrid(seed);
  const puzzleGrid = createPuzzle(grid, level, seed);
  const result = solvePuzzle(puzzleGrid);

  return {
    grid: puzzleGrid,
    solution: grid,
    level,
    difficulty: 50,
    filledCells: countFilled(puzzleGrid),
    techniques: getTechniqueNames(result),
    generationTime: performance.now() - startTime
  };
}

/**
 * Generate multiple puzzles for testing
 */
export function generatePuzzles(level: 1 | 2 | 3, count: number): Puzzle[] {
  const puzzles: Puzzle[] = [];
  for (let i = 0; i < count; i++) {
    puzzles.push(generatePuzzle(1000 + i, level));
  }
  return puzzles;
}

/**
 * Format grid as string for display
 */
export function gridToString(grid: Grid): string {
  let result = '';
  for (let r = 0; r < 9; r++) {
    if (r > 0 && r % 3 === 0) result += '------+-------+------\n';
    for (let c = 0; c < 9; c++) {
      if (c > 0 && c % 3 === 0) result += '| ';
      result += (grid[r][c] || '.') + ' ';
    }
    result += '\n';
  }
  return result;
}
