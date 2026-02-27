import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import Spinner from '@/components/ui/Spinner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { t } = useLanguage();
  const { resetPassword, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {t.auth?.emailSent || 'Email Sent'}
            </h2>
            <p className="text-slate-600 mb-6">
              {t.auth?.resetEmailSent ||
                'If an account exists with that email, you will receive a password reset link shortly.'}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.auth?.backToLogin || 'Back to Login'}
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                {t.auth?.forgotPassword || 'Forgot Password?'}
              </h1>
              <p className="text-slate-500 mt-2">
                {t.auth?.forgotPasswordSubtitle ||
                  "Enter your email and we'll send you a reset link"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.auth?.email || 'Email'}
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="max@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  t.auth?.sendResetLink || 'Send Reset Link'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.auth?.backToLogin || 'Back to Login'}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
