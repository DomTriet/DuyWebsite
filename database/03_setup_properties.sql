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