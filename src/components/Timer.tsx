/**
 * Timer Component — Displays elapsed time in mm:ss format
 * Supports pause/resume capability
 */

import React from 'react';

interface TimerProps {
  seconds: number;
  isRunning: boolean;
  onPause?: () => void;
  onResume?: () => void;
}

/**
 * Format seconds to mm:ss
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const Timer: React.FC<TimerProps> = ({
  seconds,
  isRunning,
  onPause,
  onResume
}) => {
  const handleToggle = () => {
    if (isRunning) {
      onPause?.();
    } else {
      onResume?.();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-2xl font-mono font-bold text-blue-600">
        {formatTime(seconds)}
      </div>
      {onPause && onResume && (
        <button
          onClick={handleToggle}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
      )}
    </div>
  );
};
