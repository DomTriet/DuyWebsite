# 📋 MASTER CHECKLIST: DỰ ÁN WEBSITE BẤT ĐỘNG SẢN ĐA THEME (FULL CẤU TRÚC)

---

## 🏗️ GIAI ĐOẠN 1: DBO - KHỞI TẠO CƠ SỞ DỮ LIỆU & BẢO MẬT TẠI GỐC (SUPABASE)

*(Tác vụ: Chạy các file SQL này trực tiếp trên SQL Editor của Supabase)*

### 1.1. Cấu hình User, Phân quyền (Auth) & Hệ thống User & Role (Identity)

* [x] Tạo file `database/01_setup_users.sql`.
* [x] Viết script tạo bảng `public.users` liên kết với `auth.users` của Supabase.
* [x] Khai báo Enum `user_role` (`'admin'`, `'agent'`, `'member'`).
* [x] Chạy file `01_setup_users.sql` trên Supabase.
* [x] **Table profiles**: Gồm `id`, `updated_at`, `username`, `full_name`, `avatar_url`, `role` (enum), `phone`.
* [x] **Trigger tự động & Safe-cast**: Viết Function `handle_new_user()` và Trigger trên Supabase. Xử lý ép kiểu an toàn khi `raw_user_meta_data` bị thiếu trường, mặc định gán `member` tránh lỗi 500. Viết Trigger đồng bộ ngược `sync_role_to_auth_users`.
* [x] **Bảng agent_profiles**: Lưu thông tin chuyên sâu của Agent (số năm kinh nghiệm, khu vực phụ trách, bằng cấp).

### 1.2. Tạo bảng Quản lý Dự án & Cấu trúc Bất động sản cốt lõi (The Core)

* [x] Tạo file `database/02_setup_projects.sql`.
* [x] Viết script tạo bảng `projects` (`theme_id`, `name`,...).
* [x] Tạo file `database/03_setup_properties.sql`.
* [x] Viết script tạo bảng `properties`.
* [x] **[QUAN TRỌNG]** Khai báo cột `attributes` với kiểu dữ liệu `JSONB` để lưu linh hoạt Căn hộ/Nhà phố.
* [x] Chạy file 02 và 03 trên Supabase.
* [x] **Bảng categories**: Để bạn có thể thêm các loại hình khác sau này (Căn hộ, Đất nền...).
* [x] **Bảng properties (Chi tiết CRUD)**:
* [x] Ràng buộc toàn vẹn (Constraints): `price DECIMAL(15,2) CHECK (price > 0)`, `slug TEXT UNIQUE`.
* [x] Tối ưu truy vấn (Indexing): Đánh index `GIN (attributes)` để đảm bảo tốc độ lọc các trường JSONB linh hoạt (VD: Lọc nhà có `bedrooms = 3`).
* [x] Metadata & Soft Delete: `created_by` (Lưu ID người tạo), `agent_id` (Người phụ trách), cấu hình cờ `is_deleted BOOLEAN DEFAULT false`.
* [x] **Bảng property_media**: Lưu danh sách ảnh/video cho mỗi BĐS (tránh dồn quá nhiều text vào bảng chính).

### 1.3. Tạo bảng CRM (Leads) & Agent

* [x] Tạo file `database/04_setup_leads.sql`.
* [x] Viết script tạo bảng `leads` (khách hàng điền form). Set Foreign Key `agent_id` và `property_id`.
* [x] Viết script tạo bảng `agent_requests` (chứa cột `request_data` JSONB để lưu form linh hoạt).
* [x] Chạy file 04.

### 1.4. Tạo bảng Diễn đàn & Đa ngôn ngữ

* [x] Tạo file `database/05_setup_forum.sql`.
* [x] Viết script tạo bảng `forum_posts` và `forum_comments`.
* [x] Tạo file `database/06_setup_translations.sql`.
* [x] Viết script tạo bảng `translations` lưu cặp Key-Value.
* [x] Chạy file 05 và 06.

### 1.5. Thiết lập Bảo mật CSDL (Row Level Security - RLS) - "Bức tường lửa"

* [x] Tạo file `database/07_setup_rls_policies.sql`.
* [x] Viết Policy: Bật RLS cho tất cả các bảng.
* [x] Tùy chỉnh Policy `properties` (Fix lỗi 42501): Mở rộng quyền SELECT cho tác giả (`created_by`) và `admin` nhìn thấy toàn bộ dữ liệu (kể cả khi `is_deleted = true`) để luồng Soft Delete không bị Database từ chối.
* [x] Phân quyền dữ liệu `leads`: Public chỉ được INSERT. Agent chỉ được SELECT/UPDATE khách hàng được gán (`agent_id`).
* [x] Chạy file 07.
* [x] **Policy properties**:
* [x] SELECT: Public (mọi người đều xem được bài published).
* [x] INSERT: Chỉ authenticated và role là Admin hoặc Agent.
* [x] UPDATE/DELETE: Chỉ Admin hoặc người có id trùng với `created_by`.


* [x] **Policy leads**:
* [x] INSERT: Public (khách điền form).
* [x] SELECT: Admin hoặc Agent có id trùng với `agent_id` của lead đó.
* [x] **[BỔ SUNG]** Tạo file `database/08_setup_logs.sql` để tạo bảng `system_logs` và cấu hình RLS chỉ Admin xem được.
* [x] **[BỔ SUNG]** Tạo file `database/09_setup_blogs.sql` để tạo bảng `blogs` (CMS Marketing) với cấu trúc JSONB cho Layout Builder.

