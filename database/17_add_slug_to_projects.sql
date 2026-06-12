-- ============================================================
-- 17_add_slug_to_projects.sql
-- Thêm cột slug vào bảng projects để URL thân thiện thay vì UUID
-- Chạy file này trên Supabase SQL Editor
-- ============================================================

-- Bật extension unaccent (bỏ dấu tiếng Việt trong SQL)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Thêm cột slug
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill: tạo slug cho các dự án đã tồn tại
-- Lấy tên dự án, bỏ dấu, chuyển thường, thay space thành '-', loại ký tự đặc biệt
-- Thêm 8 ký tự đầu của UUID để đảm bảo duy nhất
UPDATE public.projects
SET slug = lower(
  regexp_replace(
    regexp_replace(
      unaccent(name),
      '[^a-zA-Z0-9\s]', '', 'g'
    ),
    '\s+', '-', 'g'
  )
) || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL;

-- Đảm bảo không có giá trị trùng (dự phòng nếu 2 tên giống nhau)
-- Nếu trùng, thêm thêm 4 ký tự UUID nữa
UPDATE public.projects p1
SET slug = p1.slug || '-' || substring(p1.id::text, 9, 4)
WHERE (SELECT COUNT(*) FROM public.projects p2 WHERE p2.slug = p1.slug AND p2.id != p1.id) > 0;

-- Thêm unique constraint và NOT NULL (sau khi backfill xong)
ALTER TABLE public.projects ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.projects ADD CONSTRAINT projects_slug_unique UNIQUE (slug);

-- Index cho tra cứu nhanh theo slug
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects (slug);
