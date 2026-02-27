-- ============================================================
-- Site Configuration Table
-- Stores editable site config like plan prices and features.
-- ============================================================

create table public.site_config (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_by  uuid references public.profiles on delete set null,
  updated_at  timestamptz default now()
);

alter table public.site_config enable row level security;

-- Anyone can read site config (public data like pricing)
create policy "Anyone can read site config"
  on public.site_config for select
  using (true);

-- Only admins can insert/update/delete site config
create policy "Admins can insert site config"
  on public.site_config for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update site config"
  on public.site_config for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can delete site config"
  on public.site_config for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-update updated_at
create trigger set_site_config_updated_at
  before update on public.site_config
  for each row
  execute function public.update_updated_at();

-- Seed default plan config
insert into public.site_config (key, value) values (
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
);
