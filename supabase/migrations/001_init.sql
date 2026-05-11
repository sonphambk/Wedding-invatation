-- Wedding config table (single row, id=1)
CREATE TABLE IF NOT EXISTS wedding_config (
  id              int4        PRIMARY KEY DEFAULT 1,
  bride_name      text        NOT NULL DEFAULT '',
  groom_name      text        NOT NULL DEFAULT '',
  wedding_date    timestamptz,
  venue_name      text        NOT NULL DEFAULT '',
  venue_address   text        NOT NULL DEFAULT '',
  maps_url        text        NOT NULL DEFAULT '',
  dresscode       text        NOT NULL DEFAULT '',
  extra_notes     text        NOT NULL DEFAULT '',
  bank1_code      text        NOT NULL DEFAULT '',
  bank1_account   text        NOT NULL DEFAULT '',
  bank1_holder    text        NOT NULL DEFAULT '',
  bank2_code      text        NOT NULL DEFAULT '',
  bank2_account   text        NOT NULL DEFAULT '',
  bank2_holder    text        NOT NULL DEFAULT '',
  music_url       text        NOT NULL DEFAULT '',
  photos          jsonb       NOT NULL DEFAULT '[]',
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Seed row
INSERT INTO wedding_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wedding_config_updated_at
  BEFORE UPDATE ON wedding_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Wishes table
CREATE TABLE IF NOT EXISTS wishes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name  text        NOT NULL,
  message     text        NOT NULL,
  likes       int4        NOT NULL DEFAULT 0,
  approved    boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
