/**
 * Pre-generated Sudoku puzzles for levels 1-3
 * Generated automatically by generate-puzzles.test.ts
 * DO NOT EDIT MANUALLY
 */

export interface PuzzleMeta {
  id: string;
  level: 1 | 2 | 3;
  seed: string;
  grid: number[][];
  solution: number[][];
  filledCells: number;
  techniques: string[];
  difficulty: number;
}

export const PUZZLES: PuzzleMeta[] = [
  {
    id: "L1-001",
    level: 1,
    seed: "sudoku-trainer-L1-001",
    grid: [[3,4,1,6,5,2,7,0,8],[0,9,8,3,4,1,6,5,2],[0,0,2,7,9,8,3,4,1],[0,1,3,5,2,6,9,8,7],[5,2,6,9,8,7,4,1,3],[9,8,7,4,1,3,5,2,0],[1,3,4,2,6,5,8,0,0],[2,6,5,8,7,9,1,3,0],[8,0,9,1,3,4,2,6,5]],
    solution: [[3,4,1,6,5,2,7,9,8],[7,9,8,3,4,1,6,5,2],[6,5,2,7,9,8,3,4,1],[4,1,3,5,2,6,9,8,7],[5,2,6,9,8,7,4,1,3],[9,8,7,4,1,3,5,2,6],[1,3,4,2,6,5,8,7,9],[2,6,5,8,7,9,1,3,4],[8,7,9,1,3,4,2,6,5]],
    filledCells: 71,
    techniques: ["fullHouse"],
    difficulty: 0
  },
  {
    id: "L1-002",
    level: 1,
    seed: "sudoku-trainer-L1-002",
    grid: [[8,5,9,2,0,4,7,0,6],[3,2,4,1,7,6,8,0,9],[7,1,6,5,0,9,3,2,4],[5,9,8,4,2,0,0,0,7],[2,4,3,6,1,7,5,9,8],[1,0,0,0,5,8,2,4,3],[4,3,2,7,0,1,9,8,5],[9,0,5,3,4,2,6,7,1],[6,0,1,8,0,5,4,3,2]],
    solution: [[8,5,9,2,3,4,7,1,6],[3,2,4,1,7,6,8,5,9],[7,1,6,5,8,9,3,2,4],[5,9,8,4,2,3,1,6,7],[2,4,3,6,1,7,5,9,8],[1,6,7,9,5,8,2,4,3],[4,3,2,7,6,1,9,8,5],[9,8,5,3,4,2,6,7,1],[6,7,1,8,9,5,4,3,2]],
    filledCells: 67,
    techniques: ["fullHouse"],
    difficulty: 0
  },
  {
    id: "L1-003",
    level: 1,
    seed: "sudoku-trainer-L1-003",
    grid: [[8,7,9,5,1,0,3,6,2],[5,4,1,0,6,2,0,9,7],[3,0,6,8,9,7,5,1,4],[9,8,7,0,4,5,0,2,3],[6,3,2,9,7,8,1,4,5],[1,5,0,6,2,0,9,7,8],[4,1,5,2,3,6,7,0,9],[7,9,0,4,5,0,2,3,6],[2,6,3,0,8,9,4,5,1]],
    solution: [[8,7,9,5,1,4,3,6,2],[5,4,1,3,6,2,8,9,7],[3,2,6,8,9,7,5,1,4],[9,8,7,1,4,5,6,2,3],[6,3,2,9,7,8,1,4,5],[1,5,4,6,2,3,9,7,8],[4,1,5,2,3,6,7,8,9],[7,9,8,4,5,1,2,3,6],[2,6,3,7,8,9,4,5,1]],
    filledCells: 69,
    techniques: ["fullHouse"],
    difficulty: 0
  },
  {
    id: "L2-001",
    level: 2,
    seed: "sudoku-trainer-L2-001",
    grid: [[0,0,0,0,0,2,7,4,0],[7,4,5,3,0,8,9,1,2],[0,0,0,7,0,0,3,0,8],[6,0,0,0,2,0,0,0,7],[0,5,0,6,8,3,0,2,0],[1,0,0,0,5,0,0,0,3],[8,0,6,0,0,1,0,0,0],[5,7,4,8,0,6,2,9,1],[0,9,1,5,0,0,0,0,0]],
    solution: [[3,6,8,9,1,2,7,4,5],[7,4,5,3,6,8,9,1,2],[9,1,2,7,4,5,3,6,8],[6,8,3,1,2,9,4,5,7],[4,5,7,6,8,3,1,2,9],[1,2,9,4,5,7,6,8,3],[8,3,6,2,9,1,5,7,4],[5,7,4,8,3,6,2,9,1],[2,9,1,5,7,4,8,3,6]],
    filledCells: 39,
    techniques: ["fullHouse","hiddenSingle"],
    difficulty: 0
  },
  {
    id: "L2-002",
    level: 2,
    seed: "sudoku-trainer-L2-002",
    grid: [[7,5,0,0,0,2,4,0,3],[2,0,6,0,3,0,5,7,0],[8,0,3,5,9,0,0,0,0],[6,2,0,0,4,3,0,9,0],[0,7,0,0,0,0,0,3,0],[0,8,0,7,5,0,0,6,1],[0,0,0,0,2,1,3,0,8],[0,6,2,0,8,0,9,0,7],[4,0,8,9,0,0,0,1,2]],
    solution: [[7,5,9,1,6,2,4,8,3],[2,1,6,4,3,8,5,7,9],[8,4,3,5,9,7,1,2,6],[6,2,1,8,4,3,7,9,5],[9,7,5,2,1,6,8,3,4],[3,8,4,7,5,9,2,6,1],[5,9,7,6,2,1,3,4,8],[1,6,2,3,8,4,9,5,7],[4,3,8,9,7,5,6,1,2]],
    filledCells: 40,
    techniques: ["fullHouse","hiddenSingle","nakedSingle"],
    difficulty: 50
  },
  {
    id: "L2-003",
    level: 2,
    seed: "sudoku-trainer-L2-003",
    grid: [[0,0,3,7,1,0,0,0,2],[9,2,0,0,0,0,0,0,5],[1,0,7,0,0,2,4,3,6],[0,0,5,0,8,0,0,6,4],[3,0,0,5,7,1,0,0,9],[8,9,0,0,3,0,7,0,0],[6,3,4,1,0,0,2,0,8],[5,0,0,0,0,0,0,4,3],[2,0,0,0,6,3,5,0,0]],
    solution: [[4,6,3,7,1,5,9,8,2],[9,2,8,3,4,6,1,7,5],[1,5,7,8,9,2,4,3,6],[7,1,5,2,8,9,3,6,4],[3,4,6,5,7,1,8,2,9],[8,9,2,6,3,4,7,5,1],[6,3,4,1,5,7,2,9,8],[5,7,1,9,2,8,6,4,3],[2,8,9,4,6,3,5,1,7]],
    filledCells: 39,
    techniques: ["hiddenSingle","nakedSingle"],
    difficulty: 50
  },
  {
    id: "L3-001",
    level: 3,
    seed: "sudoku-trainer-L3-001",
    grid: [[0,5,7,9,0,0,1,2,0],[0,8,0,0,0,0,0,0,0],[1,0,6,3,0,0,9,0,4],[5,0,0,8,4,0,0,0,0],[0,4,9,0,6,0,5,7,0],[0,0,0,0,7,3,0,0,9],[4,0,8,0,0,2,7,0,5],[0,0,0,0,0,0,0,1,0],[0,1,2,0,0,5,4,9,0]],
    solution: [[3,5,7,9,8,4,1,2,6],[9,8,4,1,2,6,3,5,7],[1,2,6,3,5,7,9,8,4],[5,7,3,8,4,9,2,6,1],[8,4,9,2,6,1,5,7,3],[2,6,1,5,7,3,8,4,9],[4,9,8,6,1,2,7,3,5],[7,3,5,4,9,8,6,1,2],[6,1,2,7,3,5,4,9,8]],
    filledCells: 33,
    techniques: ["hiddenSingle","nakedSingle"],
    difficulty: 25
  },
  {
    id: "L3-002",
    level: 3,
    seed: "sudoku-trainer-L3-002",
    grid: [[0,9,0,0,0,0,0,0,0],[0,0,1,0,6,0,2,0,9],[8,0,4,0,0,5,7,0,0],[3,0,7,6,4,0,0,0,5],[0,5,0,3,1,7,0,8,0],[6,0,0,0,5,2,3,0,1],[0,0,9,1,0,0,4,0,8],[4,0,6,0,2,0,1,0,0],[0,0,0,0,0,0,0,9,0]],
    solution: [[2,9,5,7,3,1,8,4,6],[7,3,1,8,6,4,2,5,9],[8,6,4,2,9,5,7,1,3],[3,1,7,6,4,8,9,2,5],[9,5,2,3,1,7,6,8,4],[6,4,8,9,5,2,3,7,1],[5,2,9,1,7,3,4,6,8],[4,8,6,5,2,9,1,3,7],[1,7,3,4,8,6,5,9,2]],
    filledCells: 33,
    techniques: ["fullHouse","hiddenSingle","nakedSingle"],
    difficulty: 25
  },
  {
    id: "L3-003",
    level: 3,
    seed: "sudoku-trainer-L3-003",
    grid: [[0,0,3,0,0,0,2,0,0],[0,1,6,0,0,7,0,0,0],[0,9,7,8,4,0,0,0,0],[4,3,0,1,0,0,0,7,2],[9,0,0,0,3,0,0,0,5],[1,6,0,0,0,2,0,3,8],[0,0,0,0,5,1,7,2,0],[0,0,0,7,0,0,3,8,0],[0,0,9,0,0,0,6,0,0]],
    solution: [[8,4,3,5,1,6,2,9,7],[5,1,6,2,9,7,8,4,3],[2,9,7,8,4,3,5,1,6],[4,3,8,1,6,5,9,7,2],[9,7,2,4,3,8,1,6,5],[1,6,5,9,7,2,4,3,8],[3,8,4,6,5,1,7,2,9],[6,5,1,7,2,9,3,8,4],[7,2,9,3,8,4,6,5,1]],
    filledCells: 31,
    techniques: ["fullHouse","hiddenSingle","nakedSingle"],
    difficulty: 25
  },
];

