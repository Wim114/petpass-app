import type { HealthCondition, District } from '@/types';

export const VIENNA_VET_PRICES = {
  checkup: 40,
  vaccination: {
    basic: 65,
    rabies: 45,
  },
  bloodwork: 75,
  dentalCleaning: 175,
  grooming: {
    dog: 60,
    cat: 45,
    rabbit: 35,
  },
  healthConditionCosts: {
    none: 0,
    allergies: 225,
    diabetes: 600,
    joint_problems: 300,
    skin_conditions: 175,
    digestive_issues: 225,
    heart_conditions: 450,
    dental_problems: 200,
    obesity: 150,
  } as Record<HealthCondition, number>,
  emergencyBufferPercent: 0.15,
};

export const PLAN_PRICES = {
  basic: 16,
  care_plus: 39,
  vip: 99,
} as const;

export const DISTRICTS: District[] = [
  '1st (Innere Stadt)', '2nd (Leopoldstadt)', '3rd (Landstraße)',
  '4th (Wieden)', '5th (Margareten)', '6th (Mariahilf)',
  '7th (Neubau)', '8th (Josefstadt)', '9th (Alsergrund)',
  'Other (10-23)',
];
