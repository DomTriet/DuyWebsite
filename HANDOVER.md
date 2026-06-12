# 📦 HANDOVER — Pro-RealEstate (DuyWebsite)

Tài liệu bàn giao tổng hợp. Cập nhật: **2026-06-05**. Đọc file này trước, rồi tra cứu chi tiết trong thư mục `docs/`.

---

## 1. Tổng quan kiến trúc
- **Database:** Supabase (PostgreSQL + RLS). Schema & SQL trong `database/` (13 file, chạy theo số thứ tự).
- **Backend (BUS):** Node.js + Express + TypeScript (`backend/`), deploy Railway. Supabase JS, Cloudinary (ảnh), Resend (email), Socket.io (realtime), MyMemory (dịch máy).
- **Frontend (GUI):** Angular 21 SSR (`frontend/`), deploy Vercel. Đa theme (minimalist/luxury/eco-green/**custom**), i18n vi/en/ko/zh.

## 2. Tình trạng dự án

| Giai đoạn (MasterPlan) | Trạng thái |
|---|---|
| Phase 1 — Database & RLS | ✅ Hoàn tất |
| Phase 2 — Backend & API | ✅ Hoàn tất |
| Phase 3 — Admin/Agent Dashboard | ✅ Hoàn tất |
| Phase 4 — Theme Engine khách hàng | ✅ Hoàn tất |
| Phase 5 — QA & Deploy | 🟡 Tài liệu sẵn sàng; phần QA/deploy cần môi trường + credential của khách |

**Nâng cấp v2 (feedback khách):** ✅ Dịch thuật đầy đủ 4 ngôn ngữ · ✅ Lọc BĐS trang chủ + trang dự án · ✅ Section nội dung dự án (CRUD) · ✅ Blog gắn dự án + bài liên quan · ✅ Thông số BĐS + preset theo loại · ✅ **Custom Theme drag & drop** · ✅ Quản lý dịch thuật gom nhóm · ✅ Forum ẩn khỏi menu (giữ data).

**Kiểm thử tự động (mới nhất):** backend `tsc` = 0 · frontend `ng build` = 0 · i18n 367 key parity. Chi tiết QA: [docs/PHASE_5_DEPLOY_QA.md](docs/PHASE_5_DEPLOY_QA.md).

## 3. Chạy dự án (local)
```bash
# 1) Database: chạy 13 file SQL trong database/ trên Supabase SQL Editor (xem docs/DEPLOYMENT.md §3)
# 2) Backend
cd backend && npm install
#    tạo backend/.env theo bảng biến môi trường (docs/DEPLOYMENT.md §4)
npm run dev            # chạy dev (hoặc: npm run build && npm start)
# 3) Frontend
cd frontend && npm install
npm start              # http://localhost:4200  (API mặc định http://localhost:5000/api)
```

## 4. Triển khai Production
Theo [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): Backend → Railway, Frontend → Vercel, DB → Supabase. Gồm: thứ tự chạy 13 file SQL, bảng biến môi trường, cấu hình CORS, Vercel rewrite SPA, mục tiêu Lighthouse > 90.
> ⚠️ Cần credential Supabase/Railway/Vercel của khách để thực hiện bước cuối — đội phát triển không tự deploy được.

## 5. Tài liệu tham chiếu
| File | Nội dung |
|---|---|
| `MasterPlan.md` | Checklist build 5 giai đoạn |
| `docs/DATABASE_SCHEMA.md` | Cấu trúc bảng, RLS, mở rộng v2 |
| `docs/API_REFERENCE.md` | Toàn bộ endpoint (gồm v2: sections, facets, custom theme, translations gom nhóm) |
| `docs/USER_MANUAL.md` | HDSD Admin/Agent (gồm Custom Theme, Section, Dịch thuật) |
| `docs/THEME_DEVELOPMENT_GUIDE.md` | Kiến trúc theme + Custom Theme block-based |
| `docs/DEPLOYMENT.md` · `docs/PHASE_5_DEPLOY_QA.md` | Triển khai & QA nghiệm thu |

## 6. Việc tồn đọng có chủ đích (ngoài phạm vi bàn giao)
- **Marketplace 2hand** (đăng tin BĐS cũ + thanh toán MoMo + admin duyệt): Phase tương lai (theo roadmap "module lớn để sau").
- **SEO meta** (`<title>`/`description`) các trang khách: giữ Tiếng Việt (không hiển thị trực tiếp cho người dùng; không phản ứng đổi ngôn ngữ).
- **Dịch nội dung động** (tên/mô tả dự án, tiêu đề BĐS, blog, section): hiển thị ngôn ngữ khác **sau khi Admin duyệt** trong Quản lý Dịch thuật (đúng thiết kế kiểm duyệt).
- **Quota dịch máy MyMemory**: ~5.000 từ/ngày (ẩn danh) → ~50.000 từ/ngày nếu đặt `MYMEMORY_EMAIL`.
- **Cosmetic nhỏ:** link "Xem tất cả" dưới "Dự Án Nổi Bật" (home) hiện trỏ `/blogs` — không hỏng, có thể chỉnh hướng nếu khách muốn.

## 7. Bước tiếp theo đề xuất khi khách tiếp nhận
1. Chạy 13 file SQL trên Supabase production; tạo 1 tài khoản Admin.
2. Điền biến môi trường Railway + cập nhật `environment.prod.ts` (URL API).
3. Chạy checklist QA [docs/PHASE_5_DEPLOY_QA.md](docs/PHASE_5_DEPLOY_QA.md) §B.
4. Deploy theo [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md); chạy Lighthouse.
