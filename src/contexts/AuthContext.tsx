import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { getGuestSession, getOrCreateGuestSession } from '../lib/guest-session';
import { migrateGuestProgress } from '../lib/guest-migration';
import type { User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isMigrating: boolean;
  migrationStatus: string | null;
}

// eslint-disable-next-line react-refresh/only-export-components -- context must be co-located with provider
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const supabase = getSupabaseClient();
  const supabaseConfigured = isSupabaseConfigured();

  // Initialize guest session and listen for auth changes on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Ensure guest session exists (even if not using it yet)
      getOrCreateGuestSession();

      // If Supabase is not configured, stay in guest mode
      if (!supabaseConfigured || !supabase) {
        setIsGuest(true);
        setUser(null);
        setIsLoading(false);
        setHasInitialized(true);
        return;
      }

      try {
        // Check if there's an existing session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setIsGuest(false);
        } else {
          setIsGuest(true);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsGuest(true);
        setUser(null);
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user);
            setIsGuest(false);

            // Migrate guest progress when user signs in (after initial session check)
            // SIGNED_IN event fires both for new signups and returning users
            if (event === 'SIGNED_IN' && hasInitialized && getGuestSession()) {
              try {
                setIsMigrating(true);
                setMigrationStatus('Syncing your progress...');
                await migrateGuestProgress(session.user.id);
                setMigrationStatus('Progress synced!');
                // Clear status after 2 seconds
                setTimeout(() => setMigrationStatus(null), 2000);
              } catch (error) {
                console.error('Failed to migrate guest progress:', error);
                setMigrationStatus('Progress sync failed, but account created.');
                setTimeout(() => setMigrationStatus(null), 3000);
              } finally {
                setIsMigrating(false);
              }
            }
          } else {
            setUser(null);
            setIsGuest(true);
          }
        }
      );

      return () => {
        data?.subscription?.unsubscribe();
      };
    }
  }, [supabase, supabaseConfigured, hasInitialized]);

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) {
      // Guest mode, just clear state
      setUser(null);
      setIsGuest(true);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setIsGuest(true);
  };

  const value: AuthContextType = {
    user,
    isGuest,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isMigrating,
    migrationStatus,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// useAuth hook moved to ./useAuth.ts for react-refresh compatibility
