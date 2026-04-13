import { Link } from 'react-router-dom';

export default function LandingPage() {
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
  ];

  const unlockedLevels = 3;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container-sudoku py-12 sm:py-16 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <h1
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{ color: 'var(--color-neutral-dark)' }}
            >
              Master Sudoku, One Technique at a Time
            </h1>
            <p
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: 'var(--color-neutral-dark)' }}
            >
              Learn Sudoku systematically with our structured curriculum. Each level teaches one
              solving technique with clear examples, then you practice immediately.
            </p>

            {/* CTAs */}
            <div className="flex gap-4 flex-col sm:flex-row pt-4">
              <Link
                to="/lesson/1"
                className="btn-primary px-8 py-4 text-center font-semibold text-lg rounded-lg hover:shadow-lg transition-shadow"
              >
                Start Learning — Free
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 text-center font-semibold text-lg rounded-lg border-2 transition-colors"
                style={{
                  borderColor: 'var(--color-primary-blue)',
                  color: 'var(--color-primary-blue)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--color-neutral-light)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Learn More
              </a>
            </div>

            {/* No Account Needed */}
            <p className="text-sm font-medium" style={{ color: 'var(--color-secondary-teal)' }}>
              ✓ No account needed to start
            </p>
          </div>

          {/* Right: Sudoku Grid Visual */}
          <div className="hidden md:flex justify-center items-center">
            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: 'var(--color-neutral-light)' }}
            >
              <div
                className="grid grid-cols-3 gap-px"
                style={{ backgroundColor: 'var(--color-neutral-dark)' }}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 flex items-center justify-center font-bold text-lg bg-white"
                    style={{ color: 'var(--color-primary-blue)' }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20"
        style={{ backgroundColor: 'var(--color-neutral-light)' }}
      >
        <div className="container-sudoku">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg mb-4"
                style={{ backgroundColor: 'var(--color-primary-blue)' }}
              >
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Learn</h3>
              <p style={{ color: 'var(--color-neutral-dark)' }}>
                Each level teaches one solving technique with clear examples and step-by-step
                explanations.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg mb-4"
                style={{ backgroundColor: 'var(--color-secondary-teal)' }}
              >
                2
              </div>
              <h3 className="text-xl font-bold mb-4">Practice</h3>
              <p style={{ color: 'var(--color-neutral-dark)' }}>
                Apply what you learned on puzzles specifically designed to require that technique.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg mb-4"
                style={{ backgroundColor: 'var(--color-success-green)' }}
              >
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Progress</h3>
              <p style={{ color: 'var(--color-neutral-dark)' }}>
                Unlock new levels as you master each skill and build your Sudoku expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Preview Section */}
      <section className="container-sudoku py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Your Learning Path</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {levels.map(item => {
            const isUnlocked = item.level <= unlockedLevels;
            return (
              <Link
                key={item.level}
                to={isUnlocked ? `/lesson/${item.level}` : '#'}
                className={`p-6 rounded-lg text-center transition-all ${
                  isUnlocked ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'
                }`}
                style={{
                  backgroundColor: isUnlocked ? 'white' : 'var(--color-neutral-light)',
                  border: `2px solid ${isUnlocked ? 'var(--color-primary-blue)' : 'var(--color-neutral-light)'}`,
                  opacity: isUnlocked ? 1 : 0.6,
                }}
                onClick={e => {
                  if (!isUnlocked) {
                    e.preventDefault();
                  }
                }}
              >
                <div
                  className="text-sm font-semibold mb-2"
                  style={{
                    color: isUnlocked ? 'var(--color-primary-blue)' : 'var(--color-neutral-dark)',
                  }}
                >
                  Level {item.level}
                </div>
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ color: 'var(--color-neutral-dark)' }}
                >
                  {item.name}
                </h3>
                {!isUnlocked && <div className="text-xs text-gray-500">Coming soon</div>}
              </Link>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link
            to="/lesson/1"
            className="btn-primary px-8 py-4 font-semibold text-lg rounded-lg hover:shadow-lg transition-shadow inline-block"
          >
            Start with Level 1
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 border-t"
        style={{ borderColor: 'var(--color-neutral-light)', backgroundColor: 'white' }}
      >
        <div className="container-sudoku">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <p style={{ color: 'var(--color-neutral-dark)' }}>
              Built for learners, by puzzle enthusiasts
            </p>
            <a
              href="https://github.com/geofas/turbo-disco"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors hover:opacity-70"
              style={{ color: 'var(--color-primary-blue)' }}
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
