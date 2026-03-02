import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, verifyUser } from './_lib/supabase';
import { handleCors } from './_lib/cors';

const DEFAULT_PLAN_CONFIG = {
  plans: [
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
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // GET — public read
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select('value')
      .eq('key', 'plan_config')
      .single();

    if (error || !data?.value) {
      // Table or row may not exist yet — return defaults
      return res.status(200).json(DEFAULT_PLAN_CONFIG);
    }
    return res.status(200).json(data.value);
  }

  // PUT — admin-only write
  if (req.method === 'PUT') {
    const user = await verifyUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin role required' });
    }

    const { plans } = req.body;

    if (!Array.isArray(plans) || plans.length === 0) {
      return res.status(400).json({ error: 'Invalid plan config: plans array required' });
    }

    for (const plan of plans) {
      if (!plan.key || typeof plan.price !== 'number' || plan.price < 0) {
        return res.status(400).json({ error: `Invalid plan: ${plan.key}` });
      }
      if (!Array.isArray(plan.features_en) || !Array.isArray(plan.features_de)) {
        return res.status(400).json({ error: `Missing features for plan: ${plan.key}` });
      }
    }

    const { error } = await supabaseAdmin
      .from('site_config')
      .upsert({
        key: 'plan_config',
        value: { plans },
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      // If the site_config table doesn't exist, provide a clear message
      if (error.code === 'PGRST204' || error.message?.includes('site_config')) {
        return res.status(500).json({
          error: 'The site_config table does not exist. Please run the database migration (004_fix_site_config_and_pet_types.sql) in the Supabase SQL Editor.',
        });
      }
      return res.status(500).json({ error: error.message });
    }

    // Log the admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: user.id,
      action: 'update_plan_config',
      target_type: 'site_config',
      target_id: 'plan_config',
      metadata: { plans_count: plans.length },
    });

    return res.status(200).json({ success: true, plans });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
