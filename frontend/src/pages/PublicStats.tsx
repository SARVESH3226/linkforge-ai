import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Clock, 
  ExternalLink,
  Link2
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export function PublicStats() {
  const { code } = useParams<{ code: string }>();
  const [stats, setStats] = useState<any | null>(null);
  const [linkDetails, setLinkDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicStats() {
      if (!code) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/analytics/public/${code}`);
        if (res.success) {
          setStats(res.data.stats);
          setLinkDetails(res.data.link);
        } else {
          setError('Public statistics could not be loaded.');
        }
      } catch (err: any) {
        setError(err.message || 'The requested link details could not be found or are restricted.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPublicStats();
  }, [code]);

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans grid-bg relative py-12 px-6 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Decorative Blur Blobs */}
      <div className="glow-blur w-[400px] h-[400px] bg-indigo-600/10 top-[-100px] left-[-100px]" style={{ filter: 'blur(120px)' }} />
      <div className="glow-blur w-[400px] h-[400px] bg-purple-600/5 bottom-[-100px] right-[-100px]" style={{ filter: 'blur(120px)' }} />

      {/* HEADER NAVBAR */}
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-12 relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <Link2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-white tracking-wide">LinkForge AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/login"
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-all bg-white/5 border border-white/10 px-3.5 py-2 rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <main className="max-w-4xl mx-auto z-10 relative">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 bg-zinc-900/40 rounded-2xl border border-white/5" />
            <div className="h-80 bg-zinc-900/40 rounded-2xl border border-white/5" />
          </div>
        ) : error ? (
          <div className="p-8 text-center border border-rose-500/20 rounded-2xl bg-rose-500/5 max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">Stats unavailable</h3>
            <p className="text-zinc-400 text-sm">{error}</p>
            <Link to="/" className="inline-block px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg border border-white/5">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Header Card detailing link info */}
            <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Public Campaign Report</span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  /{linkDetails.shortCode} <span className="text-zinc-500 text-xs font-normal">stats</span>
                </h2>
                <a 
                  href={linkDetails.originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-400 hover:underline text-xs flex items-center gap-1 font-mono max-w-md truncate"
                >
                  {linkDetails.originalUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Total clicks counter widget */}
              <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
                <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Total Clicks</span>
                <span className="text-2xl font-extrabold text-white">{stats.totalClicks}</span>
              </div>
            </div>

            {/* 2. Timeline graph */}
            <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-md space-y-4">
              <div>
                <h4 className="font-bold text-base text-white">Analytics Traffic over time</h4>
                <p className="text-xs text-zinc-500">Timeline of visits recorded on this shortened link.</p>
              </div>

              <div className="h-72 w-full pt-4">
                {stats.timeline.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                    No timeline visits registered yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.timeline}>
                      <defs>
                        <linearGradient id="colorClicksPublic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Area type="monotone" dataKey="clicks" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorClicksPublic)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/5 py-8 text-center text-zinc-600 text-xs">
        <p>&copy; {new Date().getFullYear()} LinkForge AI. Open Analytics Gateway. Part of Katomaran Hackathon.</p>
      </footer>
    </div>
  );
}
