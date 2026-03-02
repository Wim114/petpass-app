import { useQuery } from '@tanstack/react-query';
import type { PlanConfig, PlanConfigItem, PlanType } from '@/types';

const DEFAULT_PLANS: PlanConfigItem[] = [
  {
    key: 'basic',
    price: 16,
    isPopular: false,
    features_en: [
      'Yearly Vaccinations',
      '2x Annual Health Check',
      '10% Off Partner Vets',
      'Digital Membership Card',
    ],
    features_de: [
      'Jährliche Impfungen',
      '2x Jährlicher Gesundheitscheck',
      '10% Rabatt bei Partner-Tierärzten',
      'Digitale Mitgliedskarte',
    ],
  },
  {
    key: 'care_plus',
    price: 39,
    isPopular: true,
    features_en: [
      'Yearly Vaccinations',
      '3x Annual Health Checks',
      '15% Off All Treatments',
      '15% Off at Partner Shops',
      'Priority Customer Support',
    ],
    features_de: [
      'Jährliche Impfungen',
      '3x Jährliche Gesundheitschecks',
      '15% Rabatt auf alle Behandlungen',
      '15% Rabatt in Partner-Shops',
      'Prioritäts-Kundensupport',
    ],
  },
  {
    key: 'vip',
    price: 99,
    isPopular: false,
    features_en: [
      'Everything in Care Plus',
      '4x Annual Health Checks',
      '4x Professional Grooming sessions (€240+ value)',
      '1x Professional Teeth Cleaning (€175 value)',
      '25% Off at Partner Shops',
      '24/7 Priority Chat',
      'VIP Event Access',
      'More perks as our network grows!',
    ],
    features_de: [
      'Alles aus Care Plus',
      '4x Jährliche Gesundheitschecks',
      '4x Professionelle Pflegesitzungen (€240+ Wert)',
      '1x Professionelle Zahnreinigung (€175 Wert)',
      '25% Rabatt in Partner-Shops',
      '24/7 Prioritäts-Chat',
      'VIP Event Zugang',
      'Mehr Vorteile wenn unser Netzwerk wächst!',
    ],
  },
];

async function fetchPlanConfig(): Promise<PlanConfig> {
  try {
    const res = await fetch('/api/plan-config');
    if (res.ok) {
      const data = await res.json();
      if (data?.plans && Array.isArray(data.plans)) {
        return data as PlanConfig;
      }
    }
  } catch {
    // API unavailable, use defaults
  }
  return { plans: DEFAULT_PLANS };
}

export function usePlanConfig() {
  const query = useQuery<PlanConfig>({
    queryKey: ['plan-config'],
    queryFn: fetchPlanConfig,
    staleTime: 1000 * 60 * 10,
  });

  return {
    ...query,
    plans: query.data?.plans ?? DEFAULT_PLANS,
  };
}

export { DEFAULT_PLANS };
