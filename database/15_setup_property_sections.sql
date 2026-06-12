-- ============================================================
-- 15_setup_property_sections.sql
-- Nội dung mở rộng cho trang chi tiết Bất động sản:
--   property_sections → Các section nội dung (Điểm nổi bật, Mặt bằng, Vị trí, Pháp lý...)
-- Chạy file này trên Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.property_sections (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id  UUID    NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  section_type TEXT    NOT NULL CHECK (section_type IN (
    'highlights', 'floor_plan', 'location', 'legal', 'payment', 'virtual_tour', 'custom'
  )),
  title        TEXT    NOT NULL,
  content      TEXT,
  image_url    TEXT,
  metadata     JSONB   DEFAULT '{}'::jsonb,
  sort_order   INT     DEFAULT 0,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_property_sections_property
  ON public.property_sections (property_id, sort_order);

ALTER TABLE public.property_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read property sections" ON public.property_sections;
CREATE POLICY "Public read property sections" ON public.property_sections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Agent/Admin manage property sections" ON public.property_sections;
CREATE POLICY "Agent/Admin manage property sections" ON public.property_sections
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'agent'))
  );
