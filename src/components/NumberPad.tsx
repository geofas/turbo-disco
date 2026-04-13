import React from 'react';

interface NumberPadProps {
  onNumberClick: (number: number) => void;
  onClear: () => void;
  selectedNumber?: number;
  disabled?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onNumberClick,
  onClear,
  selectedNumber,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            disabled={disabled}
            className={`
              py-3 px-2 rounded font-bold text-lg
              transition-colors
              ${
                selectedNumber === num
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }
              ${disabled && 'opacity-50 cursor-not-allowed'}
            `}
          >
            {num}
          </button>
        ))}
      </div>
      <button
        onClick={onClear}
        disabled={disabled}
        className={`
          w-full py-3 px-4 rounded font-bold text-base
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
