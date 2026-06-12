-- System Settings table for feature toggles
-- Extensible key-value store for admin-controlled feature flags

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_system_settings_timestamp ON public.system_settings;
CREATE TRIGGER set_system_settings_timestamp
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_system_settings_timestamp();

-- Seed default values
INSERT INTO public.system_settings (key, value) VALUES
    ('forum_enabled', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed by guest nav to show/hide forum link)
CREATE POLICY "Public read system settings"
    ON public.system_settings FOR SELECT
    USING (true);

-- Only admins can modify settings
CREATE POLICY "Admin write system settings"
    ON public.system_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
