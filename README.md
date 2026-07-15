# 📸 CTRL+Snap — AI Digital Photobooth

Aplikasi web photobooth digital untuk mengambil, menghias, dan membagikan foto strip secara online. Dibangun dengan **React 19 + Vite** (frontend) dan **FastAPI** (backend), siap di-deploy sebagai *serverless function* di Vercel.

🔗 **Live Demo**: [ctrlsnap.rypl.my.id](https://ctrlsnap.rypl.my.id)

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Teknologi](#-teknologi)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Alur Halaman](#-alur-halaman)
- [Model Bisnis](#-model-bisnis)
- [API Endpoints](#-api-endpoints)
- [Struktur Folder](#-struktur-folder)
- [Troubleshooting](#-troubleshooting)
- [Scripts yang Tersedia](#-scripts-yang-tersedia)
- [Catatan Keamanan & Status Backend](#-catatan-keamanan--status-backend)
- [Kontribusi](#-kontribusi)

---

## ✨ Fitur

### 🆓 Gratis Selamanya
| Fitur | Keterangan |
|---|---|
| 📐 Semua Layout | 1×1 Solo Portrait, 1×3 Classic Strip, 1×4 Iconic Strip, 2×2 Bento Grid |
| 🎨 Filter Real-time | Normal, Glamour, Kodak Gold, Cyberpunk, Monochrome, Pop Art |
| 🖼️ Frame Standar | 6 frame preset (Cloud White, Muted Blue, Warm Cream, dll.) |
| ✏️ Editor Dekorasi | Stiker emoji drag-and-drop, tambah teks, drag repositioning |
| 📥 Export HD | Unduh hasil foto dalam format JPEG kualitas tinggi |
| 🔗 Share | Bagikan via WhatsApp, QR code, atau salin tautan |
| 📚 Riwayat Sesi | Tersimpan di browser (localStorage + cookies) |

> Hasil foto gratis menyertakan watermark **CTRL+Snap** di bagian bawah strip.

### 💎 Premium — Rp 10.000/sesi (QRIS)
| Fitur | Keterangan |
|---|---|
| 📤 Upload Frame Kustom | Gunakan gambar sendiri sebagai background frame (JPG/PNG) |
| 🎨 Kustomisasi Warna Frame | Ubah warna background & teks watermark bebas |
| 🦊 Upload Mascot/Logo | Tambahkan logo, karakter, atau gambar kustom di pojok strip |
| 🚫 Bebas Watermark | Hasil foto tanpa watermark CTRL+Snap |

> Upgrade premium bisa dilakukan kapan saja — dari halaman **Konfigurasi Photostrip** (sebelum sesi) maupun langsung dari dalam **Editor** saat mengakses fitur terkunci.

### 🤖 Umum
- Kamera langsung dari browser (WebRTC), timer 3/5/10 detik, suara shutter
- Preview strip live saat konfigurasi layout & frame
- Upload otomatis ke Cloudinary setelah sesi selesai
- Halaman *shared result* untuk melihat foto dari orang lain via tautan `?share=`

---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| **Frontend** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + custom design system |
| **Animasi** | [Motion (Framer Motion)](https://motion.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) (Python) |
| **Database** | [SQLAlchemy](https://www.sqlalchemy.org/) — SQLite (dev) / MySQL (produksi) |
| **Storage** | [Cloudinary](https://cloudinary.com/) — upload & hosting gambar |
| **Payment** | QRIS Dinamis — generate via CRC16 manual, verifikasi disimulasikan di frontend |
| **Deploy** | [Vercel](https://vercel.com/) — static frontend + Python serverless |

---

## 📦 Prasyarat

Pastikan sudah terinstall di komputer kamu:

1. **Node.js** v18+ → [nodejs.org](https://nodejs.org/)
2. **Python** v3.11+ → [python.org](https://www.python.org/)
3. **Git** → [git-scm.com](https://git-scm.com/)
4. *(Opsional)* Akun **Cloudinary** gratis → [cloudinary.com](https://cloudinary.com/)

---

## 🚀 Instalasi

### 1. Clone repositori

```bash
git clone https://github.com/rktdnt/ctrlsnap_photobooth.git
cd ctrlsnap_photobooth
```

### 2. Install dependencies Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Install dependencies Frontend

```bash
cd ../frontend
npm install
```

---

## 🗄️ Konfigurasi Environment

### `backend/.env`

```env
DATABASE_URL=sqlite:///./ctrlsnap.db
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_ORIGIN=http://localhost:3000
APP_PUBLIC_BASE_URL=http://127.0.0.1:8000
```

> Untuk produksi, ganti `DATABASE_URL` ke MySQL:
> `mysql+pymysql://USER:PASSWORD@HOST:3306/NAMA_DATABASE`

### `frontend/.env`

```env
VITE_CLOUDINARY_CLOUD_NAME=nama_cloud_kamu
VITE_CLOUDINARY_UPLOAD_PRESET=ml_default
VITE_STATIC_QRIS=00020101021126610014...  # isi dengan QRIS statis kamu
```

| Variabel | Wajib | Keterangan |
|---|---|---|
| `VITE_CLOUDINARY_CLOUD_NAME` | Opsional | Jika kosong, foto tetap bisa diunduh sebagai data URL lokal |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Opsional | Default: `ml_default` |
| `VITE_STATIC_QRIS` | Opsional | String QRIS statis dari rekening/merchant kamu untuk fitur upgrade Premium |

---

## ▶️ Menjalankan Aplikasi

### Jalankan Backend (FastAPI)

```bash
cd backend
uvicorn app.main:app --reload
```

Backend berjalan di **http://127.0.0.1:8000**

### Jalankan Frontend (Vite)

```bash
cd frontend
npm run dev
```

Buka browser: **[http://localhost:3000](http://localhost:3000)**

> ⚠️ Akses kamera membutuhkan *secure context* (HTTPS). Dari `localhost` sudah diizinkan browser. Untuk akses dari HP/jaringan lain, gunakan `ngrok` atau `mkcert`.

---

## 🌐 Alur Halaman

Aplikasi ini adalah *Single Page Application* — perpindahan tampilan diatur via state React di `App.tsx`.

```
Landing → Selector → Photobooth → Editor → Result
                                              ↓
                                         Shared (via ?share=URL)
```

| Tampilan | Komponen | Keterangan |
|---|---|---|
| **Landing** | `LandingPage.tsx` | Hero, fitur, demo live, testimoni, harga |
| **Selector** | `TemplateSelector.tsx` | Pilih layout & frame (preview visual), upgrade Premium via QRIS |
| **Photobooth** | `Photobooth.tsx` | Sesi foto dengan hitung mundur & suara shutter |
| **Editor** | `PhotoEditor.tsx` | Filter, stiker, teks, frame kustom, mascot, upgrade Premium inline |
| **Result** | `ResultPage.tsx` | Unduh HD, share WhatsApp/QR/link, riwayat sesi |
| **Shared** | `SharedResultPage.tsx` | Tampilan foto dari orang lain via `?share=` |

---

## 💰 Model Bisnis

CTRL+Snap menggunakan model **freemium tanpa akun**:

| | Gratis | Premium (Rp 10.000/sesi) |
|---|---|---|
| Semua layout | ✅ | ✅ |
| Semua filter | ✅ | ✅ |
| Frame standar | ✅ | ✅ |
| Export HD | ✅ | ✅ |
| Share link & QR | ✅ | ✅ |
| Upload frame kustom | ❌ | ✅ |
| Kustomisasi warna frame | ❌ | ✅ |
| Upload mascot/logo | ❌ | ✅ |
| Bebas watermark | ❌ | ✅ |
| Bayar via | — | QRIS Dinamis |

**Kapan bisa upgrade?**
1. **Di Selector** — klik "Frame Kustom" → muncul popup upgrade → bayar QRIS → langsung masuk ke sesi premium
2. **Di Editor** — klik area terkunci (Frame Warna / Mascot) → muncul popup upgrade → bayar → fitur langsung terbuka tanpa reload

> ⚠️ Verifikasi pembayaran QRIS saat ini **disimulasikan** (`setTimeout 2.5 detik`) — belum terhubung ke payment gateway sungguhan.

---

## 📡 API Endpoints

### ✅ Aktif (di `main.py`)

| Method | URL | Keterangan |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/ai/remove-background` | Stub penghapusan background |

### 🔧 Tersedia di kode, belum terdaftar (`routers/`)

| Method | URL | File | Keterangan |
|---|---|---|---|
| `POST` | `/api/sessions` | `sessions.py` | Simpan record sesi foto |
| `GET` | `/api/sessions?device_id=...` | `sessions.py` | Ambil riwayat sesi |
| `DELETE` | `/api/sessions/:id` | `sessions.py` | Hapus record sesi |
| `POST` | `/api/upload` | `upload.py` | Upload gambar ke Cloudinary |
| `POST` | `/api/qrcode` | `qrcode_gen.py` | Generate QR code PNG |
| `POST` | `/api/media/gif` | `media.py` | Pembuatan GIF (placeholder) |

---

## 📁 Struktur Folder

```
ctrlsnap_photobooth/
│
├── api/                         ← Entry point serverless (Vercel)
│   ├── index.py
│   └── requirements.txt
│
├── backend/                     ← Backend FastAPI
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py              ← Entry point + CORS + endpoint aktif
│       ├── config.py            ← Load .env
│       ├── database.py          ← SQLAlchemy setup
│       ├── models.py            ← Model ORM PhotoSession
│       ├── schemas.py           ← Skema Pydantic
│       ├── routers/             ← Endpoint per-fitur
│       └── services/            ← Integrasi Cloudinary, QR
│
├── frontend/                    ← React SPA
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── public/images/           ← Aset gambar landing page
│   └── src/
│       ├── main.tsx
│       ├── App.tsx              ← State global & navigasi antar-view
│       ├── index.css            ← Design system & token warna
│       ├── types.ts             ← TypeScript types + preset data
│       ├── components/
│       │   ├── LandingPage.tsx  ← Halaman awal
│       │   ├── TemplateSelector.tsx ← Pilih layout/frame + upgrade premium
│       │   ├── Photobooth.tsx   ← Sesi foto
│       │   ├── PhotoEditor.tsx  ← Editor foto + upgrade premium inline
│       │   ├── ResultPage.tsx   ← Hasil & share
│       │   └── SharedResultPage.tsx
│       └── utils/
│           └── qris.ts          ← Generator QRIS dinamis (CRC16)
│
├── vercel.json                  ← Routing Vercel
└── README.md
```

---

## 🔧 Troubleshooting

### ❌ "Failed to access camera"

- Pastikan akses dari `http://localhost:3000` (bukan alamat IP)
- Jika gagal, aplikasi otomatis menampilkan placeholder
- Untuk akses dari HP: gunakan HTTPS via `ngrok` atau `mkcert`

### ❌ "Module not found" saat `npm run dev`

```bash
cd frontend && npm install
```

### ❌ Port 3000 sudah dipakai

```bash
npm run dev -- --port 3001
```

### ❌ Upload / QR tidak muncul di halaman hasil

Isi `VITE_CLOUDINARY_CLOUD_NAME` di `frontend/.env`, lalu restart dev server. Tanpa ini, foto tetap bisa diunduh sebagai data URL lokal (tidak ter-upload ke cloud).

### ❌ QRIS tidak muncul di modal upgrade

Isi `VITE_STATIC_QRIS` di `frontend/.env` dengan string QRIS statis dari akun QRIS kamu. Jika kosong, digunakan string QRIS default dari kode.

---

## 📜 Scripts yang Tersedia

| Perintah | Lokasi | Fungsi |
|---|---|---|
| `npm run dev` | `frontend/` | Dev server Vite (port 3000, hot reload) |
| `npm run build` | `frontend/` | Build production (`tsc -b && vite build`) |
| `npm run preview` | `frontend/` | Preview build production |
| `uvicorn app.main:app --reload` | `backend/` | Server FastAPI dengan hot reload |
| `docker build -t ctrlsnap-backend .` | `backend/` | Build Docker image backend |

---

## 🔐 Catatan Keamanan & Status Backend

- ⚠️ Router `sessions`, `upload`, `qrcode_gen`, `media`, `ai_tools` **belum** didaftarkan di `main.py` — perlu `app.include_router(...)` untuk mengaktifkannya
- ⚠️ Upload gambar, generate QR, dan riwayat sesi berjalan **langsung dari browser** (Cloudinary unsigned upload, `api.qrserver.com`, `localStorage`/cookie)
- ⚠️ Verifikasi pembayaran QRIS disimulasikan (`setTimeout`) — belum terhubung payment gateway sungguhan
- ⚠️ `routers/media.py` dan `routers/ai_tools.py` masih placeholder
- ✅ CORS dikonfigurasi via `FRONTEND_ORIGIN` di `config.py`
- ✅ `.env` tidak ikut ter-commit ke Git

---

## 🤝 Kontribusi

1. Fork repositori ini
2. Buat branch baru: `git checkout -b fitur-saya`
3. Commit perubahan: `git commit -m "feat: tambah fitur X"`
4. Push: `git push origin fitur-saya`
5. Buat Pull Request

---

*Dibuat dengan ❤️ menggunakan React + FastAPI · [ctrlsnap.rypl.my.id](https://ctrlsnap.rypl.my.id)*