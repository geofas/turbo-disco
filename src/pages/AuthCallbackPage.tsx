import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '../lib/supabase';

/**
 * Handles the OAuth redirect callback from Supabase.
 * When Google redirects back with tokens in the URL hash,
 * Supabase client automatically exchanges them for a session.
 * This page waits for that to complete, then redirects to /curriculum.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        navigate('/auth');
        return;
      }

      try {
        // Supabase PKCE flow: Google returns ?code=... in query params.
        // Explicitly exchange the code for a session so we don't race the
        // client's auto-detect behaviour.
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('OAuth code exchange failed:', exchangeError);
            navigate('/auth');
            return;
          }
        }

        // Confirm we actually have a session before redirecting.
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          console.error('OAuth callback: no session after exchange', error);
          navigate('/auth');
          return;
        }

        // Session is established — redirect to curriculum
        navigate('/curriculum', { replace: true });
      } catch (err) {
        console.error('OAuth callback failed:', err);
        navigate('/auth');
      }
    };

    handleCallback();
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
