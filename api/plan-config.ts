import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, verifyUser } from './_lib/supabase';
import { handleCors } from './_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // GET — public read
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select('value')
      .eq('key', 'plan_config')
      .single();

    if (error) {
      return res.status(404).json({ error: 'Plan config not found' });
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
