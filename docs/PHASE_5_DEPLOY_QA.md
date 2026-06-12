# ✅ GIAI ĐOẠN 5: QA, KIỂM THỬ & DEPLOY (Nghiệm thu)

Tài liệu tổng hợp checklist kiểm thử và chuẩn bị Go-Live. Cập nhật: 2026-06-05.

---

## A. Kiểm thử tự động (đã chạy — PASS)

| Hạng mục | Lệnh | Kết quả |
|---|---|---|
| Backend type-check | `cd backend && npx tsc --noEmit` | ✅ Exit 0 |
| Frontend production build | `cd frontend && npx ng build` | ✅ Exit 0 (chỉ warning CSS budget theme & CommonJS socket.io — vô hại) |
| i18n parity (vi/en/ko/zh) | script đối chiếu key | ✅ 367 key, 0 thiếu / 0 thừa |

> Warning "CSS budget exceeded" của 3 theme là do inline styles lớn — không ảnh hưởng chạy. Có thể nâng `budgets` trong `angular.json` nếu muốn tắt cảnh báo.

---

## B. Checklist QA cần môi trường chạy (đội vận hành thực hiện)

> Cần Backend + Frontend chạy + tài khoản test (`admin`, `agent`, `member`). Tick khi đã kiểm.

### B.1. Bảo mật & Phân quyền (RBAC / RLS)
- [ ] Tài khoản `agent` gõ URL `/admin/system-logs` → `AdminGuard` đá về Dashboard.
- [ ] Postman với token `agent` gọi `DELETE /projects/:id` → `403 Forbidden`.
- [ ] Agent A gọi `PUT /properties/:id_của_agentB` → DB từ chối (RLS / 401/403).
- [ ] Nhập `<script>alert(1)</script>` vào form Lead → lưu an toàn, không thực thi script.

### B.2. Luồng kỹ thuật
- [ ] Tạo BĐS mới → sau 2–3s, bảng `translations` có bản ghi en/ko/zh (`is_approved=false`).
- [ ] Khách điền Lead → Admin nhận thông báo realtime qua Socket.io (không cần F5).
- [ ] Vào trang BĐS/dự án ở EN khi bản dịch chưa duyệt → fallback Tiếng Việt, không vỡ layout.
- [ ] Post forum chứa từ cấm / link đối thủ → `CensorService` chặn.

### B.3. Hiệu năng & UI/UX
- [ ] Upload file ảnh hỏng / > 10MB → server dọn `tmp/` (block `finally fs.unlinkSync`).
- [ ] Mở DevTools Network → vào dự án `Luxury` chỉ tải `luxury-component` chunk (lazy-load).
- [ ] Mạng Fast 3G → Skeleton loader hiển thị khi chờ API.
- [ ] Spam click "Gửi email khôi phục MK" → timer 60s disable nút.

### B.4. Tính năng v2 (mới)
- [ ] Admin tạo BĐS: đổi **Danh mục** → bộ thông số gợi ý đổi theo → lưu → trang chi tiết theme hiển thị đủ phòng ngủ/diện tích.
- [ ] Trang dự án: bộ lọc giá/phòng ngủ/diện tích/loại hoạt động; mục "Tin tức dự án" và các Section hiển thị; nav có anchor tới section.
- [ ] Trình dựng **Custom Theme**: đổi màu/font/logo (preview đổi ngay), kéo-thả block, Lưu → `/project/:id` render đúng.
- [ ] **Quản lý Dịch thuật**: nhóm hiển thị 🇻🇳→🇬🇧→🇨🇳→🇰🇷; sửa + duyệt → web khách hiển thị bản dịch.
- [ ] Đổi cờ ngôn ngữ trên trang khách (home/about/contact/blog/forum/profile + theme) → UI đổi đầy đủ vi/en/ko/zh.

---

## C. Go-Live
Xem checklist triển khai chi tiết tại [DEPLOYMENT.md](DEPLOYMENT.md) (SQL migration, biến môi trường, CORS, Vercel rewrite, Lighthouse).

---

## D. Ghi chú nghiệm thu
- **Tự động deploy**: cần credential Supabase/Railway/Vercel của khách — đội phát triển đã chuẩn bị sẵn tài liệu, khách thực hiện bước cuối.
- **Việc tồn đọng có chủ đích**: xem [../HANDOVER.md](../HANDOVER.md) (Marketplace 2hand để Phase sau; SEO meta giữ Tiếng Việt; dịch nội dung động cần Admin duyệt).
