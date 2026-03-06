-- Announcements table for admin-managed announcements/advertisements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  style text NOT NULL DEFAULT 'banner' CHECK (style IN ('banner', 'card', 'spotlight')),
  enabled boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for public queries (enabled announcements sorted by date)
CREATE INDEX idx_announcements_enabled ON announcements (enabled, created_at DESC);

-- RLS policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read enabled announcements
CREATE POLICY "Public can read enabled announcements"
  ON announcements FOR SELECT
  USING (enabled = true);

-- Admins can do everything
CREATE POLICY "Admins have full access to announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Auto-update updated_at
CREATE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
