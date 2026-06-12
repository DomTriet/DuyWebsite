CREATE TABLE public.blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL, -- Blog gắn trực tiếp với 1 dự án
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_blocks JSONB DEFAULT '[]'::jsonb, -- Lưu trữ Layout Builder dưới dạng Mảng JSON
    status TEXT CHECK (status IN ('draft', 'pending', 'published')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật bảo mật RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Public (Khách vãng lai) chỉ xem được bài đã xuất bản
CREATE POLICY "Public can view published blogs" ON public.blogs FOR SELECT USING (status = 'published');

-- Admin có toàn quyền thao tác (Duyệt, Xóa mọi bài)
CREATE POLICY "Admin full access blogs" ON public.blogs FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Agent có quyền quản lý, sửa và xóa BÀI CỦA CHÍNH MÌNH tạo ra
CREATE POLICY "Agents can manage own blogs" ON public.blogs FOR ALL USING (auth.uid() = author_id);