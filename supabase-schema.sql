-- =============================================
-- GOLF 3D CLUB — DATABASE SCHEMA
-- Chạy script này trong Supabase SQL Editor
-- =============================================

-- 1. BẢNG BOOKINGS — Lịch book bay
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bay TEXT NOT NULL,                    -- 'Bay 1' đến 'Bay 7'
  booking_date DATE NOT NULL,          -- Ngày book
  start_hour INTEGER NOT NULL CHECK (start_hour >= 9 AND start_hour <= 16),
  duration INTEGER NOT NULL DEFAULT 1 CHECK (duration IN (1, 2)),
  member_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index cho truy vấn theo ngày
CREATE INDEX idx_bookings_date ON bookings(booking_date);

-- Chống trùng: không cho 2 người book cùng bay, cùng giờ, cùng ngày
CREATE UNIQUE INDEX idx_bookings_unique ON bookings(bay, booking_date, start_hour);

-- 2. BẢNG VIDEOS — Video buổi tập
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_name TEXT NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bay TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  focus TEXT,                          -- 'Driver & Iron', 'Short Game', 'Full Swing'...
  trainer_comment TEXT,
  video_url TEXT,                      -- Link video (YouTube, Google Drive, v.v.)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_videos_date ON videos(session_date DESC);

-- 3. BẢNG OUTINGS — Sự kiện outing
CREATE TABLE outings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                  -- 'Outing Tân Sơn Nhất Golf'
  event_date DATE NOT NULL,
  max_slots INTEGER NOT NULL DEFAULT 12,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BẢNG OUTING_REGISTRATIONS — Đăng ký outing
CREATE TABLE outing_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outing_id UUID NOT NULL REFERENCES outings(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chống trùng: 1 người chỉ đăng ký 1 lần mỗi outing
CREATE UNIQUE INDEX idx_outing_reg_unique ON outing_registrations(outing_id, member_name);

-- =============================================
-- DỮ LIỆU MẪU (có thể xoá sau)
-- =============================================

-- Video mẫu
INSERT INTO videos (member_name, session_date, bay, duration_minutes, focus, trainer_comment) VALUES
  ('Nguyễn Minh', CURRENT_DATE - 1, 'Bay 3', 45, 'Driver & Iron', 'Swing path đã cải thiện nhiều. Cần chú ý grip pressure ở tay phải, đang nắm hơi chặt khiến release không tự nhiên.'),
  ('Trần Hoa', CURRENT_DATE - 2, 'Bay 1', 60, 'Short Game', 'Chipping quanh green rất ổn định. Putting cần đọc line kỹ hơn, đặc biệt ở putt 3-5m.'),
  ('Lê Tuấn', CURRENT_DATE - 2, 'Bay 5', 30, 'Full Swing', 'Setup position tốt nhưng backswing hơi over-the-top. Drill inside-out path.');

-- Outing mẫu
INSERT INTO outings (name, event_date, max_slots) VALUES
  ('Outing Tân Sơn Nhất Golf', CURRENT_DATE + 30, 12),
  ('Outing Long Thành Golf Resort', CURRENT_DATE + 60, 8),
  ('Outing Sông Bé Golf', CURRENT_DATE + 14, 20);

-- Đăng ký mẫu cho outing đầu tiên
INSERT INTO outing_registrations (outing_id, member_name)
SELECT id, unnest(ARRAY['Minh', 'Hoa', 'Tuấn', 'Linh', 'Nam'])
FROM outings WHERE name = 'Outing Tân Sơn Nhất Golf';

-- =============================================
-- BẬT ROW LEVEL SECURITY (bảo mật)
-- Cho phép mọi người đọc/ghi (demo mode)
-- Khi production, cần thêm authentication
-- =============================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE outings ENABLE ROW LEVEL SECURITY;
ALTER TABLE outing_registrations ENABLE ROW LEVEL SECURITY;

-- Policies cho phép anonymous access (demo)
CREATE POLICY "Allow all on bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on videos" ON videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on outings" ON outings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on outing_registrations" ON outing_registrations FOR ALL USING (true) WITH CHECK (true);
