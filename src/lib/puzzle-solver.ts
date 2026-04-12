/**
 * Sudoku Puzzle Solver — Constraint Propagation Engine
 * Levels 1–3 technique support: Full House, Hidden Single, Naked Single
 *
 * Guarantees unique solution via elimination without backtracking.
 * Returns immediately if advanced technique needed (level 4+).
 */

export type Grid = number[][];

export type SolveResult = {
  solved: boolean;
  solution?: Grid;
  techniques: {
    fullHouse: number;
    hiddenSingle: number;
    nakedSingle: number;
    advanced: number;
  };
  steps: number;
  maxLevel: 1 | 2 | 3 | 4;
  unsolved: number;
};

type CandidateSet = Set<number>;
type CandidateGrid = CandidateSet[][];

/**
 * Initialize candidates from puzzle grid
 * Each empty cell starts with candidates {1-9}
 * Each filled cell has candidate = {value}
 */
function initializeCandidates(puzzle: Grid): CandidateGrid {
  const candidates: CandidateGrid = [];

  for (let r = 0; r < 9; r++) {
    candidates[r] = [];
    for (let c = 0; c < 9; c++) {
      if (puzzle[r][c] !== 0) {
        // Filled cell: single candidate
        candidates[r][c] = new Set([puzzle[r][c]]);
      } else {
        // Empty cell: all digits initially possible
        candidates[r][c] = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      }
    }
  }

  // Eliminate candidates based on filled cells
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzle[r][c] !== 0) {
        const value = puzzle[r][c];
        eliminateFromPeers(candidates, r, c, value);
      }
    }
  }

  return candidates;
}

/**
 * Remove a value from all peers (row, column, box) of a cell
 */
function eliminateFromPeers(
  candidates: CandidateGrid,
  row: number,
  col: number,
  value: number
): void {
  // Eliminate from row
  for (let c = 0; c < 9; c++) {
    if (c !== col) {
      candidates[row][c].delete(value);
    }
  }

  // Eliminate from column
  for (let r = 0; r < 9; r++) {
    if (r !== row) {
      candidates[r][col].delete(value);
    }
  }

  // Eliminate from 3×3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row || c !== col) {
        candidates[r][c].delete(value);
      }
    }
  }
}

/**
 * Count filled cells in a row
 */
function filledInRow(grid: Grid, row: number): number {
  let count = 0;
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] !== 0) count++;
  }
  return count;
}

/**
 * Count filled cells in a column
 */
function filledInCol(grid: Grid, col: number): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] !== 0) count++;
  }
  return count;
}

/**
 * Count filled cells in a 3×3 box
 */
function filledInBox(grid: Grid, row: number, col: number): number {
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  let count = 0;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] !== 0) count++;
    }
  }
  return count;
}

/**
 * Get empty cells in a row
 */
function getEmptyInRow(grid: Grid, row: number): number[] {
  const empty = [];
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === 0) {
      empty.push(c);
    }
  }
  return empty;
}

/**
 * Get empty cells in a column
 */
function getEmptyInCol(grid: Grid, col: number): number[] {
  const empty = [];
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === 0) {
      empty.push(r);
    }
  }
  return empty;
}

/**
 * Get empty cells in a 3×3 box
 */
function getEmptyInBox(grid: Grid, row: number, col: number): Array<[number, number]> {
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  const empty: Array<[number, number]> = [];
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === 0) {
        empty.push([r, c]);
      }
    }
  }
  return empty;
}

/**
 * Check if grid is fully solved
 */
function isSolved(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  return true;
}

/**
 * Count unsolved cells
 */
function countUnsolved(grid: Grid): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) count++;
    }
  }
  return count;
}

/**
 * Determine max technique level required
 */
function computeMaxLevel(
  techniques: { fullHouse: number; hiddenSingle: number; nakedSingle: number; advanced: number }
): 1 | 2 | 3 | 4 {
  if (techniques.advanced > 0) return 4;
  if (techniques.nakedSingle > 0) return 3;
  if (techniques.hiddenSingle > 0) return 2;
  return 1;
}

/**
 * Deep copy a grid
 */
export function deepCopyGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}

/**
 * Main constraint propagation solver
 * Returns immediately if advanced technique detected
 */
