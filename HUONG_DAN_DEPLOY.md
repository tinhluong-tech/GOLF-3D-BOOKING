# 🏌️ GOLF 3D CLUB — Hướng dẫn Deploy

## Tổng quan

App có 3 chức năng:
1. **Book Bay** — Đặt giờ tập tại 7 bay simulator 3D (9am–5pm, book 1-2h)
2. **Video Swing** — Lưu video buổi tập + nhận xét trainer
3. **Đăng ký Outing** — Đăng ký tham gia outing, giới hạn slot

**Tech stack:** React + Vite (frontend) → Netlify (hosting) + Supabase (database miễn phí)

---

## BƯỚC 1: Tạo Database trên Supabase (miễn phí)

1. Vào **https://supabase.com** → Đăng ký bằng GitHub hoặc email
2. Click **"New Project"** → đặt tên (ví dụ: `golf-3d-club`), chọn region **Singapore** (gần VN nhất)
3. Đặt password database → click **Create**
4. Đợi 1-2 phút cho project khởi tạo xong
5. Vào menu bên trái → **SQL Editor**
6. Copy toàn bộ nội dung file **`supabase-schema.sql`** → paste vào SQL Editor → click **Run**
7. Nếu thấy "Success" → database đã sẵn sàng!

### Lấy API keys:
1. Menu bên trái → **Project Settings** (icon bánh răng) → **API**
2. Copy 2 giá trị:
   - **Project URL** — dạng `https://xxxxx.supabase.co`
   - **anon / public key** — chuỗi dài bắt đầu bằng `eyJ...`

---

## BƯỚC 2: Push code lên GitHub

1. Vào **https://github.com** → đăng nhập (hoặc đăng ký mới)
2. Click **"+"** góc phải trên → **New repository**
3. Đặt tên: `golf-3d-booking` → click **Create repository**
4. **Giải nén file ZIP** đã tải về
5. Trong folder đã giải nén, tạo file **`.env`** (copy từ `.env.example`) và điền 2 giá trị Supabase:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...chuỗi_dài_ở_đây
```

6. Upload toàn bộ file lên GitHub repo vừa tạo:
   - Trên trang GitHub repo → click **"uploading an existing file"**
   - Kéo thả toàn bộ file vào → click **Commit changes**

> ⚠️ **KHÔNG upload file `.env`** lên GitHub (chứa key bí mật). Chỉ upload các file khác.

---

## BƯỚC 3: Deploy lên Netlify (miễn phí)

1. Vào **https://app.netlify.com** → đăng nhập bằng GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Chọn **GitHub** → chọn repo `golf-3d-booking`
4. Cấu hình build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. **Thêm Environment Variables** (QUAN TRỌNG!):
   - Click **"Add environment variables"**
   - Thêm 2 biến:
     - Key: `VITE_SUPABASE_URL` → Value: URL Supabase của bạn
     - Key: `VITE_SUPABASE_ANON_KEY` → Value: anon key của bạn
6. Click **"Deploy site"**
7. Đợi 1-2 phút → Netlify sẽ cho bạn URL dạng: `https://ten-random.netlify.app`

**🎉 XONG! App đã chạy trên internet.**

---

## Sau khi deploy

### Thêm dữ liệu thật:
- Vào **Supabase Dashboard** → **Table Editor** để thêm/sửa/xoá:
  - Bảng `outings` — thêm sự kiện outing mới
  - Bảng `videos` — thêm video buổi tập (paste link YouTube/Drive vào cột `video_url`)
  - Bảng `bookings` — xem/quản lý booking (hoặc member tự book trên app)

### Đổi tên miền (tuỳ chọn):
- Netlify → **Domain management** → đổi thành `golf3d.netlify.app` hoặc gắn domain riêng

### Giới hạn của bản demo:
- Chưa có đăng nhập (ai có link đều book được)
- Chưa có phân quyền Admin/Member/Trainer
- Video chỉ lưu link, chưa upload trực tiếp
- Nếu cần các tính năng trên → cần dev team mở rộng

---

## Cấu trúc project

```
golf-3d-booking/
├── index.html              ← Trang HTML chính
├── package.json            ← Cấu hình project
├── vite.config.js          ← Cấu hình build tool
├── netlify.toml            ← Cấu hình Netlify
├── supabase-schema.sql     ← Script tạo database
├── .env.example            ← Mẫu file cấu hình
└── src/
    ├── main.jsx            ← Entry point
    ├── supabaseClient.js   ← Kết nối Supabase
    └── App.jsx             ← Toàn bộ giao diện app
```
