-- ============================================================
-- 13_setup_custom_theme.sql
-- Custom Theme — Drag & Drop Builder
-- Lưu toàn bộ cấu hình giao diện tùy biến của từng dự án vào projects.layout_config
-- Chạy file này trên Supabase SQL Editor
-- ============================================================

-- Cột JSONB chứa cấu hình builder (tokens màu/font, danh sách block, footer...)
-- Cấu trúc tham khảo:
--   {
--     "tokens": { colorPrimary, colorBg, colorText, colorAccent, fontHead, fontBody, logoUrl, logoText },
--     "blocks": [ { id, type, visible, props } ],   -- type: hero|stats|properties|sections|blogs|gallery|text|cta
--     "footer": { text, showContact, phone, email },
--     "basePropertyTheme": "minimalist"
--   }
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}'::jsonb;
