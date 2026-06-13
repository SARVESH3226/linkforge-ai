import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import type { Link, AnalyticsStats } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  BarChart3, 
  Clock, 
  Users, 
  MousePointerClick, 
  Filter, 
  Globe2,
  Smartphone,
  Laptop
} from 'lucide-react';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export function Analytics() {
  const location = useLocation();
  const routeState = location.state as { linkId?: string; shortCode?: string } | null;

  // Filters
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string>(routeState?.linkId || '');
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  
  // Dashboard Analytics Data
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all user links to populate dropdown
  useEffect(() => {
    async function fetchUserLinks() {
      try {
        const res = await api.get('/links?limit=100');
        if (res.success) {
          setLinks(res.data);
        }
      } catch (err) {
        console.error('Failed to load filter links:', err);
      }
    }
    fetchUserLinks();
  }, []);

  // Fetch stats based on active filters
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      let endpoint = '/analytics';
      if (selectedLinkId) {
        endpoint = `/analytics/link/${selectedLinkId}`;
      }
      
      const res = await api.get(`${endpoint}?period=${period}`);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedLinkId, period]);

  // Handle link selection switch
  const handleLinkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLinkId(e.target.value);
  };

  const getActiveCode = () => {
    if (!selectedLinkId) return 'All Shortlinks';
    const found = links.find((l) => l.id === selectedLinkId);
    return found ? `/${found.shortCode}` : 'Selected Link';
  };

  return (
    <div className="space-y-6">
      {/* FILTER PANEL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={selectedLinkId}
            onChange={handleLinkChange}
            className="flex-1 sm:w-64 px-3 py-2 rounded-lg border border-white/5 bg-black/40 text-zinc-300 focus:outline-none focus:border-indigo-500 transition-all text-sm"
          >
            <option value="">All Links Overview</option>
            {links.map((link) => (
              <option key={link.id} value={link.id}>
                /{link.shortCode} - {link.title || link.originalUrl.substring(0, 30)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['24h', '7d', '30d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all shrink-0
                ${period === p
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30'
                  : 'bg-black/20 border-white/5 text-zinc-400 hover:text-white'}
              `}
            >
              {p === 'all' ? 'All time' : p}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md h-28 animate-pulse" />
            ))}
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md h-80 animate-pulse" />
        </div>
      ) : !stats || stats.totalClicks === 0 ? (
        /* EMPTY STATE */
        <div className="p-16 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/10 backdrop-blur-md max-w-lg mx-auto space-y-4">
          <BarChart3 className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="font-bold text-lg text-white">No traffic recorded</h3>
          <p className="text-zinc-500 text-sm">
            {selectedLinkId 
              ? `Shortlink ${getActiveCode()} hasn't received any clicks during the selected period.`
              : "None of your shortened URLs have received traffic yet. Share them on social channels or newsletters to see charts build."}
          </p>
        </div>
      ) : (
        /* METRIC CARDS AND CHARTS */
        <div className="space-y-6">
          {/* 1. Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total clicks */}
            <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Clickthroughs</p>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{stats.totalClicks}</h3>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <MousePointerClick className="w-5 h-5" />
              </div>
            </div>

            {/* Unique visitors */}
            <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Unique Visitors</p>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{stats.uniqueVisitors}</h3>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Last Visited */}
            <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Last Interaction</p>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {stats.lastVisited 
                    ? new Date(stats.lastVisited).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'No visits'}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 2. Timeline Area Chart */}
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md space-y-4">
            <div>
              <h4 className="font-bold text-base text-white">Click Traffic Trend</h4>
              <p className="text-xs text-zinc-500">Visual trend showing redirects over the selected timeline.</p>
            </div>
            
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.timeline}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorClicks)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Devices breakdown */}
            <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md flex flex-col justify-between h-80">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-zinc-400" /> Device Types
                </h4>
              </div>
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.devices}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.devices.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend checklist */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                {stats.devices.map((d, index) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-zinc-400">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                    />
                    <span>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browsers breakdown */}
            <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md flex flex-col justify-between h-80">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-zinc-400" /> Browsers
                </h4>
              </div>
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.browsers}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.browsers.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                {stats.browsers.map((b, index) => (
                  <div key={b.name} className="flex items-center gap-1.5 text-zinc-400">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                    />
                    <span>{b.name} ({b.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Countries breakdown */}
            <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md flex flex-col justify-between h-80">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-zinc-400" /> Top Countries
                </h4>
              </div>
              
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.countries} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#71717a" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                      width={70} 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 4. Recent Visits Table */}
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md space-y-4">
            <div>
              <h4 className="font-bold text-base text-white">Recent Redirect Activity</h4>
              <p className="text-xs text-zinc-500">Real-time log of the latest redirects registered by visitors.</p>
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 text-zinc-400 text-xs font-semibold border-b border-white/5">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Short Link</th>
                    <th className="p-4">Country & City</th>
                    <th className="p-4">Device</th>
                    <th className="p-4">Platform (OS/Browser)</th>
                    <th className="p-4">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-zinc-300 font-mono text-xs">
                        {new Date(visit.timestamp).toLocaleString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="p-4 font-semibold text-indigo-400">
                        /{visit.link?.shortCode}
                      </td>
                      <td className="p-4 text-zinc-300">
                        {visit.country || 'Unknown'} {visit.city ? `(${visit.city})` : ''}
                      </td>
                      <td className="p-4 text-zinc-300">
                        {visit.device}
                      </td>
                      <td className="p-4 text-zinc-400 text-xs">
                        {visit.os} • {visit.browser.split(' ')[0]}
                      </td>
                      <td className="p-4 text-zinc-500 text-xs max-w-xs truncate" title={visit.referrer || 'Direct'}>
                        {visit.referrer || 'Direct'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
