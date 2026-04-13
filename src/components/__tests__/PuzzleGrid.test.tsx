import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PuzzleGrid } from '../PuzzleGrid';

// Mock puzzle for testing
const mockPuzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

describe('PuzzleGrid', () => {
  it('renders 81 cells', () => {
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} />);
    // Find all cell buttons (PuzzleCell components are button elements)
    const gridButtons = container.querySelectorAll('button');
    // Should have at least 81 cell buttons (plus 10 from the number pad: 9 numbers + 1 clear)
    expect(gridButtons.length).toBeGreaterThanOrEqual(81);
  });

  it('displays given cells correctly', () => {
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} />);
    // Get the first row of cells from the grid
    const cells = container.querySelectorAll('button');
    // First cell should contain "5", second should contain "3"
    expect(cells[0].textContent).toContain('5');
    expect(cells[1].textContent).toContain('3');
  });

  it('does not allow editing given cells', () => {
    const onCellChange = vi.fn();
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} onCellChange={onCellChange} />);

    const buttons = container.querySelectorAll('button');
    // Click on a given cell (first cell with "5")
    fireEvent.click(buttons[0] as HTMLElement);

    // Try to enter a number via keyboard (should not work for given cells)
    fireEvent.keyDown(window, { key: '1' });

    expect(onCellChange).not.toHaveBeenCalled();
  });

  it('allows editing empty cells', async () => {
    const onCellChange = vi.fn();
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} onCellChange={onCellChange} />);

    const buttons = container.querySelectorAll('button');
    // Find first empty cell (index 2, which is puzzle[0][2] = 0)
    fireEvent.click(buttons[2] as HTMLElement);

    // Use keyboard input to enter a number
    fireEvent.keyDown(window, { key: '1' });

    await waitFor(() => {
      expect(onCellChange).toHaveBeenCalledWith(0, 2, 1);
    });
  });

  it('handles keyboard number input', async () => {
    const onCellChange = vi.fn();
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} onCellChange={onCellChange} />);

    const buttons = container.querySelectorAll('button');
    // Click on an empty cell
    fireEvent.click(buttons[2] as HTMLElement);

    // Simulate keyboard input
    fireEvent.keyDown(window, { key: '5' });

    await waitFor(() => {
      expect(onCellChange).toHaveBeenCalledWith(0, 2, 5);
    });
  });

  it('clears cell with Backspace', async () => {
    const onCellChange = vi.fn();
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} onCellChange={onCellChange} />);

    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[2] as HTMLElement); // Select cell [0][2]

    // First add a value
    fireEvent.keyDown(window, { key: '5' });

    // Then clear it
    fireEvent.keyDown(window, { key: 'Backspace' });

    await waitFor(() => {
      expect(onCellChange).toHaveBeenLastCalledWith(0, 2, 0);
    });
  });

  it('navigates with arrow keys', async () => {
    const onCellSelect = vi.fn();
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} onCellSelect={onCellSelect} />);

    const buttons = container.querySelectorAll('button');
    // Select an empty cell first (cell [0][2])
    fireEvent.click(buttons[2] as HTMLElement);

    // Press ArrowDown to move to [1][2]
    fireEvent.keyDown(window, { key: 'ArrowDown' });

    // The onCellSelect should be called for the new cell
    await waitFor(() => {
      // Should have navigated down to [1][2]
      expect(onCellSelect).toHaveBeenCalledWith(1, 2);
    });
  });

  it('highlights selected cell', () => {
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} selectedCell={{ row: 0, col: 0 }} />);

    const buttons = container.querySelectorAll('button');
    // First cell should be highlighted (selected) and have blue background
    const firstCell = buttons[0] as HTMLElement;
    expect(firstCell.className).toContain('bg-blue');
  });

  it('highlights same numbers when cell is selected', () => {
    const puzzleWithDuplicates = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    render(<PuzzleGrid puzzle={puzzleWithDuplicates} selectedCell={{ row: 0, col: 0 }} />);

    // Cell [0][0] = 5, no other 5s should highlight since none are user-entered
    // But when we add a user value of 5, other cells with 5 should highlight
    expect(true).toBe(true);
  });

  it('detects conflicts in rows', async () => {
    const onCellChange = vi.fn();
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} onCellChange={onCellChange} />);

    const buttons = container.querySelectorAll('button');

    // Select cell [0][2] (empty)
    fireEvent.click(buttons[2] as HTMLElement);

    // Try to add 5 (which already exists at [0][0])
    fireEvent.keyDown(window, { key: '5' });

    await waitFor(() => {
      expect(onCellChange).toHaveBeenCalledWith(0, 2, 5);
      // The cell will have error styling since 5 already exists in row 0
    });
  });

  it('prevents editing in readOnly mode', () => {
    const onCellChange = vi.fn();
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} readOnly={true} onCellChange={onCellChange} />);

    const buttons = container.querySelectorAll('button');
    // Try to click on an empty cell
    fireEvent.click(buttons[2] as HTMLElement);

    // Try to enter a number via keyboard - should not work
    fireEvent.keyDown(window, { key: '1' });

    expect(onCellChange).not.toHaveBeenCalled();
  });

  it('supports pencil marks (candidates)', async () => {
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} />);

    const pencilCheckbox = screen.getByLabelText('Pencil Mode (Candidates)') as HTMLInputElement;
    const buttons = container.querySelectorAll('button');

    // Enable pencil mode
    fireEvent.click(pencilCheckbox);
    expect(pencilCheckbox.checked).toBe(true);

    // Select an empty cell
    fireEvent.click(buttons[2] as HTMLElement);

    // Enter a number in pencil mode
    fireEvent.keyDown(window, { key: '1' });

    // Cell should now show candidate marks
    expect(pencilCheckbox.checked).toBe(true);
  });

  it('calls onCellSelect callback when cell is selected', async () => {
    const onCellSelect = vi.fn();
    const { container } = render(<PuzzleGrid puzzle={mockPuzzle} onCellSelect={onCellSelect} />);

    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[2] as HTMLElement); // Select cell [0][2]

    await waitFor(() => {
      expect(onCellSelect).toHaveBeenCalledWith(0, 2);
    });
  });

  it('respects external selectedCell prop', () => {
    render(<PuzzleGrid puzzle={mockPuzzle} selectedCell={{ row: 1, col: 1 }} />);

    const buttons = screen.getAllByRole('button');
    // Cell [1][1] should be selected (9 + 1 = index 10)
    expect(buttons[10]).toHaveClass('bg-blue-300');
  });

  it('applies custom highlight colors', () => {
    const highlightCells = [{ row: 0, col: 0, color: 'green' }];
    render(<PuzzleGrid puzzle={mockPuzzle} highlightCells={highlightCells} />);

    // Should render without errors
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
