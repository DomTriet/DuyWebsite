# 🎨 HƯỚNG DẪN PHÁT TRIỂN THEME (THEME DEVELOPMENT GUIDE)

Tài liệu này hướng dẫn các Frontend Developer cách tạo mới, cấu hình và tích hợp một Theme hoàn toàn mới vào hệ thống **Multi-Theme Engine** của dự án Pro-RealEstate. Dự án sử dụng kiến trúc **Angular Standalone Components**, giúp việc tạo và tích hợp Theme trở nên cực kỳ đơn giản.

## 1. Cơ chế hoạt động của Theme Engine
Hệ thống nhận diện giao diện thông qua `theme_id` của bảng Dự án (Projects). 
Khi khách hàng truy cập một dự án, Angular Resolver sẽ gọi API lấy thông tin và dùng **Dynamic Component Loading** để nạp đúng Component giao diện tương ứng (Ví dụ: `LuxuryComponent` hoặc `EcoGreenComponent`), giúp tối ưu tốc độ tải trang vì không nạp CSS/JS dư thừa.

## 2. Các bước khởi tạo một Theme mới

### Bước 1: Tạo Standalone Component cho Theme
Sử dụng Angular CLI để tạo một Component độc lập mới trong thư mục `frontend/src/app/guest/themes/`:
```bash
ng generate component guest/themes/my-new-theme --standalone
```

### Bước 2: Thiết lập SCSS Variables (Biến màu sắc)
Tại file `my-new-theme.component.scss`, hãy định nghĩa lại bộ màu chủ đạo. Việc này cho phép bạn ghi đè lên các thuộc tính TailwindCSS mặc định của dự án.
```scss
:host {
  --theme-primary: #1a202c; /* Đen nhám sang trọng */
  --theme-accent: #d4af37;  /* Vàng gold điểm xuyết */
}
```

### Bước 3: Ánh xạ dữ liệu JSONB động
Do mỗi theme sẽ ưu tiên hiển thị một loại thông tin khác nhau. Bạn hãy bóc tách trường `attributes` (JSONB) từ API để hiển thị.
*   *Với Căn hộ (Luxury):* Ưu tiên render `bedrooms`, `bathrooms`, `balcony_direction`.
*   *Với Khu sinh thái (Eco-Green):* Ưu tiên render `green_area`, `lake_view`, `tree_density`.

## 3. Quy chuẩn Đa ngôn ngữ (i18n) trong Theme
Không fix cứng (hardcode) văn bản vào HTML. Luôn sử dụng Pipe `translate`:
```html
<!-- SAI -->
<button>Liên hệ Môi giới</button>

<!-- ĐÚNG -->
<button>{{ 'THEME.CONTACT_AGENT' | translate }}</button>
```

*Tài liệu sẽ liên tục được cập nhật trong quá trình triển khai Giai đoạn 4.*