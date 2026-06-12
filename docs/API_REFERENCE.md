# 📖 API Reference — Điểm Tâm BĐS

Base URL:
- **Development:** `https://duywebsite-production.up.railway.app/api`
- **Production:** `https://api.bdsdiemtam.com/api`

> **Lưu ý Authentication**: Các API yêu cầu `[Auth]` cần đính kèm header:
> `Authorization: Bearer <your_jwt_token>`

## 0. Authentication (Xác thực)

### 0.1 Đăng ký tài khoản (Register)
* **Endpoint:** `POST /auth/register`
* **Body (JSON):** `{ "email": "user@gmail.com", "password": "password123", "full_name": "Nguyễn Văn A" }`
* **Lưu ý:** Hệ thống sẽ tự động gửi Email xác nhận tới địa chỉ người dùng.

### 0.2 Đăng nhập (Login)
* **Endpoint:** `POST /auth/login`
* **Body (JSON):** `{ "email": "user@gmail.com", "password": "password123" }`
* **Response:** Trả về đối tượng `session` chứa `access_token` (JWT).

### 0.3 Đăng xuất (Logout) `[Auth]`
* **Endpoint:** `POST /auth/logout`
* **Lưu ý:** Client cần chủ động xóa token lưu trong LocalStorage sau khi gọi API này thành công.

### 0.4 Quên mật khẩu (Forgot Password)
* **Endpoint:** `POST /auth/forgot-password`
* **Body (JSON):** `{ "email": "user@gmail.com" }`
* **Lưu ý:** Gửi link reset mật khẩu qua email. Link này sẽ trỏ về màn hình `/reset-password` của Frontend.

### 0.5 Đặt lại mật khẩu mới (Reset Password) `[Auth]`
* **Endpoint:** `POST /auth/reset-password`
* **Body (JSON):** `{ "new_password": "StrongPassword123!" }`
* **Lưu ý:** Cần đính kèm Token (được trích xuất từ link email) vào Header Authorization.

---

## 1. Quản lý Hồ sơ (Profile)

### 1.1 Lấy thông tin cá nhân `[Auth]`
* **Endpoint:** `GET /profiles/me`

### 1.2 Cập nhật thông tin cá nhân `[Auth]`
* **Endpoint:** `PUT /profiles/me`
* **Body (JSON):** `{ "full_name": "Tên Mới", "phone": "090123", "experience_years": 5 }`

### 1.3 Quản lý Người dùng `[Auth: Admin]`
* **Lấy danh sách Users:** `GET /profiles`
* **Đổi Role / Phân quyền:** `PUT /profiles/:id/role`
    *   Body: `{ "role": "admin" }` (Các role: `'admin'`, `'agent'`, `'member'`)

### 1.4 Cập nhật & Xóa Bất động sản `[Auth: Admin, Agent]`
* **Cập nhật:** `PUT /properties/:id` (Gửi lên các field cần đổi).
* **Xóa mềm (Soft Delete):** `DELETE /properties/:id`. Trả về `{ "status": "success", "message": "Property deleted successfully" }`.

### 1.5 Quản lý Danh mục (Categories)
*   **Lấy danh sách:** `GET /properties/categories`
*   **Tạo mới `[Auth: Admin]`:** `POST /properties/categories`
    *   Body: `{ "name": "Biệt thự nghỉ dưỡng" }`
*   **Cập nhật `[Auth: Admin]`:** `PUT /properties/categories/:id`
    *   Body: `{ "name": "Tên mới" }`
*   **Xóa `[Auth: Admin]`:** `DELETE /properties/categories/:id`

### 1.6 Xóa hình ảnh Bất động sản `[Auth: Admin, Agent]`
* **Endpoint:** `DELETE /properties/media/:mediaId`

### 1.7 Đặt ảnh làm Ảnh đại diện (Thumbnail) `[Auth: Admin, Agent]`
* **Endpoint:** `PUT /properties/media/:mediaId/thumbnail`
---

## 2. Properties (Bất động sản)