### 1.6. Chốt sổ Giai đoạn 1 (Documentation)

* [x] Viết tài liệu `docs/DATABASE_SCHEMA.md` giải thích cấu trúc bảng, kiểu dữ liệu JSONB và RLS Policies.
* [x] Tổng kết Database Schema, RLS và Triggers vào file `docs/PHASE_1_DBO.md`.


---

## 🎼 GIAI ĐOẠN 2: BUS - NHẠC TRƯỞNG LOGIC & XÂY DỰNG BACKEND NODE.JS (RAILWAY)

*(Tác vụ: Code tại thư mục backend/)*

### 2.1. Khởi tạo & Cấu hình (Config)

* [x] Chạy `npm init -y` tại thư mục `backend/`.
* [x] Cài đặt package: `express`, `cors`, `dotenv`, `@supabase/supabase-js`.
* [x] Tạo file `backend/.env`. Điền API keys của Supabase, Cloudinary, Resend.
* [x] Tạo `backend/src/server.ts`: Khởi tạo Express app, set up CORS.
* [x] Tạo `backend/src/config/supabase.ts`: Khởi tạo Supabase client.
* [x] Tạo các file config cho `cloudinary.ts` và `resend.ts`.

### 2.2. Xây dựng Middleware Phân quyền (RBAC) & Authentication / Authorization

* [x] Tạo `backend/src/middlewares/auth.middleware.ts`.
* [x] Viết hàm `verifyToken`: Lấy Bearer token, giải mã với Supabase Auth.
* [x] Tạo `backend/src/middlewares/role.middleware.ts`.
* [x] Viết hàm `requireAdmin`: Kiểm tra `req.user.role === 'admin'`.
* [x] Viết hàm `requireAgentOrAdmin`: Kiểm tra `req.user.role === 'agent' || 'admin'`.
* [x] Phân giải JWT: Lấy Bearer Token, query đối chiếu với `supabase.auth.getUser()`.
* [x] Bảo vệ tài nguyên (Ownership Check): Viết middleware xác minh Agent chỉ được thao tác chỉnh sửa/xóa trên các BĐS hoặc Blog do chính họ sở hữu.
* [x] **Chuẩn hóa API Response & Error Handling**: Tạo `error.middleware.ts` bắt mọi Exception (kể cả lỗi Async/Await), map sang JSON chuẩn HTTP Status (`400 Bad Request`, `401 Unauthorized`, `500 Internal`).
> *Ghi chú: Đăng ký `error.middleware.ts` ở dòng cuối cùng của file `server.ts` (sau tất cả các route) để bắt mọi lỗi phát sinh.*



### 2.3. Xây dựng Tầng Services & Utils Bổ sung

* [x] Tạo `backend/src/services/translation.service.ts`: Hàm gọi Google/Libre API.
* [x] Tạo `backend/src/services/notification.service.ts`: Hàm gọi Resend gửi mail.
* [x] Tạo `backend/src/services/upload.service.ts`: Xử lý Stream buffer Multer lên Cloudinary. Áp dụng `try/finally` kết hợp `fs.unlinkSync` xóa file `tmp/` chống Rò rỉ bộ nhớ (Memory Leak).
* [x] Tạo `backend/src/services/censor.service.ts`: Thuật toán Regex dò tìm từ khóa cấm trong nội dung diễn đàn.
* [x] **[BỔ SUNG]** Tạo `backend/src/services/log.service.ts`: Lưu vết mọi thao tác của Admin/Agent để quản lý lịch sử hệ thống.
* [x] **[BỔ SUNG]** Tạo `backend/src/utils/slug.util.ts`: Hàm chuyển đổi Tiếng Việt có dấu thành slug không dấu cho URL.

### 2.4. Xây dựng Controllers, Logic Core (Nhạc trưởng) & Chi tiết CRUD tương tác

* [x] Tạo `backend/src/controllers/property.controller.ts`.
* [x] Tạo `backend/src/controllers/project.controller.ts`.
* [x] Hàm `createProperty`: Nhận JSON data, parse phần dữ liệu linh hoạt nhét vào cột `attributes` (JSONB) trước khi đẩy xuống Supabase.
* [x] Logic lọc động (Dynamic Querying): API `getProperties` nhận cờ `?manage=true`. Tự động chèn query `.or('agent_id.eq.ID,created_by.eq.ID')` nếu request gọi từ Dashboard Agent, giữ nguyên query nếu từ Public.
* [x] Tạo `backend/src/controllers/forum.controller.ts`.
* [x] Hàm `createPost`: Gọi `censor.service.ts` trước. Nếu pass, set `status='pending'`, insert xuống Supabase.
* [x] Tạo `backend/src/controllers/lead.controller.ts`.
* [x] Hàm `submitLead`: Insert DB -> Lấy email Agent/Admin phụ trách -> Gọi `notification.service.ts` bắn email.
* [x] **Create Property**:
* [x] Kiểm tra file upload có đúng định dạng (jpg, png, mp4).
* [x] Tự động tạo slug từ tên dự án (sử dụng `slug.util.ts`).
* [x] Gọi API dịch thuật ngay sau khi lưu bản gốc.


