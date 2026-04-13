#!/usr/bin/env node

/**
 * Puzzle generation script
 * Run: node generate-puzzles.mjs
 */

import { generatePuzzle } from './src/lib/puzzle-generator.ts';
import { validatePuzzleGrid } from './src/lib/puzzle-validator.ts';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Generate all puzzles for L1-L3 (3 per level = 9 total)
 */
function generateAllPuzzles() {
  const puzzles = [];
  const levels = [1, 2, 3];

  for (const level of levels) {
    for (let i = 1; i <= 3; i++) {
      const puzzleNum = String(i).padStart(3, '0');
      const id = `L${level}-${puzzleNum}`;
      const seed = `sudoku-trainer-L${level}-${puzzleNum}`;

      console.log(`Generating puzzle ${id}...`);

      // Generate puzzle using string seed for determinism
      const puzzle = generatePuzzle(level, { seed });

      // Validate the generated puzzle
      const validation = validatePuzzleGrid(puzzle.grid, level);

      if (!validation.isValid) {
        console.warn(`Warning: Puzzle ${id} failed validation: ${validation.error}`);
      }

      const puzzleMeta = {
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
      console.log(`  ✓ ${id}: ${puzzle.filledCells} cells, difficulty ${puzzle.difficulty}, techniques: ${puzzle.techniques.join(', ')}`);
    }
  }

  return puzzles;
}

/**
 * Generate TypeScript file with puzzle data
 */
function generatePuzzlesFile(puzzles) {
  const lines = [
    '/**',
    ' * Pre-generated Sudoku puzzles for levels 1-3',
    ' * Generated automatically by generate-puzzles.mjs',
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

  return lines.join('\n');
}

/**
 * Main script execution
 */
async function main() {
  try {
    console.log('🚀 Starting puzzle generation...\n');

    // Generate all puzzles
    const puzzles = generateAllPuzzles();

    console.log(`\n✓ Generated ${puzzles.length} puzzles\n`);

    // Generate TypeScript file
    const fileContent = generatePuzzlesFile(puzzles);

    // Ensure output directory exists
    const dataDir = 'src/data';
    mkdirSync(dataDir, { recursive: true });

    // Write to file
    const outputPath = join(dataDir, 'puzzles.ts');
    writeFileSync(outputPath, fileContent, 'utf-8');

    console.log(`✓ Wrote ${outputPath}`);
    console.log('\nGeneration complete!');
    console.log(`Summary:`);
    console.log(`  Total puzzles: ${puzzles.length}`);
    puzzles.forEach(p => {
      console.log(`  ${p.id}: ${p.filledCells} cells, difficulty ${p.difficulty}`);
    });
  } catch (error) {
    console.error('Error generating puzzles:', error);
    process.exit(1);
  }
}

main();