### 2.1 Lấy danh sách Bất động sản
* **Endpoint:** `GET /properties`
* **Query Params:** 
  * `page`, `limit`: Dùng cho Phân trang (Mặc định page=1, limit=10).
  * `manage=true`: Thêm cờ này khi gọi từ Admin/Agent Dashboard.
  * `trash=true`: Kết hợp với `manage=true` để lấy danh sách các BĐS đã bị xóa mềm (nằm trong Thùng rác).
  * `category_id`, `project_id`, `min_price`, `max_price`, `search`: Bộ lọc tìm kiếm. Từ khóa `search` sẽ được đối chiếu trong cả Tiêu đề (`title`) và Mô tả (`description`).
  * `bedrooms`, `property_type`: Lọc theo số phòng ngủ và loại bất động sản.
  * `min_area`, `max_area`: Lọc theo diện tích tối thiểu / tối đa (m²).
  * `sort`: Sắp xếp kết quả. Giá trị hợp lệ: `price_asc`, `price_desc`, `newest`, `area_asc`, `area_desc`.
* **Response:** Trả về danh sách `data` (bao gồm thông tin dự án, danh mục, hình ảnh và thông tin chi tiết người môi giới phụ trách trong object `agent: { full_name, phone, email, avatar_url }`) và cấu trúc phân trang `meta: { total, page, limit }`.
* **Lưu ý Phân quyền:** 
  * Nếu truyền `manage=true` và gọi bởi Role `agent`, hệ thống tự động lọc CHỈ trả về các BĐS do Agent đó tạo (`created_by`) hoặc phụ trách (`agent_id`).
  * Gọi bình thường (Public API) sẽ trả về toàn bộ BĐS chưa xóa.

### 2.2 Lấy chi tiết Bất động sản
* **Endpoint:** `GET /properties/:slug`
* **Response:** Trả về Object chi tiết BĐS kèm danh sách hình ảnh `property_media` và thông tin `categories`.

### 2.3 Đăng Bất động sản mới `[Auth: Admin, Agent]`
* **Endpoint:** `POST /properties`
* **Body (JSON):**
```json
{
  "project_id": "uuid",
  "category_id": 1,
  "title": "Căn hộ Vinhome",
  "description": "View hồ đẹp",
  "price": 2500000000,
  "attributes": { "bedrooms": 3, "pool": true, "gallery_layout": "grid" }, // Hoặc stringified JSON. gallery_layout: default|grid|single
  "detail_theme": "luxury" // Tùy chọn: theme trang chi tiết (minimalist|luxury|eco-green). Bỏ qua/null = theo theme dự án
}
```

### 2.4 Cập nhật Bất động sản `[Auth: Admin, Agent]`
* **Endpoint:** `PUT /properties/:id`
* **Mẹo (Khôi phục BĐS):** Để khôi phục một BĐS từ thùng rác, chỉ cần truyền Body là `{ "is_deleted": false }`.

### 2.5 Quản lý Dự án (Projects)
*   **Lấy danh sách:** `GET /projects`
*   **Tạo mới `[Auth: Admin]`:** `POST /projects`
    *   Body: `{ "name": "...", "theme_id": "luxury", "description": "..." }`
*   **Cập nhật `[Auth: Admin]`:** `PUT /projects/:id`
*   **Xóa `[Auth: Admin]`:** `DELETE /projects/:id`

---

## 3. Leads (Khách hàng & CRM)

### 3.1 Khách hàng Gửi Form Liên Hệ
* **Endpoint:** `POST /leads`
* **Logic:** Tự động gửi Email cho Agent phụ trách, đồng thời phát tín hiệu Socket.io `new_lead`.
* **Body (JSON):**
```json
{
  "customer_name": "Nguyễn Văn A",
  "customer_phone": "0901234567",
  "message": "Tôi muốn xem nhà",
  "property_id": "uuid",
  "agent_id": "uuid"
}
```

### 3.2 Lấy danh sách Khách hàng `[Auth: Admin, Agent]`
* **Endpoint:** `GET /leads`
* **Lưu ý:** Agent chỉ thấy khách của mình. Admin thấy toàn bộ.

### 3.3 Cập nhật Trạng thái & Ghi chú Khách hàng `[Auth: Admin, Agent]`
* **Endpoint:** `PUT /leads/:id`
* **Body (JSON):** `{ "status": "contacted", "notes": "Khách hẹn xem nhà lúc 9h sáng thứ 7" }`

