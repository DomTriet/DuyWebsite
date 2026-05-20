# 🎨 CHỐT SỔ GIAI ĐOẠN 4: LỚP GUI - THEME ENGINE KHÁCH HÀNG

**Trạng thái:** Hoàn thành ✅

Tài liệu này tổng kết kiến trúc của **Multi-Theme Engine**, cơ chế Đa ngôn ngữ và cách hệ thống quản lý UI cho người dùng cuối (Khách hàng vãng lai) tại Frontend.

## 1. Kiến trúc Multi-Theme Engine & Lazy Loading
Hệ thống Bất động sản của chúng ta cho phép **một mã nguồn duy nhất có thể hiển thị N giao diện khác nhau** tùy thuộc vào Dự án mà khách hàng đang xem.

### Cơ chế hoạt động:
1. **Angular Resolver (`theme.resolver.ts`):** 
   Khi khách hàng truy cập `/project/:id`, Resolver sẽ gọi API chặn lại để lấy trước thông tin dự án (bao gồm `theme_id`). Nếu backend lỗi, nó tự fallback về `minimalist`.
2. **Dynamic Component Loader (`theme-container.component.ts`):**
   Sử dụng `ViewContainerRef.createComponent()`, hệ thống nạp động chính xác Component giao diện tương ứng (VD: `LuxuryComponent` hoặc `EcoGreenComponent`) thông qua `import()` của ES6. Các Theme không được kích hoạt sẽ KHÔNG bao giờ bị tải xuống trình duyệt, giúp tối ưu băng thông (Lazy Loading).
3. **Dữ liệu truyền ngầm:** Dùng `componentRef.setInput()` để truyền dữ liệu `project` vừa lấy được ở Resolver xuống thẳng Theme con.

## 2. Giao diện (The Themes)
Hệ thống đã xây dựng sẵn 3 Theme đẳng cấp với TailwindCSS:
*   **Minimalist:** Phong cách tối giản, nền trắng, typography lớn, dùng Grid hiển thị ảnh phong cách Airbnb.
*   **Luxury:** Nền Dark Mode (`#0f172a`), màu nhấn Vàng Gold (`#d4af37`), font chữ Serif sang trọng. Tích hợp thanh trượt CSS-based cho thư viện ảnh.
*   **Eco-Green:** Màu xanh lá chủ đạo, bo góc mềm mại, họa tiết chìm (pattern) thiên nhiên. Tích hợp sẵn khung hiển thị bản đồ dự án.

## 3. Hệ sinh thái Tiện ích (Guest Ecosystem)
*   **Diễn đàn (Forum):** Tích hợp Optimistic UI cho nút Like (phản hồi ngay lập tức, báo API chạy ngầm). Hiển thị bài viết dạng Feed.
*   **Tin tức (Blogs):** Thông dịch mảng JSONB `content_blocks` thành một bài báo hoàn chỉnh bằng vòng lặp `ngFor`, nhúng Video Youtube thông minh và an toàn (`DomSanitizer`).
*   **Hồ sơ Cá nhân (Profile):** Form đăng ký nâng cấp thành Môi giới (Agent) kết hợp gọi API kiểm tra trạng thái `pending`/`rejected`. Quản lý danh sách Yêu thích.
*   **Danh sách Yêu thích (Favorites):** Lưu trữ tập trung bằng Service RxJS. Đồng bộ ngay lập tức giữa LocalStorage và API Backend (Cơ chế Fallback mượt mà).

## 4. Đa Ngôn Ngữ (i18n) & SEO
*   **i18n (`@ngx-translate`):** Hỗ trợ 4 ngôn ngữ: Tiếng Việt, Tiếng Anh, Tiếng Hàn, Tiếng Trung. File JSON tĩnh dùng cho Navbar và các Form UI. Dữ liệu động (Tiêu đề, Mô tả BĐS) được lấy từ API Backend (có fallback về tiếng Việt nếu bản dịch chưa duyệt).
*   **Angular SSR Safe:** Custom `TranslateLoader` tránh vòng lặp deadlock HTTP khi render phía Server (Server-Side Rendering).
*   **SEO & OpenGraph:** Tích hợp `SeoService` chèn thẻ `<meta>` động. Khi chia sẻ URL nhà lên Facebook/Zalo, hình ảnh đầu tiên của BĐS và tiêu đề sẽ được tự động trích xuất để làm Preview cực đẹp.
*   **Social Share (Native):** Gắn các nút chia sẻ mạng xã hội dùng hàm `navigator.share` (Web Share API) cho phép khách hàng lan truyền BĐS và Blog dễ dàng lên đa nền tảng.

## 5. Tối ưu Trải nghiệm Người dùng (UX Refinements)
*   **Khôi phục Vị trí Cuộn (Scroll Position Restoration):** Tự động cuộn lên đầu trang mỗi khi chuyển route, giải quyết triệt để vấn đề kẹt thanh cuộn trong ứng dụng một trang (SPA).
*   **Dịch thuật Toàn diện (Full i18n):** Đảm bảo 100% các chuỗi văn bản tĩnh (kể cả các chi tiết nhỏ như "Chuyên viên tư vấn" trong Agent Card) đều được dịch sang 4 ngôn ngữ.
*   **Tối ưu Tìm kiếm:** API tìm kiếm được nâng cấp để tìm kiếm từ khóa trong cả Tiêu đề (`title`) và Mô tả (`description`) của Bất động sản.
*   **Lọc "Rác" Yêu thích:** Danh sách bất động sản yêu thích của người dùng sẽ tự động loại bỏ những sản phẩm đã bị Admin xóa khỏi hệ thống, tránh lỗi 404.

---
*Dự án đã sẵn sàng 100% để bước vào Giai đoạn 5 (Deploy & Security QA).*