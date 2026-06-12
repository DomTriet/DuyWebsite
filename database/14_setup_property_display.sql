-- ============================================================
-- 14_setup_property_display.sql
-- Hiển thị trang chi tiết BĐS: chọn theme riêng từng BĐS + bố cục ảnh
-- Chạy file này trên Supabase SQL Editor
-- ============================================================

-- Theme dùng cho TRANG CHI TIẾT của riêng BĐS này.
-- NULL = kế thừa theme của dự án (mặc định). Giá trị: minimalist | luxury | eco-green
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS detail_theme TEXT;

-- (Bố cục ảnh gallery lưu trong attributes.gallery_layout: 'default' | 'grid' | 'single' — không cần cột mới)
