-- ============================================================
-- 12_setup_project_content.sql
-- Nội dung mở rộng cho Trang chi tiết Dự án:
--   1. blogs.project_id  → Blog gắn trực tiếp với 1 dự án
--   2. project_sections  → Các section nội dung (Chủ đầu tư, Vị trí, Tiện ích, Pháp lý...)
-- Chạy file này trên Supabase SQL Editor
-- ============================================================

-- ── 1. Liên kết Blog với Dự án ────────────────────────────────
ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS project_id UUID
  REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blogs_project_id ON public.blogs (project_id);

-- ── 2. Bảng project_sections ──────────────────────────────────
-- Mỗi dòng là 1 khối nội dung của dự án, phân loại theo section_type.
-- Trường cố định theo loại được lưu trong metadata (JSONB):
--   developer : { name, website, logo_url, established_year }
--   location  : { address, map_embed_url, latitude, longitude }
--   amenities : { items: string[] }
--   legal     : { items: string[] }
--   payment   : { items: string[] }
--   overview / custom : chỉ dùng title + content + image_url
CREATE TABLE IF NOT EXISTS public.project_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN
    ('overview','developer','location','amenities','legal','payment','custom')),
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_sections_project
  ON public.project_sections (project_id, sort_order);

-- Bật bảo mật RLS
ALTER TABLE public.project_sections ENABLE ROW LEVEL SECURITY;

-- Public xem được toàn bộ section (nội dung công khai trên trang dự án)
DROP POLICY IF EXISTS "Public read project sections" ON public.project_sections;
CREATE POLICY "Public read project sections" ON public.project_sections
  FOR SELECT USING (true);

-- Chỉ Admin được thêm/sửa/xóa section
DROP POLICY IF EXISTS "Admin manage project sections" ON public.project_sections;
CREATE POLICY "Admin manage project sections" ON public.project_sections
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
