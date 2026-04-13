import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { LessonStep as LessonStepType, HighlightSequence } from '../data/lessons';
import { PuzzleGrid } from './PuzzleGrid';

interface LessonStepProps {
  step: LessonStepType;
  stepIndex: number;
  totalSteps: number;
  onComplete?: () => void;
  onBack?: () => void;
  onNext?: () => void;
}

export const LessonStep: React.FC<LessonStepProps> = ({
  step,
  stepIndex,
  totalSteps,
  onComplete,
  onBack,
  onNext,
}) => {
  const [correctAnswer, setCorrectAnswer] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showWrongFeedback, setShowWrongFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLastStep = stepIndex === totalSteps - 1;

  /**
   * Compute staggered highlights from highlightSequence
   * Converts highlightSequence (ordered list with step numbers) into highlightCells array
   * with animation delays for smooth, one-by-one highlighting effect.
   * Stagger interval: 100ms between each cell highlight for clarity without rushing.
   */
  const computedHighlightCells = useMemo(() => {
    // If highlightSequence is provided, use it with staggered delays
    if (step.highlightSequence && step.highlightSequence.length > 0) {
      // Sort by step number to ensure correct ordering
      const sorted = [...step.highlightSequence].sort((a, b) => a.step - b.step);
      return sorted.map((seq: HighlightSequence) => ({
        row: seq.row,
        col: seq.col,
        color: seq.color,
        delay: seq.step * 100, // 100ms stagger between cells
      }));
    }
    // Otherwise, use static highlightCells if provided
    return step.highlightCells || [];
  }, [step.highlightSequence, step.highlightCells]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const getHintMessage = (): string => {
    if (!step.solution) return '';
    const { row, col } = step.solution;
    const boxRow = Math.floor(row / 3) + 1;
    const boxCol = Math.floor(col / 3) + 1;

    // Rotate hints for variety
    const hintOptions = [
      `Look at row ${row + 1}—what constraint does it provide?`,
      `Check column ${col + 1}—which numbers are already placed?`,
      `Focus on the ${boxRow}-${boxCol} box (counting from top-left)—what's missing?`,
      `The answer is constrained by row ${row + 1}, column ${col + 1}, and the middle box of the grid.`,
    ];
    return hintOptions[wrongAttempts % hintOptions.length];
  };

  const handleInteractiveCellChange = (
    row: number,
    col: number,
    value: number
  ) => {
    if (!step.solution) return;

    const isSolutionCell =
      row === step.solution.row && col === step.solution.col;
    const isCorrectValue = value === step.solution.value;

    if (isSolutionCell) {
      if (isCorrectValue) {
        // Correct answer!
        setCorrectAnswer(true);
        setShowConfetti(true);
        // Fade confetti after animation
        setTimeout(() => setShowConfetti(false), 2000);
      } else if (value !== 0) {
        // Wrong answer (non-zero value entered)
        const newAttempts = attempts + 1;
        const newWrongAttempts = wrongAttempts + 1;
        setAttempts(newAttempts);
        setWrongAttempts(newWrongAttempts);

        // Show wrong feedback
        setShowWrongFeedback(true);

        // Show hint after 3 wrong attempts
        if (newWrongAttempts === 3) {
          setShowHint(true);
        }

        // Clear wrong feedback after 1.5 seconds
        if (feedbackTimeoutRef.current) {
          clearTimeout(feedbackTimeoutRef.current);
        }
        feedbackTimeoutRef.current = setTimeout(() => {
          setShowWrongFeedback(false);
        }, 1500);
      }
    }
  };

  // Format markdown-like content to have proper line breaks
  const renderContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      // Handle bold text
      const parts = line.split(/\*\*([^*]+)\*\*/);
      return (
        <p key={idx} className="mb-3 leading-relaxed text-base md:text-lg">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="font-semibold">
                {part}
              </strong>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600">
          Step {stepIndex + 1} of {totalSteps}
        </div>
        {/* Progress Bar */}
        <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              backgroundColor: 'var(--color-primary-blue)',
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold">
          {step.title}
        </h2>

        {/* Render based on step type */}
        {step.type === 'explanation' && (
          <div className="space-y-4 text-gray-700">
            {renderContent(step.content)}
          </div>
        )}

        {step.type === 'example' && (
          <div className="space-y-6">
            <div className="text-gray-700">
              {renderContent(step.content)}
            </div>
            {step.grid && (
              <div className="flex justify-center">
                <PuzzleGrid
                  puzzle={step.grid}
                  highlightCells={computedHighlightCells}
                  readOnly={true}
                />
              </div>
            )}
          </div>
        )}

        {step.type === 'interactive' && (
          <div className="space-y-6">
            <div className="text-gray-700">
              {renderContent(step.content)}
            </div>

            {/* Attempt Counter */}
            {attempts > 0 && (
              <div className="text-center text-sm text-gray-600 font-medium">
                Attempt {attempts}{wrongAttempts > 0 && ` (${wrongAttempts} wrong)`}
              </div>
            )}

            {step.grid && (
              <div className="flex justify-center relative">
                <style>{`
                  @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                  }
                  @keyframes cellRedFlash {
                    0% { background-color: #fee2e2; }
                    100% { background-color: transparent; }
                  }
                  @keyframes successGlow {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                  }
                  @keyframes confettiFall {
                    to {
                      transform: translateY(100px) rotate(360deg);
                      opacity: 0;
                    }
                  }
                  @keyframes fadeIn {
                    from {
                      opacity: 0;
                    }
                    to {
                      opacity: 1;
                    }
                  }
                  .shake-animation {
                    animation: shake 0.5s ease-in-out;
                  }
                  .cell-red-flash {
                    animation: cellRedFlash 1.5s ease-out;
                  }
                  .success-glow {
                    animation: successGlow 0.6s ease-out;
                  }
                  .confetti {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    pointer-events: none;
                    animation: confettiFall 2s ease-out forwards;
                  }
                `}</style>

                {/* Confetti elements */}
                {showConfetti &&
                  Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={`confetti-${i}`}
                      className="confetti"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: '50%',
                        backgroundColor: ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa'][i % 5],
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}

                <div className={showWrongFeedback ? 'shake-animation' : ''}>
                  <PuzzleGrid
                    puzzle={step.grid}
                    highlightCells={computedHighlightCells}
                    readOnly={false}
                    onCellChange={handleInteractiveCellChange}
                  />
                </div>
              </div>
            )}

            {/* Wrong Answer Feedback */}
            {showWrongFeedback && (
              <div
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded animate-in fade-in duration-200"
                style={{
                  animation: 'fadeIn 0.3s ease-out',
                }}
              >
                <p className="text-red-800 font-semibold text-center">
                  Try again! 🤔
                </p>
              </div>
            )}

            {/* Hint */}
            {showHint && !correctAnswer && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-blue-900 font-semibold text-sm mb-1">Hint:</p>
                <p className="text-blue-800 text-sm">{getHintMessage()}</p>
              </div>
            )}

            {/* Success Message */}
            {correctAnswer && (
              <div
                className="p-4 bg-green-50 border-l-4 border-green-500 rounded success-glow"
                style={{
                  animation: 'successGlow 0.6s ease-out',
                }}
              >
                <p className="text-green-800 font-semibold text-center">
                  Excellent! You found the solution! 🎉
                </p>
                {attempts > 1 && (
                  <p className="text-green-700 text-sm text-center mt-2">
                    Solved in {attempts} attempt{attempts !== 1 ? 's' : ''} ✨
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-center pt-6">
        {stepIndex > 0 && (
          <button
            onClick={onBack}
            className="btn-secondary"
          >
            Back
          </button>
        )}

        {step.type === 'interactive' && !correctAnswer ? (
          <button
            disabled
            className="btn-primary opacity-50 cursor-not-allowed"
          >
            Next
          </button>
        ) : isLastStep ? (
          <button
            onClick={onComplete}
            className="btn-success px-8"
          >
            Start Practicing
          </button>
        ) : (
          <button
            onClick={onNext}
            className="btn-primary"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};
