import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container-sudoku min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="text-8xl font-bold" style={{ color: 'var(--color-primary-blue)' }}>
          404
        </div>
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <div className="flex gap-4 justify-center flex-col sm:flex-row pt-4">
          <Link to="/" className="btn-primary px-6 py-3 text-center rounded-lg">
            Go Home
          </Link>
          <Link
            to="/curriculum"
            className="px-6 py-3 text-center rounded-lg border-2 font-medium transition-colors"
            style={{
              borderColor: 'var(--color-primary-blue)',
              color: 'var(--color-primary-blue)',
            }}
          >
            View Curriculum
          </Link>
        </div>
      </div>
    </div>
  );
}
