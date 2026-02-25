import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PawPrint, CreditCard, Plus, Crown, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { Spinner } from '@/components/ui/Spinner';
import type { Pet, Subscription } from '@/types';

export default function DashboardHome() {
  const { t } = useLanguage();
  const { profile, user } = useAuthStore();

  const { data: pets = [], isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const { data: subscription, isLoading: subLoading } =
    useQuery<Subscription | null>({
      queryKey: ['subscription', user?.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user!.id)
          .in('status', ['active', 'trialing'])
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id,
    });

  const isLoading = petsLoading || subLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const firstName = profile?.first_name || user?.email?.split('@')[0] || '';

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          {t.dashboard?.welcome ?? 'Welcome back'}, {firstName}!
        </h1>
        <p className="text-slate-500 mt-1">
          {t.dashboard?.welcomeSubtitle ??
            "Here's an overview of your PetPass account."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-emerald-600" />
            </div>
            {subscription ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full uppercase">
                {subscription.status}
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase">
                {t.dashboard?.noplan ?? 'No Plan'}
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-slate-500">
            {t.dashboard?.subscription ?? 'Subscription'}
          </h3>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {subscription?.plan_type
              ? subscription.plan_type.charAt(0).toUpperCase() +
                subscription.plan_type.slice(1)
              : t.dashboard?.free ?? 'Free'}
          </p>
        </div>

        {/* Pet Count */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-500">
            {t.dashboard?.registeredPets ?? 'Registered Pets'}
          </h3>
          <p className="text-xl font-bold text-slate-800 mt-1">{pets.length}</p>
        </div>

        {/* Member Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-500">
            {t.dashboard?.memberCard ?? 'Member Card'}
          </h3>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {subscription
              ? t.dashboard?.active ?? 'Active'
              : t.dashboard?.inactive ?? 'Inactive'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {t.dashboard?.quickActions ?? 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/dashboard/pets"
            className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">
                {t.dashboard?.addPet ?? 'Add Pet'}
              </p>
              <p className="text-xs text-slate-500">
                {t.dashboard?.addPetDesc ?? 'Register a new pet'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition" />
          </Link>

          <Link
            to="/dashboard/card"
            className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">
                {t.dashboard?.viewCard ?? 'View Card'}
              </p>
              <p className="text-xs text-slate-500">
                {t.dashboard?.viewCardDesc ?? 'Your digital membership card'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition" />
          </Link>

          <Link
            to="/dashboard/membership"
            className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">
                {t.dashboard?.managePlan ?? 'Manage Plan'}
              </p>
              <p className="text-xs text-slate-500">
                {t.dashboard?.managePlanDesc ?? 'Upgrade or change your plan'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}
