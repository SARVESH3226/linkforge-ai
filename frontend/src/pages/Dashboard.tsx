import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Link, Category } from '../types';
import { 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  BarChart3, 
  QrCode, 
  Star, 
  Archive, 
  Download, 
  Upload, 
  X, 
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Users,
  MousePointerClick
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State variables
  const [links, setLinks] = useState<Link[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalLinks, setTotalLinks] = useState(0);
  const [globalStats, setGlobalStats] = useState<{ totalClicks: number; uniqueVisitors: number } | null>(null);
  
  // Search, Filter, Pagination, Sort
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterActive] = useState<boolean | undefined>(undefined);
  const [filterArchived, setFilterArchived] = useState<boolean>(false);
  const [filterFavorite, setFilterFavorite] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'originalUrl' | 'shortCode'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8);

  // Modals & Action variables
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Inputs
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkCategoryId, setLinkCategoryId] = useState('');
  const [linkExpiresAt, setLinkExpiresAt] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV bulk state
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvImportResult, setCsvImportResult] = useState<any | null>(null);

  // Trigger Create modal from router state (e.g. redirected from top header "Create Link")
  useEffect(() => {
    if (location.state && (location.state as any).openNewModal) {
      setIsCreateModalOpen(true);
      // Clean router state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch Links and Categories
  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      let queryParams = `page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (search) queryParams += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) queryParams += `&categoryId=${selectedCategory}`;
      if (filterActive !== undefined) queryParams += `&isActive=${filterActive}`;
      if (filterArchived !== undefined) queryParams += `&isArchived=${filterArchived}`;
      if (filterFavorite) queryParams += `&isFavorite=true`;

      const res = await api.get(`/links?${queryParams}`);
      if (res.success) {
        setLinks(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalLinks(res.pagination.total || 0);
        }
      }
    } catch (err: any) {
      console.error('Error fetching links:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const res = await api.get('/analytics?period=all');
      if (res.success) {
        setGlobalStats({
          totalClicks: res.data.totalClicks || 0,
          uniqueVisitors: res.data.uniqueVisitors || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching global stats:', err);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [page, search, selectedCategory, filterActive, filterArchived, filterFavorite, sortBy, sortOrder]);

  useEffect(() => {
    fetchCategories();
    fetchGlobalStats();
  }, []);

  // Actions
  const handleCopy = (id: string, code: string) => {
    // Redirect goes to backend, which redirects. So copy backend redirection endpoint
    const redirectUrl = `http://localhost:5000/${code}`;
    navigator.clipboard.writeText(redirectUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = async (link: Link) => {
    try {
      const res = await api.post(`/links/${link.id}/favorite`);
      if (res.success) {
        // Toggle locally
        setLinks(links.map(l => {
          if (l.id === link.id) {
            const hasFav = l.favorites.length > 0;
            return {
              ...l,
              favorites: hasFav ? [] : [{ id: 'temp' }]
            };
          }
          return l;
        }));
      }
    } catch (err) {
      console.error('Error favoriting link:', err);
    }
  };

  const handleToggleArchive = async (link: Link) => {
    try {
      const res = await api.put(`/links/${link.id}`, { isArchived: !link.isArchived });
      if (res.success) {
        setLinks(links.map(l => (l.id === link.id ? { ...l, isArchived: res.data.isArchived } : l)));
        fetchLinks(); // Refetch to filter out archived if toggled
      }
    } catch (err) {
      console.error('Error archiving link:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      const res = await api.delete(`/links/${id}`);
      if (res.success) {
        setLinks(links.filter(l => l.id !== id));
        fetchLinks();
        fetchGlobalStats();
      }
    } catch (err) {
      console.error('Error deleting link:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const body = {
        originalUrl,
        customAlias: customAlias || undefined,
        categoryId: linkCategoryId || null,
        expiresAt: linkExpiresAt ? new Date(linkExpiresAt).toISOString() : null,
      };

      const res = await api.post('/links', body);
      if (res.success) {
        setIsCreateModalOpen(false);
        // Reset form
        setOriginalUrl('');
        setCustomAlias('');
        setLinkCategoryId('');
        setLinkExpiresAt('');
        
        // Confetti explosion
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });

        fetchLinks();
        fetchGlobalStats();
      }
    } catch (err: any) {
      setFormError(err.message || 'Validation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (link: Link) => {
    setSelectedLink(link);
    setOriginalUrl(link.originalUrl);
    setLinkTitle(link.title || '');
    setLinkDescription(link.description || '');
    setLinkCategoryId(link.categoryId || '');
    setLinkExpiresAt(link.expiresAt ? new Date(link.expiresAt).toISOString().split('T')[0] : '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLink) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const body = {
        originalUrl,
        title: linkTitle || null,
        description: linkDescription || null,
        categoryId: linkCategoryId || null,
        expiresAt: linkExpiresAt ? new Date(linkExpiresAt).toISOString() : null,
      };

      const res = await api.put(`/links/${selectedLink.id}`, body);
      if (res.success) {
        setIsEditModalOpen(false);
        setSelectedLink(null);
        fetchLinks();
      }
    } catch (err: any) {
      setFormError(err.message || 'Edit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV actions
  const handleExportCSV = async () => {
    try {
      const csvText = (await api.get('/links/export')) as unknown as string;
      
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `linkforge_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText) return;
    setIsSubmitting(true);
    setCsvImportResult(null);

    try {
      const res = await api.post('/links/import', { csvText });
      if (res.success) {
        setCsvImportResult(res.data);
        setCsvText('');
        fetchLinks();
        fetchGlobalStats();
      }
    } catch (err: any) {
      setFormError(err.message || 'CSV Import failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQrCode = (code: string) => {
    const svg = document.getElementById(`qr-${code}`);
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const trigger = document.createElement('a');
    trigger.href = url;
    trigger.download = `qr_${code}.svg`;
    document.body.appendChild(trigger);
    trigger.click();
    document.body.removeChild(trigger);
  };

  return (
    <div className="space-y-6">
      {/* Top dashboard metric cards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Your Shortlinks</h2>
          <p className="text-zinc-500 text-sm">Create, share, and track all your custom URLs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-300 text-sm font-medium rounded-lg transition-all"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-300 text-sm font-medium rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={() => {
              setOriginalUrl('');
              setCustomAlias('');
              setLinkCategoryId('');
              setLinkExpiresAt('');
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Link
          </button>
        </div>
      </div>

      {/* GLOBAL METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Links Card */}
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between group hover:border-indigo-500/20 transition-all duration-300">
          <div className="space-y-1.5">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Shortlinks</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{totalLinks}</h3>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Total Clickthroughs Card */}
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between group hover:border-purple-500/20 transition-all duration-300">
          <div className="space-y-1.5">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Clickthroughs</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{globalStats?.totalClicks ?? 0}</h3>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform duration-300">
            <MousePointerClick className="w-5 h-5" />
          </div>
        </div>

        {/* Unique Visitors Card */}
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md flex items-center justify-between group hover:border-emerald-500/20 transition-all duration-300">
          <div className="space-y-1.5">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Unique Visitors</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{globalStats?.uniqueVisitors ?? 0}</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH, SORT, FILTER CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-[50%] translate-y-[-50%]" />
          <input
            type="text"
            placeholder="Search original links, short alias, titles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-sans"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-black/40 text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort order options */}
        <div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
              setPage(1);
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-black/40 text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
          >
            <option value="createdAt-desc">Newest Created</option>
            <option value="createdAt-asc">Oldest Created</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="originalUrl-asc">Original URL (A-Z)</option>
            <option value="shortCode-asc">Short Code (A-Z)</option>
          </select>
        </div>
      </div>

      {/* FILTER BUTTON TABS */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setFilterArchived(false);
            setFilterFavorite(false);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            !filterArchived && !filterFavorite
              ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30'
              : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
          }`}
        >
          Active Links
        </button>
        <button
          onClick={() => {
            setFilterArchived(true);
            setFilterFavorite(false);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            filterArchived && !filterFavorite
              ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30'
              : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
          }`}
        >
          Archived Links
        </button>
        <button
          onClick={() => {
            setFilterFavorite(true);
            setFilterArchived(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            filterFavorite
              ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30'
              : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" /> Favorites
        </button>
      </div>

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-zinc-800 rounded-lg" />
                <div className="h-6 w-16 bg-zinc-800 rounded-lg" />
              </div>
              <div className="h-4 w-3/4 bg-zinc-800 rounded-lg" />
              <div className="h-4 w-1/2 bg-zinc-800 rounded-lg" />
              <div className="flex justify-between pt-4 border-t border-white/5">
                <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
                <div className="h-8 w-8 bg-zinc-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : links.length === 0 ? (
        /* EMPTY STATE */
        <div className="p-16 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/10 backdrop-blur-md max-w-lg mx-auto space-y-4">
          <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="font-bold text-lg text-white">No shortlinks found</h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            Get started by creating your very first trackable shortened link or import a set from a CSV template sheet.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold rounded-lg"
          >
            Create link
          </button>
        </div>
      ) : (
        /* LINKS GRID LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => {
            const isFav = link.favorites && link.favorites.length > 0;
            const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
            
            return (
              <div
                key={link.id}
                className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md hover:border-white/10 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    {/* Title */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-white group-hover:text-indigo-400 transition-colors truncate max-w-xs">
                        {link.title || link.shortCode}
                      </h4>
                      {link.description && (
                        <p className="text-zinc-500 text-xs line-clamp-1">{link.description}</p>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1.5">
                      {link.category && (
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                          style={{
                            color: link.category.color,
                            borderColor: `${link.category.color}40`,
                            backgroundColor: `${link.category.color}10`,
                          }}
                        >
                          {link.category.name}
                        </span>
                      )}
                      
                      {isExpired ? (
                        <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded">
                          Expired
                        </span>
                      ) : link.isArchived ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded">
                          Archived
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* URLs display */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-mono text-zinc-300 font-semibold truncate select-all">
                        http://localhost:5000/{link.shortCode}
                      </span>
                      <button
                        onClick={() => handleCopy(link.id, link.shortCode)}
                        className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                        title="Copy short link"
                      >
                        {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    
                    <p className="text-zinc-500 text-xs font-mono truncate max-w-sm" title={link.originalUrl}>
                      {link.originalUrl}
                    </p>
                  </div>
                </div>

                {/* Footer details & action bar */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <div>
                      Clicks: <span className="font-bold text-zinc-300">{link._count?.analytics || 0}</span>
                    </div>
                    <div>
                      {new Date(link.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleFavorite(link)}
                      className={`p-2 rounded-lg border transition-colors ${
                        isFav 
                          ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400' 
                          : 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                      title={isFav ? 'Remove Favorite' : 'Mark Favorite'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => handleToggleArchive(link)}
                      className={`p-2 rounded-lg border transition-colors ${
                        link.isArchived 
                          ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' 
                          : 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                      title={link.isArchived ? 'Unarchive Link' : 'Archive Link'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedLink(link);
                        setIsQrModalOpen(true);
                      }}
                      className="p-2 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white transition-colors"
                      title="QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigate(`/analytics`, { state: { linkId: link.id, shortCode: link.shortCode } })}
                      className="p-2 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white transition-colors"
                      title="View Analytics"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleEditClick(link)}
                      className="p-2 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white transition-colors"
                      title="Edit link"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 rounded-lg border border-transparent hover:border-rose-500/30 bg-white/5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-zinc-400 px-4">
            Page <span className="font-semibold text-white">{page}</span> of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div onClick={() => setIsCreateModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Dialog Panel */}
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl relative z-10 animate-scaleUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Shorten new URL</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Destination URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/very-long-campaign-link"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all text-sm font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Custom Alias (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. promo-2026"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all text-sm font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Dropdown */}
                <div className="space-y-1">
                  <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Category Folder</label>
                  <select
                    value={linkCategoryId}
                    onChange={(e) => setLinkCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-black/40 text-zinc-300 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expiration Date */}
                <div className="space-y-1">
                  <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Expiration Date</label>
                  <input
                    type="date"
                    value={linkExpiresAt}
                    onChange={(e) => setLinkExpiresAt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-black/40 text-zinc-300 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 mt-6"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Generate Short Link'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsEditModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl relative z-10 animate-scaleUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Edit shortlink</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Destination URL</label>
                <input
                  type="text"
                  required
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Link Title</label>
                <input
                  type="text"
                  placeholder="e.g. Documentation checkout redirect"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Description</label>
                <textarea
                  placeholder="Enter custom context or comments..."
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm h-20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Category Folder</label>
                  <select
                    value={linkCategoryId}
                    onChange={(e) => setLinkCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-black/40 text-zinc-300 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Expiration Date</label>
                  <input
                    type="date"
                    value={linkExpiresAt}
                    onChange={(e) => setLinkExpiresAt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-black/40 text-zinc-300 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-95 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center shadow-lg mt-6"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {isQrModalOpen && selectedLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsQrModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="w-full max-w-sm p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl relative z-10 animate-scaleUp text-center flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-4">
              <h3 className="font-bold text-lg text-white">QR Code Generator</h3>
              <button onClick={() => setIsQrModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg border border-white/10 mt-4">
              <QRCodeSVG
                id={`qr-${selectedLink.shortCode}`}
                value={`http://localhost:5000/${selectedLink.shortCode}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-zinc-400 text-xs mt-4">
              Scans redirect instantly to:<br />
              <span className="font-semibold text-white font-mono break-all">http://localhost:5000/{selectedLink.shortCode}</span>
            </p>

            <button
              onClick={() => downloadQrCode(selectedLink.shortCode)}
              className="w-full mt-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-95 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" /> Download SVG Vector
            </button>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {isCsvImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCsvImportOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl relative z-10 animate-scaleUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Bulk Import Links</h3>
              <button onClick={() => {
                setIsCsvImportOpen(false);
                setCsvImportResult(null);
                setFormError(null);
              }} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {formError}
              </div>
            )}

            {csvImportResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
                  <Check className="w-5 h-5" />
                  <span>Successfully imported <span className="font-bold">{csvImportResult.imported}</span> links.</span>
                </div>

                {csvImportResult.failures.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-wide">Failed Import Rows</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                      {csvImportResult.failures.map((fail: any, idx: number) => (
                        <div key={idx} className="p-2 rounded bg-zinc-950 border border-white/5 text-xs">
                          <p className="font-semibold text-rose-400">Row {fail.row}: {fail.reason}</p>
                          <p className="text-zinc-500 truncate">{fail.url}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsCsvImportOpen(false);
                    setCsvImportResult(null);
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-sm border border-white/5 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleImportCSV} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">CSV Sheet Content</label>
                    <button
                      type="button"
                      onClick={() => {
                        setCsvText(`Original URL,Custom Alias,Category ID\nhttps://google.com,google-search,\nhttps://github.com/trending,github-trending,\n`);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold"
                    >
                      Load Template Sample
                    </button>
                  </div>
                  <textarea
                    required
                    placeholder="originalUrl,customAlias,categoryId&#10;https://google.com,goog,&#10;https://vercel.com,v-dash,..."
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    className="w-full h-44 px-4 py-3 rounded-lg border border-white/5 bg-black/40 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !csvText}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-95 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Start Bulk Import
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
