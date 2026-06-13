import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('linkforge_theme') === 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isLight) {
      root.classList.add('light');
      localStorage.setItem('linkforge_theme', 'light');
    } else {
      root.classList.remove('light');
      localStorage.setItem('linkforge_theme', 'dark');
    }
  }, [isLight]);

  return (
    <button
      onClick={() => setIsLight(!isLight)}
      className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label="Toggle theme"
    >
      {isLight ? (
        <Moon className="w-5 h-5 transition-transform duration-200" />
      ) : (
        <Sun className="w-5 h-5 transition-transform duration-200" />
      )}
    </button>
  );
}