* [x] **Read (Public)**: Cache dữ liệu các dự án hot để giảm tải cho Supabase.
* [x] **Update**: Gọi `log.service.ts` để lưu lại lịch sử chỉnh sửa - ai đã sửa cái gì vào lúc nào.
* [x] **Delete**: Áp dụng "Soft Delete" (chỉ đánh dấu `is_deleted = true`) thay vì xóa vĩnh viễn để tránh mất dữ liệu nhầm.

### 2.5. Logic Diễn đàn & Cộng đồng (Advanced)

* [x] Rate Limiting: Chặn Member spam (Ví dụ: 1 phút chỉ được đăng 1 bình luận).
* [x] Auto-Censor Service: Lọc từ thô tục. Chặn chèn link website đối thủ (Regex check).
* [x] Notification Logic: Admin duyệt bài -> Gửi mail thông báo cho Member bài đã lên sóng. Có khách điền form -> Bắn thông báo Real-time qua Socket.io hoặc Push Notification.

### 2.6. Đa ngôn ngữ (Translation Workflow)

* [x] Tích hợp cơ chế "Fallback": Nếu bản dịch tiếng Anh chưa có, tự động hiển thị tiếng Việt thay vì để trống.
* [x] API Endpoint riêng cho việc Admin "Approve" bản dịch máy.

### 2.7. Xây dựng Routes (Định tuyến API)

* [x] Tạo `backend/src/routes/property.routes.ts`: Map endpoint với Controller, gắn middleware auth/role vào.
* [x] **[BỔ SUNG]** API Lấy danh mục `categories` cho thuộc tính và lưu trữ mảng hình ảnh vào `property_media`.
* [x] Tạo `backend/src/routes/auth.routes.ts`: API Đăng ký, Đăng nhập, Quên mật khẩu và Đăng xuất.
* [x] Tạo `backend/src/routes/project.routes.ts`: Phân quyền Admin quản lý.
* [x] Tạo `backend/src/routes/lead.routes.ts`: Public API cho khách hàng vãng lai gửi yêu cầu.
* [x] **[BỔ SUNG]** API `GET /leads` và `PUT /leads/:id/status` cho Admin/Agent Dashboard.
* [x] **[BỔ SUNG]** API `POST /upload` với Multer lưu ảnh/video lên Cloudinary.
* [x] **[BỔ SUNG]** API `GET /profiles/me` và `PUT /profiles/me` quản lý hồ sơ Agent/Member.
* [x] **[BỔ SUNG]** API `GET /logs` giúp Admin kiểm soát lịch sử thao tác hệ thống.
* [x] **[BỔ SUNG]** Tạo `backend/src/controllers/blog.controller.ts` và `backend/src/routes/blog.routes.ts`: Quản lý bài viết Blog (Block-based).
* [x] Tạo `backend/src/routes/forum.routes.ts`: Đăng bài (VerifyToken) và Xem danh sách bài.
* [x] Tạo `backend/src/routes/index.ts`: Gom toàn bộ routes vào tiền tố `/api`. Map vào `server.ts`.

### 2.8. Chốt sổ Giai đoạn 2 (Documentation)
* [x] Tổng kết danh sách API, luồng Middlewares và Error Handling vào file `docs/PHASE_2_BUS.md`.
* [x] Cập nhật tài liệu `docs/API_REFERENCE.md` cho các API đã hoàn thiện.

---

## 💻 GIAI ĐOẠN 3: LỚP GUI - CORE, TRẢI NGHIỆM NGƯỜI DÙNG & DASHBOARD QUẢN TRỊ (ANGULAR)

*(Tác vụ: Code tại thư mục frontend/)*

### 3.1. Thiết lập Core (Khung xương Angular)

* [x] Chạy `ng new frontend`. Xóa các file rác.
* [x] Khởi tạo thư mục `frontend/src/app/core/`.
* [x] **[BỔ SUNG]** Tạo `frontend/src/app/core/models/`: Định nghĩa các Interface toàn cục (`User.ts`, `Property.ts`, `Lead.ts`, `ThemeConfig.ts`).
* [x] Tạo `core/services/api.service.ts`: Viết các hàm HttpClient (get, post, put, delete) gọi lên BUS.
* [x] **[BỔ SUNG]** Tạo `core/services/upload.service.ts`: Xử lý bọc Form-Data để gọi API `POST /upload`.
* [x] **[BỔ SUNG]** Tạo `core/services/socket.service.ts`: Khởi tạo kết nối `Socket.io` client để lắng nghe các sự kiện real-time (ví dụ: `new_lead`).
* [x] Interceptor Bảo mật (`auth.interceptor.ts`): Tự động nhét JWT token. Lắng nghe HTTP Error, nếu trả về `401 Unauthorized`, tự động ép `localStorage.clear()` và redirect người dùng ra trang Login (Session Expired).
* [x] Tạo `core/guards/admin.guard.ts` và `agent.guard.ts`: Bảo vệ các route nhạy cảm.

### 3.2. Cấu trúc Module Admin Dashboard / Dashboard Quản trị (Admin & Agent)

