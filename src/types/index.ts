export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export type District =
  | '1st (Innere Stadt)' | '2nd (Leopoldstadt)' | '3rd (Landstraße)'
  | '4th (Wieden)' | '5th (Margareten)' | '6th (Mariahilf)'
  | '7th (Neubau)' | '8th (Josefstadt)' | '9th (Alsergrund)'
  | 'Other (10-23)';

export type PetType = 'dog' | 'cat' | 'rabbit' | 'other';

export type PetAge = 'puppy_kitten' | 'young' | 'adult' | 'senior';

export type VetFrequency = 'rarely' | 'once_year' | 'twice_year' | 'quarterly' | 'monthly';

export type HealthCondition =
  | 'none'
  | 'allergies'
  | 'diabetes'
  | 'joint_problems'
  | 'skin_conditions'
  | 'digestive_issues'
  | 'heart_conditions'
  | 'dental_problems'
  | 'obesity';

export interface PetSurveyData {
  petType: PetType;
  petCount: number;
  petAge: PetAge;
  vetFrequency: VetFrequency;
  healthConditions: HealthCondition[];
  groomingFrequency: number;
}

export interface CostBreakdown {
  annualCheckups: number;
  vaccinations: number;
  healthConditionCosts: number;
  grooming: number;
  emergencyBuffer: number;
  totalWithoutMembership: number;
  recommendedPlan: 'basic' | 'care_plus' | 'vip';
  planCost: number;
  annualSavings: number;
  savingsPercentage: number;
}

export type PlanType = 'basic' | 'care_plus' | 'vip';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  district: string | null;
  avatar_url: string | null;
  preferred_language: 'en' | 'de';
  role: 'member' | 'admin' | 'vetpro';
  stripe_customer_id: string | null;
  referral_code: string | null;
  referred_by: string | null;
  gdpr_consent_at: string | null;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  type: PetType;
  breed: string | null;
  age_category: PetAge | null;
  birthday: string | null;
  weight_kg: number | null;
  photo_url: string | null;
  notes: string | null;
  health_conditions: HealthCondition[];
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: PlanType;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancelled_at: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: 'paid' | 'failed' | 'pending' | 'refunded';
  invoice_url: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  referred_user_id: string | null;
  status: 'pending' | 'converted' | 'rewarded';
  reward_applied: boolean;
  created_at: string;
}

export interface AdminStats {
  totalMembers: number;
  mrr: number;
  arr: number;
  churnRate: number;
  retentionRate: number;
  arpu: number;
  ltv: number;
  trialConversionRate: number;
  newSignupsThisMonth: number;
  petsPerUser: number;
  waitlistSize: number;
  planDistribution: {
    basic: number;
    care_plus: number;
    vip: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    members: number;
  }>;
  recentSignups: Array<{
    email: string;
    plan: PlanType;
    district: string;
    created_at: string;
  }>;
}
