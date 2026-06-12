-- ============================================================
-- FULL SCHEMA - DuyWebsite (Supabase / PostgreSQL)
-- Auto-generated from 01~10_setup_*.sql
-- Last updated: 2026-06-02
-- ============================================================

-- ============================================================
-- 01. USERS & PROFILES
-- ============================================================

-- Khai báo Enum cho user_role
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'member');

-- Bảng profiles liên kết trực tiếp với auth.users của Supabase
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'member'::user_role,
    phone TEXT,
    email TEXT
);

-- Bảng agent_profiles: Thông tin chuyên sâu của Agent
CREATE TABLE public.agent_profiles (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    experience_years INTEGER DEFAULT 0,
    assigned_area TEXT,
    certificates TEXT
);

-- Trigger tự động: Chèn dữ liệu vào bảng profiles khi user đăng ký qua Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role public.user_role := 'member'::public.user_role;
BEGIN
    -- Gán an toàn: Chỉ đổi role nếu metadata thực sự có chứa giá trị hợp lệ
    IF new.raw_user_meta_data->>'role' = 'admin' THEN
        default_role := 'admin'::public.user_role;
    ELSIF new.raw_user_meta_data->>'role' = 'agent' THEN
        default_role := 'agent'::public.user_role;
    END IF;

    INSERT INTO public.profiles (id, full_name, role, email)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', default_role, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger tự động (Đồng bộ ngược): Cập nhật raw_user_meta_data khi Admin đổi role trong bảng profiles
CREATE OR REPLACE FUNCTION public.sync_role_to_auth_users()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        UPDATE auth.users
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_role_updated
    AFTER UPDATE OF role ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.sync_role_to_auth_users();

-- ============================================================
-- 02. PROJECTS
-- ============================================================

-- Bảng projects (Quản lý các dự án, liên kết Theme)
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    theme_id TEXT NOT NULL DEFAULT 'minimalist',
    description TEXT,
    status TEXT DEFAULT 'planning',
    layout_config JSONB DEFAULT '{}'::jsonb -- Cấu hình Custom Theme (drag & drop builder)
);

-- ============================================================
-- 03. PROPERTIES
-- ============================================================

-- Bảng categories (Loại hình BĐS: Căn hộ, Nhà phố, Đất nền...)
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);

-- Bảng properties: Bảng cốt lõi
CREATE TABLE public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(15,2) CHECK (price > 0),
    attributes JSONB DEFAULT '{}'::jsonb, -- Dữ liệu động
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'available',
    is_deleted BOOLEAN DEFAULT false, -- Hỗ trợ Soft Delete
    detail_theme TEXT -- Theme riêng cho trang chi tiết BĐS (NULL = theo dự án)
);

-- Đánh Index trên cột JSONB để tăng tốc độ tìm kiếm theo thuộc tính mở rộng
CREATE INDEX idx_properties_attributes ON public.properties USING GIN (attributes);

-- Bảng property_media: Quản lý Hình ảnh / Video linh hoạt
CREATE TABLE public.property_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    is_thumbnail BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- 04. LEADS & AGENT REQUESTS
-- ============================================================

-- Bảng leads (Khách hàng điền Form)
CREATE TABLE public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    message TEXT,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'new',
    notes TEXT -- Ghi chú nội bộ dành cho Admin/Agent theo dõi tiến độ
);

-- Bảng agent_requests (Yêu cầu đăng ký từ Agent/Broker)
CREATE TABLE public.agent_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_data JSONB, -- Linh hoạt lưu form đăng ký
    status TEXT DEFAULT 'pending'
);

-- ============================================================
-- 05. FORUM
-- ============================================================

-- Bảng forum_posts
CREATE TABLE public.forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending'
);

-- Bảng forum_comments
CREATE TABLE public.forum_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'approved'
);

-- Bảng forum_reactions (Hệ thống Like/Tim bài viết)
CREATE TABLE public.forum_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(post_id, user_id) -- Mỗi user chỉ được like 1 lần cho 1 bài
);

-- Bảng forum_reports (Nút báo cáo vi phạm)
CREATE TABLE public.forum_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- 06. TRANSLATIONS (Đa ngôn ngữ Backend)
-- ============================================================

