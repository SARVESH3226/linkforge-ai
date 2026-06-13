import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/auth';
import { api } from '../services/api';
import { AlertCircle, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await api.post('/auth/login', values);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        navigate('/dashboard');
      } else {
        setErrorMessage('Failed to sign in. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
          Sign in to LinkForge AI
        </h2>
        <p className="text-zinc-400 text-sm">
          Enter your email and password to access your dashboard.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-[50%] translate-y-[-50%]" />
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={`
                w-full pl-11 pr-4 py-3 rounded-xl border bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm
                ${errors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/5 focus:border-indigo-500/50'}
              `}
            />
          </div>
          {errors.email && (
            <p className="text-rose-400 text-xs mt-1 animate-slideDown">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider" htmlFor="password">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-[50%] translate-y-[-50%]" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`
                w-full pl-11 pr-11 py-3 rounded-xl border bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm
                ${errors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/5 focus:border-indigo-500/50'}
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[50%] translate-y-[-50%] text-zinc-500 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-rose-400 text-xs mt-1 animate-slideDown">{errors.password.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-98 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-600/10"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-zinc-500 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
