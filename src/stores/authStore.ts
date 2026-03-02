import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string; district?: string; gdpr_consent?: boolean; marketing_consent?: boolean }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

// Track the auth subscription so we can clean it up on re-initialization (e.g. HMR)
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    // Prevent duplicate initialization and clean up previous listener
    if (get().isInitialized) return;
    if (authSubscription) {
      authSubscription.unsubscribe();
      authSubscription = null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isInitialized: true,
      });

      if (session?.user) {
        await get().fetchProfile();
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        set({
          session,
          user: session?.user ?? null,
        });

        if (session?.user) {
          await get().fetchProfile();
        } else {
          set({ profile: null });
        }
      });
      authSubscription = subscription;
    } catch {
      set({ isLoading: false, isInitialized: true });
    }
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      const profileData = data as UserProfile;
      set({ profile: profileData });

      // Sync first_name/last_name/consent from auth metadata if profile is missing them
      const meta = user.user_metadata;
      if (!profileData.first_name && meta?.first_name) {
        const updates: Partial<UserProfile> & { gdpr_consent_at?: string } = {};
        if (meta.first_name) updates.first_name = meta.first_name;
        if (meta.last_name) updates.last_name = meta.last_name;
        if (meta.district && !profileData.district) updates.district = meta.district;
        if (meta.gdpr_consent && !profileData.gdpr_consent_at) {
          (updates as any).gdpr_consent_at = new Date().toISOString();
        }
        if (meta.marketing_consent !== undefined && !profileData.marketing_consent) {
          updates.marketing_consent = meta.marketing_consent;
        }

        await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        set({ profile: { ...profileData, ...updates } });
      }
    } else if (error?.code === 'PGRST116') {
      // No profile row found — create one via RPC (handles deleted profiles,
      // missed triggers, etc.)
      const { data: created, error: rpcError } = await supabase.rpc('ensure_profile_exists');

      if (!rpcError && created) {
        set({ profile: created as UserProfile });
      }
    }
  },

  signUp: async (email, password, metadata) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error ? new Error(error.message) : null };
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? new Error(error.message) : null };
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error ? new Error(error.message) : null };
  },

  signInWithMagicLink: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error ? new Error(error.message) : null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error ? new Error(error.message) : null };
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error ? new Error(error.message) : null };
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      await get().fetchProfile();
    }
    return { error: error ? new Error(error.message) : null };
  },
}));
