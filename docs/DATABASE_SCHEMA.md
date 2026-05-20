# 🗄️ Database Schema & Architecture

Tài liệu này mô tả chi tiết cấu trúc cơ sở dữ liệu của nền tảng Pro-RealEstate, bao gồm các bảng, quan hệ, ứng dụng kiểu dữ liệu JSONB linh hoạt và các chính sách bảo mật Row Level Security (RLS) được thiết lập tại Supabase.

---

## 1. Tổng quan Sơ đồ Quan hệ (Entity Relationship)

*   **auth.users (Supabase)** `1 - 1` **profiles**
*   **profiles** `1 - 1` **agent_profiles**
*   **projects** `1 - N` **properties**
*   **categories** `1 - N` **properties**
*   **properties** `1 - N` **property_media**
*   **profiles** `1 - N` **favorites** `N - 1` **properties**
*   **properties** `1 - N` **leads**
*   **profiles** `1 - N` **properties** *(Người đăng / Agent phụ trách)*
*   **profiles** `1 - N` **leads** *(Agent chăm sóc Lead)*
*   **profiles** `1 - N` **forum_posts** *(Tác giả bài viết)*
*   **forum_posts** `1 - N` **forum_comments**
*   **profiles** `1 - N` **system_logs** *(Nhật ký hoạt động)*
*   **profiles** `1 - N` **blogs** *(Tác giả bài báo)*

---

## 2. Chi tiết Cấu trúc Bảng (Tables)

### 2.1. Quản lý Người dùng & Phân quyền (`01_setup_users.sql`)

**Bảng `profiles`**
Lưu trữ thông tin cơ bản của người dùng, được đồng bộ qua Trigger `on_auth_user_created` mỗi khi có user mới đăng ký qua Supabase Auth.
*   `id` (UUID, PK): Khóa chính, liên kết với `auth.users.id`.
*   `role` (ENUM): Vai trò (`'admin'`, `'agent'`, `'member'`). Mặc định là `'member'`.
*   Các trường hiển thị: `username`, `full_name`, `avatar_url`, `phone`.

**Bảng `agent_profiles`**
Mở rộng dữ liệu cho các Môi giới (Agent).
*   `profile_id` (UUID, PK/FK): Liên kết 1-1 với `profiles.id`.
*   Các trường nghiệp vụ: `experience_years`, `assigned_area`, `certificates`.

### 2.2. Quản lý Dự án & Bất động sản (`02_setup_projects.sql`, `03_setup_properties.sql`)

**Bảng `projects`**
Lưu trữ thông tin Dự án, quyết định Theme giao diện nào sẽ được hiển thị.
*   `id` (UUID, PK)
*   `theme_id` (TEXT): ID của Theme (`'minimalist'`, `'luxury'`, `'eco-green'`).
*   Các trường khác: `name`, `description`, `status`.

**Bảng `categories`**
*   `id` (SERIAL, PK), `name`, `slug` (UNIQUE).

**Bảng `properties` (Cốt Lõi)**
Lưu trữ thông tin chi tiết từng bất động sản.
*   `id` (UUID, PK)
*   `project_id` (UUID, FK), `category_id` (INT, FK).
*   `title`, `slug` (UNIQUE), `description`, `price` (DECIMAL, > 0).
*   **`attributes` (JSONB):** Cột lưu trữ dữ liệu động (VD: `{ "bedrooms": 3, "pool": true }`). Sử dụng index `GIN` giúp tăng tốc độ tìm kiếm bộ lọc phức tạp.
*   `created_by`, `agent_id` (UUID, FK): Ai tạo bài, ai đang quản lý.
*   `status`, `is_deleted` (BOOLEAN): Hỗ trợ cơ chế Soft Delete.

**Bảng `property_media`**
Quản lý danh sách hình ảnh/video của BĐS thay vì nhồi nhét vào bảng chính.
*   `property_id` (UUID, FK), `media_url`, `media_type`, `is_thumbnail`.

### 2.3. Quản lý Khách hàng / CRM (`04_setup_leads.sql`)

**Bảng `leads`**
Dữ liệu khách hàng để lại từ Form liên hệ/nhận báo giá.
*   Thông tin khách: `customer_name`, `customer_email`, `customer_phone`, `message`.
*   Tham chiếu: `property_id` (BĐS quan tâm), `agent_id` (Môi giới tiếp nhận).
*   `status`: Trạng thái xử lý (`'new'`, `'contacted'`, ...).
*   `notes`: Ghi chú nội bộ dành cho Agent/Admin để theo dõi tiến độ tư vấn.

**Bảng `agent_requests`**
Lưu trữ form yêu cầu trở thành Môi giới. Sử dụng `request_data` (JSONB) để lưu linh hoạt các câu trả lời form.

### 2.4. Diễn đàn Cộng đồng (`05_setup_forum.sql`)

**Bảng `forum_posts` & `forum_comments`**
*   Quản lý thảo luận, liên kết với `author_id` (profiles).
*   Trường `status` (`'pending'`, `'approved'`) hỗ trợ Admin duyệt nội dung trước khi publish.

