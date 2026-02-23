
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
  groomingFrequency: number; // times per year
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
