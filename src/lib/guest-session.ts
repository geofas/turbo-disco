/**
 * Guest Session Manager
 *
 * Handles creation and tracking of guest sessions for try-before-signup flow.
 * Session data is persisted in localStorage under 'sudoku-trainer-guest'.
 */

const STORAGE_KEY = 'sudoku-trainer-guest';

export interface GuestSession {
  sessionId: string;
  createdAt: number; // timestamp in ms
  lastActiveAt: number; // timestamp in ms
}

/**
 * Generate a UUID v4 string
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get the current guest session from localStorage.
 * Returns null if no guest session exists.
 */
export function getGuestSession(): GuestSession | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as GuestSession;
  } catch {
    // If localStorage is corrupted or unavailable, return null
    return null;
  }
}

/**
 * Create a new guest session and store it in localStorage.
 * Returns the newly created session.
 */
export function createGuestSession(): GuestSession {
  const now = Date.now();
  const session: GuestSession = {
    sessionId: generateUUID(),
    createdAt: now,
    lastActiveAt: now,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // If localStorage is not available, the session still exists in memory
    // but won't persist across page reloads
  }

  return session;
}

/**
 * Get or create a guest session.
 * If a session already exists, updates lastActiveAt and returns it.
 * Otherwise, creates a new session.
 */
export function getOrCreateGuestSession(): GuestSession {
  let session = getGuestSession();

  if (!session) {
    session = createGuestSession();
  } else {
    // Update last active timestamp
    session.lastActiveAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // If storage fails, just continue with the in-memory session
    }
  }

  return session;
}

/**
 * Check if the current session is a guest session.
 * Returns true if a guest session exists, false otherwise.
 */
export function isGuest(): boolean {
  return getGuestSession() !== null;
}
