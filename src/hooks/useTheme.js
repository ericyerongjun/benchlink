import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'logxus-theme';

function resolveEffective(pref) {
  if (pref === 'light' || pref === 'dark') return pref;
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

export function useTheme() {
  const [preference, setPreference] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    return localStorage.getItem(STORAGE_KEY) || 'system';
  });
  const [effective, setEffective] = useState(() => resolveEffective(preference));

  useEffect(() => {
    document.documentElement.dataset.theme = effective;
  }, [effective]);

  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setEffective(resolveEffective('system'));
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  useEffect(() => {
    setEffective(resolveEffective(preference));
  }, [preference]);

  const setTheme = useCallback((next) => {
    if (next === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
    setPreference(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(effective === 'dark' ? 'light' : 'dark');
  }, [effective, setTheme]);

  return { preference, effective, setTheme, toggle };
}
