-- Homepage Banners table for hero slider management

CREATE TABLE IF NOT EXISTS public.homepage_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    cta_text TEXT DEFAULT 'Khám phá ngay',
    cta_link TEXT DEFAULT '/',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_homepage_banners_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_homepage_banners_timestamp ON public.homepage_banners;
CREATE TRIGGER set_homepage_banners_timestamp
    BEFORE UPDATE ON public.homepage_banners
    FOR EACH ROW EXECUTE FUNCTION public.update_homepage_banners_timestamp();

-- Index for active banners ordered by sort
CREATE INDEX IF NOT EXISTS idx_homepage_banners_active_sort ON public.homepage_banners (is_active, sort_order);

-- RLS
ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;

-- Public can read active banners
CREATE POLICY "Public read active banners"
    ON public.homepage_banners FOR SELECT
    USING (is_active = true);

-- Admin can do everything
CREATE POLICY "Admin full access banners"
    ON public.homepage_banners FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
