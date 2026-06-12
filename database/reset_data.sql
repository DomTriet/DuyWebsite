-- ============================================================
-- RESET DATABASE — Xóa toàn bộ dữ liệu, giữ lại users/profiles
-- Chạy trên Supabase SQL Editor (hoặc psql với service_role key)
-- ============================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. Forum
-- ----------------------------------------------------------------
DELETE FROM public.forum_reactions;
DELETE FROM public.forum_reports;
DELETE FROM public.forum_comments;
DELETE FROM public.forum_posts;

-- ----------------------------------------------------------------
-- 2. Bất động sản
-- ----------------------------------------------------------------
DELETE FROM public.property_favorites;
DELETE FROM public.property_images;
DELETE FROM public.property_views;
-- Xóa properties trước khi xóa projects (FK constraint)
DELETE FROM public.properties;
DELETE FROM public.projects;

-- ----------------------------------------------------------------
-- 3. Blogs
-- ----------------------------------------------------------------
DELETE FROM public.blog_tags;
DELETE FROM public.blogs;

-- ----------------------------------------------------------------
-- 4. Danh mục (categories)
-- ----------------------------------------------------------------
DELETE FROM public.categories;

-- ----------------------------------------------------------------
-- 5. Notifications
-- ----------------------------------------------------------------
DELETE FROM public.notifications;

-- ----------------------------------------------------------------
-- 6. Banner & Settings — reset về giá trị mặc định
-- ----------------------------------------------------------------
DELETE FROM public.homepage_banners;

UPDATE public.system_settings SET value = 'false'::jsonb WHERE key = 'forum_enabled';

-- ----------------------------------------------------------------
-- GIỮ LẠI: auth.users, public.profiles — không chạm vào
-- ----------------------------------------------------------------
-- SELECT id, email, full_name FROM public.profiles; -- kiểm tra trước nếu cần

COMMIT;

-- ----------------------------------------------------------------
-- Kiểm tra sau khi reset
-- ----------------------------------------------------------------
SELECT 'forum_posts'       AS "table", COUNT(*) AS remaining FROM public.forum_posts
UNION ALL
SELECT 'properties',                   COUNT(*) FROM public.properties
UNION ALL
SELECT 'projects',                     COUNT(*) FROM public.projects
UNION ALL
SELECT 'blogs',                        COUNT(*) FROM public.blogs
UNION ALL
SELECT 'categories',                   COUNT(*) FROM public.categories
UNION ALL
SELECT 'homepage_banners',             COUNT(*) FROM public.homepage_banners
UNION ALL
SELECT 'profiles (kept)',              COUNT(*) FROM public.profiles;
