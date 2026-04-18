import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '../lib/supabase';

/**
 * Handles the OAuth redirect callback from Supabase.
 *
 * With flowType: 'pkce' and detectSessionInUrl: true, the Supabase client
 * automatically detects the ?code= param and exchanges it for a session
 * during its internal _initialize() call. A manual exchangeCodeForSession()
 * here races with that auto-detect — if auto-detect wins, the manual call
 * fails with "code already used" and the old code sent the user to /auth.
 *
 * Fix: listen for the auth state change (which fires regardless of who
 * exchanged the code) and poll getSession() as a fallback. Never bail to
 * /auth just because a manual exchange failed.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      navigate('/auth');
      return;
    }

    let settled = false;
    const settle = (path: string) => {
      if (!settled) {
        settled = true;
        navigate(path, { replace: true });
      }
    };

    // Path 1: auth state listener — fires when *either* auto-detect or
    // manual exchange establishes a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          settle('/curriculum');
        }
      }
    );

    // Path 2: try the manual exchange, then fall through to a polling
    // check. This covers the case where the listener was registered
    // after the session was already established.
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          // Attempt manual exchange — may fail if auto-detect already
          // consumed the code. That's fine; we don't bail on error.
          await supabase.auth.exchangeCodeForSession(code);
        }
      } catch {
        // Swallow — auto-detect may have handled it.
      }

      // Poll for up to 5 seconds in case the session is still being
      // established asynchronously by the Supabase client.
      for (let i = 0; i < 10; i++) {
        if (settled) return;
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            settle('/curriculum');
            return;
          }
        } catch {
          // ignore transient errors
        }
        await new Promise(r => setTimeout(r, 500));
      }

      // After 5 s with no session, give up.
      settle('/auth');
    };

    handleCallback();

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        }}
      >
        <p style={{ color: '#333', fontSize: '16px', margin: 0 }}>
          Signing you in...
        </p>
      </div>
    </div>
  );
}
