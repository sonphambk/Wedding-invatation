-- supabase/migrations/003_theme_json.sql
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS theme_json JSONB;
