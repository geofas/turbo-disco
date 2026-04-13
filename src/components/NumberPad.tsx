import React from 'react';

interface NumberPadProps {
  onNumberClick: (number: number) => void;
  onClear: () => void;
  selectedNumber?: number;
  disabled?: boolean;
  selectedCandidates?: Set<number>;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onNumberClick,
  onClear,
  selectedNumber,
  disabled = false,
  selectedCandidates,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(num => {
          const isCandidateActive = selectedCandidates && selectedCandidates.has(num);
          return (
            <button
              key={num}
              onClick={() => onNumberClick(num)}
              disabled={disabled}
              className={`
                py-3 px-2 sm:py-4 sm:px-3 rounded font-bold text-lg min-h-12
                transition-colors relative
                ${
                  selectedNumber === num
                    ? 'bg-blue-500 text-white'
                    : isCandidateActive
                      ? 'bg-purple-300 text-purple-900 font-bold'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }
                ${disabled && 'opacity-50 cursor-not-allowed'}
              `}
              title={isCandidateActive ? 'Candidate marked in selected cell' : ''}
            >
              {num}
              {isCandidateActive && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-purple-600 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={onClear}
        disabled={disabled}
        className={`
          w-full py-3 sm:py-4 px-4 rounded font-bold text-base min-h-12
          transition-colors
          bg-red-500 text-white hover:bg-red-600
          ${disabled && 'opacity-50 cursor-not-allowed'}
        `}
      >
        Clear
      </button>
    </div>
  );
};
