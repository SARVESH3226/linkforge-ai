import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Category } from '../types';
import { 
  Plus, 
  FolderPlus, 
  Trash2, 
  FolderHeart, 
  Check, 
  X, 
  Edit2
} from 'lucide-react';

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#a855f7', // Purple
];

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await api.post('/categories', { name, color });
      if (res.success) {
        setName('');
        setColor(PRESET_COLORS[0]);
        fetchCategories();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const res = await api.put(`/categories/${id}`, { name: editName, color: editColor });
      if (res.success) {
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All links inside will be set to Uncategorized.')) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.success) {
        setCategories(categories.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 1. Category Form Panel */}
      <div className="lg:col-span-1 p-6 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-md h-fit space-y-6">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-indigo-400" /> Create Category
          </h3>
          <p className="text-zinc-500 text-xs mt-1">Group shortened links into tag folders.</p>
        </div>

        {formError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Category Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Newsletter Links"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-white/5 bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Theme Color</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className="w-full h-9 rounded-lg border transition-all relative flex items-center justify-center hover:scale-105"
                  style={{ backgroundColor: preset, borderColor: color === preset ? '#ffffff' : 'rgba(255,255,255,0.05)' }}
                  title={preset}
                >
                  {color === preset && (
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 active:scale-95 disabled:opacity-40 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg mt-4"
          >
            <Plus className="w-4 h-4" /> Save Category
          </button>
        </form>
      </div>

      {/* 2. Categories List Display */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-bold text-lg text-white">Active Categories ({categories.length})</h3>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md h-24 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/10 backdrop-blur-md space-y-4">
            <FolderHeart className="w-12 h-12 text-zinc-600 mx-auto" />
            <h4 className="font-bold text-base text-white">No categories found</h4>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">
              Create folder tags on the left to group and filter your shortlinks.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
            {categories.map((cat) => {
              const isEditing = editingCategory?.id === cat.id;

              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md hover:border-white/10 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-4">
                    {isEditing ? (
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white text-sm"
                        />
                        {/* Preset Edit Color Selection */}
                        <div className="flex gap-1 overflow-x-auto py-1">
                          {PRESET_COLORS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setEditColor(preset)}
                              className="w-6 h-6 rounded-full shrink-0 border relative"
                              style={{ backgroundColor: preset, borderColor: editColor === preset ? '#fff' : 'transparent' }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full shrink-0 shadow-inner" 
                          style={{ backgroundColor: cat.color }} 
                        />
                        <h4 className="font-bold text-sm text-white truncate max-w-[160px]" title={cat.name}>
                          {cat.name}
                        </h4>
                      </div>
                    )}

                    {/* Links Counter Badge */}
                    {!isEditing && (
                      <span className="px-2 py-0.5 bg-white/5 text-zinc-400 text-[10px] font-bold rounded">
                        {cat._count?.links || 0} Links
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-end gap-1.5">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-1.5 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          className="p-1.5 rounded hover:bg-indigo-500/10 text-indigo-400 transition-colors"
                          title="Save Changes"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditName(cat.name);
                            setEditColor(cat.color);
                          }}
                          className="p-1.5 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
