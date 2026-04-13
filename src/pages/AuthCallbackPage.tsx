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
        // Supabase JS client automatically picks up the tokens from the URL hash
        // and exchanges them for a session. We just need to wait for it.
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error('OAuth callback error:', error);
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
