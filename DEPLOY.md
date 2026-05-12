# 🚀 Deploy Guide — Wedding Invite App

Hướng dẫn deploy thiệp cưới online lên Vercel + Supabase. **Hoàn toàn miễn phí.**

---

## 📋 Bước 1 — Tạo Supabase project

1. Vào https://supabase.com → **Sign in with GitHub** → **New Project**
   - Name: `wedding-invite`
   - Database password: (lưu lại)
   - Region: `Singapore` (gần VN nhất)
   - Plan: Free
2. Đợi ~2 phút để project khởi tạo.

### 1.1 — Chạy database migrations

Vào **SQL Editor** (sidebar trái) → **New Query** → paste lần lượt 2 file:

**Query 1** — copy toàn bộ nội dung `supabase/migrations/001_init.sql` → Run
**Query 2** — copy toàn bộ nội dung `supabase/migrations/002_rls.sql` → Run

### 1.2 — Tạo Storage Buckets

Vào **Storage** (sidebar) → **New Bucket** → tạo 2 buckets:

| Tên bucket | Public access |
|---|---|
| `wedding-photos` | ✅ Public |
| `wedding-music` | ✅ Public |

### 1.3 — Lấy API keys

Vào **Settings → API** → copy 3 giá trị:

| Trong Supabase | Biến .env |
|---|---|
| `Project URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key (🔒 secret!) | `SUPABASE_SERVICE_ROLE_KEY` |

---

## 🌐 Bước 2 — Deploy lên Vercel

### Cách A: Qua Web (dễ nhất)

1. Vào https://vercel.com → **Sign in with GitHub**
2. **Add New → Project** → Import `son-n-pham_opswatrd/Wedding-invatation`
3. **Framework Preset**: Next.js (auto-detect)
4. **Environment Variables** → paste 5 biến:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=mat-khau-cua-ban
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

> Lưu ý: chưa có Vercel URL ngay — paste tạm `https://placeholder.vercel.app`, deploy xong rồi sửa lại sau.

5. Click **Deploy** → đợi ~2 phút.

### Cách B: Qua CLI

```bash
cd /Users/admin/Desktop/wedding-invite-app
npm i -g vercel
vercel login          # đăng nhập GitHub
vercel                # link project
vercel --prod         # deploy production
```

Sau lần deploy đầu, vào Vercel Dashboard → Settings → Environment Variables → cập nhật `NEXT_PUBLIC_SITE_URL` thành URL thật → **Redeploy**.

---

## 🛠️ Bước 3 — Cấu hình thiệp + upload ảnh

1. Mở `https://your-app.vercel.app/admin`
2. Đăng nhập với `ADMIN_PASSWORD` đã set
3. **Config tab**: điền tên, ngày, địa điểm, ngân hàng, link Google Maps, link nhạc YouTube
4. **Photos tab**: kéo thả ảnh để upload (max 10MB, JPG/PNG/WEBP)
5. **Music**: upload mp3 nhạc nền (optional)

---

## 🎀 Bước 4 — Gửi thiệp cho khách

URL có thể nhân hoá tên khách qua query string `?to=`:

| Khách | URL |
|---|---|
| Anh Nam | `https://your-app.vercel.app/?to=Anh%20Nam` |
| Chị Lan | `https://your-app.vercel.app/?to=Chị%20Lan` |
| Gia đình A | `https://your-app.vercel.app/?to=Gia%20đình%20A` |

Tên sẽ hiện trên dòng "Trân trọng kính mời ___" trong hero card.

---

## ✅ Checklist

- [ ] Tạo Supabase project + chạy 2 migrations
- [ ] Tạo `wedding-photos` + `wedding-music` buckets (public)
- [ ] Lưu 3 API keys
- [ ] Push code lên GitHub
- [ ] Deploy lên Vercel + add 5 env vars
- [ ] Update `NEXT_PUBLIC_SITE_URL` → redeploy
- [ ] Login `/admin` → upload ảnh, config thông tin
- [ ] Test với `?to=Tên%20Khách`
- [ ] 🎉 Gửi link cho khách

---

## 🐛 Troubleshooting

**Trang trắng / lỗi build**
→ Kiểm tra Vercel Logs. Thường do thiếu env var hoặc `NEXT_PUBLIC_SUPABASE_URL` còn là `placeholder`.

**Không upload được ảnh**
→ Kiểm tra:
1. Bucket `wedding-photos` đã set Public chưa
2. `SUPABASE_SERVICE_ROLE_KEY` đúng chưa
3. Đã đăng nhập admin chưa

**Console: "WebSocket connection to wss://placeholder.supabase.co failed"**
→ Bình thường khi env var Supabase chưa real. Sau deploy với key thật thì hết.

**.ics calendar không tải xuống**
→ Đảm bảo `NEXT_PUBLIC_SITE_URL` là production URL thật (không phải localhost).