### 3.4 Thành viên đăng ký làm Môi giới `[Auth]`
* **Endpoint:** `POST /leads/agent-requests`
* **Body (JSON):** `{ "request_data": { "experience_years": 3, "area": "Quận 1" } }`
* **Lưu ý:** Chờ Admin duyệt.

### 3.5 Lấy danh sách yêu cầu Môi giới `[Auth: Admin]`
* **Endpoint:** `GET /leads/agent-requests`
* **Response:** Trả về danh sách kèm thông tin `profiles`.

### 3.6 Duyệt yêu cầu Môi giới `[Auth: Admin]`
* **Endpoint:** `PUT /leads/agent-requests/:id/status`
* **Body (JSON):** `{ "status": "approved" }` (hoặc `"rejected"`)
* **Logic:** Tự động nâng cấp Role thành Agent và tạo hồ sơ Agent rỗng.


## 4. Forum (Diễn đàn)

### 4.1 Lấy danh sách bài đã duyệt
* **Endpoint:** `GET /forum`

### 4.2 Lấy chi tiết Bài viết
* **Endpoint:** `GET /forum/:id`
* **Bảo mật:** Chỉ trả về bài có `status = 'approved'`. Truy cập bài đang chờ duyệt (pending) sẽ nhận `404`.

### 4.3 Lấy danh sách bài đang chờ duyệt `[Auth: Admin]`
* **Endpoint:** `GET /forum/pending`

### 4.4 Đăng bài (Có kiểm duyệt) `[Auth]`
* **Endpoint:** `POST /forum`
* **Rate Limit:** 1 request / 1 phút.
* **Body (JSON):** `{ "title": "Bàn về phong thủy", "content": "Nội dung bài..." }`

### 4.5 Admin Duyệt Bài `[Auth: Admin]`
* **Endpoint:** `PUT /forum/:id/approve`
* **Logic:** Chuyển status thành `approved` và gửi email thông báo cho Tác giả.

### 4.6 Admin Xóa Bài Viết `[Auth: Admin]`
* **Endpoint:** `DELETE /forum/:id`

### 4.7 Lấy danh sách Bình luận của Bài viết
* **Endpoint:** `GET /forum/:postId/comments`

### 4.8 Gửi Bình luận `[Auth]`
* **Endpoint:** `POST /forum/:postId/comments`
* **Body (JSON):** `{ "content": "Bài viết rất hay!" }`

### 4.9 Admin Xóa Bình luận `[Auth: Admin]`
* **Endpoint:** `DELETE /forum/comments/:commentId`

### 4.10 Thích / Bỏ thích Bài viết `[Auth]`
* **Endpoint:** `POST /forum/:postId/react`

### 4.11 Báo cáo Bài viết vi phạm `[Auth]`
* **Endpoint:** `POST /forum/:postId/report`
* **Body (JSON):** `{ "reason": "Nội dung spam / phản cảm" }`

### 4.12 Admin Xem Bài viết bị báo cáo `[Auth: Admin]`
* **Endpoint:** `GET /forum/reports/pending`

### 4.13 Admin Xử lý báo cáo `[Auth: Admin]`
* **Endpoint:** `PUT /forum/reports/:reportId/resolve`
* **Body (JSON):** `{ "action": "dismiss" }` (hoặc `"delete_post"`)


## 5. Translations (Đa ngôn ngữ)

### 5.1 Lấy bản dịch của BĐS / Dự án
* **Endpoint:** `GET /translations?entity_type=property&entity_id=<uuid>&lang_code=en`
* **Response (Có sẵn bản dịch đã duyệt):**
```json
{
  "status": "success",
  "fallback": false,
  "data": { "title": "Vinhome Apartment", "description": "Beautiful lake view" }
}
```
* **Response (Bản dịch chưa duyệt hoặc bị lỗi - CƠ CHẾ FALLBACK):**
```json
{
  "status": "success",
  "fallback": true,
  "message": "Bản dịch chưa sẵn sàng. Fallback về ngôn ngữ gốc.",
  "data": { "title": "Căn hộ Vinhome", "description": "View hồ đẹp" }
}
```

