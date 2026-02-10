'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'citestack-theme';
export type ThemeValue = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: ThemeValue;
  setTheme: (value: ThemeValue) => void;
  effectiveTheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): ThemeValue {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function subscribeSystemPreference(callback: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getSystemPrefersDarkSnapshot(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeValue>('system');
  const systemPrefersDark = useSyncExternalStore(
    subscribeSystemPreference,
    getSystemPrefersDarkSnapshot,
    getServerSnapshot
  );
  const effectiveTheme: 'light' | 'dark' =
    theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

  const setTheme = useCallback((value: ThemeValue) => {
    setThemeState(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, value);
      document.documentElement.dataset.theme = value;
    }
  }, []);

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    document.documentElement.dataset.theme = stored;
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, effectiveTheme }),
    [theme, setTheme, effectiveTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
