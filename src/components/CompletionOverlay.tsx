/**
 * CompletionOverlay Component — Shows when puzzle is completed
 * Displays stats, star rating, and action buttons
 * Includes celebratory CSS animation
 */

import React from 'react';
import type { PuzzleSessionStats } from '../hooks/usePuzzleSession';

interface CompletionOverlayProps {
  stats: PuzzleSessionStats;
  onNextPuzzle: () => void;
  onBackToLevel: () => void;
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
 * Render star rating
 */
function StarRating({ rating }: { rating: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`text-4xl transition-all ${
            i < rating ? 'text-yellow-400 scale-100' : 'text-gray-300 scale-75'
          }`}
        >
          ★
        </div>
      ))}
    </div>
  );
}

export const CompletionOverlay: React.FC<CompletionOverlayProps> = ({
  stats,
  onNextPuzzle,
  onBackToLevel
}) => {
  // Confetti animation CSS
  const confettiStyle = `
    @keyframes confetti-fall {
      0% {
        transform: translateY(-10px) rotateZ(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotateZ(360deg);
        opacity: 0;
      }
    }

    .confetti {
      animation: confetti-fall 3s ease-in forwards;
      position: fixed;
      pointer-events: none;
    }
  `;

  // Generate confetti pieces
  const generateConfetti = () => {
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const duration = 2 + Math.random() * 1;
      pieces.push(
        <div
          key={i}
          className="confetti"
          style={{
            left: `${left}%`,
            top: '-10px',
            width: '10px',
            height: '10px',
            backgroundColor: [
              '#FF6B6B',
              '#4ECDC4',
              '#45B7D1',
              '#FFA07A',
              '#98D8C8'
            ][Math.floor(Math.random() * 5)],
            animation: `confetti-fall ${duration}s ease-in forwards`,
            animationDelay: `${delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0'
          }}
        />
      );
    }
    return pieces;
  };

  return (
    <>
      <style>{confettiStyle}</style>
      {generateConfetti()}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in">
          {/* Celebration Header */}
          <h2 className="text-3xl font-bold text-center mb-2 text-blue-600">
            Puzzle Complete!
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Great job solving this sudoku!
          </p>

          {/* Star Rating */}
          <div className="mb-8">
            <StarRating rating={stats.starRating} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Solve Time */}
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(stats.solveTime)}
              </div>
              <div className="text-xs text-gray-600 mt-1">Solve Time</div>
            </div>

            {/* Mistakes */}
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.mistakes}
              </div>
              <div className="text-xs text-gray-600 mt-1">Mistakes</div>
            </div>

            {/* Hints Used */}
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {stats.hintsUsed}
              </div>
              <div className="text-xs text-gray-600 mt-1">Hints Used</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onBackToLevel}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Back to Level
            </button>
            <button
              onClick={onNextPuzzle}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Next Puzzle
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