CREATE TABLE public.translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    entity_type TEXT NOT NULL, -- Ví dụ: 'property', 'project'
    entity_id UUID NOT NULL,
    lang_code TEXT NOT NULL, -- Ví dụ: 'en', 'zh'
    translation_data JSONB NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    UNIQUE(entity_type, entity_id, lang_code)
);

-- ============================================================
-- 07. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Bật RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ---- PROPERTIES ----
-- SELECT: Public chỉ thấy bài chưa xóa. Admin và Tác giả được thấy toàn bộ (tránh lỗi Soft Delete).
CREATE POLICY "Properties viewable by public"
ON public.properties FOR SELECT USING (
    is_deleted = false
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR auth.uid() = created_by
);

-- INSERT: Chỉ Admin hoặc Agent
CREATE POLICY "Properties insertable by Admin or Agent"
ON public.properties FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'agent'))
);

-- UPDATE: Admin hoặc chủ bài đăng
CREATE POLICY "Properties updatable by Admin or Creator"
ON public.properties FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') OR auth.uid() = created_by
);

-- DELETE: Admin hoặc chủ bài đăng
CREATE POLICY "Properties deletable by Admin or Creator"
ON public.properties FOR DELETE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') OR auth.uid() = created_by
);

-- ---- LEADS ----
-- INSERT: Public (ai cũng có thể điền form)
CREATE POLICY "Leads insertable by public"
ON public.leads FOR INSERT WITH CHECK (true);

-- SELECT: Admin hoặc Agent được gán
CREATE POLICY "Leads viewable by Admin or Assigned Agent"
ON public.leads FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') OR auth.uid() = agent_id
);

-- UPDATE: Admin hoặc Agent được gán
CREATE POLICY "Leads updatable by Admin or Assigned Agent"
ON public.leads FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') OR auth.uid() = agent_id
);

-- ============================================================
-- 08. SYSTEM LOGS
-- ============================================================

CREATE TABLE public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT
);

-- Bảo mật: Chỉ Admin mới có quyền xem logs, không ai được sửa/xóa logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Logs viewable by Admin only"
ON public.system_logs FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Cho phép backend ghi log thay cho các user đã xác thực
CREATE POLICY "Logs insertable by authenticated users"
ON public.system_logs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
-- Lưu ý: Backend sẽ dùng Service Role (bỏ qua RLS) để INSERT dữ liệu log

-- ============================================================
-- 09. BLOGS
-- ============================================================

CREATE TABLE public.blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_blocks JSONB DEFAULT '[]'::jsonb, -- Lưu trữ Layout Builder dưới dạng Mảng JSON
    status TEXT CHECK (status IN ('draft', 'pending', 'published')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Public chỉ xem bài đã xuất bản
CREATE POLICY "Public can view published blogs" ON public.blogs FOR SELECT USING (status = 'published');

-- Admin có toàn quyền
CREATE POLICY "Admin full access blogs" ON public.blogs FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Agent chỉ quản lý bài của chính mình
CREATE POLICY "Agents can manage own blogs" ON public.blogs FOR ALL USING (auth.uid() = author_id);

-- Section nội dung dự án (Chủ đầu tư, Vị trí, Tiện ích, Pháp lý...)
CREATE TABLE public.project_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL CHECK (section_type IN
      ('overview','developer','location','amenities','legal','payment','custom')),
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Trường cố định theo loại section
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_project_sections_project ON public.project_sections (project_id, sort_order);

ALTER TABLE public.project_sections ENABLE ROW LEVEL SECURITY;

-- Public xem được toàn bộ section
CREATE POLICY "Public read project sections" ON public.project_sections FOR SELECT USING (true);

-- Chỉ Admin được quản lý section
CREATE POLICY "Admin manage project sections" ON public.project_sections FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- ============================================================
-- 10. FAVORITES
-- ============================================================

CREATE TABLE public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, property_id) -- Một user chỉ được lưu 1 BĐS một lần
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SEED: Gán Admin (chạy thủ công sau khi đăng ký tài khoản)
-- ============================================================
-- Bỏ comment và thay email trước khi chạy:
--
-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'your_email@example.com';
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your_email@example.com');
