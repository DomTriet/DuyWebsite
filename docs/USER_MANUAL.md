# 📖 HƯỚNG DẪN SỬ DỤNG (USER MANUAL)

Tài liệu hướng dẫn thao tác trên Hệ thống Quản trị (Dashboard) của nền tảng **Điểm Tâm BĐS** dành cho hai đối tượng chính: **Quản trị viên (Admin)** và **Môi giới (Agent)**.

---

## 1. Hướng dẫn Chung (Đăng nhập & Tài khoản)

### 1.1. Đăng nhập và Quên mật khẩu
1. Truy cập đường dẫn: `http://[ten-mien]/auth/login`
2. Nhập Email và Mật khẩu đã được cấp hoặc đã đăng ký.
3. Nếu quên mật khẩu, chọn **"Quên mật khẩu?"**. Hệ thống sẽ yêu cầu nhập Email để gửi liên kết khôi phục.
   * *Lưu ý:* Cần đợi 60 giây giữa các lần gửi yêu cầu khôi phục để tránh spam hệ thống. Nhớ kiểm tra thư mục Spam/Junk.

### 1.2. Cập nhật Hồ sơ cá nhân (Account Settings)
1. Tại giao diện Dashboard, bấm vào Avatar góc trên cùng bên phải -> Chọn **Cài đặt tài khoản**.
2. Cập nhật thông tin cơ bản: Tên hiển thị, Số điện thoại, Đổi mật khẩu.
3. (Với người dùng thường - Member): Tại đây sẽ có thêm mục **"Đăng ký làm Môi giới"** để điền kinh nghiệm và gửi yêu cầu nâng cấp tài khoản lên Admin.

---

## 2. Dành cho Môi giới (Agent)

Môi giới là nhân sự trực tiếp đăng bán Bất động sản và quản lý nguồn khách hàng.

### 2.1. Quản lý Bất động sản (Properties)
1. **Truy cập:** Menu Trái -> `Quản lý Bất động sản`.
2. **Danh sách:** Hiển thị 100% các BĐS do bạn đăng tải hoặc được Ban quản trị phân công.
3. **Thêm Mới / Sửa:**
   * Điền Tiêu đề, Giá, chọn Danh mục (Căn hộ, Đất nền,...).
   * **Thông số chi tiết:** Điền diện tích, số tầng, hướng...
   * **Theme trang chi tiết:** Chọn giao diện riêng cho trang chi tiết của BĐS này (Minimalist / Luxury / Eco Green). Để **"Tự động (theo dự án)"** nếu muốn dùng theme của dự án — đây cũng là mặc định, đảm bảo các BĐS cũ giữ nguyên giao diện.
   * **Bố cục ảnh:** Chọn cách hiển thị ảnh trên trang chi tiết — *Mặc định* (ảnh chính + dải thumbnail), *Lưới* (hiện tất cả ảnh) hoặc *1 ảnh lớn*.
   * **Kéo thả hình ảnh:** Upload trực tiếp file từ máy tính. Có thể click xóa ảnh, ảnh đầu tiên luôn mặc định là "Ảnh bìa" (Thumbnail).
   * **👁 Xem trước:** Bấm để mở cửa sổ xem trước trang chi tiết với đúng theme + bố cục ảnh + dữ liệu đang nhập, trước khi lưu.
4. **Xóa BĐS:** Bấm "Xóa". BĐS sẽ được ẩn khỏi giao diện khách hàng (Chuyển vào thùng rác).

### 2.2. Quản lý Khách hàng (Leads CRM)
1. **Truy cập:** Menu Trái -> `Quản lý Khách hàng`.
2. **Tiếp nhận:** Khi có khách hàng gửi yêu cầu tư vấn trên Web, trạng thái là "New" và bạn sẽ nhận được Email thông báo.
3. **Xử lý:** Cập nhật Trạng thái (Đã liên hệ, Đã chốt, Hủy) và cập nhật cột **Ghi chú** để tiện theo dõi tiến trình chăm sóc.

---

## 3. Dành cho Quản trị viên (Admin)

Quản trị viên có toàn quyền xem và thao tác trên mọi hệ thống.

### 3.1. Quản lý Người dùng & Duyệt Yêu cầu Môi giới
1. **Users Manage:** Xem danh sách toàn bộ thành viên. Thay đổi Role (Phân quyền) bất kỳ ai.
2. **Agent Requests:** Khi duyệt đơn (Approve), hệ thống tự động thăng cấp người đó thành Agent và cấp quyền sử dụng Dashboard ngay lập tức.

### 3.2. Quản lý Danh mục & Dự án
1. Thêm mới các Danh mục BĐS (VD: Khu nghỉ dưỡng, Shophouse...).
2. Tạo mới Dự án, thiết lập ID Giao diện (Theme ID) để hệ thống tự động đổi giao diện Public phù hợp với Dự án đó.

### 3.3. Kiểm duyệt Cộng đồng (Forum & Báo cáo)
1. **Truy cập:** Menu Trái -> `Duyệt Diễn đàn`.
2. Đọc và quyết định Cho phép duyệt / Xóa bỏ các bài viết do user đăng tải. Xử lý bài viết rác từ tab "Báo cáo vi phạm".

### 3.4. Quản lý Dịch thuật Đa ngôn ngữ
1. Hệ thống tự động dịch BĐS mới sang Tiếng Anh (thông qua Trí tuệ Nhân tạo).
2. Truy cập `Quản lý Dịch thuật` để xem lại các bản dịch này.
3. Nếu dịch sai, Admin có thể sửa trực tiếp bên khung Tiếng Anh và bấm **Lưu & Duyệt**. Bản dịch chuẩn sẽ xuất hiện trên Website Public.

