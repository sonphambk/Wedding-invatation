-- Enable RLS
ALTER TABLE wedding_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- wedding_config: public read
CREATE POLICY "Public can read wedding_config"
  ON wedding_config FOR SELECT
  USING (true);

-- wishes: public can read approved only
CREATE POLICY "Public can read approved wishes"
  ON wishes FOR SELECT
  USING (approved = true);

-- wishes: public can insert (guest submissions)
CREATE POLICY "Public can insert wishes"
  ON wishes FOR INSERT
  WITH CHECK (true);
