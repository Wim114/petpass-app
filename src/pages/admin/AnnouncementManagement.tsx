import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Image,
  AlertCircle,
  CheckCircle2,
  Megaphone,
  X,
  LayoutTemplate,
  Square,
  Sparkles,
} from 'lucide-react';
import { apiCall } from '@/lib/api';
import type { Announcement, AnnouncementStyle } from '@/types';

const STYLE_OPTIONS: { value: AnnouncementStyle; label: string; description: string; icon: typeof LayoutTemplate }[] = [
  { value: 'banner', label: 'Banner', description: 'Full-width bar at the top', icon: LayoutTemplate },
  { value: 'card', label: 'Card', description: 'Contained card with image', icon: Square },
  { value: 'spotlight', label: 'Spotlight', description: 'Bold hero-style highlight', icon: Sparkles },
];

const STYLE_PREVIEW_CLASSES: Record<AnnouncementStyle, string> = {
  banner: 'border-blue-300 bg-blue-50',
  card: 'border-emerald-300 bg-emerald-50',
  spotlight: 'border-amber-300 bg-amber-50',
};

interface AnnouncementForm {
  title: string;
  body: string;
  image_url: string;
  style: AnnouncementStyle;
  enabled: boolean;
}

const EMPTY_FORM: AnnouncementForm = {
  title: '',
  body: '',
  image_url: '',
  style: 'banner',
  enabled: false,
};

export default function AnnouncementManagement() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: () =>
      apiCall<{ announcements: Announcement[] }>('announcements?admin=true', { method: 'GET' }),
  });

  const announcements = data?.announcements ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      apiCall('announcements', {
        method: 'POST',
        body: {
          title: form.title,
          body: form.body,
          image_url: form.image_url || null,
          style: form.style,
          enabled: form.enabled,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setForm(EMPTY_FORM);
      setShowForm(false);
      showToast('success', 'Announcement created successfully!');
    },
    onError: (err: Error) => showToast('error', err.message || 'Failed to create announcement.'),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      apiCall('announcements', {
        method: 'PUT',
        body: {
          id: editingId,
          title: form.title,
          body: form.body,
          image_url: form.image_url || null,
          style: form.style,
          enabled: form.enabled,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setEditingId(null);
      setForm(EMPTY_FORM);
      setShowForm(false);
      showToast('success', 'Announcement updated successfully!');
    },
    onError: (err: Error) => showToast('error', err.message || 'Failed to update announcement.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiCall(`announcements?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      showToast('success', 'Announcement deleted.');
    },
    onError: (err: Error) => showToast('error', err.message || 'Failed to delete announcement.'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiCall('announcements', { method: 'PUT', body: { id, enabled } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
    onError: (err: Error) => showToast('error', err.message || 'Failed to toggle announcement.'),
  });

  const startEditing = (a: Announcement) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      body: a.body,
      image_url: a.image_url ?? '',
      style: a.style,
      enabled: a.enabled,
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Announcements</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage announcements shown to members. Choose a style and toggle visibility.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY_FORM);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </h3>
            <button onClick={cancelForm} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Announcement title..."
                maxLength={200}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            {/* Body */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Content</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Write the announcement content..."
                rows={4}
                maxLength={5000}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <p className="mt-1 text-xs text-slate-400">{form.body.length}/5000</p>
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Image className="h-4 w-4" />
                  Image URL (optional)
                </span>
              </label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            {/* Style Selector */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Style</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, style: opt.value }))}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors ${
                      form.style === opt.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <opt.icon className="h-6 w-6" />
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-xs opacity-70">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enabled toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  form.enabled ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    form.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-slate-700">
                {form.enabled ? 'Visible to members' : 'Hidden (draft)'}
              </span>
            </div>

            {/* Preview */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Preview</label>
              <div className={`rounded-xl border-2 p-5 ${STYLE_PREVIEW_CLASSES[form.style]}`}>
                {form.style === 'banner' && (
                  <div className="flex items-center gap-4">
                    {form.image_url && (
                      <img
                        src={form.image_url}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div>
                      <p className="font-bold text-slate-900">{form.title || 'Announcement Title'}</p>
                      <p className="text-sm text-slate-600">{form.body || 'Announcement content goes here...'}</p>
                    </div>
                  </div>
                )}
                {form.style === 'card' && (
                  <div className="max-w-sm">
                    {form.image_url && (
                      <img
                        src={form.image_url}
                        alt=""
                        className="mb-3 h-40 w-full rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <h4 className="text-lg font-bold text-slate-900">{form.title || 'Announcement Title'}</h4>
                    <p className="mt-1 text-sm text-slate-600">{form.body || 'Announcement content goes here...'}</p>
                  </div>
                )}
                {form.style === 'spotlight' && (
                  <div className="text-center">
                    {form.image_url && (
                      <img
                        src={form.image_url}
                        alt=""
                        className="mx-auto mb-4 h-48 w-full max-w-md rounded-xl object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <h4 className="text-2xl font-black text-slate-900">{form.title || 'Announcement Title'}</h4>
                    <p className="mx-auto mt-2 max-w-lg text-slate-600">{form.body || 'Announcement content goes here...'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={cancelForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving || !form.title.trim() || !form.body.trim()}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : editingId ? 'Update Announcement' : 'Create Announcement'}
            </button>
          </div>
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
          <Megaphone className="mb-3 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-600">No announcements yet</h3>
          <p className="mt-1 text-sm text-slate-400">Create your first announcement to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border-2 bg-white p-5 shadow-sm transition-colors ${
                a.enabled ? 'border-emerald-200' : 'border-slate-200 opacity-75'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{a.title}</h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STYLE_PREVIEW_CLASSES[a.style]
                      }`}
                    >
                      {a.style}
                    </span>
                    {a.enabled ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <Eye className="h-3 w-3" /> Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{a.body}</p>
                  {a.image_url && (
                    <p className="mt-1 truncate text-xs text-slate-400">{a.image_url}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-400">
                    Created {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMutation.mutate({ id: a.id, enabled: !a.enabled })}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      a.enabled
                        ? 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {a.enabled ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {a.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => startEditing(a)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this announcement? This cannot be undone.')) {
                        deleteMutation.mutate(a.id);
                      }
                    }}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
