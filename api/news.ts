import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, verifyUser } from './_lib/supabase';
import { handleCors } from './_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  try {
    // GET — public read (published only) or admin read (all with ?include_drafts=true)
    if (req.method === 'GET') {
      const includeDrafts = req.query.include_drafts === 'true';

      // If requesting drafts, verify admin
      if (includeDrafts) {
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
      }

      try {
        const { data, error } = await supabaseAdmin
          .from('site_config')
          .select('value')
          .eq('key', 'news_articles')
          .single();

        if (error || !data?.value) {
          return res.status(200).json({ articles: [] });
        }

        let articles = data.value.articles ?? [];

        if (!includeDrafts) {
          articles = articles.filter((a: { published: boolean }) => a.published);
        }

        // Sort by created_at descending
        articles.sort((a: { created_at: string }, b: { created_at: string }) =>
          b.created_at.localeCompare(a.created_at)
        );

        return res.status(200).json({ articles });
      } catch {
        return res.status(200).json({ articles: [] });
      }
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

      const { articles } = req.body ?? {};

      if (!Array.isArray(articles)) {
        return res.status(400).json({ error: 'Invalid news config: articles array required' });
      }

      // Validate and sanitize each article
      for (const article of articles) {
        if (!article.id || !article.title_en || !article.title_de) {
          return res.status(400).json({ error: 'Each article must have id, title_en, and title_de' });
        }

        // Strip HTML tags to prevent stored XSS
        const textFields = [
          'title_en', 'title_de',
          'summary_en', 'summary_de',
          'content_en', 'content_de',
          'category',
        ] as const;
        for (const field of textFields) {
          if (typeof article[field] === 'string') {
            article[field] = article[field].replace(/<[^>]*>/g, '').slice(0, 5000);
          }
        }

        // Sanitize URL
        if (typeof article.image_url === 'string') {
          article.image_url = article.image_url.replace(/<[^>]*>/g, '').slice(0, 2000);
        }
      }

      const { error } = await supabaseAdmin
        .from('site_config')
        .upsert({
          key: 'news_articles',
          value: { articles },
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        if (error.code === 'PGRST204' || error.message?.includes('site_config')) {
          return res.status(500).json({
            error: 'The site_config table does not exist. Please run the database migration.',
          });
        }
        return res.status(500).json({ error: 'Failed to save news articles' });
      }

      // Log the admin action
      try {
        await supabaseAdmin.from('admin_logs').insert({
          admin_id: user.id,
          action: 'update_news_articles',
          target_type: 'site_config',
          target_id: 'news_articles',
          metadata: { articles_count: articles.length },
        });
      } catch {
        // Non-critical — don't fail the request if audit logging fails
      }

      return res.status(200).json({ success: true, articles });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in news handler:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
