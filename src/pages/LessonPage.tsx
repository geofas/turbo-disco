import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessons } from '../data/lessons';
import { LessonStep } from '../components/LessonStep';

export default function LessonPage() {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Find the lesson matching the URL level param
  const lesson = useMemo(() => {
    const levelNum = parseInt(level || '1', 10);
    return lessons.find((l) => l.level === levelNum);
  }, [level]);

  // Redirect if lesson not found
  if (!lesson) {
    return (
      <div className="container-sudoku">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Lesson Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the lesson for level {level}.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentStep = lesson.steps[currentStepIndex];
  const totalSteps = lesson.steps.length;

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompletion = () => {
    setIsCompleted(true);
  };

  // Show completion screen if all steps done
  if (isCompleted) {
    return (
      <div className="container-sudoku min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Congratulations!
          </h1>
          <p className="text-xl text-gray-700">
            You've completed the <strong>{lesson.technique}</strong> lesson!
          </p>
          <p className="text-gray-600">
            You're now ready to practice what you've learned. Apply these new
            skills to solve more puzzles and build your mastery.
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate(`/practice/${lesson.level}`)}
              className="btn-success px-8 py-3 text-lg"
            >
              Start Practicing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-sudoku min-h-screen py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Lessons
        </button>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {lesson.title}
          </h1>
          <p className="text-lg text-gray-600">{lesson.description}</p>
        </div>
      </div>

      {/* Main lesson step renderer */}
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
        <LessonStep
          step={currentStep}
          stepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onNext={handleNextStep}
          onBack={handlePrevStep}
          onComplete={handleCompletion}
        />
      </div>
    </div>
  );
}
