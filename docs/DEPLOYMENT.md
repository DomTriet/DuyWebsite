# 🚀 HƯỚNG DẪN TRIỂN KHAI LÊN PRODUCTION (DEPLOYMENT GUIDE)

Dự án **Điểm Tâm BĐS** sử dụng kiến trúc tách rời (Decoupled Architecture): Frontend Angular → Vercel, Backend Node.js → Railway, Database → Supabase, lưu trữ ảnh → Cloudinary, email → Resend.

---

## 1. Triển khai Backend (Node.js) lên Railway.app

Railway là nền tảng tối ưu cho các ứng dụng Node.js đòi hỏi kết nối ổn định (WebSocket/Socket.io).

1. Đăng nhập vào Railway.app.
2. Chọn **New Project** -> **Deploy from GitHub repo**.
3. Chọn repo chứa mã nguồn, Railway sẽ tự phát hiện thư mục `backend/`.
4. Vào tab **Variables**, thêm toàn bộ biến môi trường (xem bảng ở Mục 4).
5. Start Command tự lấy từ `backend/Procfile`: `node dist/server.js`. Build Command: `npm install && npm run build`.
6. Generate Domain (Railway sẽ cấp URL, ví dụ: `bdsdiemtam-api.up.railway.app`).
7. Trỏ subdomain `api.bdsdiemtam.com` CNAME về URL Railway đó (xem Mục 5).

---

## 2. Triển khai Frontend (Angular) lên Vercel

Vercel cung cấp bộ nhớ đệm (Edge Caching) cực tốt cho các ứng dụng Frontend.

1. File `frontend/vercel.json` đã được commit (rewrite SPA + output dir cấu hình đúng cho Angular 17+).
2. File `frontend/src/environments/environment.prod.ts` đã trỏ `apiUrl: 'https://api.bdsdiemtam.com/api'`.
3. Commit & Push lên GitHub.
4. Đăng nhập Vercel.com → **Add New Project** → chọn repo → Root Directory: `frontend`.
5. Framework: **Angular**. Build command: `npm run build`. Output: `dist/frontend/browser`.
6. Bấm Deploy. Sau khi xong, thêm custom domain `bdsdiemtam.com` trong Vercel Settings.

---

## 3. Khởi tạo Database (Supabase) — chạy SQL theo thứ tự

Vào **Supabase → SQL Editor**, chạy lần lượt các file trong thư mục `database/`:

```
01_setup_users.sql           02_setup_projects.sql        03_setup_properties.sql
04_setup_leads.sql           05_setup_forum.sql           06_setup_translations.sql
07_setup_rls_policies.sql    08_setup_logs.sql            09_setup_blogs.sql
10_setup_favorites.sql       11_setup_search_indexes.sql
12_setup_project_content.sql 13_setup_custom_theme.sql
14_setup_property_display.sql
18_setup_homepage_banners.sql   ← Slider banner trang chủ
19_setup_system_settings.sql    ← Feature flags (forum_enabled, ...)
```

> File `00_full_schema.sql` chứa toàn bộ schema gộp (dùng khi khởi tạo project mới hoàn toàn). Khi nâng cấp dự án đang chạy, chỉ cần chạy bổ sung các file còn thiếu (đã viết `IF NOT EXISTS`/`ADD COLUMN IF NOT EXISTS` nên an toàn chạy lại).

---

## 4. Biến môi trường Production (Backend `.env` trên Railway)

| Biến | Mô tả |
|---|---|
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (Backend dùng để bỏ qua RLS) |
| `SUPABASE_ANON_KEY` | Anon key (xác thực token người dùng) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Upload ảnh/video |
| `RESEND_API_KEY` | Gửi email (thông báo lead, duyệt bài) |
| `MYMEMORY_EMAIL` | (Khuyến nghị) email để nâng quota dịch máy MyMemory lên ~50.000 từ/ngày |
| `CORS_ORIGIN` | Tên miền frontend production: `https://bdsdiemtam.com` |
| `PORT` | Cổng server (Railway tự cấp, không cần set) |
| `NODE_ENV` | `production` |

Frontend `environment.prod.ts` đã được cấu hình trỏ tới `https://api.bdsdiemtam.com/api`. Xem `backend/.env.example` để có danh sách đầy đủ tất cả biến môi trường.

---

## 5. Cấu hình DNS cho domain `bdsdiemtam.com`

Sau khi có domain (Namecheap, Cloudflare Registrar, hoặc tương đương):

| Record | Name | Value |
|--------|------|-------|
| A / CNAME | `@` (hoặc `bdsdiemtam.com`) | Vercel cung cấp sau khi thêm domain |
| CNAME | `api` | URL Railway/Render (VD: `bdsdiemtam-api.up.railway.app`) |
| CNAME | `www` | `cname.vercel-dns.com` |

**Khuyến nghị:** Dùng Cloudflare làm DNS manager (đổi nameserver về Cloudflare), bật proxy (`🟠`) cho `bdsdiemtam.com` để có CDN + DDoS protection miễn phí. Để `api.bdsdiemtam.com` ở DNS-only (`🔵`) để WebSocket hoạt động đúng.

---

## 6. Checklist Go-Live

- [ ] Đã chạy đủ tất cả file SQL (01–19) trên Supabase production.
- [ ] Đã điền đủ biến môi trường trên Railway (bao gồm `CORS_ORIGIN=https://bdsdiemtam.com`).
- [ ] Backend trả `200` ở route `GET /health`: `{"status":"ok","message":"Điểm Tâm BĐS API is running smoothly!"}`.
- [ ] **DNS**: `bdsdiemtam.com` → Vercel, `api.bdsdiemtam.com` → Railway đã propagate.
- [ ] `vercel.json` và `Procfile` đã được commit — Vercel/Railway nhận cấu hình tự động.
- [ ] `ng build --configuration production` thành công, 0 TypeScript errors.
- [ ] Tạo 1 tài khoản Admin đầu tiên (đổi role trong bảng `profiles` qua Supabase Studio hoặc Users Manage).
- [ ] Kiểm tra Forum toggle: Admin Settings → bật → link "Cộng đồng" xuất hiện trong nav.
- [ ] Chạy **Google Lighthouse** (mục tiêu > 90 điểm SEO/Performance/Accessibility).