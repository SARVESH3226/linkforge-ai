import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Link2, 
  ArrowRight, 
  BarChart3, 
  QrCode, 
  ShieldCheck, 
  Zap
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export function Landing() {
  const navigate = useNavigate();
  const [longUrl, setLongUrl] = useState('');
  const [mockShortened, setMockShortened] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMockShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;
    setIsShortening(true);
    setTimeout(() => {
      setIsShortening(false);
      // Generate a nice simulated shortcode matching the product domain
      const codes = ['xk9F2', 'LfA89', 'shR12', 'opt45'];
      const code = codes[Math.floor(Math.random() * codes.length)];
      setMockShortened(`https://linkforge.ai/${code}`);
    }, 850);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mockShortened);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans overflow-hidden grid-bg relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Glow effects */}
      <div className="glow-blur w-[600px] h-[600px] bg-indigo-600/10 top-[-200px] left-[-200px]" />
      <div className="glow-blur w-[500px] h-[500px] bg-purple-600/10 bottom-[-100px] right-[-100px]" />

      {/* FLOATING HEADER */}
      <header className="fixed top-4 inset-x-4 max-w-5xl mx-auto z-50 glass-panel border border-white/5 rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <Link2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white font-sans tracking-wide">LinkForge AI</span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-all px-3 py-1.5"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/15"
          >
            Sign Up <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-semibold tracking-wide mb-6"
        >
          <Zap className="w-3.5 h-3.5 fill-indigo-400/20" /> Next Gen Link Optimizer
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white max-w-4xl"
        >
          Create.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Track.
          </span>{' '}
          Optimize.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-zinc-400 md:text-lg max-w-2xl leading-relaxed font-sans font-normal"
        >
          Build custom shortlinks, compile real-time browser & country analytics, and run optimization scripts. The ultimate developer URL management service.
        </motion.p>

        {/* Shortener Preview Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 w-full max-w-2xl p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl relative"
        >
          <div className="absolute top-0 right-10 translate-y-[-50%] bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-white/10 shadow-lg">
            Demo Portal
          </div>
          <form onSubmit={handleMockShorten} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Link2 className="w-5 h-5 text-zinc-500 absolute left-4 top-[50%] translate-y-[-50%]" />
              <input
                type="text"
                placeholder="Paste a long URL (e.g. https://amazon.in/electronics/phones/very-long-id)"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={isShortening || !longUrl}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              {isShortening ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Shortening...
                </>
              ) : (
                'Shorten Link'
              )}
            </button>
          </form>

          {/* Shortened Output Display */}
          {mockShortened && (
            <div className="mt-5 p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between animate-fadeIn text-sm">
              <span className="font-mono text-indigo-400 select-all font-medium truncate pr-4">{mockShortened}</span>
              <button
                onClick={copyToClipboard}
                type="button"
                className={`
                  px-4 py-2 rounded-lg text-xs font-semibold transition-all border
                  ${copied 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10'}
                `}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* CORE FEATURES LIST SECTION */}
      <section className="py-20 px-6 max-w-5xl mx-auto z-10 relative">
        <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-wider text-center mb-16">
          Equipped with Premium SaaS Capabilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Detailed Analytics</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Track timestamps, device classifications, browsers, operating systems, referrers, and city/country locations on every redirect.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card relative">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">QR Code Generator</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Instantly create beautiful vector SVG QR codes for every shortened link to support printing and cross-device marketing campaigns.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Security Hardening</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Equipped with JWT sessions, IP hashing, CORS gates, Helmet middlewares, rate limits, and cryptographic link encoders.
            </p>
          </div>
        </div>
      </section>

      {/* SECONDARY PROMO CALLOUT */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center z-10 relative">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-b from-zinc-900/50 to-zinc-950/80 border border-white/5 flex flex-col items-center">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white">
            Ready to track your marketing campaigns?
          </h2>
          <p className="text-zinc-400 text-sm md:text-base mt-4 max-w-lg">
            Create an account in less than 30 seconds and start generating secure, optimized shortlinks.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-95 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2"
          >
            Create Account <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6 text-center text-zinc-600 text-sm">
        <p>&copy; {new Date().getFullYear()} LinkForge AI. Build for hackathon campaign.</p>
        <p className="mt-2 text-zinc-500 text-xs">
          This project is a part of a hackathon run by <a href="https://katomaran.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://katomaran.com</a>
        </p>
      </footer>
    </div>
  );
}
