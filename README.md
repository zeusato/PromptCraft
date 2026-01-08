# PromptCraft - Studio Sáng Tạo Prompt AI Chuyên Nghiệp

**PromptCraft** là công cụ kỹ thuật prompt (prompt engineering) tiên tiến, được thiết kế để giúp các nhà sáng tạo nội dung, lập trình viên và nhà nghiên cứu tạo ra các prompt chất lượng cao, tối ưu hóa cho nhiều mô hình AI khác nhau.

![PromptCraft UI](public/og-image.png)

## 🚀 Tính Năng Nổi Bật

*   **Chế Độ Kép (Dual Modes):**
    *   **Craft Mode:** Tự do sáng tạo prompt với sự hỗ trợ của AI cho các tác vụ Research, Coding, Writing...
    *   **Prompt Libs (Thư Viện):** Kho mẫu prompt chuyên nghiệp có sẵn, chỉ cần điền biến số là dùng ngay.
*   **Đa Lĩnh Vực:** Hỗ trợ chuyên sâu cho:
    *   **Research & Data (Mới):** Phân tích dữ liệu, báo cáo thị trường, dịch thuật, tổng hợp tin tức.
    *   **Marketing (Mới):** Viết content viral, email marketing, kịch bản xử lý từ chối, kế hoạch ra mắt sản phẩm.
    *   **Coding:** Tạo code, debug, refactor, viết unit test.
    *   **Writing & Content:** Viết blog, tiểu luận, email, tóm tắt văn bản theo tone giọng.
    *   **Image & Video:** Tạo prompt chi tiết cho Midjourney, Stable Diffusion, Runway Gen-2.
*   **Output Chuẩn JSON (Mới):** Tự động cấu trúc prompt thành format JSON sạch, tách biệt các trường (Role, Context, Task...), loại bỏ ký tự thừa, dễ dàng tích hợp vào code hoặc API.
*   **Hỗ Trợ Song Ngữ:** Tự động tạo prompt tiếng Anh (ngôn ngữ tối ưu cho LLM) nhưng giao diện và giải thích hoàn toàn bằng tiếng Việt.
*   **Giao Diện Premium:** Thiết kế Glassmorphism hiện đại, hỗ trợ Dark/Light mode, tối ưu cho cả Mobile (PWA).
*   **Bảo Mật & Riêng Tư:** Sử dụng Google Gemini Flash API tốc độ cao, lưu trữ lịch sử ngay trên trình duyệt (Local Storage/IndexedDB), không lưu data lên server lạ.

## 🛠 Công Nghệ Sử Dụng

*   **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI Engine**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/genai) (Gemini Models)
*   **Markdown**: `react-markdown` để hiển thị prompt đẹp mắt.
*   **Lưu trữ**: IndexedDB (qua thư viện `idb`) cho lịch sử local.
*   **Icons**: Material Symbols Rounded.

## 🚦 Cài Đặt & Chạy Local

Làm theo các bước sau để chạy dự án trên máy của bạn:

### Yêu cầu
*   Node.js (v18 trở lên)
*   npm hoặc yarn

### Các bước
1.  **Clone dự án**
    ```bash
    git clone https://github.com/zeusato/PromptCraft.git
    cd PromptCraft
    ```

2.  **Cài đặt dependencies**
    ```bash
    npm install
    ```

3.  **Cấu hình Environment**
    Tạo file `.env` ở thư mục gốc và thêm API Key Google Gemini của bạn:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Chạy server development**
    ```bash
    npm run dev
    ```
    Truy cập `http://localhost:5173` để trải nghiệm.

## 📱 Build Production

Để tạo bản build tối ưu cho production:
```bash
npm run build
```

## 📄 License
Dự án được phát hành dưới giấy phép MIT.

---
*Phát triển bởi [Quyetnm](https://github.com/zeusato)*
