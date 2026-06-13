-- =====================================================
-- Migration 20: Xóa suffix ngẫu nhiên khỏi slug
-- Projects: luxury-bf091a1a  → luxury
-- Properties: bds-luxury-27032 → bds-luxury
--
-- CHẠY MIGRATION NÀY 1 LẦN trên Supabase SQL Editor.
-- =====================================================

-- Bước 1: Backup slug cũ (để rollback nếu cần)
ALTER TABLE projects  ADD COLUMN IF NOT EXISTS slug_old TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS slug_old TEXT;
UPDATE projects   SET slug_old = slug WHERE slug_old IS NULL;
UPDATE properties SET slug_old = slug WHERE slug_old IS NULL;

-- Bước 2: Tạo clean slug cho projects
-- Pattern: xóa suffix là -[a-z0-9]{4,8} ở cuối (hex hash hoặc số)
UPDATE projects
SET slug = REGEXP_REPLACE(slug, '-[a-z0-9]{4,8}$', '')
WHERE slug ~ '-[a-z0-9]{4,8}$';

-- Bước 3: Tạo clean slug cho properties
-- Pattern: xóa suffix là -[0-9]{4,6} ở cuối (số thập phân)
UPDATE properties
SET slug = REGEXP_REPLACE(slug, '-[0-9]{4,6}$', '')
WHERE slug ~ '-[0-9]{4,6}$';

-- Bước 4: Xử lý trùng lặp sau khi clean (thêm -2, -3 nếu cần)
-- Cho projects
WITH ranked AS (
  SELECT id, slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) AS rn
  FROM projects
)
UPDATE projects p
SET slug = p.slug || '-' || (ranked.rn)
FROM ranked
WHERE ranked.id = p.id AND ranked.rn > 1;

-- Cho properties
WITH ranked AS (
  SELECT id, slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) AS rn
  FROM properties
)
UPDATE properties p
SET slug = p.slug || '-' || (ranked.rn)
FROM ranked
WHERE ranked.id = p.id AND ranked.rn > 1;

-- Bước 5: Kiểm tra kết quả
SELECT 'projects' AS tbl, id, slug_old, slug FROM projects ORDER BY created_at;
SELECT 'properties' AS tbl, id, slug_old, slug FROM properties ORDER BY created_at;

-- Để rollback (nếu cần):
-- UPDATE projects SET slug = slug_old WHERE slug_old IS NOT NULL;
-- UPDATE properties SET slug = slug_old WHERE slug_old IS NOT NULL;
