import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { api } from '../services/api';
import { 
  User as UserIcon, 
  Lock, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

export function Settings() {
  const { user, setUser } = useAuthStore();
  
  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notice overlays
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setIsProfileSubmitting(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await api.put('/auth/profile', { fullName });
      if (res.success) {
        setProfileSuccess(true);
        if (user) {
          setUser({ ...user, fullName: res.data.fullName });
        }
      }
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile settings.');
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setIsPasswordSubmitting(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const res = await api.put('/auth/profile/password', { currentPassword, newPassword });
      if (res.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. Edit profile metadata */}
      <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-md h-fit space-y-6">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-400" /> Account Settings
          </h3>
          <p className="text-zinc-500 text-xs mt-1">Manage your account profile fields.</p>
        </div>

        {profileSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Profile name updated successfully.</span>
          </div>
        )}

        {profileError && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-1">
            <label className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">Registered Email</label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-zinc-950 text-zinc-500 cursor-not-allowed text-sm font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Display Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={isProfileSubmitting || fullName === user?.fullName}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white font-semibold rounded-lg text-sm transition-all"
          >
            {isProfileSubmitting ? 'Updating...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* 2. Change password */}
      <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-md h-fit space-y-6">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" /> Security Settings
          </h3>
          <p className="text-zinc-500 text-xs mt-1">Adjust your password credentials regularly.</p>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Password updated successfully.</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Current Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">New Password</label>
            <input
              type="password"
              required
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPasswordSubmitting || !currentPassword || !newPassword || !confirmPassword}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white font-semibold rounded-lg text-sm transition-all"
          >
            {isPasswordSubmitting ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
