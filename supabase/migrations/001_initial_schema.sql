-- ============================================================
-- PetPass Initial Schema Migration
-- ============================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- 1. profiles
create table public.profiles (
  id                  uuid primary key references auth.users on delete cascade,
  email               text,
  first_name          text,
  last_name           text,
  phone               text,
  district            text,
  avatar_url          text,
  preferred_language  text default 'de',
  role                text default 'member' check (role in ('member', 'admin', 'vetpro')),
  stripe_customer_id  text,
  referral_code       text unique,
  referred_by         text,
  gdpr_consent_at     timestamptz,
  marketing_consent   boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- 2. pets
create table public.pets (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid references public.profiles on delete cascade not null,
  name              text not null,
  type              text not null check (type in ('dog', 'cat', 'rabbit', 'other')),
  breed             text,
  age_category      text,
  birthday          date,
  weight_kg         numeric(5, 2),
  photo_url         text,
  notes             text,
  health_conditions jsonb default '[]'::jsonb,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- 3. subscriptions
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references public.profiles on delete cascade not null,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  plan                    text not null check (plan in ('basic', 'care_plus', 'vip')),
  status                  text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'cancelled', 'unpaid', 'incomplete')),
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  trial_end               timestamptz,
  cancelled_at            timestamptz,
  cancel_at_period_end    boolean default false,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- 4. payments
create table public.payments (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references public.profiles on delete cascade not null,
  subscription_id           uuid references public.subscriptions on delete set null,
  stripe_invoice_id         text,
  stripe_payment_intent_id  text,
  amount_cents              integer not null,
  currency                  text default 'eur',
  status                    text not null check (status in ('paid', 'failed', 'pending', 'refunded')),
  invoice_url               text,
  created_at                timestamptz default now()
);

-- 5. waitlist
create table public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  district    text,
  language    text default 'de',
  source      text,
  survey_data jsonb,
  created_at  timestamptz default now()
);

-- 6. referrals
create table public.referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid references public.profiles on delete cascade not null,
  referred_email  text not null,
  referred_user_id uuid references public.profiles on delete set null,
  status          text default 'pending' check (status in ('pending', 'converted', 'rewarded')),
  reward_applied  boolean default false,
  created_at      timestamptz default now()
);

-- 7. admin_logs
create table public.admin_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.profiles on delete cascade not null,
  action      text not null,
  target_type text,
  target_id   text,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_pets_owner_id        on public.pets (owner_id);
create index idx_subscriptions_user_id on public.subscriptions (user_id);
create index idx_payments_user_id     on public.payments (user_id);
create index idx_referrals_referrer_id on public.referrals (referrer_id);
create index idx_waitlist_email       on public.waitlist (email);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.pets           enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.payments       enable row level security;
alter table public.waitlist       enable row level security;
alter table public.referrals      enable row level security;
alter table public.admin_logs     enable row level security;

-- ---- profiles ----
create policy "Users can view their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (id = auth.uid());

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---- pets ----
create policy "Users can view their own pets"
  on public.pets for select
  using (owner_id = auth.uid());

create policy "Users can insert their own pets"
  on public.pets for insert
  with check (owner_id = auth.uid());

create policy "Users can update their own pets"
  on public.pets for update
  using (owner_id = auth.uid());

create policy "Users can delete their own pets"
  on public.pets for delete
  using (owner_id = auth.uid());

create policy "Admins can view all pets"
  on public.pets for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---- subscriptions ----
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (user_id = auth.uid());

create policy "Users can insert their own subscriptions"
  on public.subscriptions for insert
  with check (user_id = auth.uid());

create policy "Users can update their own subscriptions"
  on public.subscriptions for update
  using (user_id = auth.uid());

create policy "Users can delete their own subscriptions"
  on public.subscriptions for delete
  using (user_id = auth.uid());

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---- payments ----
create policy "Users can view their own payments"
  on public.payments for select
  using (user_id = auth.uid());

create policy "Users can insert their own payments"
  on public.payments for insert
  with check (user_id = auth.uid());

create policy "Users can update their own payments"
  on public.payments for update
  using (user_id = auth.uid());

create policy "Users can delete their own payments"
  on public.payments for delete
  using (user_id = auth.uid());

create policy "Admins can view all payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---- waitlist ----
create policy "Anyone can insert into waitlist"
  on public.waitlist for insert
  with check (true);

create policy "Admins can view waitlist"
  on public.waitlist for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---- referrals ----
create policy "Users can view their own referrals"
  on public.referrals for select
  using (referrer_id = auth.uid());

create policy "Users can insert their own referrals"
  on public.referrals for insert
  with check (referrer_id = auth.uid());

create policy "Users can update their own referrals"
  on public.referrals for update
  using (referrer_id = auth.uid());

create policy "Users can delete their own referrals"
  on public.referrals for delete
  using (referrer_id = auth.uid());

create policy "Admins can view all referrals"
  on public.referrals for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---- admin_logs ----
create policy "Admins can insert admin logs"
  on public.admin_logs for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can view admin logs"
  on public.admin_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, referral_code)
  values (
    new.id,
    new.email,
    'PPV-' || upper(substr(md5(random()::text), 1, 6))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Generate referral_code on profile creation if missing
create or replace function public.generate_referral_code()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.referral_code is null then
    new.referral_code := 'PPV-' || upper(substr(md5(random()::text), 1, 6));
  end if;
  return new;
end;
$$;

create trigger on_profile_create_referral_code
  before insert on public.profiles
  for each row
  execute function public.generate_referral_code();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();

create trigger set_pets_updated_at
  before update on public.pets
  for each row
  execute function public.update_updated_at();

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.update_updated_at();
