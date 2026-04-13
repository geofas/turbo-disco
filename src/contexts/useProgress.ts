import { useContext } from 'react';
import { ProgressContext, type ProgressContextType } from './ProgressContext';

/**
 * Hook to access progress context
 */
export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
