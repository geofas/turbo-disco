import React, { useState } from 'react';
import type { LessonStep as LessonStepType } from '../data/lessons';
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
  const isLastStep = stepIndex === totalSteps - 1;

  const handleInteractiveCellChange = (
    row: number,
    col: number,
    value: number
  ) => {
    if (!step.solution) return;

    const isSolutionCell =
      row === step.solution.row && col === step.solution.col;
    const isCorrectValue = value === step.solution.value;

    if (isSolutionCell && isCorrectValue) {
      setCorrectAnswer(true);
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
                  highlightCells={step.highlightCells}
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
            {step.grid && (
              <div className="flex justify-center">
                <PuzzleGrid
                  puzzle={step.grid}
                  highlightCells={step.highlightCells}
                  readOnly={false}
                  onCellChange={handleInteractiveCellChange}
                />
              </div>
            )}
            {correctAnswer && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-green-800 font-semibold">
                  Excellent! You found the solution! 🎉
                </p>
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