### 5.2 Quản lý Bản dịch `[Auth: Admin]`
*   **Lấy danh sách chờ duyệt:** `GET /translations/pending`
*   **Duyệt bản dịch máy:** `PUT /translations/:id/approve`
*   **Admin sửa lại bản dịch (nếu máy dịch sai):** `PUT /translations/:id`
    *   Body: `{ "translation_data": { "title": "Corrected English Title" } }`

---

## 6. Upload (Lưu trữ ảnh/video)

### 6.1 Upload Media `[Auth]`
* **Endpoint:** `POST /upload`
* **Body (Form-Data):** Truyền file vào trường (key) có tên là `file`. Giới hạn 5MB.
* **Response:** Trả về URL của Cloudinary để Frontend dùng lưu vào bảng `properties` hoặc `property_media`.

---

## 7. System Logs (Nhật ký Hệ thống)
### 7.1 Lấy danh sách Nhật ký `[Auth: Admin]`
* **Endpoint:** `GET /logs`
* **Response:** Trả về 200 hành động (Create/Update/Delete) gần nhất của toàn bộ hệ thống.

---

## 8. Thống kê (Dashboard Stats)
### 8.1 Lấy dữ liệu Thống kê `[Auth: Admin, Agent]`
* **Endpoint:** `GET /stats`
* **Response:** Trả về tổng quan hệ thống. VD: `{ "properties": 10, "leads": 5, "pending_posts": 2, "pending_agents": 1 }`. Agent chỉ thấy thống kê của cá nhân.

---

## 9. Blogs (Tin tức & Marketing)
### 9.1 Lấy danh sách Blog (Public)
* **Endpoint:** `GET /blogs`
* **Response:** Trả về danh sách bài viết có `status='published'`.

### 9.2 Lấy danh sách Blog (Quản trị) `[Auth: Admin, Agent]`
* **Endpoint:** `GET /blogs/manage`
* **Logic:** Admin xem toàn bộ, Agent xem bài của mình.

### 9.3 Đăng Blog mới `[Auth: Admin, Agent]`
* **Endpoint:** `POST /blogs`
* **Body (JSON):**
```json
{
  "title": "Kinh nghiệm đầu tư năm 2026",
  "content_blocks": [
    { "type": "text", "value": "Nội dung bài viết..." },
    { "type": "image", "value": "https://link-anh.com" }
  ]
}
```
* **Logic:** Admin đăng tự động published, Agent đăng thì pending chờ duyệt.

### 9.4 Duyệt Blog `[Auth: Admin]`
* **Endpoint:** `PUT /blogs/:id/approve`
* **Body (JSON):** `{ "status": "published" }`

---

## 10. Favorites (Danh sách Yêu thích)

### 10.1 Thêm / Bỏ Yêu thích BĐS `[Auth]`
* **Endpoint:** `POST /favorites/toggle`
* **Body (JSON):** `{ "property_id": "<uuid>" }`

### 10.2 Lấy danh sách ID Yêu thích `[Auth]`
* **Endpoint:** `GET /favorites/ids`
* **Response:** Trả về mảng chứa các UUID của BĐS để Frontend đồng bộ State UI.

### 10.3 Lấy chi tiết BĐS Yêu thích `[Auth]`
* **Endpoint:** `GET /favorites`
* **Response:** Trả về danh sách chi tiết BĐS (bao gồm media) để hiển thị trong trang Profile. Hệ thống sẽ tự động lọc ra những BĐS đã bị xóa (`is_deleted = true`).

---

## 11. Mở rộng v2 (Trang chi tiết Dự án, Custom Theme & Tìm kiếm)

### 11.1 Tìm kiếm & Gợi ý BĐS (Public)
* `GET /properties/suggestions?q=<từ khóa>&limit=6` — Autocomplete: trả title + slug + giá + ảnh.
* `GET /properties/facets?project_id=<id>` — Số liệu lọc: `price.min/max`, đếm theo `bedrooms`, bucket `area`. Dùng để hiển thị số lượng cạnh mỗi mức lọc.
* `GET /properties` đã hỗ trợ đầy đủ tham số lọc: `search, min_price, max_price, category_id, project_id, bedrooms, min_area, max_area, property_type, sort (newest|oldest|price_asc|price_desc), page, limit`.

