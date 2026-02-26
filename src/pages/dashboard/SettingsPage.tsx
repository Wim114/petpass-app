import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Settings,
  Globe,
  Shield,
  Lock,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase';
import { apiCall } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const { updatePassword, signOut, profile, user, updateProfile, isLoading } =
    useAuthStore();

  const [gdprConsent, setGdprConsent] = useState(
    profile?.gdpr_consent ?? false
  );
  const [marketingConsent, setMarketingConsent] = useState(
    profile?.marketing_consent ?? false
  );
  const [consentSaving, setConsentSaving] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang as 'pt' | 'en');
  };

  const handleConsentChange = async (
    field: 'gdpr_consent' | 'marketing_consent',
    value: boolean
  ) => {
    if (field === 'gdpr_consent') setGdprConsent(value);
    if (field === 'marketing_consent') setMarketingConsent(value);

    setConsentSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user!.id);
    } catch {
      // Revert on error
      if (field === 'gdpr_consent') setGdprConsent(!value);
      if (field === 'marketing_consent') setMarketingConsent(!value);
    } finally {
      setConsentSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await updatePassword(data.password);
      setPasswordSuccess(true);
      reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return;
    setDeleting(true);
    try {
      await apiCall('delete-account');
      await signOut();
    } catch {
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
            onClick={() => handleLanguageChange('pt')}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              lang === 'pt'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            Portugues
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

      {/* Privacy & Consent */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">
            {t.settings?.privacy ?? 'Privacy & Consent'}
          </h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) =>
                handleConsentChange('gdpr_consent', e.target.checked)
              }
              disabled={consentSaving}
              className="mt-0.5 w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">
                {t.settings?.gdprConsent ?? 'GDPR Data Processing Consent'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.settings?.gdprConsentDesc ??
                  'I consent to the processing of my personal data in accordance with GDPR regulations.'}
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) =>
                handleConsentChange('marketing_consent', e.target.checked)
              }
              disabled={consentSaving}
              className="mt-0.5 w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-800">
                {t.settings?.marketingConsent ?? 'Marketing Communications'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.settings?.marketingConsentDesc ??
                  'I agree to receive promotional emails, newsletters, and marketing communications.'}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">
            {t.settings?.changePassword ?? 'Change Password'}
          </h2>
        </div>

        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
            {t.settings?.passwordUpdated ?? 'Password updated successfully!'}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onPasswordSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t.settings?.newPassword ?? 'New Password'}
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t.settings?.confirmPassword ?? 'Confirm New Password'}
            </label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {t.settings?.updatePassword ?? 'Update Password'}
              </>
            )}
          </button>
        </form>
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
