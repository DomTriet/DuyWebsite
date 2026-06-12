-- ============================================================
-- 16_add_address_to_properties.sql
-- Thêm trường địa chỉ và URL nhúng bản đồ vào bảng properties
-- Chạy file này trên Supabase SQL Editor
-- ============================================================

ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS map_embed_url TEXT;
