'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

function getEffectiveTheme(theme: ThemeValue): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeValue>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() =>
    getEffectiveTheme('system')
  );

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
    setEffectiveTheme(getEffectiveTheme(stored));
  }, []);

  useEffect(() => {
    if (theme !== 'system') {
      setEffectiveTheme(theme);
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setEffectiveTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

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
