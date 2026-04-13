import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessons } from '../data/lessons';
import { LessonStep } from '../components/LessonStep';
import { useProgress } from '../contexts/useProgress';

export default function LessonPage() {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { completeLessonForLevel, isLevelUnlocked } = useProgress();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Find the lesson matching the URL level param
  const lesson = useMemo(() => {
    const levelNum = parseInt(level || '1', 10);
    return lessons.find(l => l.level === levelNum);
  }, [level]);

  // Check if level is unlocked
  const levelNum = parseInt(level || '1', 10);
  const isUnlocked = isLevelUnlocked(levelNum);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Handle countdown timer for auto-redirect
  useEffect(() => {
    if (redirectCountdown === null) return;

    if (redirectCountdown === 0) {
      // Auto-redirect to practice
      if (lesson) {
        navigate(`/practice/${lesson.level}`);
      }
    } else {
      // Decrement countdown
      redirectTimeoutRef.current = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [redirectCountdown, lesson, navigate]);

  // Redirect if lesson not found
  if (!lesson) {
    return (
      <div className="container-sudoku">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Lesson Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the lesson for level {level}.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Redirect if level is coming soon (hard gate at level 4+)
  if (levelNum >= 4) {
    return (
      <div className="container-sudoku">
        <div className="text-center space-y-6 py-12">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-4xl font-bold">Level {levelNum} Coming Soon</h1>
          <p className="text-xl text-gray-700">
            We're still building lessons for advanced techniques.
          </p>
          <p className="text-gray-600 max-w-md mx-auto">
            Master the fundamentals with Levels 1-3, and check back later for more advanced
            techniques.
          </p>
          <button onClick={() => navigate('/curriculum')} className="btn-primary inline-block">
            Back to Curriculum
          </button>
        </div>
      </div>
    );
  }

  // Redirect if level is not unlocked
  if (!isUnlocked) {
    return (
      <div className="container-sudoku">
        <div className="text-center space-y-6 py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-4xl font-bold">Level {levelNum} Locked</h1>
          <p className="text-xl text-gray-700">
            You need to complete the previous level to unlock this one.
          </p>
          <p className="text-gray-600 max-w-md mx-auto">
            {levelNum === 2 &&
              "Complete Level 1's lesson and solve at least one puzzle to unlock Level 2."}
            {levelNum === 3 &&
              "Complete Level 2's lesson and solve at least one puzzle to unlock Level 3."}
          </p>
          <button onClick={() => navigate('/curriculum')} className="btn-primary inline-block">
            Back to Curriculum
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
    // Update progress store
    const levelNum = parseInt(level || '1', 10);
    completeLessonForLevel(levelNum);
    // Start 3-second countdown before auto-redirect
    setRedirectCountdown(3);
  };

  // Show completion screen if all steps done
  if (isCompleted) {
    return (
      <div className="container-sudoku min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="text-6xl mb-4 animate-pulse">🏆</div>
          <h1 className="text-4xl md:text-5xl font-bold">Level {lesson?.level} Lesson Complete!</h1>
          <p className="text-xl text-gray-700">
            You've mastered the <strong>{lesson?.technique}</strong> technique!
          </p>
          <p className="text-gray-600">
            You're now ready to practice what you've learned. Apply these new skills to solve more
            puzzles and build your mastery.
          </p>

          {/* Countdown timer */}
          {redirectCountdown !== null && (
            <div className="py-4">
              <p className="text-lg text-gray-600 mb-3">
                {redirectCountdown > 0
                  ? `Redirecting to practice in ${redirectCountdown}...`
                  : 'Redirecting...'}
              </p>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-1000"
                  style={{
                    width: `${((3 - redirectCountdown) / 3) * 100}%`,
                    backgroundColor: 'var(--color-primary-blue)',
                  }}
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={() => navigate(`/practice/${lesson?.level}`)}
              className="btn-success px-8 py-3 text-lg"
            >
              Go to Practice Now
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
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{lesson.title}</h1>
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
