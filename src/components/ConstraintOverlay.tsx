import React from 'react';

interface ConstraintIndicator {
  row: number;
  col: number;
  label: string;
  color: string;
  type: 'filled' | 'eliminated' | 'arrow' | 'missing';
}

interface ConstraintOverlayProps {
  visible: boolean;
  constraints: ConstraintIndicator[];
  technique: string;
}

export const ConstraintOverlay: React.FC<ConstraintOverlayProps> = ({
  visible,
  constraints,
}) => {
  if (!visible || constraints.length === 0) {
    return null;
  }

  const cellSize = 56; // w-14 h-14 base (3.5rem)

  return (
    <div className="absolute inset-0 pointer-events-none">
      {constraints.map((constraint, idx) => {
        const { row, col, label, color, type } = constraint;
        const left = col * cellSize;
        const top = row * cellSize;

        if (type === 'filled') {
          // Show filled number overlay
          return (
            <div
              key={idx}
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                zIndex: 10,
              }}
            >
              <div
                className="absolute inset-0 rounded opacity-20"
                style={{ backgroundColor: color }}
              />
              <span
                className="relative text-sm font-bold pointer-events-none"
                style={{ color: color }}
                title={`Cell contains: ${label}`}
              >
                {label}
              </span>
            </div>
          );
        }

        if (type === 'eliminated') {
          // Show eliminated candidate with strikethrough
          return (
            <div
              key={idx}
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                zIndex: 10,
              }}
            >
              <span
                className="relative text-xs font-semibold line-through pointer-events-none"
                style={{ color: color }}
                title={`Eliminated candidate: ${label}`}
              >
                {label}
              </span>
            </div>
          );
        }

        if (type === 'missing') {
          // Show missing number in house with emphasis
          return (
            <div
              key={idx}
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                zIndex: 10,
              }}
            >
              <div
                className="absolute inset-0 rounded border-2"
                style={{
                  borderColor: color,
                  backgroundColor: `${color}22`,
                }}
              />
              <span
                className="relative text-lg font-bold pointer-events-none"
                style={{ color }}
                title={`Missing number: ${label}`}
              >
                ?{label}
              </span>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
