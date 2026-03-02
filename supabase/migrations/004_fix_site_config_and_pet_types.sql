-- ============================================================
-- Fix Migration: site_config table + extended pet types
-- Run this in the Supabase SQL Editor to fix:
--   1. Missing site_config table (plan pricing 404)
--   2. Pet type constraint (bird/fish not allowed)
-- All statements are idempotent — safe to run multiple times.
-- ============================================================

-- 1. Create site_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.site_config (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by  uuid REFERENCES public.profiles ON DELETE SET NULL,
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- RLS policies (use DO block to avoid duplicate errors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_config' AND policyname = 'Anyone can read site config'
  ) THEN
    CREATE POLICY "Anyone can read site config"
      ON public.site_config FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_config' AND policyname = 'Admins can insert site config'
  ) THEN
    CREATE POLICY "Admins can insert site config"
      ON public.site_config FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_config' AND policyname = 'Admins can update site config'
  ) THEN
    CREATE POLICY "Admins can update site config"
      ON public.site_config FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_config' AND policyname = 'Admins can delete site config'
  ) THEN
    CREATE POLICY "Admins can delete site config"
      ON public.site_config FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- Auto-update trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_site_config_updated_at'
  ) THEN
    CREATE TRIGGER set_site_config_updated_at
      BEFORE UPDATE ON public.site_config
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- 2. Seed default plan_config if it doesn't exist
INSERT INTO public.site_config (key, value) VALUES (
  'plan_config',
  '{
    "plans": [
      {
        "key": "basic",
        "price": 16,
        "isPopular": false,
        "features_en": [
          "Yearly Vaccinations",
          "2x Annual Health Check",
          "10% Off Partner Vets",
          "Digital Membership Card"
        ],
        "features_de": [
          "Jährliche Impfungen",
          "2x Jährlicher Gesundheitscheck",
          "10% Rabatt bei Partner-Tierärzten",
          "Digitale Mitgliedskarte"
        ]
      },
      {
        "key": "care_plus",
        "price": 39,
        "isPopular": true,
        "features_en": [
          "Yearly Vaccinations",
          "3x Annual Health Checks",
          "15% Off All Treatments",
          "15% Off at Partner Shops",
          "Priority Customer Support"
        ],
        "features_de": [
          "Jährliche Impfungen",
          "3x Jährliche Gesundheitschecks",
          "15% Rabatt auf alle Behandlungen",
          "15% Rabatt in Partner-Shops",
          "Prioritäts-Kundensupport"
        ]
      },
      {
        "key": "vip",
        "price": 99,
        "isPopular": false,
        "features_en": [
          "Everything in Care Plus",
          "4x Annual Health Checks",
          "4x Professional Grooming sessions (€240+ value)",
          "1x Professional Teeth Cleaning (€175 value)",
          "25% Off at Partner Shops",
          "24/7 Priority Chat",
          "VIP Event Access",
          "More perks as our network grows!"
        ],
        "features_de": [
          "Alles aus Care Plus",
          "4x Jährliche Gesundheitschecks",
          "4x Professionelle Pflegesitzungen (€240+ Wert)",
          "1x Professionelle Zahnreinigung (€175 Wert)",
          "25% Rabatt in Partner-Shops",
          "24/7 Prioritäts-Chat",
          "VIP Event Zugang",
          "Mehr Vorteile wenn unser Netzwerk wächst!"
        ]
      }
    ]
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- 3. Update pet type constraint to include bird and fish
ALTER TABLE public.pets DROP CONSTRAINT IF EXISTS pets_type_check;
ALTER TABLE public.pets ADD CONSTRAINT pets_type_check
  CHECK (type IN ('dog', 'cat', 'bird', 'fish', 'rabbit', 'other'));