* [x] Tạo `frontend/src/app/admin/admin.module.ts` và `admin-routing.module.ts`.
* [x] **State Management (NgRx/Signals)**: Tích hợp định tuyến Lazy Loading.
* [x] Tạo `admin/layout/sidebar.component.ts` (và header): Viết logic HTML dùng `*ngIf`: Nếu role là Agent, ẩn tab "Cấu hình Theme", "Duyệt Diễn Đàn".
* [x] **Xây dựng Authentication Module (`auth/`)**:
  * [x] Tạo `AuthService`: Viết các hàm gọi API (`login`, `register`, `logout`, `forgotPassword`, `resetPassword`) và lưu/xóa JWT Token ở LocalStorage.
  * [x] Dựng `login.component`: Reactive Form đăng nhập. Xử lý lưu `access_token` và redirect vào Dashboard.
  * [x] Dựng `register.component`: Reactive Form đăng ký (Tích hợp Validator check khớp Mật khẩu). Thông báo người dùng check email.
  * [x] Dựng `forgot-password.component`: Form nhập email gọi API `/auth/forgot-password`.
  * [x] Dựng `reset-password.component`: Bắt token từ URL (qua `ActivatedRoute`), form nhập mật khẩu mới gọi API `/auth/reset-password`.
  * [x] Xử lý Đăng xuất (Logout): Nút trên Header sidebar, gọi API `/auth/logout`, clear token và đẩy về trang đăng nhập.
* [x] **[BỔ SUNG]** Tạo `admin/pages/account-settings/`: Trang cá nhân cho phép Admin/Agent/Member đổi Avatar, Tên, Số điện thoại (`PUT /profiles/me`). 
* [x] **[BỔ SUNG]** Tạo form "Đăng ký làm Môi giới" trong Account Settings để Member gọi API `POST /leads/agent-requests`.
* [x] **[BỔ SUNG]** Tạo `admin/pages/dashboard-stats/`: Dựng biểu đồ tổng quan dựa vào API `GET /stats`. Lắng nghe `Socket.io` để nhảy số Leads. *(Lưu ý UI: Agent chỉ xem được thống kê cá nhân, Admin xem toàn hệ thống).*
* [x] Dựng `properties-manage` siêu việt (SPA UX):
  * [x] Áp dụng Nested `FormGroup` hứng toàn bộ input "Phòng ngủ", "Diện tích", map gọn thành Object JSONB `attributes` gửi xuống API, hoàn toàn không cần hàm parse thủ công.
  * [x] **Cơ chế Toggle View**: Ẩn/hiện mượt mà giữa Grid Bảng BĐS và Form Sửa (`*ngIf="isFormVisible"`) không cần nạp lại trang.
  * [x] **Đồng bộ DOM**: Áp dụng `ChangeDetectorRef` (cdr) ép Angular render ngay lập tức sau khi nhận Async Promise từ API.
  * [x] **Drag & Drop Upload**: Bắt sự kiện HTML5 native `(dragover)`, gọi Multer API, hiển thị thẻ ảnh xem trước, có icon chọn "Ảnh bìa". Nút Submit tự động `[disabled]` khi ảnh đang tải.
* [x] Tạo `admin/pages/categories-projects-manage/`: Giao diện CRUD quản lý Danh mục BĐS (`/properties/categories`) và Dự án (`GET`, `POST`, `PUT`, `DELETE /projects`).
* [x] Tạo `admin/pages/users-manage/`: Giao diện Admin quản lý người dùng, thay đổi Role (`PUT /profiles/:id/role`).
* [x] Tạo `admin/pages/agent-requests/`: Hiển thị danh sách đăng ký môi giới (`GET /leads/agent-requests`). Nút Duyệt/Từ chối (`PUT /leads/agent-requests/:id/status`).
* [x] Tạo `admin/pages/forum-approval/`: 
  * Tab "Bài viết chờ duyệt": Gọi API `GET /forum/pending`, nút "Approve" (`PUT /forum/:id/approve`) và "Xóa bài" (`DELETE /forum/:id`).
  * Tab "Báo cáo vi phạm": Gọi API `GET /forum/reports/pending` và xử lý (`PUT /forum/reports/:reportId/resolve`).
  * Tab "Quản lý Bình luận": Nút xóa bình luận rác gọi API `DELETE /forum/comments/:commentId`.
* [x] Tạo `admin/pages/translations-manage/`: 
  * Gọi API `GET /translations/pending` để lấy danh sách bản dịch máy đang chờ duyệt.
  * Layout chia 2 cột để đối chiếu bản dịch gốc - bản dịch máy.
  * Nút "Duyệt nhanh" (`PUT /translations/:id/approve`) và form Lưu chỉnh sửa nếu máy dịch sai (`PUT /translations/:id`).
* [x] **Lead Management**: Gọi API `GET /leads`. Thêm tính năng cập nhật `status` và `notes` (ghi chú nội bộ) qua API `PUT /leads/:id`.
* [x] **[BỔ SUNG] Agent Portal (Hạn chế quyền)**: Ẩn các menu "Quản lý User", "Duyệt Diễn Đàn", "Nhật ký hệ thống", "Dịch thuật" trên Sidebar nếu role là `agent`.
* [x] **[BỔ SUNG]** Tạo `admin/pages/system-logs/`: Hiển thị lịch sử hoạt động hệ thống (`GET /logs`) dành riêng cho Admin (Bảo vệ bởi AdminGuard).
* [x] **[BỔ SUNG]** Tạo `admin/pages/blog-manage/`: 
  * `blog-manage.component`: Danh sách Blog (Admin duyệt, Agent quản lý bài viết của mình).
  * `blog-editor.component`: Trình soạn thảo Blog dạng kéo thả Component (Layout Builder) lưu vào JSONB, hỗ trợ Live Preview.

