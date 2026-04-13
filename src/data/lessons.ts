/**
 * Sudoku Trainer Lesson Content
 * Levels 1-3: Full House, Hidden Single, Naked Single
 * Brand voice: Encouraging, Clear, Structured, Warm
 */

export interface HighlightCell {
  row: number;
  col: number;
  color: string; // 'highlight-primary', 'highlight-secondary', 'highlight-success', etc.
}

export interface HighlightSequence {
  row: number;
  col: number;
  color: string;
  step: number;
}

export interface Solution {
  row: number;
  col: number;
  value: number;
}

export interface LessonStep {
  type: 'explanation' | 'example' | 'interactive';
  title: string;
  content: string; // markdown-like text
  grid?: number[][]; // 9x9 grid, 0 = empty
  highlightCells?: HighlightCell[];
  highlightSequence?: HighlightSequence[];
  solution?: Solution; // the cell the user needs to find
}

export interface Lesson {
  id: string;
  level: number;
  technique: string;
  title: string;
  description: string;
  steps: LessonStep[];
}

export const lessons: Lesson[] = [
  {
    id: 'lesson-1-full-house',
    level: 1,
    technique: 'Full House',
    title: 'Full House: The Simplest Technique',
    description: 'Learn to spot when a row, column, or box has only one empty cell. The answer is determined!',
    steps: [
      {
        type: 'explanation',
        title: 'What is a Full House?',
        content: `A "Full House" is the simplest solving technique in Sudoku. Here's the idea:

**A row, column, or 3×3 box with 8 cells filled has only 1 empty cell.**

When you find this situation, the missing number is obvious—it's the one digit from 1-9 that hasn't appeared yet!

Think of it like having 8 cards in a suit of 9. You know exactly which card is missing.

This technique requires no complex logic, just counting. It's a great way to start.`,
      },
      {
        type: 'example',
        title: 'Full House in a Row',
        content: `Look at the top row in this grid. Count the filled cells... 8 out of 9!

Which number is missing from cells 1-9? Check the cells and find which digit hasn't been used yet.

The empty cell (highlighted in blue) must be filled with that missing number.`,
        grid: [
          [1, 2, 3, 4, 5, 6, 7, 8, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        highlightCells: [{ row: 0, col: 8, color: 'highlight-primary' }],
        solution: { row: 0, col: 8, value: 9 },
      },
      {
        type: 'example',
        title: 'Full House in a Column',
        content: `Now let's look at a column (vertical). The first column has 8 cells filled and 1 empty.

Look down the column: 5, 7, 3, 9, 1, 4, 6, 8... What's missing from 1-9?

The empty cell in the 8th row must be that number.`,
        grid: [
          [5, 0, 0, 0, 0, 0, 0, 0, 0],
          [7, 0, 0, 0, 0, 0, 0, 0, 0],
          [3, 0, 0, 0, 0, 0, 0, 0, 0],
          [9, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 0, 0, 0, 0, 0, 0, 0, 0],
          [4, 0, 0, 0, 0, 0, 0, 0, 0],
          [6, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [8, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        highlightCells: [{ row: 7, col: 0, color: 'highlight-primary' }],
        solution: { row: 7, col: 0, value: 2 },
      },
      {
        type: 'interactive',
        title: 'Your Turn: Find the Full House',
        content: `Here's a puzzle with a Full House waiting for you. Look at the top-left 3×3 box.

Count the numbers 1-9. Which one is missing?

**Your task:** Find the empty cell in the full house and determine its value.`,
        grid: [
          [1, 2, 3, 0, 0, 0, 0, 0, 0],
          [4, 5, 6, 0, 0, 0, 0, 0, 0],
          [7, 8, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        highlightCells: [
          { row: 2, col: 2, color: 'highlight-primary' },
          { row: 0, col: 0, color: 'highlight-secondary' },
          { row: 0, col: 1, color: 'highlight-secondary' },
          { row: 0, col: 2, color: 'highlight-secondary' },
          { row: 1, col: 0, color: 'highlight-secondary' },
          { row: 1, col: 1, color: 'highlight-secondary' },
          { row: 1, col: 2, color: 'highlight-secondary' },
          { row: 2, col: 0, color: 'highlight-secondary' },
          { row: 2, col: 1, color: 'highlight-secondary' },
        ],
        solution: { row: 2, col: 2, value: 9 },
      },
      {
        type: 'explanation',
        title: 'Great Work! You\'ve Found Your First Full House',
        content: `You just used the Full House technique! 🎉

**Quick recap:**
- Count the cells in a row, column, or box
- If 8 are filled and 1 is empty, that's a Full House
- The empty cell must contain the missing digit from 1-9
- No guessing needed—the answer is certain

This technique is fast and reliable. Look for Full Houses whenever you scan the puzzle.

**Ready to solve more?** Head to the practice puzzles to find more Full Houses and build your speed!`,
      },
    ],
  },
  {
    id: 'lesson-2-hidden-single',
    level: 2,
    technique: 'Hidden Single',
    title: 'Hidden Single: Finding the Only Home',
    description: 'A number can only go in one place within a row, column, or box—even if that cell has other possibilities.',
    steps: [
      {
        type: 'explanation',
        title: 'What is a Hidden Single?',
        content: `In the Full House technique, we found rows/columns/boxes with 1 empty cell. Now we go deeper.

**A Hidden Single is when a number 1-9 can only go in ONE cell within a row, column, or box—even though that cell might accept multiple numbers.**

Here's the key: You find this by checking: "Where in this row can the number 5 go?"

If 5 can only fit in one spot, that cell must be 5. The number is "hidden" because that cell might look like it could be several values.

This technique is like saying: "I haven't placed the 3 in this column yet. Where's the only spot it fits?" That spot is forced.`,
      },
      {
        type: 'example',
        title: 'Hidden Single in a Row',
        content: `Look at row 1. Let's find where the number 9 can go.

Row 1 has: 1, 2, 3, 4, 5, 6, 7, _, _

Where can 9 be placed? Check cells 8 and 9:
- Cell (1,8): The 3×3 box above it already has a 9? (Show blue highlight)
- Cell (1,9): The 3×3 box above it doesn't have a 9. This cell is in column 9, which doesn't have a 9. So 9 can go here!

Since 9 can only go in cell (1,9), that cell **must** be 9.`,
        grid: [
          [1, 2, 3, 4, 5, 6, 7, 0, 0],
          [4, 5, 6, 7, 8, 9, 1, 0, 0],
          [7, 8, 9, 1, 2, 3, 4, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        highlightCells: [
          { row: 0, col: 7, color: 'highlight-primary' },
          { row: 0, col: 8, color: 'highlight-primary' },
          { row: 0, col: 0, color: 'highlight-secondary' },
          { row: 0, col: 1, color: 'highlight-secondary' },
          { row: 0, col: 2, color: 'highlight-secondary' },
          { row: 0, col: 3, color: 'highlight-secondary' },
          { row: 0, col: 4, color: 'highlight-secondary' },
          { row: 0, col: 5, color: 'highlight-secondary' },
          { row: 0, col: 6, color: 'highlight-secondary' },
        ],
        solution: { row: 0, col: 8, value: 9 },
      },
      {
        type: 'example',
        title: 'Hidden Single in a 3×3 Box',
        content: `Let's check the top-left 3×3 box. It has: 1, 2, 3, 4, 5, 6, 7, 8. The number 9 is missing!

Where can 9 go? We need to check each empty cell in this box:
- Row 1, Col 3: Column 3 already has a 9 elsewhere (not shown, but assume it does). Can't place 9 here.
- Row 2, Col 3: Same column issue. Can't place 9 here.
- Row 3, Col 2: Column 2 doesn't have a 9 yet, row 3 doesn't have a 9 yet. This cell can hold 9!

Since 9 can only be placed in one cell of this box, that cell **must** be 9.`,
        grid: [
          [1, 2, 0, 0, 0, 0, 0, 0, 0],
          [4, 5, 0, 0, 0, 0, 0, 0, 0],
          [7, 8, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        highlightCells: [
          { row: 0, col: 2, color: 'highlight-primary' },
          { row: 1, col: 2, color: 'highlight-primary' },
          { row: 2, col: 2, color: 'highlight-primary' },
          { row: 0, col: 0, color: 'highlight-secondary' },
          { row: 0, col: 1, color: 'highlight-secondary' },
          { row: 1, col: 0, color: 'highlight-secondary' },
          { row: 1, col: 1, color: 'highlight-secondary' },
          { row: 2, col: 0, color: 'highlight-secondary' },
          { row: 2, col: 1, color: 'highlight-secondary' },
        ],
        solution: { row: 2, col: 2, value: 3 },
      },
      {
        type: 'interactive',
        title: 'Find the Hidden Single',
        content: `Look at the middle row (row 5). It has 1-8, but 9 is missing.

Where is the only spot where 9 can go in row 5?

Check each empty cell:
- Does column 1 already have a 9?
- Does column 9 already have a 9?
- Which 3×3 boxes do these cells belong to—do they have 9 already?

**Your task:** Find which cell in row 5 must be 9.`,
        grid: [
          [0, 0, 0, 0, 0, 0, 0, 0, 9],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 2, 3, 4, 5, 6, 7, 8, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        highlightCells: [
          { row: 4, col: 0, color: 'highlight-primary' },
          { row: 4, col: 8, color: 'highlight-primary' },
          { row: 4, col: 1, color: 'highlight-secondary' },
          { row: 4, col: 2, color: 'highlight-secondary' },
          { row: 4, col: 3, color: 'highlight-secondary' },
          { row: 4, col: 4, color: 'highlight-secondary' },
          { row: 4, col: 5, color: 'highlight-secondary' },
          { row: 4, col: 6, color: 'highlight-secondary' },
          { row: 4, col: 7, color: 'highlight-secondary' },
        ],
        solution: { row: 4, col: 8, value: 9 },
      },
      {
        type: 'explanation',
        title: 'You\'ve Mastered Hidden Singles!',
        content: `Excellent! You found a Hidden Single. 🌟

**The process:**
1. Pick a row, column, or box
2. Find a number (like 5) that's not yet placed
3. Check every empty cell: Can 5 go here?
4. If 5 can only go in one spot, place it there—it's forced!

Hidden Singles are more powerful than Full Houses because you can spot them anywhere, not just in almost-complete rows/columns/boxes.

**Pro tip:** When scanning, try this:
- "Where can 1 go in this row?"
- "Where can 2 go in this box?"
- Keep checking all 9 numbers until you find one with only one home.

Ready to tackle more puzzles? Hidden Singles will help you solve much faster!`,
      },
    ],
  },
  {
    id: 'lesson-3-naked-single',
    level: 3,
    technique: 'Naked Single',
    title: 'Naked Single: When a Cell Has Only One Choice',
    description: 'A cell can only contain one possible number—all others are ruled out by row, column, and box constraints.',
    steps: [
      {
        type: 'explanation',
        title: 'What is a Naked Single?',
        content: `You've learned Full House and Hidden Single. Now let's reverse the question.

Instead of asking "Where can this number go?" we ask: "What numbers can go in this cell?"

**A Naked Single is a cell that can only contain ONE possible number.** All other numbers 1-9 are already present in that cell's row, column, or 3×3 box.

Here's the logic:
- A cell's row already has 1, 3, 5, 7, 8, 9
- The same cell's column has 2, 4, 6
- The cell's box already has some other numbers

After elimination, only one number from 1-9 is still possible. That's the answer!

This technique requires careful elimination but gives you certain answers.`,
      },
      {
        type: 'example',
        title: 'Naked Single: Process of Elimination',
        content: `Let's focus on the empty cell at row 1, column 1.

**What numbers are in row 1?**
Numbers: 2, 3, 4, 5, 6, 7, 8

**What numbers are in column 1?**
Numbers: 3, 5, 7, 9

**What numbers are in the top-left 3×3 box?**
Numbers: 2, 3, 4, 5, 6

Now, let's find what can go in this cell:
- Can it be 1? No conflicts so far... yes, 1 is possible.
- Can it be 2? Row 1 has 2. No.
- Can it be 3? Row 1 has 3. No.
- Can it be 4? Row 1 has 4. No.
- ...continue this for all 9 numbers.

After checking all 9: Only **1** has no conflicts. This cell must be 1.`,
        grid: [
          [0, 2, 3, 4, 5, 6, 7, 8, 9],
          [3, 0, 0, 0, 0, 0, 0, 0, 0],
          [5, 0, 0, 0, 0, 0, 0, 0, 0],
          [7, 0, 0, 0, 0, 0, 0, 0, 0],
          [9, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        highlightCells: [
          { row: 0, col: 0, color: 'highlight-primary' },
          { row: 0, col: 1, color: 'highlight-secondary' },
          { row: 0, col: 2, color: 'highlight-secondary' },
          { row: 0, col: 3, color: 'highlight-secondary' },
          { row: 0, col: 4, color: 'highlight-secondary' },
          { row: 0, col: 5, color: 'highlight-secondary' },
          { row: 0, col: 6, color: 'highlight-secondary' },
          { row: 0, col: 7, color: 'highlight-secondary' },
          { row: 0, col: 8, color: 'highlight-secondary' },
        ],
        solution: { row: 0, col: 0, value: 1 },
      },
      {
        type: 'example',
        title: 'Another Naked Single Example',
        content: `Let's check row 5, column 3.

**Row 5 contains:** 1, 2, 4, 5, 6, 7, 9
Missing from row: 3, 8

**Column 3 contains:** 3, 5, 6, 8, 9
Missing from column: 1, 2, 4, 7

**The 3×3 box (middle-left) contains:** 1, 2, 4, 5, 7, 8, 9
Missing from box: 3, 6

Now, what can go in this cell?
- Must be missing from row (3 or 8)
- Must be missing from column (1, 2, 4, or 7)
- Must be missing from box (3 or 6)

The only number that satisfies all three: **3**

This cell must be 3.`,
        grid: [
          [0, 0, 3, 0, 0, 0, 0, 0, 0],
          [0, 0, 5, 0, 0, 0, 0, 0, 0],
          [0, 0, 6, 0, 0, 0, 0, 0, 0],
          [1, 7, 8, 0, 0, 0, 0, 0, 0],
          [2, 8, 9, 0, 0, 0, 0, 0, 0],
          [1, 2, 0, 4, 5, 6, 7, 9, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        highlightCells: [
          { row: 5, col: 2, color: 'highlight-primary' },
          { row: 5, col: 0, color: 'highlight-secondary' },
          { row: 5, col: 1, color: 'highlight-secondary' },
          { row: 5, col: 3, color: 'highlight-secondary' },
          { row: 5, col: 4, color: 'highlight-secondary' },
          { row: 5, col: 5, color: 'highlight-secondary' },
          { row: 5, col: 6, color: 'highlight-secondary' },
          { row: 5, col: 7, color: 'highlight-secondary' },
        ],
        solution: { row: 5, col: 2, value: 3 },
      },
      {
        type: 'interactive',
        title: 'Find the Naked Single',
        content: `Look at row 9, column 5 (the empty cell highlighted in blue).

Use elimination to find what number must go there:

1. What numbers are already in row 9?
2. What numbers are already in column 5?
3. What numbers are already in the bottom-middle 3×3 box?
4. Which number from 1-9 is missing from all three (row, column, and box)?

That's your answer!`,
        grid: [
          [0, 0, 0, 0, 1, 0, 0, 0, 0],
          [0, 0, 0, 0, 2, 0, 0, 0, 0],
          [0, 0, 0, 0, 3, 0, 0, 0, 0],
          [0, 0, 0, 0, 4, 0, 0, 0, 0],
          [0, 0, 0, 0, 5, 0, 0, 0, 0],
          [0, 0, 0, 0, 6, 0, 0, 0, 0],
          [0, 0, 0, 0, 7, 0, 0, 0, 0],
          [0, 0, 0, 0, 8, 0, 0, 0, 0],
          [1, 2, 3, 4, 0, 6, 7, 8, 9],
        ],
        highlightCells: [
          { row: 8, col: 4, color: 'highlight-primary' },
          { row: 8, col: 0, color: 'highlight-secondary' },
          { row: 8, col: 1, color: 'highlight-secondary' },
          { row: 8, col: 2, color: 'highlight-secondary' },
          { row: 8, col: 3, color: 'highlight-secondary' },
          { row: 8, col: 5, color: 'highlight-secondary' },
          { row: 8, col: 6, color: 'highlight-secondary' },
          { row: 8, col: 7, color: 'highlight-secondary' },
          { row: 8, col: 8, color: 'highlight-secondary' },
        ],
        solution: { row: 8, col: 4, value: 5 },
      },
      {
        type: 'explanation',
        title: 'Congrats! You\'ve Learned All Three Level 1-3 Techniques!',
        content: `You just used Naked Single logic! 🏆

**Quick recap of all three techniques:**

**Full House:** A row, column, or box with 8 cells filled → the empty cell is forced.

**Hidden Single:** A number can only go in one place within a row, column, or box → place it there.

**Naked Single:** A cell can only contain one number after eliminating row/column/box conflicts → that's the answer.

**Next steps:**
- Practice these three techniques until they feel natural
- Learn to combine them—often one technique reveals a cell that enables another
- As you advance, you'll tackle harder techniques, but these three are the foundation

You're building a powerful Sudoku solver. Keep going! 💪`,
      },
    ],
  },
];
