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

---

## 4. Custom Theme — Kiến trúc Block-based (v2)

Ngoài 3 theme cố định (`minimalist`, `luxury`, `eco-green`), hệ thống có theme **`custom`** render hoàn toàn từ cấu hình `projects.layout_config` do Admin tự dựng.

**Các file liên quan:**
*   `frontend/src/app/themes/custom/custom-layout.model.ts` — định nghĩa `LayoutConfig`, `LayoutBlock`, danh sách block (`BLOCK_PALETTE`), font (`FONT_OPTIONS`), `defaultLayout()`, `normalizeLayout()`.
*   `frontend/src/app/themes/custom/custom.component.ts` — `CustomThemeComponent`: đọc `layout_config`, áp tokens (màu/font) qua biến CSS trong `:host`, render block theo `[ngSwitch]="block.type"`. Tái dùng logic dữ liệu của theme minimalist (properties/facets/categories/sections/blogs/favorites).
*   `frontend/src/app/admin/pages/theme-builder.component.ts` — `ThemeBuilderComponent`: trình dựng 2 cột (điều khiển + live preview `<app-custom-theme>`), kéo-thả block bằng HTML5 native, lưu qua `PUT /projects/:id`.

**Thêm 1 loại block mới:** bổ sung `BlockType` + `defaultBlock()` trong model → thêm `case` render trong `custom.component.ts` → thêm panel sửa `props` trong `theme-builder.component.ts`.

**Container:**
*   `theme-container.component.ts`: nhánh `themeId === 'custom'` → lazy-load `CustomThemeComponent`.
*   `theme-property-container.component.ts`: dự án custom dùng `layout_config.basePropertyTheme` (mặc định `minimalist`) cho trang chi tiết BĐS.

> Bản dịch nội dung động của Section (`project_section`) được các theme đọc qua `LanguageService.getDynamicTranslation('project_section', id)` và chỉ áp khi bản dịch đã được Admin duyệt.

*Tài liệu sẽ liên tục được cập nhật trong quá trình triển khai Giai đoạn 4.*