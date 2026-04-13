/**
 * Constraint highlighting utilities for Sudoku Trainer lessons
 * Provides logic to generate constraint visualizations for different techniques
 */

interface ConstraintIndicator {
  row: number;
  col: number;
  label: string;
  color: string;
  type: 'filled' | 'eliminated' | 'arrow' | 'missing';
}

/**
 * Get all filled cells in a house (row, column, or 3x3 box)
 */
function getHouseCells(
  row: number,
  col: number,
  houseType: 'row' | 'col' | 'box'
): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = [];

  if (houseType === 'row') {
    for (let c = 0; c < 9; c++) {
      cells.push({ row, col: c });
    }
  } else if (houseType === 'col') {
    for (let r = 0; r < 9; r++) {
      cells.push({ row: r, col });
    }
  } else if (houseType === 'box') {
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        cells.push({ row: r, col: c });
      }
    }
  }

  return cells;
}

/**
 * Get all peers of a cell (cells in same row, column, or box)
 */
function getPeers(row: number, col: number): Array<{ row: number; col: number }> {
  const peers = new Set<string>();

  // Row
  for (let c = 0; c < 9; c++) {
    if (c !== col) {
      peers.add(`${row},${c}`);
    }
  }

  // Column
  for (let r = 0; r < 9; r++) {
    if (r !== row) {
      peers.add(`${r},${col}`);
    }
  }

  // Box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row || c !== col) {
        peers.add(`${r},${c}`);
      }
    }
  }

  return Array.from(peers).map((key) => {
    const [r, c] = key.split(',').map(Number);
    return { row: r, col: c };
  });
}

/**
 * Get missing number from 1-9 in a set of values
 */
function getMissingNumber(values: number[]): number {
  const present = new Set(values.filter((v) => v !== 0));
  for (let i = 1; i <= 9; i++) {
    if (!present.has(i)) {
      return i;
    }
  }
  return 0;
}

/**
 * Full House constraint highlighting
 * Shows all 8 filled cells in the house and the missing number
 */
export function getFullHouseConstraints(
  puzzle: number[][],
  row: number,
  col: number,
  houseType: 'row' | 'col' | 'box'
): ConstraintIndicator[] {
  const constraints: ConstraintIndicator[] = [];
  const cellsInHouse = getHouseCells(row, col, houseType);
  const values = cellsInHouse.map(({ row: r, col: c }) => puzzle[r][c]);
  const missingNumber = getMissingNumber(values);

  // Highlight filled cells
  for (const cell of cellsInHouse) {
    if (puzzle[cell.row][cell.col] !== 0) {
      constraints.push({
        row: cell.row,
        col: cell.col,
        label: puzzle[cell.row][cell.col].toString(),
        color: '#20B2AA', // secondary-teal
        type: 'filled',
      });
    }
  }

  // Highlight the empty cell with missing number
  if (missingNumber !== 0) {
    constraints.push({
      row,
      col,
      label: missingNumber.toString(),
      color: '#0066CC', // primary-blue
      type: 'missing',
    });
  }

  return constraints;
}

/**
 * Hidden Single constraint highlighting
 * Shows cells that eliminate a candidate, highlighting why only one position remains
 */
export function getHiddenSingleConstraints(
  puzzle: number[][],
  targetRow: number,
  targetCol: number,
  candidate: number,
  houseType: 'row' | 'col' | 'box'
): ConstraintIndicator[] {
  const constraints: ConstraintIndicator[] = [];
  const cellsInHouse = getHouseCells(targetRow, targetCol, houseType);

  // Find other cells in the house that already have the candidate or block it
  for (const cell of cellsInHouse) {
    if (cell.row === targetRow && cell.col === targetCol) {
      continue; // Skip target cell
    }

    const value = puzzle[cell.row][cell.col];

    // Cell has the candidate value filled
    if (value === candidate) {
      constraints.push({
        row: cell.row,
        col: cell.col,
        label: candidate.toString(),
        color: '#FF9800', // warning-orange
        type: 'filled',
      });
    }
  }

  // Highlight target cell as the only option
  constraints.push({
    row: targetRow,
    col: targetCol,
    label: candidate.toString(),
    color: '#28A745', // success-green
    type: 'missing',
  });

  return constraints;
}

/**
 * Naked Single constraint highlighting
 * Shows all peers that eliminate candidates, leaving only one option in target cell
 */
export function getNakedSingleConstraints(
  puzzle: number[][],
  targetRow: number,
  targetCol: number,
  candidates: number[],
  solution: number
): ConstraintIndicator[] {
  const constraints: ConstraintIndicator[] = [];
  const peers = getPeers(targetRow, targetCol);

  // Highlight peer cells that eliminate candidates
  const uniquePeers = new Set<string>();
  for (const peer of peers) {
    const value = puzzle[peer.row][peer.col];
    if (value !== 0 && candidates.includes(value)) {
      const key = `${peer.row},${peer.col}`;
      if (!uniquePeers.has(key)) {
        uniquePeers.add(key);
        constraints.push({
          row: peer.row,
          col: peer.col,
          label: value.toString(),
          color: '#FF9800', // warning-orange
          type: 'filled',
        });
      }
    }
  }

  // Highlight target cell with the solution
  constraints.push({
    row: targetRow,
    col: targetCol,
    label: solution.toString(),
    color: '#28A745', // success-green
    type: 'missing',
  });

  return constraints;
}

/**
 * Elimination visualization for Hidden Single
 * Shows candidates that are eliminated from the target cell
 */
export function getEliminationIndicators(
  targetRow: number,
  targetCol: number,
  eliminated: number[],
  remaining: number
): ConstraintIndicator[] {
  const constraints: ConstraintIndicator[] = [];

  // Show eliminated candidates
  for (const candidate of eliminated) {
    constraints.push({
      row: targetRow,
      col: targetCol,
      label: candidate.toString(),
      color: '#FF9800', // warning-orange
      type: 'eliminated',
    });
  }

  // Show the remaining candidate
  constraints.push({
    row: targetRow,
    col: targetCol,
    label: remaining.toString(),
    color: '#28A745', // success-green
    type: 'missing',
  });

  return constraints;
}
