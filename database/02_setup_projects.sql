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