/**
 * Puzzle Generation Test / Generator
 * This test file generates and outputs pre-generated puzzles to src/data/puzzles.ts
 * Run with: npx vitest run generate-puzzles.test.ts
 */

import { describe, it, expect } from 'vitest';
import { generatePuzzle } from '../puzzle-generator';
import { validatePuzzleGrid } from '../puzzle-validator';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PuzzleMeta {
  id: string;
  level: 1 | 2 | 3;
  seed: string;
  grid: number[][];
  solution: number[][];
  filledCells: number;
  techniques: string[];
  difficulty: number;
}

describe('Puzzle Generator - Pre-generation', () => {
  it('should generate 3 puzzles per level (L1-L3) and write to src/data/puzzles.ts', () => {
    const puzzles: PuzzleMeta[] = [];
    const levels: (1 | 2 | 3)[] = [1, 2, 3];

    for (const level of levels) {
      for (let i = 1; i <= 3; i++) {
        const puzzleNum = String(i).padStart(3, '0');
        const id = `L${level}-${puzzleNum}`;
        const seed = `sudoku-trainer-L${level}-${puzzleNum}`;

        // Generate puzzle using string seed for determinism
        const puzzle = generatePuzzle(level, { seed });

        // Validate the generated puzzle
        const validation = validatePuzzleGrid(puzzle.grid, level);

        expect(validation.isValid).toBe(true);
        expect(puzzle.level).toBe(level);
        expect(puzzle.grid).toBeDefined();
        expect(puzzle.solution).toBeDefined();
        expect(puzzle.filledCells).toBeGreaterThan(0);
        expect(puzzle.filledCells).toBeLessThanOrEqual(81);

        const puzzleMeta: PuzzleMeta = {
          id,
          level,
          seed,
          grid: puzzle.grid,
          solution: puzzle.solution,
          filledCells: puzzle.filledCells,
          techniques: puzzle.techniques,
          difficulty: puzzle.difficulty
        };

        puzzles.push(puzzleMeta);
      }
    }

    // Verify we have exactly 9 puzzles
    expect(puzzles).toHaveLength(9);
    expect(puzzles.filter(p => p.level === 1)).toHaveLength(3);
    expect(puzzles.filter(p => p.level === 2)).toHaveLength(3);
    expect(puzzles.filter(p => p.level === 3)).toHaveLength(3);

    // Verify all puzzles have unique IDs
    const ids = puzzles.map(p => p.id);
    expect(new Set(ids).size).toBe(9);

    // Generate TypeScript file content
    const lines: string[] = [
      '/**',
      ' * Pre-generated Sudoku puzzles for levels 1-3',
      ' * Generated automatically by generate-puzzles.test.ts',
      ' * DO NOT EDIT MANUALLY',
      ' */',
      '',
      'export interface PuzzleMeta {',
      '  id: string;',
      '  level: 1 | 2 | 3;',
      '  seed: string;',
      '  grid: number[][];',
      '  solution: number[][];',
      '  filledCells: number;',
      '  techniques: string[];',
      '  difficulty: number;',
      '}',
      '',
      'export const PUZZLES: PuzzleMeta[] = ['
    ];

    for (const puzzle of puzzles) {
      lines.push('  {');
      lines.push(`    id: "${puzzle.id}",`);
      lines.push(`    level: ${puzzle.level},`);
      lines.push(`    seed: "${puzzle.seed}",`);
      lines.push(`    grid: ${JSON.stringify(puzzle.grid)},`);
      lines.push(`    solution: ${JSON.stringify(puzzle.solution)},`);
      lines.push(`    filledCells: ${puzzle.filledCells},`);
      lines.push(`    techniques: ${JSON.stringify(puzzle.techniques)},`);
      lines.push(`    difficulty: ${puzzle.difficulty}`);
      lines.push('  },');
    }

    lines.push('];');
    lines.push('');
    lines.push('export const PUZZLES_BY_LEVEL = {');
    lines.push('  1: PUZZLES.filter(p => p.level === 1),');
    lines.push('  2: PUZZLES.filter(p => p.level === 2),');
    lines.push('  3: PUZZLES.filter(p => p.level === 3)');
    lines.push('};');
    lines.push('');
    lines.push('/**');
    lines.push(' * Puzzle type compatible with puzzle-generator.ts Puzzle interface.');
    lines.push(' * Adds generationTime (always 0 for pre-generated puzzles).');
    lines.push(' */');
    lines.push('export type PuzzleFromData = PuzzleMeta & { generationTime: number };');
    lines.push('');
    lines.push('/**');
    lines.push(' * Get a specific puzzle by level and puzzle number (1-indexed).');
    lines.push(' * Returns the puzzle data formatted for the PuzzleGrid component.');
    lines.push(' */');
    lines.push('export function getPuzzle(level: number, puzzleNumber: number): PuzzleFromData {');
    lines.push('  const levelPuzzles = PUZZLES_BY_LEVEL[level as keyof typeof PUZZLES_BY_LEVEL];');
    lines.push('  const meta = (levelPuzzles && puzzleNumber >= 1 && puzzleNumber <= levelPuzzles.length)');
    lines.push('    ? levelPuzzles[puzzleNumber - 1]');
    lines.push('    : (levelPuzzles?.[0] ?? PUZZLES[0]);');
    lines.push('  return { ...meta, generationTime: 0 };');
    lines.push('}');
    lines.push('');
    lines.push('/**');
    lines.push(' * Get metadata for a specific puzzle at a given level.');
    lines.push(' * Used by PracticePage to display puzzle tile info.');
    lines.push(' */');
    lines.push('export function getPuzzleMetadata(level: number, puzzleNumber: number): Pick<PuzzleMeta, \'id\' | \'level\' | \'filledCells\' | \'techniques\' | \'difficulty\'> {');
    lines.push('  const puzzle = getPuzzle(level, puzzleNumber);');
    lines.push('  return {');
    lines.push('    id: puzzle.id,');
    lines.push('    level: puzzle.level,');
    lines.push('    filledCells: puzzle.filledCells,');
    lines.push('    techniques: puzzle.techniques,');
    lines.push('    difficulty: puzzle.difficulty,');
    lines.push('  };');
    lines.push('}');
    lines.push('');

    const fileContent = lines.join('\n');

    // Write to src/data/puzzles.ts
    const dataDir = join(__dirname, '../../data');
    mkdirSync(dataDir, { recursive: true });

    const outputPath = join(dataDir, 'puzzles.ts');
    writeFileSync(outputPath, fileContent, 'utf-8');

    console.log(`\n✓ Generated ${puzzles.length} puzzles and wrote to ${outputPath}`);
    puzzles.forEach(p => {
      console.log(`  ${p.id}: ${p.filledCells} cells, difficulty ${p.difficulty}`);
    });
  });
});
