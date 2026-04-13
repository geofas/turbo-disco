import React from 'react';
import './PuzzleCell.css';

interface PuzzleCellProps {
  value: number;
  givenValue: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  isInSelectedRow: boolean;
  isInSelectedCol: boolean;
  isInSelectedBox: boolean;
  hasError: boolean;
  highlightColor?: string;
  readOnly?: boolean;
  candidates?: Set<number>;
  onClick: () => void;
  highlightDelay?: number; // Delay in ms for staggered animations
}

export const PuzzleCell: React.FC<PuzzleCellProps> = ({
  value,
  givenValue,
  isSelected,
  isHighlighted,
  isSameNumber,
  isInSelectedRow,
  isInSelectedCol,
  isInSelectedBox,
  hasError,
  highlightColor,
  readOnly = false,
  candidates,
  onClick,
  highlightDelay = 0,
}) => {
  const isGiven = givenValue !== 0;
  const isEmpty = value === 0 && givenValue === 0;
  const displayValue = givenValue !== 0 ? givenValue : value;

  let bgClass = '';
  let textClass = '';
  let borderClass = '';

  if (hasError) {
    bgClass = 'bg-red-200';
    textClass = 'text-red-800';
  } else if (isSelected) {
    bgClass = 'bg-blue-300';
    textClass = isGiven ? 'text-gray-800' : 'text-white';
    borderClass = 'border-2 border-blue-500';
  } else if (isHighlighted && highlightColor) {
    // Custom highlight color from teaching mode
    bgClass = `bg-opacity-20`;
    textClass = isGiven ? 'text-gray-800' : 'text-gray-800';
  } else if (isSameNumber && !isEmpty) {
    bgClass = 'bg-yellow-100';
    textClass = isGiven ? 'text-gray-800' : 'text-gray-700';
  } else if (isInSelectedRow || isInSelectedCol || isInSelectedBox) {
    bgClass = 'bg-blue-50';
    textClass = isGiven ? 'text-gray-800' : 'text-gray-700';
  } else if (isGiven) {
    bgClass = 'bg-white';
    textClass = 'text-gray-900 font-bold';
  } else {
    bgClass = 'bg-white';
    textClass = 'text-gray-700';
  }

  // Calculate highlight-specific animation classes
  const highlightAnimationClass = isHighlighted ? 'cell-highlight-animate' : '';
  const delayStyle = isHighlighted && highlightDelay > 0
    ? { animationDelay: `${highlightDelay}ms` }
    : undefined;

  return (
    <button
      onClick={onClick}
      disabled={readOnly || isGiven}
      className={`
        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
        flex flex-col items-center justify-center
        border border-gray-400
        text-base sm:text-lg md:text-xl
        font-semibold
        transition-colors duration-300
        relative
        ${bgClass}
        ${textClass}
        ${borderClass}
        ${highlightAnimationClass}
        ${!readOnly && !isGiven && 'hover:bg-gray-100'}
        ${readOnly || isGiven ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={delayStyle}
      title={isEmpty ? 'Empty' : `Value: ${displayValue}`}
    >
      {/* Main value or empty candidates view */}
      <div className="w-full h-full flex items-center justify-center">
        {displayValue !== 0 ? (
          displayValue
        ) : candidates && candidates.size > 0 ? (
          <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
              <span
                key={num}
                className={`
                  text-xs
                  flex items-center justify-center
                  ${candidates.has(num) ? 'text-purple-600' : 'text-gray-300'}
                `}
              >
                {candidates.has(num) ? num : ''}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
};
