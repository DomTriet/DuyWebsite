REAL-ESTATE-PLATFORM/
│
├── 📚 docs/                          <-- LỚP TÀI LIỆU (TỔNG KẾT GIAI ĐOẠN)
│   ├── API_REFERENCE.md              (Tài liệu API cho Frontend/Mobile)
│   ├── DATABASE_SCHEMA.md            (Cấu trúc bảng, JSONB, RLS Supabase)
│   ├── THEME_DEVELOPMENT_GUIDE.md    (Hướng dẫn tạo Theme mới cho Angular)
│   ├── DEPLOYMENT.md                 (Hướng dẫn deploy Vercel & Railway)
│   ├── USER_MANUAL.md                (Hướng dẫn sử dụng cho Admin & Agent)
│   ├── PHASE_1_DBO.md                (Chốt sổ GĐ 1: Database Schema, RLS, Triggers)
│   ├── PHASE_2_BUS.md                (Chốt sổ GĐ 2: Danh sách API, Flow Middlewares)
│   ├── PHASE_3_GUI_ADMIN.md          (Chốt sổ GĐ 3: Luồng Admin/Agent Dashboard, Phân quyền UI)
│   ├── PHASE_4_GUI_THEMES.md         (Chốt sổ GĐ 4: Logic Multi-Theme Engine, Lazy Loading)
│   └── PHASE_5_DEPLOY_QA.md          (Chốt sổ GĐ 5: Checklist Testing, Config Vercel/Railway)
│   ├── SYSTEM_ARCHITECTURE_AND_WORKFLOWS.md (Báo cáo Kiến trúc & Luồng kỹ thuật toàn diện GĐ 1-3)
│
├── �️ database/                      <-- LỚP DBO (SUPABASE SQL)
│   ├── 01_setup_users.sql            (Auth, Roles, Profiles, Triggers)
│   ├── 02_setup_projects.sql         (Project management)
│   ├── 03_setup_properties.sql       (Properties table with JSONB attributes)
│   ├── 04_setup_leads.sql            (Leads CRM & Agent Requests)
│   ├── 05_setup_forum.sql            (Posts, Comments, Moderation status)
│   ├── 06_setup_translations.sql     (Key-Value dynamic translations)
│   ├── 07_setup_rls_policies.sql     (Row Level Security - Bức tường lửa)
│   └── 08_setup_logs.sql             (System Logs - Lịch sử thao tác)
│   └── 09_setup_blogs.sql            (CMS Blog & Layout Builder JSONB)
│   └── 10_setup_favorites.sql        (Bất động sản Yêu thích)
│
├── ⚙️ backend/                       <-- LỚP BUS (NODE.JS/RAILWAY)
│   ├── package.json
│   ├── .env                          (Keys: Supabase, Cloudinary, Resend)
│   ├── src/
│   │   ├── server.ts                 (Entry Point & Global Error Middleware)
│   │   ├── config/
│   │   │   ├── supabase.ts
│   │   │   ├── cloudinary.ts
│   │   │   └── resend.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts    (Verify JWT)
│   │   │   ├── role.middleware.ts    (Admin/Agent checks)
│   │   │   └── error.middleware.ts   (Global Error Handling - JSON Standard)
│   │   ├── services/
│   │   │   ├── translation.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── upload.service.ts
│   │   │   ├── censor.service.ts     (Regex filtering)
│   │   │   └── log.service.ts        (Lưu vết thao tác Admin/Agent)
│   │   ├── controllers/
│   │   │   ├── project.controller.ts
│   │   │   ├── property.controller.ts
│   │   │   ├── lead.controller.ts
│   │   │   ├── forum.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── stats.controller.ts
│   │   │   ├── seo.controller.ts
│   │   │   ├── upload.controller.ts
│   │   │   ├── favorite.controller.ts
│   │   │   ├── log.controller.ts
│   │   │   └── blog.controller.ts    (CMS Logic)
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   └── *.routes.ts           (Các file routes)
│   │   ├── utils/
│   │   │   └── slug.util.ts          (Chuyển đổi Tiếng Việt có dấu -> Slug)
│
└── 🎨 frontend/                      <-- LỚP GUI (ANGULAR/VERCEL)
    ├── src/
    │   ├── app/
    │   │   ├── core/                 (Singleton services, guards, interceptors)
    │   │   │   ├── guards/           (AdminGuard, AgentGuard)
    │   │   │   ├── interceptors/     (AuthInterceptor - Bearer Token)
    │   │   │   ├── models/           (User.ts, Property.ts, Lead.ts, Theme.ts)
    │   │   │   └── services/         (api.service.ts, auth.service.ts)
    │   │   ├── shared/               (Dùng chung toàn app)
    │   │   │   ├── components/
    │   │   │   │   └── skeleton-loader/ (Hiệu ứng khung xương chờ load)
    │   │   │   └── validators/
    │   │   │       └── custom.validators.ts (Phone VN, Email, Strong Pass)
│   │   ├── auth/                 (AUTHENTICATION MODULE)
│   │   │   ├── login.component.ts
│   │   │   ├── register.component.ts
│   │   │   ├── forgot-password.component.ts
│   │   │   └── reset-password.component.ts
    │   │   ├── admin/                (DASHBOARD MODULE)
    │   │   │   ├── layout/           (Sidebar, Header với role-based logic)
    │   │   │   ├── pages/
    │   │   │   │   ├── projects-manage/
    │   │   │   │   ├── properties-manage/ (Reactive Dynamic Form)
    │   │   │   │   ├── forum-approval/
    │   │   │   │   └── translations-manage/ (Side-by-side view)
│   │   │   │   └── blog-manage/         (CMS Block Editor & Preview)
    │   │   │   └── admin-routing.module.ts
│   │   └── guest/                (GUEST / CUSTOMER MODULE)
│   │       ├── forum/            (Cộng đồng - Diễn đàn)
│   │       ├── blogs/            (Tin tức - Bài viết CMS)
│   │       └── themes/           (THEME ENGINE MODULE)
│   │           ├── theme.resolver.ts
│   │           ├── theme-container.component.ts
│   │           ├── luxury/
│   │           ├── minimalist/
│   │           └── eco-green/
    │   ├── assets/
    │   │   ├── i18n/                 (vi.json, en.json, zh.json)
    │   │   └── images/
    │   └── environments/             (dev & prod configs)