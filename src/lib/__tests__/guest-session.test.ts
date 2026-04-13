import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getGuestSession,
  createGuestSession,
  getOrCreateGuestSession,
  isGuest,
} from '../guest-session';

/**
 * Mock localStorage for testing
 */
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe('Guest Session Manager', () => {
  let localStorageMock: LocalStorageMock;

  beforeEach(() => {
    localStorageMock = new LocalStorageMock();
    global.localStorage = localStorageMock as any;
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('getGuestSession', () => {
    it('should return null when no session exists', () => {
      const session = getGuestSession();
      expect(session).toBeNull();
    });

    it('should return the session when one exists', () => {
      createGuestSession();
      const session = getGuestSession();
      expect(session).not.toBeNull();
      expect(session?.sessionId).toBeDefined();
    });

    it('should return the same session on multiple calls', () => {
      createGuestSession();
      const session1 = getGuestSession();
      const session2 = getGuestSession();
      expect(session1?.sessionId).toBe(session2?.sessionId);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorageMock.setItem('sudoku-trainer-guest', 'invalid json{');
      const session = getGuestSession();
      expect(session).toBeNull();
    });
  });

  describe('createGuestSession', () => {
    it('should create a session with a unique ID', () => {
      const session = createGuestSession();
      expect(session.sessionId).toBeDefined();
      expect(session.sessionId.length).toBeGreaterThan(0);
    });

    it('should create a session with timestamps', () => {
      const before = Date.now();
      const session = createGuestSession();
      const after = Date.now();

      expect(session.createdAt).toBeGreaterThanOrEqual(before);
      expect(session.createdAt).toBeLessThanOrEqual(after);
      expect(session.lastActiveAt).toBeGreaterThanOrEqual(before);
      expect(session.lastActiveAt).toBeLessThanOrEqual(after);
    });

    it('should store the session in localStorage', () => {
      createGuestSession();
      const stored = localStorageMock.getItem('sudoku-trainer-guest');
      expect(stored).toBeDefined();
      expect(() => JSON.parse(stored!)).not.toThrow();
    });

    it('should generate unique IDs for separate sessions', () => {
      const session1 = createGuestSession();
      localStorageMock.clear();
      const session2 = createGuestSession();

      expect(session1.sessionId).not.toBe(session2.sessionId);
    });

    it('should handle localStorage unavailable gracefully', () => {
      global.localStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error('Storage unavailable');
        },
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      } as any;

      const session = createGuestSession();
      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
    });
  });

  describe('getOrCreateGuestSession', () => {
    it('should create a session if none exists', () => {
      expect(getGuestSession()).toBeNull();
      const session = getOrCreateGuestSession();
      expect(session).toBeDefined();
      expect(getGuestSession()).not.toBeNull();
    });

    it('should return existing session if one exists', () => {
      const created = createGuestSession();
      const retrieved = getOrCreateGuestSession();
      expect(retrieved.sessionId).toBe(created.sessionId);
    });

    it('should update lastActiveAt on subsequent calls', () => {
      const session1 = getOrCreateGuestSession();
      const firstActiveAt = session1.lastActiveAt;

      // Wait a tiny bit and call again
      const session2 = getOrCreateGuestSession();

      expect(session2.lastActiveAt).toBeGreaterThanOrEqual(firstActiveAt);
      expect(session2.sessionId).toBe(session1.sessionId);
    });

    it('should persist the session in localStorage', () => {
      getOrCreateGuestSession();
      const stored = localStorageMock.getItem('sudoku-trainer-guest');
      expect(stored).toBeDefined();
    });
  });

  describe('isGuest', () => {
    it('should return false when no session exists', () => {
      expect(isGuest()).toBe(false);
    });

    it('should return true when a session exists', () => {
      createGuestSession();
      expect(isGuest()).toBe(true);
    });

    it('should return true after getOrCreateGuestSession', () => {
      getOrCreateGuestSession();
      expect(isGuest()).toBe(true);
    });
  });

  describe('UUID Generation', () => {
    it('should generate valid UUID v4 format', () => {
      const session = createGuestSession();
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(session.sessionId).toMatch(uuidPattern);
    });

    it('should generate unique UUIDs', () => {
      const sessions = new Set();
      for (let i = 0; i < 10; i++) {
        localStorageMock.clear();
        const session = createGuestSession();
        sessions.add(session.sessionId);
      }
      expect(sessions.size).toBe(10);
    });
  });

  describe('Session Persistence across reloads', () => {
    it('should survive a simulated page reload', () => {
      const session1 = getOrCreateGuestSession();
      const sessionId1 = session1.sessionId;

      // Simulate page reload by creating new localStorage but keeping data
      const savedData = localStorageMock.getItem('sudoku-trainer-guest');
      const newStorageMock = new LocalStorageMock();
      if (savedData) {
        newStorageMock.setItem('sudoku-trainer-guest', savedData);
      }
      global.localStorage = newStorageMock as any;

      const session2 = getOrCreateGuestSession();
      expect(session2.sessionId).toBe(sessionId1);
    });
  });
});
