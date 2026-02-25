import type { PetSurveyData, CostBreakdown, VetFrequency } from '@/types';
import { VIENNA_VET_PRICES, PLAN_PRICES } from './constants';

export function calculateCosts(data: PetSurveyData): CostBreakdown {
  const { petType, petCount, petAge, vetFrequency, healthConditions, groomingFrequency } = data;

  const visitsPerYear: Record<VetFrequency, number> = {
    rarely: 0.5,
    once_year: 1,
    twice_year: 2,
    quarterly: 4,
    monthly: 12,
  };

  const checkupsPerYear = visitsPerYear[vetFrequency];
  const annualCheckups = checkupsPerYear * VIENNA_VET_PRICES.checkup * petCount;

  let vaccinations = (VIENNA_VET_PRICES.vaccination.basic + VIENNA_VET_PRICES.vaccination.rabies) * petCount;

  if (petAge === 'puppy_kitten') {
    vaccinations *= 1.5;
  } else if (petAge === 'senior') {
    vaccinations *= 1.2;
  }

  let healthConditionCosts = 0;
  healthConditions.forEach(condition => {
    healthConditionCosts += VIENNA_VET_PRICES.healthConditionCosts[condition];
  });
  healthConditionCosts *= petCount;

  if (petAge === 'senior') {
    healthConditionCosts *= 1.3;
  }

  const groomingPrice = petType === 'dog'
    ? VIENNA_VET_PRICES.grooming.dog
    : petType === 'cat'
      ? VIENNA_VET_PRICES.grooming.cat
      : VIENNA_VET_PRICES.grooming.rabbit;
  const grooming = groomingFrequency * groomingPrice * petCount;

  const subtotal = annualCheckups + vaccinations + healthConditionCosts + grooming;
  const emergencyBuffer = subtotal * VIENNA_VET_PRICES.emergencyBufferPercent;

  const totalWithoutMembership = Math.round(subtotal + emergencyBuffer);

  let recommendedPlan: 'basic' | 'care_plus' | 'vip';
  const actualHealthConditions = healthConditions.filter(c => c !== 'none');
  if (actualHealthConditions.length >= 2 || groomingFrequency >= 4 || petAge === 'senior') {
    recommendedPlan = 'vip';
  } else if (actualHealthConditions.length >= 1 || groomingFrequency > 2 || checkupsPerYear > 2) {
    recommendedPlan = 'care_plus';
  } else {
    recommendedPlan = 'basic';
  }

  const planCost = PLAN_PRICES[recommendedPlan] * 12;

  let membershipValue = 0;
  membershipValue += vaccinations;

  if (recommendedPlan === 'basic') {
    membershipValue += VIENNA_VET_PRICES.checkup * 2 * petCount;
    membershipValue += totalWithoutMembership * 0.10;
  } else if (recommendedPlan === 'care_plus') {
    membershipValue += VIENNA_VET_PRICES.checkup * 3 * petCount;
    membershipValue += totalWithoutMembership * 0.15;
  } else {
    membershipValue += VIENNA_VET_PRICES.checkup * 4 * petCount;
    membershipValue += 4 * groomingPrice * petCount;
    membershipValue += VIENNA_VET_PRICES.dentalCleaning * petCount;
    membershipValue += totalWithoutMembership * 0.25;
  }

  const annualSavings = Math.max(0, Math.round(membershipValue - planCost));
  const savingsPercentage = totalWithoutMembership > 0
    ? Math.round((annualSavings / totalWithoutMembership) * 100)
    : 0;

  return {
    annualCheckups: Math.round(annualCheckups),
    vaccinations: Math.round(vaccinations),
    healthConditionCosts: Math.round(healthConditionCosts),
    grooming: Math.round(grooming),
    emergencyBuffer: Math.round(emergencyBuffer),
    totalWithoutMembership,
    recommendedPlan,
    planCost,
    annualSavings,
    savingsPercentage,
  };
}

export function generateReferralCode(): string {
  return 'PPV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('de-AT', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string, locale = 'en'): string {
  return new Date(date).toLocaleDateString(locale === 'de' ? 'de-AT' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
