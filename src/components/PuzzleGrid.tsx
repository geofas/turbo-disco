import React, { useState, useCallback, useEffect } from 'react';
import { PuzzleCell } from './PuzzleCell';
import { NumberPad } from './NumberPad';

interface HighlightCell {
  row: number;
  col: number;
  color: string;
}

interface PuzzleGridProps {
  puzzle: number[][];
  solution?: number[][];
  onCellChange?: (row: number, col: number, value: number) => void;
  highlightCells?: HighlightCell[];
  readOnly?: boolean;
  selectedCell?: { row: number; col: number } | null;
  onCellSelect?: (row: number, col: number) => void;
}

interface CandidateMap {
  [key: string]: Set<number>;
}

export const PuzzleGrid: React.FC<PuzzleGridProps> = ({
  puzzle,
  onCellChange,
  highlightCells = [],
  readOnly = false,
  selectedCell: externalSelectedCell = null,
  onCellSelect,
}) => {
  const [userValues, setUserValues] = useState<number[][]>(
    puzzle.map((row) => [...row])
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(
    externalSelectedCell
  );
  const [candidates, setCandidates] = useState<CandidateMap>({});
  const [pencilMode, setPencilMode] = useState(false);

  // Sync external selectedCell prop
  useEffect(() => {
    if (externalSelectedCell) {
      setSelectedCell(externalSelectedCell);
    }
  }, [externalSelectedCell]);

  // Helper to check if a value conflicts in a row
  const hasRowConflict = (row: number, col: number, value: number): boolean => {
    for (let c = 0; c < 9; c++) {
      if (c !== col && userValues[row][c] === value && value !== 0) {
        return true;
      }
    }
    return false;
  };

  // Helper to check if a value conflicts in a column
  const hasColConflict = (row: number, col: number, value: number): boolean => {
    for (let r = 0; r < 9; r++) {
      if (r !== row && userValues[r][col] === value && value !== 0) {
        return true;
      }
    }
    return false;
  };

  // Helper to check if a value conflicts in a 3x3 box
  const hasBoxConflict = (row: number, col: number, value: number): boolean => {
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && userValues[r][c] === value && value !== 0) {
          return true;
        }
      }
    }
    return false;
  };

  const hasError = (row: number, col: number): boolean => {
    const value = userValues[row][col];
    if (value === 0) return false;
    return hasRowConflict(row, col, value) || hasColConflict(row, col, value) || hasBoxConflict(row, col, value);
  };

  const handleCellSelect = useCallback(
    (row: number, col: number) => {
      if (readOnly || puzzle[row][col] !== 0) return;
      setSelectedCell({ row, col });
      onCellSelect?.(row, col);
    },
    [puzzle, readOnly, onCellSelect]
  );

  const handleNumberClick = useCallback(
    (num: number) => {
      if (!selectedCell) return;
      const { row, col } = selectedCell;
      if (puzzle[row][col] !== 0) return; // Given cell, don't modify

      const newValues = userValues.map((r) => [...r]);
      if (pencilMode) {
        const key = `${row}-${col}`;
        const newCandidates = { ...candidates };
        if (!newCandidates[key]) {
          newCandidates[key] = new Set();
        }
        if (newCandidates[key].has(num)) {
          newCandidates[key].delete(num);
        } else {
          newCandidates[key].add(num);
        }
        setCandidates(newCandidates);
      } else {
        newValues[row][col] = num;
        setUserValues(newValues);
        onCellChange?.(row, col, num);
      }
    },
    [selectedCell, puzzle, userValues, candidates, pencilMode, onCellChange]
  );

  const handleClear = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (puzzle[row][col] !== 0) return;

    const newValues = userValues.map((r) => [...r]);
    newValues[row][col] = 0;
    setUserValues(newValues);
    onCellChange?.(row, col, 0);

    const newCandidates = { ...candidates };
    delete newCandidates[`${row}-${col}`];
    setCandidates(newCandidates);
  }, [selectedCell, puzzle, userValues, candidates, onCellChange]);

  // Keyboard navigation and input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      const { row, col } = selectedCell;
      const isNumKey = /^[1-9]$/.test(e.key);
      const isDelete = e.key === 'Backspace' || e.key === 'Delete';
      const isArrow = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);

      if (isNumKey) {
        e.preventDefault();
        handleNumberClick(parseInt(e.key, 10));
      } else if (isDelete) {
        e.preventDefault();
        handleClear();
      } else if (isArrow) {
        e.preventDefault();
        let newRow = row;
        let newCol = col;

        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, row - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(8, row + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(8, col + 1);
            break;
        }

        handleCellSelect(newRow, newCol);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, handleCellSelect, handleNumberClick, handleClear]);

  const highlightMap = new Map(highlightCells.map((h) => [`${h.row}-${h.col}`, h.color]));

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4">
      {/* Main Sudoku Grid */}
      <div className="inline-block border-4 border-gray-900 shadow-lg">
        {Array.from({ length: 9 }, (_, row) => (
          <div
            key={`row-${row}`}
            className={`flex ${row % 3 === 2 && row !== 8 ? 'border-b-4 border-gray-900' : ''}`}
          >
            {Array.from({ length: 9 }, (_, col) => {
              const givenValue = puzzle[row][col];
              const userValue = userValues[row][col];
              const isSelected = selectedCell?.row === row && selectedCell?.col === col;
              const isSameNumber =
                !isSelected &&
                selectedCell !== null &&
                userValues[selectedCell.row][selectedCell.col] !== 0 &&
                userValues[selectedCell.row][selectedCell.col] === userValue &&
                userValue !== 0;
              const isInSelectedRow = selectedCell?.row === row && selectedCell?.col !== col;
              const isInSelectedCol = selectedCell?.col === col && selectedCell?.row !== row;
              const boxRow = Math.floor(row / 3);
              const boxCol = Math.floor(col / 3);
              const selectedBoxRow = selectedCell ? Math.floor(selectedCell.row / 3) : -1;
              const selectedBoxCol = selectedCell ? Math.floor(selectedCell.col / 3) : -1;
              const isInSelectedBox =
                boxRow === selectedBoxRow &&
                boxCol === selectedBoxCol &&
                !(selectedCell?.row === row && selectedCell?.col === col);

              return (
                <div
                  key={`cell-${row}-${col}`}
                  className={`${col % 3 === 2 && col !== 8 ? 'border-r-4 border-gray-900' : ''}`}
                >
                  <PuzzleCell
                    value={userValue}
                    givenValue={givenValue}
                    isSelected={isSelected}
                    isHighlighted={highlightMap.has(`${row}-${col}`)}
                    highlightColor={highlightMap.get(`${row}-${col}`)}
                    isSameNumber={isSameNumber}
                    isInSelectedRow={isInSelectedRow}
                    isInSelectedCol={isInSelectedCol}
                    isInSelectedBox={isInSelectedBox}
                    hasError={hasError(row, col)}
                    readOnly={readOnly}
                    candidates={candidates[`${row}-${col}`]}
                    onClick={() => handleCellSelect(row, col)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Controls */}
      {!readOnly && (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          {/* Pencil Mode Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pencilMode}
              onChange={(e) => setPencilMode(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Pencil Mode (Candidates)</span>
          </label>

          {/* Number Pad */}
          <NumberPad
            onNumberClick={handleNumberClick}
            onClear={handleClear}
            disabled={!selectedCell}
          />
        </div>
      )}

      {/* Info Text */}
      {selectedCell && !readOnly && (
        <p className="text-sm text-gray-600">
          Selected: Row {selectedCell.row + 1}, Column {selectedCell.col + 1}
        </p>
      )}
    </div>
  );
};
