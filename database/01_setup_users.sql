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