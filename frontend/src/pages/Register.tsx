import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/auth';
import { api } from '../services/api';
import { AlertCircle, ArrowRight, Mail, Lock, User as UserIcon } from 'lucide-react';

const registerFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await api.post('/auth/register', values);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        navigate('/dashboard');
      } else {
        setErrorMessage('Failed to create account. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
          Create your account
        </h2>
        <p className="text-zinc-400 text-sm">
          Join LinkForge AI to manage and optimize your shortlinks.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider" htmlFor="fullName">
            Full Name
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-zinc-500 absolute left-4 top-[50%] translate-y-[-50%]" />
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              {...register('fullName')}
              className={`
                w-full pl-11 pr-4 py-3 rounded-xl border bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm
                ${errors.fullName ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/5 focus:border-indigo-500/50'}
              `}
            />
          </div>
          {errors.fullName && (
            <p className="text-rose-400 text-xs mt-1 animate-slideDown">{errors.fullName.message}</p>
          )}
        </div>

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
          <label className="text-zinc-300 text-xs font-semibold uppercase tracking-wider" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-[50%] translate-y-[-50%]" />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`
                w-full pl-11 pr-4 py-3 rounded-xl border bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-sm
                ${errors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/5 focus:border-indigo-500/50'}
              `}
            />
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
              Sign Up <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-zinc-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
