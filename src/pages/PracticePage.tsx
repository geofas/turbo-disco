/**
 * PracticePage — Main practice hub with puzzle selection and solving flow
 * Shows 3 puzzle tiles for selected level
 * On tile click: opens full-screen puzzle solver
 * On completion: shows overlay with stats, returns to hub
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PuzzleTile } from '../components/PuzzleTile';
import { PuzzleGrid } from '../components/PuzzleGrid';
import { CompletionOverlay } from '../components/CompletionOverlay';
import { Timer } from '../components/Timer';
import { usePuzzleSession } from '../hooks/usePuzzleSession';
import { usePracticeProgress } from '../hooks/usePracticeProgress';
import { getPuzzle, getPuzzleMetadata } from '../data/puzzles';
import type { PuzzleSessionStats } from '../hooks/usePuzzleSession';
import type { Puzzle } from '../lib/puzzle-generator';

type ViewMode = 'hub' | 'solving';

interface ActivePuzzleState {
  puzzleNumber: 1 | 2 | 3;
  puzzle: Puzzle;
}

export default function PracticePage() {
  const { level: levelParam } = useParams();
  const navigate = useNavigate();

  // Validate level
  const level = levelParam ? parseInt(levelParam, 10) : 0;
  if (![1, 2, 3].includes(level)) {
    return (
      <div className="container-sudoku text-center py-12">
        <h1 className="text-red-600">Invalid level</h1>
        <button
          onClick={() => navigate('/curriculum')}
          className="btn-primary mt-4"
        >
          Back to Curriculum
        </button>
      </div>
    );
  }

  const typedLevel = level as 1 | 2 | 3;
  const { getPuzzleProgress, startPuzzle, completePuzzle, getLevelStats } =
    usePracticeProgress(typedLevel);

  const [viewMode, setViewMode] = useState<ViewMode>('hub');
  const [activePuzzle, setActivePuzzle] = useState<ActivePuzzleState | null>(
    null
  );
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionStats, setCompletionStats] = useState<PuzzleSessionStats | null>(
    null
  );

  // Puzzle session management
  const puzzleSession = activePuzzle
    ? usePuzzleSession(activePuzzle.puzzle.grid, activePuzzle.puzzle.solution)
    : null;

  // Start solving when view changes
  useEffect(() => {
    if (viewMode === 'solving' && puzzleSession) {
      puzzleSession.startPuzzle();
    }
  }, [viewMode, puzzleSession]);

  // Check for completion
  useEffect(() => {
    if (puzzleSession?.state.isComplete && !showCompletion) {
      const stats = puzzleSession.state.stats;
      setCompletionStats(stats);
      setShowCompletion(true);
      puzzleSession.pauseTimer();
    }
  }, [puzzleSession?.state.isComplete, showCompletion, puzzleSession]);

  // Handlers
  const handlePuzzleTileClick = (puzzleNumber: 1 | 2 | 3) => {
    startPuzzle(puzzleNumber);
    const puzzle = getPuzzle(typedLevel, puzzleNumber);
    setActivePuzzle({ puzzleNumber, puzzle });
    setViewMode('solving');
  };

  const handleBackFromPuzzle = () => {
    if (activePuzzle && puzzleSession) {
      // Mark as in-progress if not complete
      if (!puzzleSession.state.isComplete) {
        startPuzzle(activePuzzle.puzzleNumber); // Update attempts
      }
    }
    setActivePuzzle(null);
    setViewMode('hub');
    setShowCompletion(false);
    setCompletionStats(null);
  };

  const handleCompletionOverlayNext = () => {
    if (
      activePuzzle &&
      completionStats &&
      puzzleSession
    ) {
      completePuzzle(
        activePuzzle.puzzleNumber,
        completionStats.solveTime,
        completionStats.starRating
      );
    }

    // Move to next puzzle or back to hub
    const nextPuzzleNum = (activePuzzle!.puzzleNumber % 3) + 1 as 1 | 2 | 3;
    const nextPuzzle = getPuzzle(typedLevel, nextPuzzleNum);
    startPuzzle(nextPuzzleNum);
    setActivePuzzle({ puzzleNumber: nextPuzzleNum, puzzle: nextPuzzle });
    setShowCompletion(false);
    setCompletionStats(null);
    puzzleSession?.resetPuzzle();
  };

  const handleCompletionOverlayBack = () => {
    if (
      activePuzzle &&
      completionStats &&
      puzzleSession
    ) {
      completePuzzle(
        activePuzzle.puzzleNumber,
        completionStats.solveTime,
        completionStats.starRating
      );
    }
    setActivePuzzle(null);
    setViewMode('hub');
    setShowCompletion(false);
    setCompletionStats(null);
  };

  // HUB VIEW
  if (viewMode === 'hub') {
    const stats = getLevelStats();

    return (
      <div className="container-sudoku py-8">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/curriculum')}
            className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            ← Back to Curriculum
          </button>
          <h1 className="mb-2">Practice Level {typedLevel}</h1>
          <p className="text-gray-600">
            Master the techniques with guided puzzles
          </p>
        </div>

        {/* Progress Summary */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.completed}
              </div>
              <div className="text-xs text-gray-600 mt-1">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">
                {stats.inProgress}
              </div>
              <div className="text-xs text-gray-600 mt-1">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {stats.total - stats.completed}
              </div>
              <div className="text-xs text-gray-600 mt-1">Remaining</div>
            </div>
          </div>
        </div>

        {/* Puzzle Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((num) => {
            const puzzleNum = num as 1 | 2 | 3;
            const progress = getPuzzleProgress(puzzleNum);
            const metadata = getPuzzleMetadata(typedLevel, puzzleNum);

            return (
              <PuzzleTile
                key={puzzleNum}
                puzzleNumber={puzzleNum}
                difficulty={metadata.difficulty}
                status={progress.status}
                bestTime={progress.bestTime}
                stars={progress.stars}
                onClick={() => handlePuzzleTileClick(puzzleNum)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // SOLVING VIEW
  if (viewMode === 'solving' && activePuzzle && puzzleSession) {
    return (
      <div className="container-sudoku py-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={handleBackFromPuzzle}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-2"
            >
              ← Back to Level
            </button>
            <h2 className="text-2xl font-bold">
              Level {typedLevel} · Puzzle #{activePuzzle.puzzleNumber}
            </h2>
          </div>

          {/* Timer */}
          <div className="bg-blue-50 rounded-lg px-6 py-4 border border-blue-200">
            <Timer
              seconds={puzzleSession.state.timer}
              isRunning={puzzleSession.state.isRunning}
              onPause={puzzleSession.pauseTimer}
              onResume={puzzleSession.resumeTimer}
            />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-sm text-gray-600">Mistakes</div>
            <div className="text-2xl font-bold text-red-600">
              {puzzleSession.state.mistakes}
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="text-sm text-gray-600">Hints Used</div>
            <div className="text-2xl font-bold text-amber-600">
              {puzzleSession.state.hintsUsed}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <button
              onClick={puzzleSession.useHint}
              disabled={puzzleSession.state.isComplete}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              Get Hint
            </button>
          </div>
        </div>

        {/* Puzzle Grid */}
        <div className="bg-white rounded-lg p-8 border border-gray-200 flex justify-center">
          <PuzzleGrid
            puzzle={puzzleSession.state.puzzle}
            solution={puzzleSession.state.solution}
            onCellChange={puzzleSession.enterValue}
            readOnly={puzzleSession.state.isComplete}
          />
        </div>

        {/* Completion Overlay */}
        {showCompletion && completionStats && (
          <CompletionOverlay
            stats={completionStats}
            onNextPuzzle={handleCompletionOverlayNext}
            onBackToLevel={handleCompletionOverlayBack}
          />
        )}
      </div>
    );
  }

  return null;
}