### 11.2 Section nội dung Dự án
* `GET /projects/:id/sections` — **Public**. Trả danh sách section theo `sort_order`.
* `POST /projects/:id/sections` `[Auth: Admin]` — Body: `{ section_type, title, content, image_url, metadata, sort_order }`.
* `PUT /projects/sections/:sectionId` `[Auth: Admin]` — Cập nhật 1 section.
* `DELETE /projects/sections/:sectionId` `[Auth: Admin]`.
* *Lưu ý routing:* các route `/sections/:sectionId` đặt **trước** `/:id` để tránh match nhầm.

### 11.3 Blog gắn Dự án
* `GET /blogs?project_id=<id>&limit=3` — Lọc bài blog đã `published` thuộc 1 dự án (mục "Tin tức dự án").
* `POST /blogs` & `PUT /blogs/:id` — nhận thêm trường `project_id` (tùy chọn) ngoài `property_id`.

### 11.4 Custom Theme (Trình dựng giao diện)
* Lưu cấu hình: `PUT /projects/:id` `[Auth: Admin]` với body `{ theme_id: 'custom', layout_config: {...} }`. Không có endpoint riêng — tái dùng API cập nhật dự án.
* Trang khách lấy `layout_config` qua `GET /projects/:id` (Theme Resolver) và render block-based.

### 11.5 Dịch thuật (cập nhật — gom nhóm)
* `GET /translations/pending` `[Auth: Admin]` — **trả về dữ liệu GOM NHÓM theo từng entity**: `[{ entity_type, entity_id, source: {bản gốc tiếng Việt}, langs: [{id, lang_code, translation_data, is_approved}] (thứ tự en→zh→ko) }]`. Chỉ gồm nhóm còn ≥1 bản dịch chưa duyệt.
* `PUT /translations/:id` `[Auth: Admin]` — lưu `{ translation_data }` (tự động duyệt).
* `PUT /translations/:id/approve` `[Auth: Admin]`.
* `GET /translations?entity_type=&entity_id=&lang_code=` — Public, có Fallback: nếu chưa duyệt → trả bản gốc tiếng Việt. Hỗ trợ `entity_type`: `property | project | blog | project_section`.

---

## 12. Banners (Slider trang chủ)

### 12.1 Lấy danh sách Banner đang hiển thị (Public)
* **Endpoint:** `GET /banners`
* **Response:** Trả về danh sách banner có `is_active = true`, sắp xếp theo `sort_order ASC`.

### 12.2 Lấy toàn bộ Banner (Admin)
* **Endpoint:** `GET /banners/all` `[Auth: Admin]`
* **Response:** Toàn bộ banner bao gồm cả bị ẩn.

### 12.3 Tạo Banner mới `[Auth: Admin]`
* **Endpoint:** `POST /banners`
* **Body (JSON):**
```json
{
  "image_url": "https://res.cloudinary.com/...",
  "title": "Khám phá BĐS cao cấp",
  "subtitle": "Hàng nghìn căn hộ chờ bạn",
  "cta_text": "Xem ngay",
  "cta_link": "/properties",
  "sort_order": 1,
  "is_active": true
}
```

### 12.4 Cập nhật Banner `[Auth: Admin]`
* **Endpoint:** `PUT /banners/:id`
* **Body (JSON):** Các field cần thay đổi (partial update).

### 12.5 Xóa Banner `[Auth: Admin]`
* **Endpoint:** `DELETE /banners/:id`

---

## 13. Settings (Cài đặt hệ thống)

### 13.1 Lấy tất cả Settings (Public)
* **Endpoint:** `GET /settings`
* **Response:** `{ "forum_enabled": false, "maintenance_mode": false }` (dạng key-value map).
* **Lưu ý:** Được gọi khi app khởi động để load toàn bộ feature flags.

### 13.2 Cập nhật một Setting `[Auth: Admin]`
* **Endpoint:** `PUT /settings/:key`
* **Body (JSON):** `{ "value": true }`
* **Ví dụ:** `PUT /settings/forum_enabled` với body `{ "value": true }` để bật Forum công khai.

**Các setting hiện có:**

| Key | Kiểu | Mặc định | Mô tả |
|-----|------|----------|-------|
| `forum_enabled` | boolean | `false` | Hiển thị Forum trong nav/footer công khai |