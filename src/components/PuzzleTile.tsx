/**
 * PuzzleTile Component — Card for individual puzzle in practice hub
 * Shows puzzle number, difficulty, status, best time
 * Click to start puzzle
 */

import React from 'react';
import type { PuzzleStatus } from '../hooks/usePracticeProgress';

interface PuzzleTileProps {
  puzzleNumber: number;
  difficulty: number; // 0-100
  status: PuzzleStatus;
  bestTime?: number; // in seconds
  stars?: 1 | 2 | 3;
  onClick: () => void;
}

/**
 * Format seconds to mm:ss
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Render difficulty dots (1-3 filled based on difficulty)
 */
function DifficultyIndicator({ difficulty }: { difficulty: number }) {
  const filledDots = Math.min(3, Math.max(1, Math.ceil((difficulty / 100) * 3)));
  return (
    <div className="flex gap-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-colors ${
            i < filledDots ? 'bg-orange-400' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Render status icon
 */
function StatusIcon({ status }: { status: PuzzleStatus }) {
  switch (status) {
    case 'completed':
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-600 text-lg">✓</span>
        </div>
      );
    case 'inProgress':
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600">⏸</span>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-600 text-lg">▶</span>
        </div>
      );
  }
}

/**
 * Render star rating
 */
function StarRating({ stars }: { stars: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={`text-lg transition-all ${
            i < stars ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export const PuzzleTile: React.FC<PuzzleTileProps> = ({
  puzzleNumber,
  difficulty,
  status,
  bestTime,
  stars,
  onClick
}) => {
  const isCompleted = status === 'completed';
  const isInProgress = status === 'inProgress';

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-6 rounded-lg border-2 transition-all duration-200
        flex flex-col gap-4
        ${
          isCompleted
            ? 'border-green-300 bg-green-50 hover:shadow-lg hover:border-green-400'
            : isInProgress
            ? 'border-blue-300 bg-blue-50 hover:shadow-lg hover:border-blue-400'
            : 'border-gray-200 bg-white hover:shadow-lg hover:border-gray-300'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
    >
      {/* Header: Number + Status */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Puzzle #{puzzleNumber}
          </h3>
        </div>
        <StatusIcon status={status} />
      </div>

      {/* Difficulty Indicator */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-600 font-medium">Difficulty</span>
        <DifficultyIndicator difficulty={difficulty} />
      </div>

      {/* Stats Section - only show if completed */}
      {isCompleted && (
        <div className="pt-2 border-t border-green-200">
          {bestTime && (
            <div className="mb-3">
              <span className="text-xs text-gray-600 font-medium">Best Time</span>
              <div className="text-lg font-mono font-bold text-green-600">
                {formatTime(bestTime)}
              </div>
            </div>
          )}
          {stars && (
            <div>
              <span className="text-xs text-gray-600 font-medium block mb-1">
                Rating
              </span>
              <StarRating stars={stars} />
            </div>
          )}
        </div>
      )}

      {/* In Progress Indicator */}
      {isInProgress && (
        <div className="pt-2 border-t border-blue-200">
          <span className="text-xs text-blue-600 font-medium">In Progress</span>
        </div>
      )}

      {/* Not Started - show start button state */}
      {status === 'notStarted' && (
        <div className="pt-2 text-center">
          <span className="text-sm font-medium text-gray-600">Ready to start?</span>
        </div>
      )}
    </button>
  );
};
