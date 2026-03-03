import { useState } from 'react';
import {
  Globe,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { apiCall } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

export default function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang as 'de' | 'en');
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiCall('delete-account');
      await signOut();
      navigate('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {t.settings?.title ?? 'Settings'}
        </h1>
        <p className="text-slate-500 mt-1">
          {t.settings?.subtitle ?? 'Manage your account preferences'}
        </p>
      </div>

      {/* Language */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">
            {t.settings?.language ?? 'Language'}
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleLanguageChange('de')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              lang === 'de'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            Deutsch
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              lang === 'en'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-800">
            {t.settings?.deleteAccount ?? 'Delete Account'}
          </h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          {t.settings?.deleteAccountDesc ??
            'Once you delete your account, all of your data will be permanently removed. This action cannot be undone.'}
        </p>

        {deleteError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {deleteError}
          </div>
        )}

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
            {t.settings?.deleteMyAccount ?? 'Delete My Account'}
          </button>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">
                {t.settings?.deleteConfirmTitle ??
                  'Are you absolutely sure?'}
              </p>
            </div>
            <p className="text-xs text-red-600">
              {t.settings?.deleteConfirmDesc ??
                'Type DELETE to confirm account deletion.'}
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="DELETE"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteText !== 'DELETE' || deleting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {deleting ? (
                  <Spinner size="sm" />
                ) : (
                  t.settings?.confirmDelete ?? 'Permanently Delete'
                )}
              </button>
              <button
                onClick={() => {
                  setDeleteConfirm(false);
                  setDeleteText('');
                }}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg transition text-sm"
              >
                {t.settings?.cancel ?? 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
