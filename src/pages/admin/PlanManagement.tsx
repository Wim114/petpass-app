import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  Euro,
  Star,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { usePlanConfig, DEFAULT_PLANS } from '@/hooks/usePlanConfig';
import { apiCall } from '@/lib/api';
import type { PlanConfigItem, PlanType } from '@/types';

const PLAN_LABELS: Record<PlanType, string> = {
  basic: 'Basic',
  care_plus: 'Care Plus',
  vip: 'VIP',
};

const PLAN_COLORS: Record<PlanType, string> = {
  basic: 'border-slate-300 bg-slate-50',
  care_plus: 'border-emerald-300 bg-emerald-50',
  vip: 'border-amber-300 bg-amber-50',
};

export default function PlanManagement() {
  const queryClient = useQueryClient();
  const { plans: savedPlans, isLoading } = usePlanConfig();
  const [plans, setPlans] = useState<PlanConfigItem[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (savedPlans && savedPlans.length > 0) {
      setPlans(JSON.parse(JSON.stringify(savedPlans)));
    }
  }, [savedPlans]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiCall('plan-config', { method: 'PUT', body: { plans } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-config'] });
      setToast({ type: 'success', message: 'Plan configuration saved successfully!' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (err: Error) => {
      setToast({ type: 'error', message: err.message || 'Failed to save plan configuration.' });
      setTimeout(() => setToast(null), 5000);
    },
  });

  const updatePlan = (index: number, field: keyof PlanConfigItem, value: any) => {
    setPlans((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateFeature = (
    planIndex: number,
    lang: 'features_en' | 'features_de',
    featureIndex: number,
    value: string
  ) => {
    setPlans((prev) => {
      const next = [...prev];
      const features = [...next[planIndex][lang]];
      features[featureIndex] = value;
      next[planIndex] = { ...next[planIndex], [lang]: features };
      return next;
    });
  };

  const addFeature = (planIndex: number) => {
    setPlans((prev) => {
      const next = [...prev];
      next[planIndex] = {
        ...next[planIndex],
        features_en: [...next[planIndex].features_en, ''],
        features_de: [...next[planIndex].features_de, ''],
      };
      return next;
    });
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    setPlans((prev) => {
      const next = [...prev];
      next[planIndex] = {
        ...next[planIndex],
        features_en: next[planIndex].features_en.filter((_, i) => i !== featureIndex),
        features_de: next[planIndex].features_de.filter((_, i) => i !== featureIndex),
      };
      return next;
    });
  };

  const setPopular = (planIndex: number) => {
    setPlans((prev) =>
      prev.map((p, i) => ({ ...p, isPopular: i === planIndex }))
    );
  };

  const resetToDefaults = () => {
    setPlans(JSON.parse(JSON.stringify(DEFAULT_PLANS)));
  };

  const hasChanges = JSON.stringify(plans) !== JSON.stringify(savedPlans);

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
          <h2 className="text-2xl font-bold text-slate-900">Plan Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Edit pricing, features, and offers shown on the landing page.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset Defaults
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !hasChanges}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
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

      {/* Unsaved changes indicator */}
      {hasChanges && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes. Click "Save Changes" to publish them to the landing page.
        </div>
      )}

      {/* Plan Cards */}
      <div className="space-y-6">
        {plans.map((plan, planIndex) => (
          <div
            key={plan.key}
            className={`rounded-xl border-2 p-6 shadow-sm ${PLAN_COLORS[plan.key]}`}
          >
            {/* Plan Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-slate-400" />
                <h3 className="text-xl font-bold text-slate-900">
                  {PLAN_LABELS[plan.key]}
                </h3>
                {plan.isPopular && (
                  <span className="rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-bold text-white">
                    MOST POPULAR
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPopular(planIndex)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    plan.isPopular
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${plan.isPopular ? 'fill-emerald-500' : ''}`} />
                  {plan.isPopular ? 'Popular' : 'Set as Popular'}
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Monthly Price (EUR)
              </label>
              <div className="relative w-48">
                <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={plan.price}
                  onChange={(e) =>
                    updatePlan(planIndex, 'price', Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-lg font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            {/* Features - Side by Side EN/DE */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* English Features */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Features (English)
                  </label>
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                    {plan.features_en.length} items
                  </span>
                </div>
                <div className="space-y-2">
                  {plan.features_en.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) =>
                          updateFeature(planIndex, 'features_en', fIdx, e.target.value)
                        }
                        placeholder="Feature description..."
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                      <button
                        onClick={() => removeFeature(planIndex, fIdx)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        title="Remove feature"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* German Features */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Features (Deutsch)
                  </label>
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                    {plan.features_de.length} items
                  </span>
                </div>
                <div className="space-y-2">
                  {plan.features_de.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) =>
                          updateFeature(planIndex, 'features_de', fIdx, e.target.value)
                        }
                        placeholder="Feature-Beschreibung..."
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                      <button
                        onClick={() => removeFeature(planIndex, fIdx)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        title="Remove feature"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add feature button */}
            <button
              onClick={() => addFeature(planIndex)}
              className="mt-4 flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-emerald-400 hover:text-emerald-600"
            >
              <Plus className="h-4 w-4" />
              Add Feature
            </button>
          </div>
        ))}
      </div>

      {/* Preview Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Live Preview</h3>
        <p className="mb-6 text-sm text-slate-500">
          This is how the plans will look on the landing page.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl border-2 p-6 ${
                plan.isPopular
                  ? 'border-emerald-500 ring-4 ring-emerald-50'
                  : 'border-slate-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-bold text-white">
                  MOST POPULAR
                </div>
              )}
              <h4 className="text-lg font-bold text-slate-900">
                {PLAN_LABELS[plan.key]}
              </h4>
              <div className="mt-3">
                <span className="text-4xl font-black text-slate-900">
                  €{plan.price}
                </span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="mt-4 flex-grow space-y-2">
                {plan.features_en.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full rounded-xl py-3 text-sm font-bold ${
                  plan.isPopular
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                {plan.isPopular ? 'Get Started' : 'Join Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
