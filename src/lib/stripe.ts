import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export const PLAN_PRICES = {
  basic: 16,
  care_plus: 39,
  vip: 99,
} as const;

export const PLAN_STRIPE_PRICE_IDS = {
  basic: import.meta.env.VITE_STRIPE_PRICE_BASIC || '',
  care_plus: import.meta.env.VITE_STRIPE_PRICE_CARE_PLUS || '',
  vip: import.meta.env.VITE_STRIPE_PRICE_VIP || '',
} as const;
