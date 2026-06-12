-- ============================================================
-- RESET DATABASE — Xóa toàn bộ dữ liệu, giữ lại users/profiles
-- Chạy trên Supabase SQL Editor (SQL tab → paste → Run)
-- ============================================================
-- Thứ tự xóa theo FK: con trước, cha sau
-- GIỮ: profiles, agent_profiles (dữ liệu tài khoản người dùng)
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Forum (05_setup_forum.sql)
--    forum_reactions/reports/comments → CASCADE từ forum_posts
--    Xóa tường minh để rõ ràng
-- ----------------------------------------------------------------
DELETE FROM public.forum_reactions;
DELETE FROM public.forum_reports;
DELETE FROM public.forum_comments;
DELETE FROM public.forum_posts;

-- ----------------------------------------------------------------
-- 2. Translations (06_setup_translations.sql)
--    Bản dịch của property/project — không FK ràng buộc
-- ----------------------------------------------------------------
DELETE FROM public.translations;

-- ----------------------------------------------------------------
-- 3. System Logs (08_setup_logs.sql)
-- ----------------------------------------------------------------
DELETE FROM public.system_logs;

-- ----------------------------------------------------------------
-- 4. Leads & Agent Requests (04_setup_leads.sql)
--    leads: FK SET NULL tới properties → xóa trước properties
--    agent_requests: FK CASCADE từ profiles (xóa an toàn)
-- ----------------------------------------------------------------
DELETE FROM public.leads;
DELETE FROM public.agent_requests;

-- ----------------------------------------------------------------
-- 5. Favorites (10_setup_favorites.sql)
--    FK CASCADE tới properties và profiles
-- ----------------------------------------------------------------
DELETE FROM public.favorites;

-- ----------------------------------------------------------------
-- 6. Blogs (09_setup_blogs.sql)
--    FK SET NULL tới properties và projects → xóa trước chúng
-- ----------------------------------------------------------------
DELETE FROM public.blogs;

-- ----------------------------------------------------------------
-- 7. Property Sections & Media (15_setup_property_sections.sql)
--    FK CASCADE từ properties — xóa trước khi xóa properties
-- ----------------------------------------------------------------
DELETE FROM public.property_sections;
DELETE FROM public.property_media;

-- ----------------------------------------------------------------
-- 8. Project Sections (12_setup_project_content.sql)
--    FK CASCADE từ projects — xóa trước khi xóa projects
-- ----------------------------------------------------------------
DELETE FROM public.project_sections;

-- ----------------------------------------------------------------
-- 9. Properties (03_setup_properties.sql)
--    FK tới projects và categories (SET NULL) — xóa trước chúng
-- ----------------------------------------------------------------
DELETE FROM public.properties;

-- ----------------------------------------------------------------
-- 10. Projects & Categories (02_setup_projects.sql)
-- ----------------------------------------------------------------
DELETE FROM public.projects;
DELETE FROM public.categories;

-- ----------------------------------------------------------------
-- 11. Homepage Banners (18_setup_homepage_banners.sql)
-- ----------------------------------------------------------------
DELETE FROM public.homepage_banners;

-- ----------------------------------------------------------------
-- 12. System Settings — reset về mặc định (19_setup_system_settings.sql)
--     Không xóa dòng, chỉ reset giá trị
-- ----------------------------------------------------------------
UPDATE public.system_settings
SET "value" = CAST('false' AS jsonb),
    updated_at = NOW()
WHERE key = 'forum_enabled';

-- ----------------------------------------------------------------
-- GIỮ NGUYÊN (không chạm vào):
--   auth.users            — Supabase Auth, quản lý bởi Auth service
--   public.profiles       — Thông tin người dùng (01_setup_users.sql)
--   public.agent_profiles — Thông tin đại lý (01_setup_users.sql)
-- ----------------------------------------------------------------

-- ----------------------------------------------------------------
-- Kiểm tra sau khi reset (chạy riêng nếu cần)
-- ----------------------------------------------------------------
SELECT table_name AS "table", remaining
FROM (
  SELECT 'forum_posts'      AS table_name, COUNT(*) AS remaining FROM public.forum_posts       UNION ALL
  SELECT 'forum_comments',                 COUNT(*) FROM public.forum_comments                  UNION ALL
  SELECT 'translations',                   COUNT(*) FROM public.translations                     UNION ALL
  SELECT 'system_logs',                    COUNT(*) FROM public.system_logs                      UNION ALL
  SELECT 'leads',                          COUNT(*) FROM public.leads                            UNION ALL
  SELECT 'agent_requests',                 COUNT(*) FROM public.agent_requests                   UNION ALL
  SELECT 'favorites',                      COUNT(*) FROM public.favorites                        UNION ALL
  SELECT 'blogs',                          COUNT(*) FROM public.blogs                            UNION ALL
  SELECT 'property_sections',              COUNT(*) FROM public.property_sections                UNION ALL
  SELECT 'property_media',                 COUNT(*) FROM public.property_media                   UNION ALL
  SELECT 'project_sections',               COUNT(*) FROM public.project_sections                 UNION ALL
  SELECT 'properties',                     COUNT(*) FROM public.properties                       UNION ALL
  SELECT 'projects',                       COUNT(*) FROM public.projects                         UNION ALL
  SELECT 'categories',                     COUNT(*) FROM public.categories                       UNION ALL
  SELECT 'homepage_banners',               COUNT(*) FROM public.homepage_banners                 UNION ALL
  SELECT '-- KEPT: profiles --',           COUNT(*) FROM public.profiles                         UNION ALL
  SELECT '-- KEPT: agent_profiles --',     COUNT(*) FROM public.agent_profiles
) t
ORDER BY table_name;
