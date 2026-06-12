-- ============================================================
-- 11_setup_search_indexes.sql
-- Tối ưu hiệu năng tìm kiếm: B-tree indexes + Full-text search
-- Chạy file này trên Supabase SQL Editor
-- ============================================================

-- ── 1. B-tree indexes cho các cột filter thường dùng ──────────

-- Properties: tìm kiếm / lọc giá / phân trang
CREATE INDEX IF NOT EXISTS idx_properties_is_deleted    ON public.properties (is_deleted);
CREATE INDEX IF NOT EXISTS idx_properties_status        ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_price         ON public.properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_project_id    ON public.properties (project_id);
CREATE INDEX IF NOT EXISTS idx_properties_category_id   ON public.properties (category_id);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id      ON public.properties (agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_at    ON public.properties (created_at DESC);

-- Composite index cho public search (is_deleted + status + created_at)
CREATE INDEX IF NOT EXISTS idx_properties_public_search
  ON public.properties (is_deleted, status, created_at DESC);

-- Composite index cho price range filter
CREATE INDEX IF NOT EXISTS idx_properties_price_range
  ON public.properties (is_deleted, status, price);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_theme_id    ON public.projects (theme_id);
CREATE INDEX IF NOT EXISTS idx_projects_status      ON public.projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at  ON public.projects (created_at DESC);

-- Blogs
CREATE INDEX IF NOT EXISTS idx_blogs_status       ON public.blogs (status);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id    ON public.blogs (author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_property_id  ON public.blogs (property_id);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at   ON public.blogs (created_at DESC);

-- Translations
CREATE INDEX IF NOT EXISTS idx_translations_entity ON public.translations (entity_type, entity_id, lang_code);
CREATE INDEX IF NOT EXISTS idx_translations_pending ON public.translations (is_approved) WHERE is_approved = false;

-- ── 2. GIN index cho JSONB attributes (đã có, tạo lại nếu thiếu) ──

CREATE INDEX IF NOT EXISTS idx_properties_attributes
  ON public.properties USING GIN (attributes);

-- Expression indexes cho các trường attributes thường filter
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms
  ON public.properties ((attributes->>'bedrooms'))
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_properties_area
  ON public.properties ((cast(attributes->>'area' as numeric)))
  WHERE is_deleted = false AND attributes->>'area' IS NOT NULL;

-- ── 3. Full-text search với tsvector ──────────────────────────

-- Thêm cột tsvector vào bảng properties (nếu chưa có)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Cập nhật cột search_vector cho toàn bộ dữ liệu hiện có
UPDATE public.properties SET search_vector =
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B');

-- GIN index cho full-text search
CREATE INDEX IF NOT EXISTS idx_properties_search_vector
  ON public.properties USING GIN (search_vector);

-- Trigger tự động cập nhật search_vector khi title/description thay đổi
CREATE OR REPLACE FUNCTION update_property_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_property_search_vector ON public.properties;
CREATE TRIGGER trigger_property_search_vector
  BEFORE INSERT OR UPDATE OF title, description
  ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_property_search_vector();

-- Tương tự cho blogs
ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE public.blogs SET search_vector =
  setweight(to_tsvector('simple', coalesce(title, '')), 'A');

CREATE INDEX IF NOT EXISTS idx_blogs_search_vector
  ON public.blogs USING GIN (search_vector);

CREATE OR REPLACE FUNCTION update_blog_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blog_search_vector ON public.blogs;
CREATE TRIGGER trigger_blog_search_vector
  BEFORE INSERT OR UPDATE OF title
  ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION update_blog_search_vector();

-- ── 4. Stored function tìm kiếm nhanh qua tsvector ───────────

-- Hàm tìm kiếm properties với full-text + fallback ilike
CREATE OR REPLACE FUNCTION search_properties(
  search_term TEXT,
  p_project_id UUID DEFAULT NULL,
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_bedrooms INT DEFAULT NULL,
  p_min_area NUMERIC DEFAULT NULL,
  p_limit INT DEFAULT 12,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, title TEXT, slug TEXT, price NUMERIC,
  attributes JSONB, description TEXT, created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.title, p.slug, p.price,
    p.attributes, p.description, p.created_at,
    CASE
      WHEN search_term IS NOT NULL AND search_term != ''
        THEN ts_rank(p.search_vector, plainto_tsquery('simple', search_term))
      ELSE 1.0
    END::REAL AS rank
  FROM public.properties p
  WHERE
    p.is_deleted = false
    AND p.status = 'available'
    AND (p_project_id IS NULL OR p.project_id = p_project_id)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (p_bedrooms IS NULL OR (p.attributes->>'bedrooms')::INT = p_bedrooms)
    AND (p_min_area IS NULL OR (p.attributes->>'area')::NUMERIC >= p_min_area)
    AND (
      search_term IS NULL OR search_term = ''
      OR p.search_vector @@ plainto_tsquery('simple', search_term)
      OR p.title ILIKE '%' || search_term || '%'
    )
  ORDER BY rank DESC, p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ── 5. Verify ────────────────────────────────────────────────
-- Kiểm tra các index đã được tạo
SELECT indexname, tablename FROM pg_indexes
WHERE tablename IN ('properties', 'blogs', 'projects', 'translations')
ORDER BY tablename, indexname;