### 3.3. Shared Components & Validators (Bổ sung)

* [x] **[BỔ SUNG] Skeleton Loader**: Tạo `frontend/src/app/shared/components/skeleton-loader/` để tối ưu UX.
> *Lưu ý: Tạo các mẫu skeleton riêng cho từng theme để người dùng cảm nhận được layout ngay khi đang load.*

* [x] **[BỔ SUNG] Validators**: Tạo các hàm kiểm tra dữ liệu form (Số điện thoại Việt Nam, định dạng email, mật khẩu mạnh...).

### 3.4. Diễn đàn (Cộng đồng)

* [x] **Trang Danh sách Bài viết**: Gọi API `GET /forum` hiển thị luồng thảo luận của cộng đồng.
* [x] **Trang Chi tiết Bài viết & Bình luận**: Gọi API `GET /forum/:id` và `GET /forum/:postId/comments`.
* [x] Giao diện đăng bài (`POST /forum`): Giới hạn Rate Limit và hiển thị thông báo "Bài viết đang chờ duyệt".
* [x] Tính năng Bình luận (`POST /forum/:postId/comments`), Reaction (`POST /forum/:postId/react`) và Báo cáo vi phạm (`POST /forum/:postId/report`).

### 3.5. Chốt sổ Giai đoạn 3 (Documentation)
* [x] Tài liệu hóa luồng hoạt động của Admin/Agent Dashboard và Phân quyền UI vào file `docs/PHASE_3_GUI_ADMIN.md`.
* [x] Cập nhật tài liệu hướng dẫn sử dụng cơ bản `docs/USER_MANUAL.md` cho Admin và Agent.

---

## 🎨 GIAI ĐOẠN 4: LỚP GUI - THEME ENGINE KHÁCH HÀNG (MŨI NHỌN UI/UX)

*(Tác vụ: Code tại thư mục frontend/src/app/guest/)*

### 4.1. Cơ chế Routing Thông minh (Theme Resolver) & Theme Engine

* [x] **Global Home Page (`guest/home.component.ts`)**:
  * Xây dựng trang chủ gốc (`path: ''`), hiển thị danh sách các Dự án (`GET /projects`).
  * Trỏ link đến từng dự án (`/project/:id`) để Theme Resolver nạp đúng giao diện tương ứng.
* [x] **Theme Resolver (`themes/theme.resolver.ts`)**: 
  * Đã cài đặt `ResolveFn` sử dụng `apiService.get('/projects/:id')`.
  * Ứng dụng toán tử RxJS `map()` và `catchError()` để xử lý Fallback an toàn (tự động trả về theme `minimalist` nếu backend lỗi hoặc URL sai).
* [x] **Routing Config (`app.routes.ts`)**: 
  * Đã cấu hình Object `resolve: { theme: themeResolver }` vào path `project/:id`. Angular sẽ hoãn render cho tới khi Resolver bắt được `theme_id`.
* [x] **Dynamic Component Loader (`themes/theme-container.component.ts`)**: 
  * Đã sử dụng `@ViewChild('themeContainer', { read: ViewContainerRef })`.
  * Áp dụng Native `import()` của ES6 để Lazy-load chính xác Standalone Component của Theme (vd: `import('./luxury/luxury.component')`) và nạp vào DOM bằng `createComponent()`.
* [x] **Tối ưu Network (Resolver)**: Nâng cấp `theme.resolver.ts` để trả về toàn bộ Object `Project` (thay vì chỉ chuỗi ID). Tránh việc Theme con phải gọi lại API `/projects/:id` một lần nữa.
* [x] **Router Component Input Binding**: 
  * Mở file `app.config.ts`, thêm `withComponentInputBinding()` vào `provideRouter()`.
* [x] **Cơ chế truyền dữ liệu (Data Passing):** 
  * Tại `ThemeContainerComponent`, sau khi gọi `createComponent()`, thực thi lệnh `componentRef.setInput('project', projectData)` để truyền dữ liệu ngầm định xuống Theme con.
* [x] **Theme Shared Service (`ThemeStateService`)**: 
  * Khởi tạo `BehaviorSubject` lưu state `currentProjectId` (Dùng để filter danh sách BĐS ở mọi trang).
  * Khởi tạo tính năng "Yêu thích BĐS": Dùng `localStorage` lưu danh sách UUID, map vào RxJS để tự động cập nhật icon Trái tim (Heart icon) không cần reload trang.
* [x] **[LỜI KHUYÊN] Tối ưu SEO (Sitemap & Robots)**: Xây dựng API tự động render `sitemap.xml` động (On-the-fly) để luôn cập nhật URL BĐS mới nhất cho Google Bot mà không cần lưu file cứng.
> *Đã hoàn thiện tại Giai đoạn 2 bằng API `GET /api/seo/sitemap.xml` chuẩn kiến trúc Cloud.*

### 4.2. Tích hợp Module Cộng đồng (Forum) & Tin tức (Blogs) vào Client

* [x] **CMS Client (Blog List)**: 
  * Tạo `BlogListComponent` (`GET /blogs`). Xây dựng Masonry Grid Layout. 
  * Áp dụng `NgOptimizedImage` để Lazy-load ảnh Thumbnail.