export function solvePuzzle(puzzle: Grid): SolveResult {
  const solved = deepCopyGrid(puzzle);
  const candidates = initializeCandidates(puzzle);

  const techniques = {
    fullHouse: 0,
    hiddenSingle: 0,
    nakedSingle: 0,
    advanced: 0
  };

  let steps = 0;
  let progress = true;

  while (progress && countUnsolved(solved) > 0) {
    progress = false;

    // Technique 1: Naked Single (Level 3)
    // A cell with only 1 candidate
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (solved[r][c] !== 0) continue;

        if (candidates[r][c].size === 0) {
          // Contradiction
          return {
            solved: false,
            techniques,
            steps: -1,
            maxLevel: 1,
            unsolved: countUnsolved(solved)
          };
        }

        if (candidates[r][c].size === 1) {
          const value = Array.from(candidates[r][c])[0];
          solved[r][c] = value;
          eliminateFromPeers(candidates, r, c, value);
          techniques.nakedSingle++;
          progress = true;
          steps++;
        }
      }
    }

    // Technique 2: Full House (Level 1)
    // Row/column/box has 8 filled cells, 1 empty
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (solved[r][c] !== 0) continue;

        // Check row: 8 filled + this empty = full house
        if (filledInRow(solved, r) === 8) {
          if (candidates[r][c].size !== 1) {
            // Row must complete with only one candidate
            const emptyInRow = getEmptyInRow(solved, r);
            if (emptyInRow.length === 1) {
              const value = Array.from(candidates[r][c])[0] || inferMissingValue(solved, r, c);
              solved[r][c] = value;
              eliminateFromPeers(candidates, r, c, value);
              techniques.fullHouse++;
              progress = true;
              steps++;
            }
          } else {
            const value = Array.from(candidates[r][c])[0];
            solved[r][c] = value;
            eliminateFromPeers(candidates, r, c, value);
            techniques.fullHouse++;
            progress = true;
            steps++;
          }
        }

        // Check column: 8 filled + this empty = full house
        if (filledInCol(solved, c) === 8) {
          if (solved[r][c] === 0) {
            const emptyInCol = getEmptyInCol(solved, c);
            if (emptyInCol.length === 1) {
              const value = Array.from(candidates[r][c])[0] || inferMissingValue(solved, r, c);
              solved[r][c] = value;
              eliminateFromPeers(candidates, r, c, value);
              techniques.fullHouse++;
              progress = true;
              steps++;
            }
          }
        }

        // Check box: 8 filled + this empty = full house
        if (filledInBox(solved, r, c) === 8) {
          if (solved[r][c] === 0) {
            const emptyInBox = getEmptyInBox(solved, r, c);
            if (emptyInBox.length === 1) {
              const value = Array.from(candidates[r][c])[0] || inferMissingValue(solved, r, c);
              solved[r][c] = value;
              eliminateFromPeers(candidates, r, c, value);
              techniques.fullHouse++;
              progress = true;
              steps++;
            }
          }
        }
      }
    }

    // Technique 3: Hidden Single (Level 2)
    // Value can only go in 1 cell of a row/column/box

    // Hidden singles in rows
    for (let value = 1; value <= 9; value++) {
      for (let r = 0; r < 9; r++) {
        const positions: number[] = [];
        for (let c = 0; c < 9; c++) {
          if (solved[r][c] === 0 && candidates[r][c].has(value)) {
            positions.push(c);
          }
        }
        if (positions.length === 1) {
          const c = positions[0];
          if (solved[r][c] === 0) {
            solved[r][c] = value;
            candidates[r][c] = new Set([value]);
            eliminateFromPeers(candidates, r, c, value);
            techniques.hiddenSingle++;
            progress = true;
            steps++;
          }
        }
      }
    }

    // Hidden singles in columns
    for (let value = 1; value <= 9; value++) {
      for (let c = 0; c < 9; c++) {
        const positions: number[] = [];
        for (let r = 0; r < 9; r++) {
          if (solved[r][c] === 0 && candidates[r][c].has(value)) {
            positions.push(r);
          }
        }
        if (positions.length === 1) {
          const r = positions[0];
          if (solved[r][c] === 0) {
            solved[r][c] = value;
            candidates[r][c] = new Set([value]);
            eliminateFromPeers(candidates, r, c, value);
            techniques.hiddenSingle++;
            progress = true;
            steps++;
          }
        }
      }
    }

    // Hidden singles in boxes
    for (let value = 1; value <= 9; value++) {
      for (let boxRow = 0; boxRow < 9; boxRow += 3) {
        for (let boxCol = 0; boxCol < 9; boxCol += 3) {
          const positions: Array<[number, number]> = [];
          for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
              if (solved[r][c] === 0 && candidates[r][c].has(value)) {
                positions.push([r, c]);
              }
            }
          }
          if (positions.length === 1) {
            const [r, c] = positions[0];
            if (solved[r][c] === 0) {
              solved[r][c] = value;
              candidates[r][c] = new Set([value]);
              eliminateFromPeers(candidates, r, c, value);
              techniques.hiddenSingle++;
              progress = true;
              steps++;
            }
          }
        }
      }
    }
  }

  // Check if fully solved
  const unsolved = countUnsolved(solved);
  if (unsolved === 0) {
    return {
      solved: true,
      solution: solved,
      techniques,
      steps,
      maxLevel: computeMaxLevel(techniques),
      unsolved: 0
    };
  } else {
    // Unsolved + no more L1-L3 moves = advanced technique needed
    techniques.advanced = unsolved;
    return {
      solved: false,
      techniques,
      steps,
      maxLevel: 4,
      unsolved
    };
  }
}

/**
 * Infer missing value in a row (for full house verification)
 */
function inferMissingValue(grid: Grid, row: number, col: number): number {
  const used = new Set<number>();
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] !== 0) {
      used.add(grid[row][c]);
    }
  }
  for (let v = 1; v <= 9; v++) {
    if (!used.has(v)) return v;
  }
  return 0; // Error
}

/**
 * Check if puzzle has unique solution
 * Uses constraint propagation to determine solvability
 */
export function hasUniqueSolution(puzzle: Grid): boolean {
  const result = solvePuzzle(puzzle);
  return result.solved && result.techniques.advanced === 0;
}

/**
 * Validate puzzle solvability within a max level
 */
export function validatePuzzle(puzzle: Grid, maxLevel: number): boolean {
  const result = solvePuzzle(puzzle);
  return result.solved && result.maxLevel <= maxLevel;
}
