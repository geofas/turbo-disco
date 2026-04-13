/**
 * Hint Engine — Progressive Hint System
 * Guides users through puzzle solving with progressive disclosure:
 * Hint 1: Show the row containing next missing cell
 * Hint 2: Show the exact cell to fill
 * Hint 3: Reveal the value
 */

import type { Grid } from './puzzle-solver';

export type HintType = 'row' | 'cell' | 'value';

export interface Hint {
  type: HintType;
  row?: number;
  col?: number;
  value?: number;
  message: string;
}

/**
 * Find next empty cell in puzzle (reading order: left-to-right, top-to-bottom)
 */
function findNextEmptyCell(grid: Grid): [number, number] | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        return [r, c];
      }
    }
  }
  return null;
}

/**
 * Get all empty cells in a given row
 */
function getEmptyCellsInRow(grid: Grid, row: number): Array<[number, number]> {
  const empty: Array<[number, number]> = [];
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === 0) {
      empty.push([row, c]);
    }
  }
  return empty;
}

/**
 * Generate hint based on hint count (progressive disclosure)
 */
export function generateHint(
  currentGrid: Grid,
  solution: Grid,
  hintCount: number
): Hint | null {
  const nextCell = findNextEmptyCell(currentGrid);
  if (!nextCell) {
    return null; // Puzzle is complete
  }

  const [row, col] = nextCell;
  const correctValue = solution[row][col];

  if (hintCount === 0) {
    // First hint: Show the row
    const emptyCells = getEmptyCellsInRow(currentGrid, row);
    return {
      type: 'row',
      row,
      message: `Look at row ${row + 1}. There are ${emptyCells.length} empty cell${
        emptyCells.length !== 1 ? 's' : ''
      } in this row. Try to find where the next number should go!`
    };
  } else if (hintCount === 1) {
    // Second hint: Show the cell
    return {
      type: 'cell',
      row,
      col,
      message: `Try filling the cell at row ${row + 1}, column ${col + 1}. What numbers are possible here?`
    };
  } else {
    // Third+ hint: Reveal the value
    return {
      type: 'value',
      row,
      col,
      value: correctValue,
      message: `The value at row ${row + 1}, column ${col + 1} is ${correctValue}.`
    };
  }
}