* [x] **CMS Rendering Engine (Blog Detail)**: 
  * Component `BlogDetailComponent` (`GET /blogs/:slug`).
  * Trình thông dịch JSONB `content_blocks`: Duyệt vòng lặp mảng blocks.
    * Nếu `type === 'text'`: Sử dụng Angular `DomSanitizer.bypassSecurityTrustHtml` để ép kiểu chuỗi HTML an toàn và in ra qua directive `[innerHTML]`.
    * Nếu `type === 'image'`: Render thẻ `<img class="w-full rounded-lg shadow-md my-4">`.
    * Nếu `type === 'video'`: Trích xuất YouTube ID và nhúng thẻ `<iframe>`.
* [x] **Forum List (Cộng đồng)**: 
  * Component `ForumListComponent` (`GET /forum`).
  * Thiết kế UI dạng Feed (Giống Facebook/Reddit). In ra thông tin `author.avatar_url`, `created_at` (Dùng Angular `DatePipe` format 'dd/MM/yyyy HH:mm').
* [x] **Chi tiết Diễn đàn & Tương tác:** 
  * `ForumDetailComponent` kết hợp `ReactiveFormsModule`.
  * **Optimistic UI (Nút Like):** Khi bấm Like, tự động cộng `+1` số lượng hiển thị UI trước khi gọi API `POST /forum/:postId/react`. Nếu API báo lỗi `400/500`, rollback lại `-1` (trải nghiệm mượt mà không độ trễ).
  * **Auto-refresh Comments:** Gửi Comment xong, `push()` comment mới thẳng vào mảng `comments[]` đang hiển thị trên UI, dọn sạch (reset) form nhập liệu.
  * **Auth Check Intercept:** Bắt sự kiện Click nút Like/Comment. Kiểm tra `authService.isLoggedIn()`. Nếu `false`, mở Modal `<app-login-modal>` thay vì chuyển trang.

### 4.3. Tích hợp Thu thập Khách hàng (Leads CRM Workflow)

* [x] **Tạo Component Dùng Chung (`shared/components/lead-form/lead-form.component.ts`)**:
  * Setup `FormGroup`: `customer_name` (required), `customer_phone` (required, custom Regex check SĐT `/(84|0[3|5|7|8|9])+([0-9]{8})\b/`), `customer_email` (email pattern).
* [x] **Input / Output Logic:**
  * Khai báo `@Input() propertyId!: string` và `@Input() agentId?: string`.
* [x] **Gửi Dữ liệu & Xử lý UX:**
  * Handle Submit: Gọi `api.post('/leads', payload)`.
  * State `isSubmitting = true` -> Trói buộc `[disabled]` vào nút Submit, đổi Text thành "Đang gửi...".
  * Xử lý Success: Gọi thư viện Toast notification (hoặc custom div alert), reset form.
* [x] **Agent Card Component (`shared/components/agent-card/agent-card.component.ts`)**: 
  * Tạo UI nhỏ hiển thị "Chuyên viên tư vấn".
  * Đổ dữ liệu từ `prop.agent` (được join từ DB): `avatar_url`, `full_name`. Tạo nút "Gọi ngay" dùng thẻ `<a href="tel:{{ agent.phone }}">`.

### 4.4. Triển khai Theme 1: Luxury (Căn hộ cao cấp)

* [x] **Khởi tạo Khung Giao Diện:** Đã tạo Standalone Component `themes/luxury/luxury.component.ts`.
* [x] **Hệ màu & Typography:** Cấu hình inline styles định nghĩa `--theme-primary: #0f172a`, `--theme-accent: #d4af37` (Vàng Gold). Sử dụng font `@import url('...Playfair Display')`.
* [x] **Global Layout:** Header có thuộc tính `absolute w-full z-50` (nằm đè lên banner) với hiệu ứng `backdrop-blur`.
* [x] **Trang Chủ Dự án (Project Home):**
  * Hero Banner: Container `h-screen`. Bên trong là `<video autoplay loop muted>` làm nền, fallback về thẻ `<img>`.
  * Khối "Về dự án": Nhận `@Input() project`. In `project.description` kèm hiệu ứng `Fade-in-up` (dùng thư viện AOS hoặc CSS animation).
* [x] **Danh sách BĐS (Listing):** 
  * Gọi API `GET /properties?project_id=...`. Card BĐS dùng tỷ lệ ảnh 4:3 (`aspect-[4/3]`). Phủ gradient đen mờ lên ảnh để làm nổi bật Giá đè lên ảnh. Bóc tách JSONB (Bedrooms, Bathrooms).
* [x] **Trang Chi tiết BĐS (`/luxury/property/:slug`):**
  * Header ảnh: Đã thiết kế hệ thống Thumbnail Gallery CSS-based đẹp mắt mà không cần nạp thêm thư viện bên thứ 3.
  * **JSONB Extractor:** Dùng `*ngIf="property.attributes?.bedrooms"` và bóc tách thành công toàn bộ thông số lên giao diện.
  * Sidebar phải: Gắn `<app-lead-form [propertyId]="property.id" class="sticky top-24"></app-lead-form>` thu thập Contact thành công.

### 4.5. Triển khai Theme 2: Minimalist (Nhà phố)

