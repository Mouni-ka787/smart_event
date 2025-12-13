'use client';

import { useEffect } from 'react';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Check system preference or saved preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply theme
    if (savedTheme === 'dark' || (savedTheme === 'system' && systemPrefersDark) || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'system' || !savedTheme) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    // Also listen for storage changes (in case theme is changed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const newTheme = e.newValue;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (newTheme === 'dark' || (newTheme === 'system' && systemPrefersDark) || (!newTheme && systemPrefersDark)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <>{children}</>;
}