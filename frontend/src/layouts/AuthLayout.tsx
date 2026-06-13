import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { ThemeToggle } from '../components/ThemeToggle';
import { Link2 } from 'lucide-react';

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-between p-6 grid-bg">
      {/* Decorative Blur Blobs */}
      <div 
        className="glow-blur w-[400px] h-[400px] bg-indigo-600/20 top-[-100px] left-[-100px]"
        style={{ filter: 'blur(120px)' }}
      />
      <div 
        className="glow-blur w-[400px] h-[400px] bg-purple-600/10 bottom-[-100px] right-[-100px]"
        style={{ filter: 'blur(120px)' }}
      />

      {/* Floating Theme Header */}
      <header className="flex justify-between items-center w-full max-w-6xl mx-auto z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <Link2 className="w-5 h-5" />
          </div>
          <span className="font-bold font-sans text-xl bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-wide">
            LinkForge AI
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Auth Form Center Area */}
      <main className="flex-1 flex items-center justify-center py-12 z-10">
        <div className="w-full max-w-md p-8 rounded-2xl glass-panel shadow-2xl relative border border-white/10">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-zinc-500 text-xs z-10">
        &copy; {new Date().getFullYear()} LinkForge AI. All rights reserved. Part of Katomaran Hackathon.
      </footer>
    </div>
  );
}
