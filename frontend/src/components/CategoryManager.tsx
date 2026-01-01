"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createCategory, deleteCategory, type Category } from "@/lib/api";

interface CategoryManagerProps {
  categories: Category[];
  onUpdate: () => void;
  onError?: (message: string) => void;
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#14b8a6", "#06b6d4",
  "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
];

export default function CategoryManager({ categories, onUpdate, onError }: CategoryManagerProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError("Category name is required");
      return;
    }
    
    if (trimmedName.length > 60) {
      setError("Category name must be 60 characters or less");
      return;
    }
    
    // Check for duplicate
    if (categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError("A category with this name already exists");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const token = await getToken();
      if (!token) {
        onError?.("Authentication required");
        return;
      }

      await createCategory(token, { name: trimmedName, color });
      setName("");
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      onUpdate();
    } catch (err) {
      console.error("Error creating category:", err);
      onError?.("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Show confirmation first
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    try {
      setDeletingId(id);
      const token = await getToken();
      if (!token) {
        onError?.("Authentication required");
        return;
      }

      await deleteCategory(token, id);
      setConfirmDelete(null);
      onUpdate();
    } catch (err) {
      console.error("Error deleting category:", err);
      onError?.("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Create Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Name *
              <span className="text-slate-500 text-xs ml-1">({name.length}/60)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              maxLength={60}
              placeholder="e.g., Food, Transport, Entertainment"
              className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                error ? "border-red-500" : "border-slate-600"
              }`}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c
                      ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your Categories</h2>
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No categories yet</p>
            <p className="text-slate-500 text-sm mt-1">Create your first category above!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-white font-medium">{cat.name}</span>
                </div>

                {/* Delete Button with Confirmation */}
                {confirmDelete === cat.id ? (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="px-2 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === cat.id ? (
                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      ) : (
                        "Delete"
                      )}
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="px-2 py-1 rounded bg-slate-600 text-white text-xs hover:bg-slate-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete category"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