export const PUZZLES_BY_LEVEL = {
  1: PUZZLES.filter(p => p.level === 1),
  2: PUZZLES.filter(p => p.level === 2),
  3: PUZZLES.filter(p => p.level === 3),
};

export function getPuzzle(level: 1 | 2 | 3, puzzleNumber: 1 | 2 | 3) {
  const puzzles = PUZZLES_BY_LEVEL[level];
  const meta = puzzles[puzzleNumber - 1];
  if (!meta) throw new Error(`Puzzle not found: L${level}-${puzzleNumber}`);
  return {
    grid: meta.grid.map((row) => [...row]),
    solution: meta.solution.map((row) => [...row]),
    level: meta.level,
    difficulty: meta.difficulty,
    filledCells: meta.filledCells,
    techniques: meta.techniques,
    generationTime: 0,
  };
}

export function getPuzzleMetadata(level: 1 | 2 | 3, puzzleNumber: 1 | 2 | 3) {
  const puzzles = PUZZLES_BY_LEVEL[level];
  const meta = puzzles[puzzleNumber - 1];
  if (!meta) throw new Error(`Puzzle metadata not found: L${level}-${puzzleNumber}`);
  return {
    id: meta.id,
    difficulty: meta.difficulty,
    filledCells: meta.filledCells,
    techniques: meta.techniques,
  };
}