* [x] **Khởi tạo Khung Giao Diện:** Đã tạo Standalone Component `themes/minimalist/minimalist.component.ts`.
* [x] **Hệ màu & Typography:** `--theme-primary: #ffffff`, `--theme-accent: #111827`. Sử dụng Font `Inter`. CSS loại bỏ shadow, dùng viền mỏng (`border border-gray-200`).
* [x] **Global Layout:** Thiết kế header trong suốt tinh tế, khối vuông vức, ưu tiên khoảng trắng (Whitespace).
* [x] **Trang Chủ Dự án & Danh sách (Listing):**
  * Gọi API `GET /properties`.
  * UI Listing: Thiết kế list nằm ngang (Flex-row). Trái là Ảnh vuông, Phải là thông số. Hiển thị rõ cột giá trị (Price/m2) tự động tính toán.
* [x] **Trang Chi tiết BĐS (`/minimalist/property/:slug`):**
  * Cấu trúc Ảnh: Bố cục lưới CSS Grid (1 ảnh lớn bên trái, 2 ảnh nhỏ xếp chồng bên phải) đẹp mắt giống Airbnb.
  * **JSONB Extractor:** Truy xuất `area`, `floors`, `bedrooms`, `bathrooms`, `frontage`, `street_width` đưa vào thẻ `<dl>` (Description List) chia cắt bởi viền mảnh.
  * Contact Form: Component `<app-lead-form>` được tích hợp In-line tinh tế ở cuối bài viết.

### 4.6. Triển khai Theme 3: Eco-Green (Khu sinh thái & Nghỉ dưỡng)

* [x] **Khởi tạo Khung Giao Diện:** Đã tạo Standalone Component `themes/eco-green/eco-green.component.ts`.
* [x] **Hệ màu & Typography:** Cấu hình `--theme-primary: #f0fdf4` (Xanh nhạt), `--theme-accent: #15803d` (Xanh lá). Sử dụng Font chữ `Quicksand`. Áp dụng độ bo góc mạnh `--rounded-box: 1.5rem` (`rounded-3xl`).
* [x] **Global Layout:** Header nổi bật với lớp pattern thiên nhiên SVG kết hợp gradient chìm và cấu trúc bo góc tròn dưới.
* [x] **Trang Chủ & Danh sách:**
  * Card BĐS được gắn thêm Nhãn (Badge) xanh lá "Mật độ xanh cao" ở góc ảnh cực kỳ thu hút.
* [x] **Trang Chi tiết BĐS (`/eco-green/property/:slug`):**
  * Đã tích hợp khối Bản đồ dự án tĩnh.
  * **JSONB Extractor:** Thành công bóc tách các trường `green_area`, `lake_view`, `security_247` và in ra bằng cấu trúc Grid 4 cột có màu nền nhạt rất hòa hợp thiên nhiên.

### 4.7. Tích hợp Đa ngôn ngữ (Client-side tĩnh & API động) & SEO

* [x] **Cài đặt & Cấu hình:**
  * Đã hướng dẫn npm install `@ngx-translate/core` `@ngx-translate/http-loader`.
  * Đã cấu hình `TranslateModule.forRoot()` trong `app.config.ts` với Custom Loader (an toàn cho SSR).
  * Đã tạo file ngôn ngữ tĩnh `vi.json`, `en.json`, `ko.json` (Hàn) và `zh.json` (Trung).
* [x] **Dịch Giao Diện Tĩnh (Static UI):**
  * Khởi tạo `LanguageService` xử lý chuyển đổi ngôn ngữ, lưu `localStorage` (có kiểm tra SSR).
  * Tích hợp Nút cờ (Flag) vào Navbar và thay thế HTML tĩnh bằng Pipe `translate` toàn hệ thống.
* [x] **Dịch Nội Dung Động từ Database (Dynamic Content):**
  * Cấu trúc sẵn hàm `getDynamicTranslation` trong `LanguageService` gọi API lấy bản dịch Fallback.
* [x] **Tối ưu SEO Meta Tags (Angular Meta Service):**
  * Tạo `SeoService` import `Title` và `Meta`.
  * Viết hàm `setMeta()` tối ưu OpenGraph (og:title, og:image) chuẩn bị cho việc chia sẻ MXH.

### 4.8. Các Nâng cấp Trải nghiệm Người dùng (UX/UI Refinements)

* [x] **Global Navbar & Core Pages:** Bổ sung Navbar chuẩn. Tạo trang `About Us` và `Contact Us` độc lập thay thế dạng Anchor Link.
* [x] **Member Profile (`/profile`):** Tách luồng Admin/Member. Hiển thị thông tin cá nhân và Form xin cấp quyền Môi giới.
* [x] **Agent Request Status API:** Bổ sung API `GET /leads/agent-requests/status` kiểm tra tình trạng duyệt Real-time.
* [x] **Fix SSR & Rendering Bugs:** Chuyển đổi sang `markForCheck()` để chặn lỗi NG0100 và màn hình trắng. Cấu hình WebSocket Polyfill cho Node 20.
* [x] **Forum & Grid Fixes:** Sửa lỗi tràn ảnh (Minimalist Grid) và bổ sung `authGuard` cho route `/forum/create`.
* [x] **Wishlist / Favorites:** Thêm bảng `favorites`, API `GET /favorites`, `POST /favorites/toggle` và giao diện thả tim trên toàn bộ Theme, quản lý tập trung tại trang Profile.
* [x] **Web Share API & Search Filter:** Tích hợp tính năng Chia sẻ (Copy URL) native trên mobile/desktop để tăng sức mạnh SEO. Nút xóa bộ lọc tìm kiếm tại trang chủ.

