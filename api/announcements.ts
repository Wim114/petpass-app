import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, verifyUser } from './_lib/supabase';
import { handleCors } from './_lib/cors';

const ALLOWED_STYLES = new Set(['banner', 'card', 'spotlight']);
const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 5000;
const MAX_URL_LENGTH = 2000;

async function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const user = await verifyUser(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: admin role required' });
    return null;
  }

  return user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  try {
    // GET — public read of enabled announcements, admin gets all
    if (req.method === 'GET') {
      const isAdmin = req.query.admin === 'true';

      if (isAdmin) {
        const user = await requireAdmin(req, res);
        if (!user) return;

        const { data, error } = await supabaseAdmin
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return res.status(500).json({ error: 'Failed to fetch announcements' });
        }
        return res.status(200).json({ announcements: data ?? [] });
      }

      // Public: only enabled announcements
      const { data, error } = await supabaseAdmin
        .from('announcements')
        .select('id, title, body, image_url, style, created_at')
        .eq('enabled', true)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(200).json({ announcements: [] });
      }
      return res.status(200).json({ announcements: data ?? [] });
    }

    // POST — create a new announcement (admin only)
    if (req.method === 'POST') {
      const user = await requireAdmin(req, res);
      if (!user) return;

      const { title, body, image_url, style, enabled } = req.body ?? {};

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
      }
      if (!body || typeof body !== 'string' || body.trim().length === 0) {
        return res.status(400).json({ error: 'Body is required' });
      }
      if (!ALLOWED_STYLES.has(style)) {
        return res.status(400).json({ error: `Invalid style. Must be one of: ${[...ALLOWED_STYLES].join(', ')}` });
      }

      const sanitizedTitle = title.replace(/<[^>]*>/g, '').slice(0, MAX_TITLE_LENGTH);
      const sanitizedBody = body.replace(/<[^>]*>/g, '').slice(0, MAX_BODY_LENGTH);
      const sanitizedImageUrl = image_url
        ? String(image_url).replace(/<[^>]*>/g, '').slice(0, MAX_URL_LENGTH)
        : null;

      const { data, error } = await supabaseAdmin
        .from('announcements')
        .insert({
          title: sanitizedTitle,
          body: sanitizedBody,
          image_url: sanitizedImageUrl,
          style,
          enabled: enabled ?? false,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to create announcement' });
      }

      try {
        await supabaseAdmin.from('admin_logs').insert({
          admin_id: user.id,
          action: 'create_announcement',
          target_type: 'announcement',
          target_id: data.id,
          metadata: { title: sanitizedTitle },
        });
      } catch { /* non-critical */ }

      return res.status(201).json({ announcement: data });
    }

    // PUT — update an existing announcement (admin only)
    if (req.method === 'PUT') {
      const user = await requireAdmin(req, res);
      if (!user) return;

      const { id, title, body, image_url, style, enabled } = req.body ?? {};

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Announcement ID is required' });
      }

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
          return res.status(400).json({ error: 'Title cannot be empty' });
        }
        updates.title = title.replace(/<[^>]*>/g, '').slice(0, MAX_TITLE_LENGTH);
      }
      if (body !== undefined) {
        if (typeof body !== 'string' || body.trim().length === 0) {
          return res.status(400).json({ error: 'Body cannot be empty' });
        }
        updates.body = body.replace(/<[^>]*>/g, '').slice(0, MAX_BODY_LENGTH);
      }
      if (style !== undefined) {
        if (!ALLOWED_STYLES.has(style)) {
          return res.status(400).json({ error: `Invalid style. Must be one of: ${[...ALLOWED_STYLES].join(', ')}` });
        }
        updates.style = style;
      }
      if (image_url !== undefined) {
        updates.image_url = image_url
          ? String(image_url).replace(/<[^>]*>/g, '').slice(0, MAX_URL_LENGTH)
          : null;
      }
      if (enabled !== undefined) {
        updates.enabled = Boolean(enabled);
      }

      const { data, error } = await supabaseAdmin
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to update announcement' });
      }

      try {
        await supabaseAdmin.from('admin_logs').insert({
          admin_id: user.id,
          action: 'update_announcement',
          target_type: 'announcement',
          target_id: id,
          metadata: { fields_updated: Object.keys(updates) },
        });
      } catch { /* non-critical */ }

      return res.status(200).json({ announcement: data });
    }

    // DELETE — remove an announcement (admin only)
    if (req.method === 'DELETE') {
      const user = await requireAdmin(req, res);
      if (!user) return;

      const id = req.query.id as string;
      if (!id) {
        return res.status(400).json({ error: 'Announcement ID is required' });
      }

      const { error } = await supabaseAdmin
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Failed to delete announcement' });
      }

      try {
        await supabaseAdmin.from('admin_logs').insert({
          admin_id: user.id,
          action: 'delete_announcement',
          target_type: 'announcement',
          target_id: id,
        });
      } catch { /* non-critical */ }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in announcements handler:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
