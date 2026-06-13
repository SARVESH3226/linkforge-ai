import { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { api } from '../services/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { 
  Link2, 
  BarChart3, 
  FolderHeart, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  Plus
} from 'lucide-react';

export function DashboardLayout() {
  const { user, token, isAuthenticated, clearAuth, setUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(!user && !!token);

  // 1. Fetch current profile if token exists but user object is not in store (refresh case)
  useEffect(() => {
    async function fetchProfile() {
      if (token && !user) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data.user) {
            setUser(res.data.user);
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        } finally {
          setIsVerifying(false);
        }
      } else {
        setIsVerifying(false);
      }
    }
    fetchProfile();
  }, [token, user, setUser, clearAuth]);

  // 2. Auth redirect gates
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
        <p className="text-zinc-400 font-medium animate-pulse text-sm">Synchronizing Secure Session...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout failures
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const navItems = [
    { label: 'Shortlinks', path: '/dashboard', icon: Link2 },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Categories', path: '/categories', icon: FolderHeart },
    { label: 'Profile Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row relative">
      {/* Background blurs */}
      <div className="glow-blur w-[400px] h-[400px] bg-indigo-500/5 top-[-100px] right-[-100px]" />
      <div className="glow-blur w-[450px] h-[450px] bg-purple-500/5 bottom-[-100px] left-[-100px]" />

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-white/5 z-20 w-full">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">LinkForge</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* LEFT SIDEBAR (Desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-zinc-900/60 backdrop-blur-md border-r border-white/5 p-6 flex flex-col justify-between z-30 transition-transform duration-300 md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              LinkForge AI
            </span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {user?.fullName?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
        />
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TOP NAVBAR (Desktop) */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-zinc-950 border-b border-white/5 z-10">
          <div>
            <h1 className="text-xl font-semibold text-white">
              {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">Welcome back, {user?.fullName}.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {location.pathname !== '/dashboard' && (
              <button
                onClick={() => navigate('/dashboard', { state: { openNewModal: true } })}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-95 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/15 transition-all"
              >
                <Plus className="w-4 h-4" />
                Shorten Link
              </button>
            )}
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
