import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Camera, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Spinner';

const DISTRICTS = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Açores',
  'Madeira',
];

const LANGUAGES = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
];

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  district: z.string().optional(),
  preferred_language: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { t } = useLanguage();
  const { profile, user, updateProfile, isLoading } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
      district: profile?.district || '',
      preferred_language: profile?.preferred_language || 'pt',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setError(null);
    setSuccess(false);
    try {
      await updateProfile(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setAvatarUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {t.profile?.title ?? 'Profile'}
        </h1>
        <p className="text-slate-500 mt-1">
          {t.profile?.subtitle ?? 'Manage your personal information'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          {t.profile?.updateSuccess ?? 'Profile updated successfully!'}
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-emerald-600" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition shadow-md"
            >
              {avatarUploading ? (
                <Spinner size="sm" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              {profile?.first_name} {profile?.last_name}
            </h3>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t.profile?.firstName ?? 'First Name'}
            </label>
            <input
              type="text"
              {...register('first_name')}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.first_name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t.profile?.lastName ?? 'Last Name'}
            </label>
            <input
              type="text"
              {...register('last_name')}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t.profile?.phone ?? 'Phone'}
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="+351 912 345 678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t.profile?.district ?? 'District'}
          </label>
          <select
            {...register('district')}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
          >
            <option value="">{t.profile?.selectDistrict ?? 'Select a district'}</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t.profile?.preferredLanguage ?? 'Preferred Language'}
          </label>
          <select
            {...register('preferred_language')}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isDirty}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              {t.profile?.save ?? 'Save Changes'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
