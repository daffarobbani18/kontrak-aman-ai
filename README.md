<div align="center">

<img src="https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
<img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
<img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
<img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
<img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
<img src="https://img.shields.io/badge/TypeScript-7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />

# 🛡️ KontrakAman AI

**Audit kontrak untuk freelancer Indonesia — dalam bahasa manusia, bukan bahasa pengacara.**

Unggah kontrak → AI membaca setiap klausul → kamu tahu mana yang berisiko, kenapa berisiko, dan apa yang harus dinegosiasikan.

</div>

---

## 📖 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Struktur Repositori](#-struktur-repositori)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Alur Kerja Audit](#-alur-kerja-audit)
- [Kontrak API](#-kontrak-api)
- [Pengujian](#-pengujian)
- [Standar Kode](#-standar-kode)
- [Keamanan](#-keamanan)
- [Troubleshooting](#-troubleshooting)
- [Dokumentasi](#-dokumentasi)

---

## 🎯 Tentang Proyek

Freelancer Indonesia sering menandatangani kontrak kerja sama yang klausulnya berat sepihak — denda tanpa batas, hak cipta diserahkan penuh, pembayaran yang bisa ditunda tanpa konsekuensi. Membaca dan memahami kontrak seperti itu butuh jasa pengacara yang mahal, dan hasilnya sering tidak sebanding dengan nilai proyeknya.

**KontrakAman AI** hadir untuk menutup celah itu:

- 📄 **Unggah kontrak** dalam format PDF atau gambar (hasil scan/foto).
- 🔍 **Setiap klausul dianalisis** secara individual — bukan sekadar ringkasan global.
- 🚦 **Skor risiko per klausul**: hijau (aman), kuning (perlu perhatian), merah (berisiko tinggi).
- ✍️ **Draf negosiasi otomatis** untuk klausul berisiko yang bisa langsung kamu ajukan ke klien.
- 📚 **Edukasi** klausul agar kamu paham masalahnya, bukan hanya tahu hasilnya.

Proyek ini adalah monorepo yang terdiri dari tiga layanan: aplikasi web, API backend, dan worker AI yang terpisah.

---

## ✨ Fitur Utama

### 🔐 Autentikasi & Akun
Email/kata sandi dan Google OAuth. Sesi memakai access token jangka pendek di memori (kebal XSS) dengan refresh token httpOnly cookie, sehingga token tidak pernah tersentuh JavaScript halaman. Tersedia lupa/reset kata sandi, verifikasi email, dan onboarding singkat untuk menentukan profesi.

### 📁 Dokumen Kontrak
Unggah PDF/JPG/PNG/WEBP hingga 10 MB, dengan nama dan kategori opsional (desain, penulisan, pemrograman, lainnya). Ada pratinjau dokumen, riwayat versi, hapus dokumen, serta **unggah revisi** sehingga kamu bisa membandingkan hasil audit kontrak sebelum dan sesudah dinegosiasikan.

### 🔍 Audit Klausul
Mesin inti aplikasi. Dokumen dikirim ke antrian, worker AI mengekstrak teks, menganalisis klausul per klausul, dan mengembalikan hasilnya lewat callback. Status progres dipantau secara real-time dari halaman audit, dan hasil akhir menampilkan statistik klausul beserta penjelasan serta rekomendasi tiap klausul.

### ✍️ Negosiasi
Untuk tiap klausul berisiko, AI menyusun draf pesan negosiasi yang sopan, profesional, dan siap kirim ke klien. Draf dapat disesuaikan lalu diunduh dalam format DOCX atau PDF.

### 🔔 Notifikasi
Notifikasi in-app saat audit selesai dan pengingat menindaklanjuti klausul berisiko tinggi. Terdapat pengaturan preferensi per jenis notifikasi.

### 💳 Langganan
Tier dari Gratis hingga Bisnis, dengan kuota bulanan. Pembayaran diproses melalui Mayar (QRIS, transfer bank, e-wallet) dan status diaktifkan lewat webhook.

### 🔒 Privasi
Hak subjek data sesuai UU Pelindungan Data Pribadi: ekspor seluruh data pribadi, hapus akun dengan masa tenggat 30 hari, dan kebijakan retensi dokumen 90 hari.

---

## 🏗️ Arsitektur Sistem

```
┌──────────────────────────────┐
│         Pengguna             │
└──────────────┬───────────────┘
               │  HTTPS
               ▼
┌──────────────────────────────┐
│  Frontend — Next.js 16       │  :3000
│  App Router + React Compiler │
│  Tailwind CSS 4 · Zod        │
└──────────────┬───────────────┘
               │  REST /v1  (cookie httpOnly)
               ▼
┌──────────────────────────────┐        ┌────────────────────┐
│  Backend — NestJS 11         │◄──────►│  PostgreSQL        │
│  REST API · Guard RBAC       │ Prisma │  (via Prisma 7)    │
│  :4000                       │        └────────────────────┘
└──────┬────────────┬──────────┘        ┌────────────────────┐
       │            │◄──────────────────│  Object Storage    │
       │  enqueue   │   internal API    │  S3-compatible     │
       ▼            │                   └────────────────────┘
┌──────────────────────────────┐
│  Redis + BullMQ              │
│  antrian:audit-kontrak       │
│  antrian:draf-negosiasi      │
└──────────────┬───────────────┘
               │  consume
               ▼
┌──────────────────────────────┐        ┌────────────────────┐
│  Backend AI — NestJS Worker  │───────►│  Gemini 2.5 Flash  │
│  Tanpa HTTP listener         │        │  Groq (fallback)   │
└──────────────┬───────────────┘        └────────────────────┘
               │  callback hasil (x-internal-api-key)
               └──────────────► Backend
```

**Prinsip pemisahan layanan:** backend-ai dijalankan sebagai *worker* (NestJS application context tanpa HTTP listener). Ia tidak pernah melayani permintaan pengguna; ia hanya mengambil pekerjaan dari antrian Redis, memanggil LLM, lalu mengirim callback ke backend. Dengan begitu, proses berat seperti OCR dan analisis LLM tidak pernah memblokir API yang melayani pengguna.

---

## 📂 Struktur Repositori

```
kontrak-aman-ai/
├── frontend/                 # Aplikasi web Next.js
│   └── src/
│       ├── app/              # Route App Router
│       ├── features/         # Fitur mandiri (feature-based)
│       │   ├── audit-klausul/
│       │   ├── autentikasi/
│       │   ├── dashboard/
│       │   ├── dokumen-kontrak/
│       │   ├── edukasi/
│       │   ├── langganan/
│       │   ├── negosiasi/
│       │   ├── notifikasi/
│       │   ├── privasi/
│       │   └── profil/
│       ├── lib/              # API client, util lintas fitur
│       └── test/             # Helper pengujian
│
├── backend/                  # API backend NestJS
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── core/             # Konfigurasi, guard, filter, interceptor
│       ├── features/
│       │   ├── admin/
│       │   ├── audit/
│       │   ├── auth/
│       │   ├── dokumen-kontrak/
│       │   ├── langganan/
│       │   ├── negosiasi/
│       │   ├── notifikasi/
│       │   ├── pengguna/
│       │   └── webhook/
│       └── main.ts
│
├── backend-ai/               # Worker AI (NestJS + BullMQ)
│   └── src/
│       ├── config/
│       ├── workers/
│       │   ├── audit.worker.ts
│       │   └── negosiasi.worker.ts
│       ├── features/
│       └── app.module.ts
│
├── docs/
│   └── api.md                # Sumber kebenaran kontrak API
├── api.md                    # Spesifikasi API lengkap
├── PRD.md                    # Kebutuhan produk
├── DESIGN.md                 # Panduan desain antarmuka
└── AGENTS.md                 # Standar pengembangan proyek
```

Setiap fitur bersifat **mandiri** — punya `components/`, `hooks/`, `services/`, `types/`, dan `index.ts` sebagai API publiknya. Impor antar-fitur hanya boleh melewati `index.ts`, sehingga sebuah fitur bisa diubah atau dihapus tanpa merusak fitur lain.

---

## 🛠️ Tech Stack

| Lapisan | Teknologi | Versi |
|---|---|---|
| Frontend | Next.js (App Router) | 16.3 |
| | React + React Compiler | 19.2 |
| | Tailwind CSS | 4 |
| | Zod (validasi) | 4 |
| | Vitest + Testing Library | 4 |
| Backend | NestJS | 11 |
| | Prisma ORM | 7 |
| | PostgreSQL | — |
| | Jest | — |
| Backend AI | NestJS (worker) | 11 |
| | BullMQ + Redis | 5 |
| | Gemini 2.5 Flash (utama) | — |
| | Groq llama-3.3-70b (cadangan) | — |
| | pdf-parse + Tesseract.js (OCR) | — |
| Integrasi | Mayar (pembayaran) | — |
| | S3-compatible (dokumen) | — |
| | SMTP (email) | — |

Paket manager: **pnpm 10** (`frontend`) dan npm (`backend`, `backend-ai`).

---

## ✅ Prasyarat

Pastikan sudah terpasang:

- **Node.js** 20 atau lebih baru
- **pnpm** 10 (`corepack enable && corepack prepare pnpm@10.34.5 --activate`)
- **PostgreSQL** 14 atau lebih baru
- **Redis** 6 atau lebih baru (untuk antrian BullMQ)
- Kunci API: **Google Gemini** dan opsional **Groq**

---

## 🚀 Instalasi

### 1. Klon repositori

```bash
git clone <url-repositori> kontrak-aman-ai
cd kontrak-aman-ai
```

### 2. Pasang dependensi tiap layanan

```bash
cd frontend   && pnpm install && cd ..
cd backend    && npm install  && cd ..
cd backend-ai && npm install  && cd ..
```

### 3. Siapkan basis data

```bash
cd backend
cp .env.example .env      # lalu isi DATABASE_URL
npx prisma generate
npx prisma migrate dev
```

> Jika perintah `prisma generate` mengeluh soal `DATABASE_URL`, jalankan dengan nilai sementara:
> `DATABASE_URL="postgresql://postgres:password@localhost:5432/kontrakaman" npx prisma generate`

### 4. Siapkan environment

```bash
cd backend    && cp .env.example .env
cd ../backend-ai && cp .env.example .env
cd ../frontend   && cp .env.example .env
```

Isi nilai sebenarnya pada masing-masing `.env` — rinciannya di bagian berikut.

---

## ⚙️ Konfigurasi Environment

### frontend/.env

| Variabel | Wajib | Contoh | Keterangan |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:4000/v1` | Base URL API termasuk prefix `/v1` |

### backend/.env

| Variabel | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ✅ | Koneksi PostgreSQL |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | ✅ | Secret acak minimal 64 karakter |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | ✅ | Default `15m` dan `7d` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ✅ | Kredensial OAuth Google |
| `MAYAR_API_KEY` / `MAYAR_WEBHOOK_SECRET` | ✅ | Integrasi pembayaran |
| `MAYAR_PRODUCT_ID_*` | ✅ | ID produk per paket dan periode |
| `STORAGE_ENDPOINT` / `STORAGE_BUCKET` / `STORAGE_ACCESS_KEY_ID` / `STORAGE_SECRET_ACCESS_KEY` | ✅ | Object storage dokumen |
| `SMTP_*` | ✅ | Pengiriman email transaksional |
| `BACKEND_AI_URL` / `BACKEND_AI_API_KEY` | ✅ | Alamat worker AI dan kunci internal |
| `FREE_TIER_AUDIT_QUOTA` / `FREE_TIER_NEGOTIATION_QUOTA` | — | Kuota tier gratis |
| `DOCUMENT_RETENTION_DAYS` | — | Retensi dokumen, default 90 hari |
| `PORT` / `APP_URL` / `FRONTEND_URL` / `CORS_ORIGINS` | ✅ | Port default **4000** agar tidak bentrok dengan Next.js |

### backend-ai/.env

| Variabel | Wajib | Keterangan |
|---|---|---|
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` / `REDIS_TLS` | ✅ | Koneksi Redis untuk antrian |
| `SUPABASE_S3_*` | ✅ | Akses dokumen dari object storage |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | ✅ | LLM utama |
| `GROQ_API_KEY` / `GROQ_BASE_URL` / `GROQ_MODEL` | — | LLM cadangan bila Gemini gagal |
| `BACKEND_API_URL` | ✅ | Alamat backend tujuan callback (`http://localhost:4000`) |
| `INTERNAL_API_KEY` | ✅ | Harus sama dengan `BACKEND_AI_API_KEY` di backend |

> ⚠️ **Jangan pernah commit file `.env`.** Pastikan `.gitignore` menutupinya. Semua kredensial hanya boleh hidup di environment variable.

---

## ▶️ Menjalankan Aplikasi

Tiga layanan dijalankan di terminal terpisah dengan urutan berikut:

**1 — Redis & PostgreSQL**

```bash
# Pastikan keduanya berjalan sebelum memulai backend
redis-server
```

**2 — Backend API**

```bash
cd backend
npm run start:dev        # http://localhost:4000
```

**3 — Worker AI**

```bash
cd backend-ai
npm run start:dev        # worker tanpa port HTTP
```

Worker akan menampilkan pesan `Backend AI worker berjalan — menunggu pekerjaan dari antrian...` bila koneksi Redis berhasil.

**4 — Frontend**

```bash
cd frontend
pnpm dev                 # http://localhost:3000
```

Buka `http://localhost:3000`, daftar akun baru, lalu unggah kontrak pertamamu.

---

## 🔄 Alur Kerja Audit

Memahami alur ini akan sangat membantu saat melakukan debugging:

```
1. Pengguna mengunggah kontrak
   └─ Frontend  POST /v1/dokumen-kontrak/upload  (multipart)
      Backend   validasi format & ukuran → simpan ke object storage → catat di DB
      Respons   { id, nama, status: "menunggu", ... }

2. Pengguna memulai audit
   └─ Frontend  POST /v1/audit  { dokumen_kontrak_id }
      Backend   kuota diperiksa → job dikirim ke antrian Redis:
                antrian:audit-kontrak
      Respons   { id, status: "memproses", estimasi_selesai_detik }

3. Worker AI mengambil pekerjaan
   └─ Ambil dokumen dari storage
      Ekstraksi teks (pdf-parse, atau Tesseract OCR untuk gambar)
      Analisis klausul per klausul via Gemini (fallback ke Groq bila gagal)
      Susun skor risiko, penjelasan, rekomendasi, dan draf negosiasi

4. Worker mengirim hasil ke backend
   └─ POST /v1/audit/internal/selesai   (header x-internal-api-key)
      Backend simpan hasil audit + buat notifikasi untuk pengguna

5. Frontend menampilkan hasil
   └─ Frontend memantau GET /v1/audit/:id secara berkala
      status "memproses" → tampilkan progres
      status "selesai"   → tampilkan skor risiko, klausul, dan statistik
```

Alur negosiasi mengikuti pola yang sama melalui antrian `antrian:draf-negosiasi`, dengan callback ke `/v1/negosiasi/internal/selesai`.

---

## 📡 Kontrak API

Semua endpoint berada di bawah prefix `/v1` dan mengembalikan amplop respons yang seragam:

```json
{
  "berhasil": true,
  "pesan": "Pesan yang bisa ditampilkan ke pengguna.",
  "data": { },
  "paginasi": {
    "cursor_berikutnya": null,
    "ada_lagi": false,
    "total": 0
  }
}
```

Saat gagal, `berhasil` bernilai `false` dan `kesalahan` memuat kode beserta detailnya:

```json
{
  "berhasil": false,
  "pesan": "Ukuran file melebihi batas 10 MB.",
  "kesalahan": {
    "kode": "UKURAN_FILE_MELEBIHI_BATAS",
    "detail": { "ukuran_bytes": 12582912 }
  }
}
```

**Kode error yang ditangani frontend:** `PERMINTAAN_TIDAK_VALID`, `VALIDASI_GAGAL`, `TOKEN_TIDAK_VALID`, `TOKEN_TIDAK_ADA`, `AKSES_DITOLAK`, `KUOTA_HABIS`, `LANGGANAN_DIPERLUKAN`, `TIDAK_DITEMUKAN`, `EMAIL_SUDAH_TERDAFTAR`, `FORMAT_FILE_TIDAK_DIDUKUNG`, `UKURAN_FILE_MELEBIHI_BATAS`, `FILE_TIDAK_DAPAT_DIBACA`, `TERLALU_BANYAK_PERMINTAAN`, `KESALAHAN_INTERNAL`, `LAYANAN_TIDAK_TERSEDIA`.

**Kelompok endpoint utama:**

| Kelompok | Endpoint | Keterangan |
|---|---|---|
| Autentikasi | `/auth/masuk`, `/auth/daftar`, `/auth/refresh`, `/auth/keluar` | Sesi dan token |
| | `/auth/google`, `/auth/lupa-kata-sandi`, `/auth/reset-kata-sandi` | OAuth dan pemulihan akun |
| Pengguna | `/pengguna/saya` | Profil, onboarding, hapus akun |
| | `/pengguna/saya/ubah-kata-sandi`, `/pengguna/saya/preferensi-notifikasi` | Keamanan dan notifikasi |
| | `/pengguna/saya/ekspor-data`, `/pengguna/saya/ekspor-data/status` | Hak subjek data |
| Dokumen | `/dokumen-kontrak/upload`, `/dokumen-kontrak`, `/dokumen-kontrak/:id` | Unggah, daftar, detail, hapus |
| | `/dokumen-kontrak/:id/revisi` | Riwayat versi dokumen |
| Audit | `/audit`, `/audit/:id` | Mulai audit dan ambil hasil |
| Negosiasi | `/negosiasi`, `/negosiasi/:id` | Buat dan ambil draf negosiasi |
| Notifikasi | `/notifikasi`, `/notifikasi/baca-semua`, `/notifikasi/:id/baca` | Daftar dan status baca |
| Langganan | `/langganan/paket`, `/langganan/aktif`, `/langganan/transaksi` | Informasi paket |
| | `/langganan/buat-sesi-pembayaran`, `/langganan/batalkan` | Transaksi |
| Webhook | `/webhook/mayar` | Callback pembayaran |
| Internal | `/audit/internal/selesai`, `/negosiasi/internal/selesai` | Callback worker AI (kunci internal) |

Rincian lengkap tiap endpoint — parameter, skema body, dan contoh respons — ada di [`docs/api.md`](./docs/api.md), yang menjadi **sumber kebenaran kontrak API** untuk seluruh layanan.

---

## 🧪 Pengujian

```bash
# Frontend — Vitest
cd frontend
pnpm test              # jalankan sekali
pnpm test:watch        # mode watch
pnpm test:coverage     # dengan laporan cakupan
pnpm test:e2e          # Playwright

# Backend — Jest
cd backend
npm test
npm run test:cov

# Pemeriksaan tipe
cd frontend   && pnpm exec tsc --noEmit
cd ../backend && npm run typecheck
cd ../backend-ai && npm run typecheck

# Lint
cd frontend && pnpm lint
cd ../backend && npm run lint
```

Strategi pengujian menekankan cakupan pada **hooks, services, dan utility** (target 70%), karena di sanalah logika bisnis berada. Pengujian service dilakukan dengan mem-mock `apiClient` di batas modul, sehingga tes berjalan cepat, deterministik, dan tidak butuh backend hidup.

---

## 📐 Standar Kode

**Struktur berbasis fitur, bukan lapisan.** Direktori `controllers/`, `models/`, atau `services/` di akar proyek tidak dipakai. Setiap fitur berdiri sendiri dan hanya mengekspos API publiknya melalui `index.ts`.

**Bahasa Indonesia di dalam kode.** Nama variabel, fungsi, komentar, dan string yang tampil ke pengguna menggunakan Bahasa Indonesia (`perbaruhiProfil`, `skemaUnggahDokumen`, `KesalahanAPI`). Nama pustaka dan field basis data mengikuti konvensi aslinya dengan `snake_case`.

**Konvensi penamaan:**

```
Komponen.tsx        → PascalCase          (komponen React)
gunakanHook.ts      → camelCase           (custom hook, prefix "gunakan")
layananApi.ts       → camelCase           (service)
auth.types.ts       → kebab-case          (berkas tipe)
const URL_API       → SCREAMING_SNAKE_CASE (konstanta)
interface TipeData  → PascalCase          (tipe/interface)
```

**Format commit:**

```
tambah:    fitur baru
perbaiki:  perbaikan bug
perbarui:  pembaruan tanpa perubahan perilaku
hapus:     penghapusan fitur atau kode
refaktor:  perubahan struktur tanpa mengubah perilaku
gaya:      format dan tampilan
uji:       penambahan atau perbaikan tes
docs:      dokumentasi
ci:        perubahan CI/CD
```

**Yang dihindari:** tipe `any` tanpa alasan kuat, logika bisnis di dalam komponen UI, pemanggilan API langsung dari komponen (harus lewat hook atau service), magic number tanpa konstanta, `async/await` tanpa penanganan error, dan fungsi raksasa lebih dari 200 baris.

---

## 🔒 Keamanan

| Area | Penerapan |
|---|---|
| Sesi | Access token 15 menit di memori; refresh token 7 hari di cookie `httpOnly` dengan `path=/v1/auth` |
| Kata sandi | Hash bcrypt dengan cost 12 |
| Validasi masukan | Zod di frontend, class-validator di backend — diperiksa di kedua sisi |
| Otorisasi | Guard JWT dengan RBAC; setiap resource diperiksa kepemilikannya |
| Unggahan | Pembatasan tipe MIME dan ukuran 10 MB, dokumen privat di object storage |
| Transport | Helmet, CORS terbatas pada `CORS_ORIGINS`, rate limiting |
| Layanan internal | Callback worker AI dilindungi header `x-internal-api-key` |
| Rahasia | Seluruh kredensial di environment variable — tidak ada yang di-hardcode |
| Logging | Terstruktur dan tidak pernah memuat data sensitif |

---

## 🩺 Troubleshooting

**`prisma generate` gagal karena `DATABASE_URL` tidak ditemukan**
Jalankan dengan nilai sementara:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/kontrakaman" npx prisma generate
```

**Worker AI tidak memproses apa pun**
Pastikan Redis hidup (`redis-cli ping` → `PONG`) dan `REDIS_*` benar. Worker akan tetap menunggu tanpa melempar error bila antrian kosong — itu perilaku normal.

**Callback dari worker ditolak backend**
`INTERNAL_API_KEY` di `backend-ai/.env` harus sama persis dengan `BACKEND_AI_API_KEY` di `backend/.env`. Periksa juga `BACKEND_API_URL` mengarah ke port 4000, bukan 3000.

**Permintaan frontend diblokir CORS**
Tambahkan origin frontend ke `CORS_ORIGINS` di `backend/.env` (dipisah koma bila lebih dari satu).

**Hasil audit tidak kunjung selesai**
Periksa log worker. Paling sering penyebabnya kunci LLM tidak valid atau kuota Gemini habis — worker akan mencoba Groq sebagai cadangan bila dikonfigurasi.

**`npx tsc` tidak dikenali di folder frontend**
Gunakan `pnpm exec tsc --noEmit`, karena `npx` dapat mengambil paket placeholder yang salah.

**Unggahan ditolak padahal formatnya benar**
Batas ukuran 10 MB dihitung dalam byte (`MAX_FILE_SIZE_BYTES=10485760`), dan tipe MIME yang diperiksa adalah tipe asli berkas, bukan ekstensinya.

---

## 📚 Dokumentasi

| Dokumen | Isi |
|---|---|
| [`PRD.md`](./PRD.md) | Kebutuhan produk, persona pengguna, dan prioritas fitur |
| [`api.md`](./api.md) | Spesifikasi API lengkap |
| [`docs/api.md`](./docs/api.md) | Kontrak API antar layanan (sumber kebenaran) |
| [`DESIGN.md`](./DESIGN.md) | Panduan desain dan sistem visual |
| [`AGENTS.md`](./AGENTS.md) | Standar pengembangan dan struktur proyek |

---

<div align="center">

**KontrakAman AI** — supaya freelancer Indonesia tidak lagi tanda tangan sambil menahan napas.

Dibangun dengan ❤️ untuk pekerja kreatif Indonesia.

</div>
