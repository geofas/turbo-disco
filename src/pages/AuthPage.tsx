import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import './AuthPage.css';

type AuthMode = 'signin' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn, signInWithGoogle, isMigrating, migrationStatus } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }

      // Navigate after successful auth (migration happens in background if signup)
      navigate('/curriculum');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h1>

        {migrationStatus && (
          <div className="migration-status">
            <p>{migrationStatus}</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {isSupabaseConfigured() && (
          <>
            <button
              type="button"
              onClick={async () => {
                setError('');
                try {
                  await signInWithGoogle();
                } catch (err) {
                  const message = err instanceof Error ? err.message : 'An error occurred';
                  setError(message);
                }
              }}
              disabled={isLoading || isMigrating}
              className="google-button"
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isLoading || isMigrating}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isLoading || isMigrating}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isMigrating || !email || !password}
            className="auth-button"
          >
            {isMigrating ? 'Syncing your progress...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-button"
              disabled={isLoading || isMigrating}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="auth-info">
          <p>
            {mode === 'signup'
              ? 'Your guest progress will be automatically synced to your account.'
              : 'Sign in to access your saved progress.'}
          </p>
        </div>
      </div>
    </div>
  );
}
