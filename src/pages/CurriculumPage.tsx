import { Link } from 'react-router-dom'
import { useProgress } from '../contexts/useProgress'
import { lessons } from '../data/lessons'

export default function CurriculumPage() {
  const { isLevelUnlocked, getLessonCompleted, getPuzzlesCompleted, isLoading } = useProgress()

  const levels = [
    { level: 1, name: 'Full House' },
    { level: 2, name: 'Hidden Single' },
    { level: 3, name: 'Naked Single' },
    { level: 4, name: 'Pointing Pairs' },
    { level: 5, name: 'Box/Line Reduction' },
    { level: 6, name: 'Naked Pairs' },
    { level: 7, name: 'Hidden Pairs' },
    { level: 8, name: 'Naked Triples' },
    { level: 9, name: 'X-Wing' },
    { level: 10, name: 'XY-Wing' },
  ]

  if (isLoading) {
    return (
      <div className="container-sudoku min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your progress...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="container-sudoku py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sudoku Curriculum</h1>
          <p className="text-lg text-gray-700">
            Master Sudoku techniques from beginner to expert. Each level teaches one technique, then you practice.
          </p>
        </div>

        {/* Curriculum Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {levels.map((item) => {
            const unlocked = isLevelUnlocked(item.level)
            const lessonCompleted = unlocked && getLessonCompleted(item.level)
            const puzzlesCompleted = unlocked ? getPuzzlesCompleted(item.level) : 0
            const lesson = lessons.find((l) => l.level === item.level)

            return (
              <div
                key={item.level}
                className="rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
                style={{
                  backgroundColor: unlocked ? 'white' : 'var(--color-neutral-light)',
                  opacity: unlocked ? 1 : 0.6,
                  border: `2px solid ${
                    unlocked ? 'var(--color-primary-blue)' : 'var(--color-neutral-light)'
                  }`,
                }}
              >
                {/* Header */}
                <div
                  className="p-4"
                  style={{
                    backgroundColor: unlocked ? 'var(--color-primary-blue)' : 'var(--color-neutral-light)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="text-sm font-bold"
                      style={{
                        color: unlocked ? 'white' : 'var(--color-neutral-dark)',
                      }}
                    >
                      Level {item.level}
                    </div>
                    {!unlocked && (
                      <div className="text-lg" title="Locked">
                        🔒
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3
                      className="font-bold text-lg mb-1"
                      style={{ color: 'var(--color-neutral-dark)' }}
                    >
                      {item.name}
                    </h3>
                    {lesson && (
                      <p
                        className="text-sm leading-snug"
                        style={{ color: 'var(--color-neutral-dark)' }}
                      >
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  {unlocked && (
                    <div className="space-y-2 text-sm">
                      {lessonCompleted ? (
                        <div style={{ color: 'var(--color-success-green)' }} className="font-semibold">
                          ✓ Lesson Complete
                        </div>
                      ) : (
                        <div style={{ color: 'var(--color-neutral-dark)' }}>
                          📚 Lesson Pending
                        </div>
                      )}

                      {lessonCompleted && (
                        <div style={{ color: 'var(--color-neutral-dark)' }}>
                          {puzzlesCompleted > 0 ? (
                            <span>✓ {puzzlesCompleted} puzzle{puzzlesCompleted !== 1 ? 's' : ''} solved</span>
                          ) : (
                            <span>0 puzzles solved</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!unlocked && (
                    <div style={{ color: 'var(--color-neutral-dark)' }} className="text-sm font-medium">
                      Complete Level {item.level - 1} to unlock
                    </div>
                  )}

                  {/* Button */}
                  <div className="pt-2">
                    {!unlocked ? (
                      <button
                        disabled
                        className="w-full py-2 px-4 rounded-md font-semibold text-center transition-all opacity-50 cursor-not-allowed"
                        style={{
                          backgroundColor: 'var(--color-neutral-light)',
                          color: 'var(--color-neutral-dark)',
                        }}
                      >
                        Locked
                      </button>
                    ) : lessonCompleted ? (
                      <Link
                        to={`/practice/${item.level}`}
                        className="block w-full py-2 px-4 rounded-md font-semibold text-center text-white transition-all hover:opacity-90"
                        style={{
                          backgroundColor: 'var(--color-success-green)',
                        }}
                      >
                        Practice
                      </Link>
                    ) : (
                      <Link
                        to={`/lesson/${item.level}`}
                        className="block w-full py-2 px-4 rounded-md font-semibold text-center text-white transition-all hover:opacity-90"
                        style={{
                          backgroundColor: 'var(--color-primary-blue)',
                        }}
                      >
                        Start Lesson
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link
            to="/lesson/1"
            className="btn-primary px-8 py-4 font-semibold text-lg rounded-lg hover:shadow-lg transition-shadow inline-block"
          >
            Begin Your Journey
          </Link>
        </div>
      </section>
    </div>
  )
}