**Bảng `forum_reactions` & `forum_reports`**
*   Hỗ trợ tương tác cộng đồng (Like/Thả tim) và gửi báo cáo vi phạm nội dung rác (Report) dành cho Ban quản trị.

### 2.5. Hệ thống Đa ngôn ngữ (`06_setup_translations.sql`)

**Bảng `translations`**
Cho phép dịch động nội dung DB mà không cần sửa bảng gốc.
*   `entity_type` (TEXT): Bảng tham chiếu (VD: `'property'`).
*   `entity_id` (UUID): ID của record cụ thể.
*   `lang_code` (TEXT): Mã ngôn ngữ (`'en'`, `'zh'`).
*   `translation_data` (JSONB): Nội dung dịch theo dạng Key-Value.

### 2.6. Hệ thống Nhật ký (Logs) (`08_setup_logs.sql`)

**Bảng `system_logs`**
Lưu trữ toàn bộ các thao tác chỉnh sửa, xóa, thêm mới quan trọng trên hệ thống.
*   `user_id` (UUID, FK): Người thực hiện (liên kết bảng `profiles`).
*   `action` (TEXT): Hành động (VD: 'UPDATE_PROPERTY', 'DELETE_LEAD').
*   `details` (TEXT): Ghi chú chi tiết về hành động đó.

### 2.7. Module Blog (CMS Marketing) (`09_setup_blogs.sql`)

**Bảng `blogs`**
Lưu trữ bài viết tin tức, bài PR dự án.
*   `id` (UUID, PK)
*   `title`, `slug` (UNIQUE)
*   `property_id` (UUID, FK, nullable): Liên kết bài viết với một BĐS cụ thể.
*   `author_id` (UUID, FK): Người viết bài (Admin/Agent).
*   **`content_blocks` (JSONB):** Mảng lưu trữ các khối giao diện (Text, Hình ảnh, Video, Header) theo chuẩn Block-based Editor. Rất linh hoạt để xây dựng bố cục bài viết.
*   `status` (TEXT): Trạng thái bài viết (`'draft'`, `'pending'`, `'published'`).

### 2.8. Danh sách Yêu thích (Favorites) (`10_setup_favorites.sql`)

**Bảng `favorites`**
Lưu trữ danh sách Bất động sản yêu thích (Wishlist) của người dùng.
*   `id` (UUID, PK)
*   `user_id` (UUID, FK): Liên kết bảng `profiles`.
*   `property_id` (UUID, FK): Liên kết bảng `properties`.
*   `UNIQUE(user_id, property_id)`: Đảm bảo một user chỉ lưu 1 BĐS một lần.

---

## 3. Chính sách Bảo mật (Row Level Security - RLS)

Các chính sách RLS (`07_setup_rls_policies.sql`) đảm bảo an toàn dữ liệu ngay từ tầng Database, phòng chống truy cập trái phép kể cả khi API lộ lọt:

### Bảng `properties`
*   **SELECT (Read):** Public. Bất kỳ ai cũng có thể xem bất động sản (chỉ hiển thị bài chưa xóa: `is_deleted = false`). Riêng `admin` và tác giả bài viết (`created_by`) được quyền xem toàn bộ (kể cả bài đã xóa mềm) để đảm bảo luồng Soft Delete không vi phạm RLS.
*   **INSERT (Create):** Yêu cầu xác thực (`authenticated`) VÀ có role là `admin` hoặc `agent`. User thường không thể gọi hàm thêm BĐS.
*   **UPDATE / DELETE:** Chỉ `admin` (có toàn quyền) HOẶC người dùng có `id` trùng với `created_by` (tác giả bài đăng) mới được phép sửa/xóa.

### Bảng `leads`
*   **INSERT (Create):** Public. Bất kỳ khách vãng lai nào truy cập web đều có thể gửi form liên hệ.
*   **SELECT (Read):**
    *   `admin`: Được xem tất cả Leads của hệ thống.
    *   `agent`: Chỉ được xem những Leads được gán cho mình (`auth.uid() = agent_id`).
    *   User thường/Khách: Hoàn toàn không được xem.

### Bảng `system_logs`
*   **SELECT (Read):** Chỉ `admin` được phép xem nhật ký để phục vụ công tác quản trị.
*   **INSERT / UPDATE / DELETE:** Vô hiệu hóa cho người dùng thường qua API Client. Dữ liệu chỉ được INSERT thông qua Backend (Lớp BUS) dùng `Service_Role_Key` để bỏ qua RLS.

### Bảng `blogs`
*   **SELECT (Read):** Public chỉ xem được các bài đã `'published'`. Admin xem được tất cả. Agent xem được bài của mình.
*   **INSERT / UPDATE / DELETE:** Admin có toàn quyền. Agent chỉ được quyền thao tác trên các bài do chính họ viết (`auth.uid() = author_id`).

### Bảng `favorites`
*   **Toàn quyền (ALL):** User chỉ có thể thao tác (Thêm/Xem/Xóa) trên danh sách yêu thích của chính họ (`auth.uid() = user_id`).