### 3.5. Kiểm soát Hệ thống (System Logs)
1. **Truy cập:** Menu Trái -> `Nhật ký Hệ thống`.
2. Theo dõi 24/7 mọi hành động (Sửa/Xóa/Thêm) của hệ thống. Nhằm phát hiện nhanh ai là người đã thao tác sai trên dữ liệu nhạy cảm.

---

## 4. Các tính năng v2 (Trang chi tiết Dự án nâng cao)

### 4.1. Nhập Thông số kỹ thuật BĐS (Preset theo loại)
1. Khi thêm/sửa Bất động sản, sau khi chọn **Danh mục**, khối "Thông số kỹ thuật" tự đổi bộ trường gợi ý phù hợp (Căn hộ → phòng ngủ/diện tích/tầng/hướng; Đất nền → diện tích/mặt tiền/lộ giới/pháp lý; Biệt thự, Nhà phố, Shophouse...).
2. Bỏ trống trường không áp dụng. Dữ liệu được lưu vào cột `attributes` (JSONB) và dùng để **lọc** ở trang chủ và trang dự án.

### 4.2. Quản lý Nội dung Dự án (Section)
1. Vào `Quản lý Danh mục & Dự án` → bấm **"Nội dung"** ở dự án cần sửa.
2. Thêm các section: chọn **loại** (Tổng quan / Chủ đầu tư / Vị trí / Tiện ích / Pháp lý / Thanh toán / Tùy chỉnh) → form tự hiện đúng trường (vd Vị trí có link nhúng Google Maps; Tiện ích nhập danh sách từng dòng).
3. Kéo-thả không áp dụng ở đây; dùng ô **Thứ tự hiển thị** để sắp xếp. Section sẽ xuất hiện trên trang dự án kèm liên kết điều hướng (anchor) trên thanh nav.

### 4.3. Gắn Blog với Dự án
1. Khi viết/sửa Blog, chọn **"Thuộc dự án"** (tùy chọn). Bài viết sẽ hiển thị trong mục "Tin tức dự án" trên trang dự án tương ứng.

### 4.4. Trình dựng Custom Theme (Tự thiết kế giao diện)
1. Tạo dự án với Theme = **Custom (Tự thiết kế)**, hoặc bấm nút **🎨 Tùy biến** ở dự án bất kỳ.
2. Trong trình dựng: cột trái chỉnh **màu sắc, phông chữ, logo**, thêm/ẩn/xóa và **kéo-thả sắp xếp các khối** (Hero, Thống kê, Danh sách BĐS, Nội dung dự án, Tin tức, Thư viện ảnh, Văn bản, CTA), cấu hình Footer; cột phải **xem trước trực tiếp**.
3. Bấm **💾 Lưu** → mở `/project/:id` để xem giao diện khách.

### 4.5. Duyệt Dịch thuật (giao diện gom nhóm)
1. Vào `Quản lý Dịch thuật`. Mỗi mục là 1 nhóm: **🇻🇳 Tiếng Việt (gốc)** ở trên, rồi **🇬🇧 Anh → 🇨🇳 Trung → 🇰🇷 Hàn** (sửa được).
2. Sửa nếu máy dịch chưa chuẩn → bấm **Lưu & Phê duyệt** (từng ngôn ngữ) hoặc **Lưu & duyệt cả nhóm**. Chỉ bản đã duyệt mới hiển thị trên web khách.

> **Giao diện đa ngôn ngữ tĩnh** (menu, nút, nhãn) đã được dịch sẵn vi/en/ko/zh — khách đổi cờ là đổi ngay. Riêng **nội dung động** (tên/mô tả dự án, tiêu đề BĐS, blog, section) cần Admin duyệt như trên.

---

## 5. Cài đặt Website (Site Settings)

### 5.1. Quản lý Banner Slider Trang chủ
1. Vào sidebar Admin → **Banner Trang Chủ**.
2. Danh sách hiển thị tất cả banner (cả đang ẩn). Cột **Hiển thị** là toggle bật/tắt nhanh.
3. Bấm **+ Thêm banner** để mở form:
   - **Ảnh nền** (bắt buộc): upload ảnh qua Cloudinary — tỷ lệ khuyến nghị 16:9, tối thiểu 1280×720px.
   - **Tiêu đề / Mô tả**: text overlay hiển thị trên ảnh.
   - **Nhãn nút CTA / Đường dẫn**: nút kêu gọi hành động (VD: "Xem ngay" → `/properties`).
   - **Thứ tự**: số nhỏ hiển thị trước.
4. Dùng nút ▲ ▼ để đổi thứ tự banner trong danh sách.
5. Slider trang chủ sẽ tự động chuyển slide mỗi 5 giây. Nếu không có banner nào đang bật, trang chủ hiển thị hero tĩnh mặc định.

### 5.2. Bật / Tắt Forum công khai
1. Vào sidebar Admin → **Cài đặt Website**.
2. Phần **"Tính năng Forum"**: toggle **"Hiển thị Forum công khai"**.
   - **BẬT**: Link "Cộng đồng" xuất hiện ngay trên thanh điều hướng và footer (không cần reload trang).
   - **TẮT** *(mặc định)*: Forum bị ẩn hoàn toàn khỏi khách vãng lai. Admin vẫn có thể vào `/forum` trực tiếp để kiểm tra nội dung.
3. Thay đổi được lưu ngay vào database và phản ánh realtime trên toàn bộ phiên người dùng đang mở.

---
*Mọi thắc mắc kỹ thuật vui lòng liên hệ đội ngũ phát triển tại contact@bdsdiemtam.com*