### 4.9. Chốt sổ Giai đoạn 4 (Documentation)
* [x] Ghi chú lại logic hoạt động của Multi-Theme Engine, Lazy Loading, và cấu hình Resolver vào file `docs/PHASE_4_GUI_THEMES.md`.
* [x] **[FINAL AUDIT]** Rà soát và cập nhật toàn bộ tài liệu (`API_REFERENCE`, `THEME_DEVELOPMENT_GUIDE`...) để phản ánh 100% các nâng cấp cuối cùng (Scroll-to-top, i18n, Search,...).


## ✅ GIAI ĐOẠN 5: CHECKLIST TỔNG KIỂM TRA (QA), KIỂM THỬ VÀ DEPLOY

### 5.1. Kiểm thử Bảo mật & Phân quyền (Security & RBAC QA)

* [ ] **Client-side Guards:** Dùng tài khoản `agent` cố tình gõ URL `/admin/system-logs`, đảm bảo `AdminGuard` đá văng về Dashboard.
* [ ] **API Endpoint Protection:** Dùng Postman với Token của Agent, thử gửi request `DELETE /projects/:id`, đảm bảo BUS trả về `403 Forbidden` (Role middleware block).
* [ ] **Data Ownership RLS:** Dùng Token của Agent A thử gọi `PUT /properties/:id_cua_agent_B`, đảm bảo DBO từ chối giao dịch (PGRST116 / 401).
* [ ] **XSS & SQL Injection:** Thử nhập script thẻ `<script>alert(1)</script>` vào Form điền Lead xem API có filter/escape an toàn không.

### 5.2. Kiểm thử Luồng Kỹ thuật (Workflow Integration QA)

* [ ] **Luồng Đa ngôn ngữ Ngầm:** Tạo BĐS mới. Check sau 2-3 giây trên DB xem bản ghi tiếng Anh đã được Background Task chèn vào bảng `translations` chưa.
* [ ] **Luồng Socket.io:** Mở song song trình duyệt Khách (ẩn danh) và trình duyệt Admin. Khách điền Lead, Admin phải nhận được thông báo nảy số realtime mà không F5.
* [ ] **Luồng Fallback:** Vào trang BĐS tiếng Anh khi bản dịch chưa được Admin duyệt (hoặc máy dịch lỗi), đảm bảo giao diện dùng nguyên Tiếng Việt mà không bị vỡ layout (Blank field).
* [ ] **Bộ Lọc Spam:** Post bài Forum chứa từ khóa cấm hoặc link "bds-canhtranh.com". Kiểm tra xem `CensorService` có block cứng lại không.

### 5.3. Kiểm thử Hiệu năng & UI/UX (Performance & Frontend QA)

* [ ] **Memory Leak Check:** Upload 1 file ảnh hỏng (corrupted) hoặc size > 10MB. Kiểm tra log Server xem block `finally { fs.unlinkSync }` có dọn dẹp file `tmp` sạch sẽ không.
* [ ] **Theme Engine Lazy Loading:** Mở Network tab trên DevTools. Truy cập Dự án `Luxury`, đảm bảo chỉ có `luxury.module.js` được tải về (không tải code của Minimalist/Eco-green).
* [ ] **UX Loaders:** Tốc độ mạng Fast 3G. Xem `SkeletonLoader` có hiện đầy đủ khung xương khi chờ API danh sách BĐS không.
* [ ] **Chống Spam Click (RxJS):** Click liên tục nút "Gửi Email Khôi Phục MK", đảm bảo Timer 60s disable nút (Take operator) hoạt động.

### 5.4. Chuẩn bị Môi trường Go-Live (Deployment Checklist)

* [ ] Cập nhật biến môi trường Production (`.env` trên Railway): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (dành cho API, bỏ qua RLS), `CLOUDINARY_URL`, `RESEND_KEY`.
* [ ] Biên dịch Frontend (AOT): Chạy `ng build --configuration production`, đảm bảo bundle size tối ưu không quá 2MB/chunk.
* [ ] Cấu hình Vercel Rewrite: Đảm bảo mọi URL không tồn tại đều dồn về `index.html` (để Angular Router xử lý 404 trang).
* [ ] Cấu hình CORS: Cập nhật biến CORS của Node.js chỉ cho phép duy nhất Tên miền Vercel Production gọi vào, chặn các domain lạ.
* [ ] Chạy Google Lighthouse quét điểm SEO, Accessibility, Performance (Mục tiêu > 90 điểm).

### 5.6. Chốt sổ Giai đoạn 5 (Documentation)
* [x] Hoàn thiện tài liệu nghiệm thu (Checklist Testing, Config Vercel/Railway) vào file `docs/PHASE_5_DEPLOY_QA.md`.
* [x] Cập nhật hướng dẫn triển khai lên Vercel và Railway vào `docs/DEPLOYMENT.md`.
* [x] Cập nhật tài liệu hệ thống phản ánh nâng cấp v2 (Custom Theme, Section dự án, Blog-dự án, i18n, Dịch thuật gom nhóm) + tạo `HANDOVER.md`.
* [ ] *(Khách thực hiện)* Chạy checklist QA `5.1–5.4` trên môi trường live + đóng băng tài liệu trước khi Go-live.