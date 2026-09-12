# Quốc Bảo & Lại Huệ — Sổ Tay Kỷ Niệm Tình Yêu (Single-File Edition)

Toàn bộ website bao gồm giao diện HTML, phong cách Tailwind CSS, logic tương tác JavaScript/React, trình phát nhạc đĩa than Acoustic Synthesizer và cấu hình kết nối Firebase đã được gộp trọn vẹn vào **duy nhất 1 tệp `index.html`** (có sẵn tại `dist/index.html` và `docs/index.html`).

---

## 1. Mở Trực Tiếp Trên Máy Tính (Zero-Config / Offline)
- Nhấp đúp chuột vào file `index.html` (`dist/index.html` hoặc `docs/index.html`) để mở trực tiếp trong bất kỳ trình duyệt nào (Chrome, Safari, Edge, Cốc Cốc, Firefox).
- **Không cần cài đặt Node.js hay mở terminal**.
- Trình phát nhạc đĩa than, hiệu ứng lật ảnh polaroid, lưu bút và mẩu chuyện hoạt động trơn tru ngay cả khi không có kết nối mạng nhờ bộ lưu trữ `localStorage` và Web Audio API.

---

## 2. Đưa Lên GitHub Pages (0 Đồng Miễn Phí Vĩnh Viễn)
1. Tải hoặc đẩy repository lên GitHub (hoặc chỉ cần đưa file `index.html` vào thư mục gốc của repository).
2. Mở repository trên GitHub ➔ Chọn tab **Settings**.
3. Chọn menu **Pages** ở danh mục bên trái.
4. Tại mục **Build and deployment**:
   - **Source**: Chọn `Deploy from a branch`.
   - **Branch**: Chọn nhánh `main` (hoặc `master`), thư mục chọn `/(root)` (hoặc `/docs`).
5. Bấm **Save**. Sau 1 - 2 phút, trang web sẽ xuất bản trực tuyến tại:
   `https://<ten-tai-khoan>.github.io/<ten-repo>/`

---

## 3. Cấu Hình Firebase Trực Tiếp Trong Code
- Cấu hình Firebase đã được ghi sẵn trực tiếp trong mã nguồn (`src/services/firebaseService.ts`), không phụ thuộc vào biến môi trường `.env`.
- Có thể tùy chỉnh hoặc thay đổi cấu hình Firebase bất kỳ lúc nào trực tiếp trên giao diện bằng nút **Cơ sở dữ liệu (Database)** ở thanh menu trên cùng.

---

## 4. Lệnh Đóng Gói Lại (Nếu chỉnh sửa mã nguồn)
```bash
npm run build
```
Lệnh này sẽ tự động đóng gói toàn bộ mã nguồn mới nhất thành 1 tệp duy nhất tại `dist/index.html` và `docs/index.html`.

