# AGENTS.md

Instruksi kerja untuk AI coding agent (Claude Code, Codex, Copilot, Cursor, Gemini CLI, Windsurf, dan sejenisnya) di repo KontrakAman AI. File ini yang dibaca duluan sebelum menyentuh kode apa pun.

Versi tech stack di bawah divalidasi Agustus 2026. Kalau sudah lewat beberapa bulan dari tanggal ini, cek ulang versi terbaru sebelum inisialisasi project baru, jangan asumsikan dari file ini begitu saja.

---

## 1. Ringkasan Proyek

KontrakAman AI adalah SaaS yang mengaudit kontrak kerja freelance memakai AI, menghasilkan skor risiko (Hijau/Kuning/Merah) dan draf negosiasi tandingan untuk pekerja gig Indonesia. Fitur AI bersifat substansial (pipeline OCR, klasifikasi klausul, orkestrasi LLM multi tahap), sehingga backend dipisah jadi `backend` (auth, CRUD, gateway) dan `backend-ai` (logika AI). Detail produk, fitur, dan keputusan bisnis ada di **PRD.md**, itu single source of truth, bukan file ini.

---

## 2. Perintah Penting

### frontend/
```bash
pnpm install
pnpm dev                 # dev server, http://localhost:3000
pnpm build                # build production
pnpm start                # jalankan hasil build
pnpm test                 # unit/component test (Vitest)
pnpm test:e2e              # E2E (Playwright)
pnpm lint                 # ESLint
pnpm format                # Prettier --write
```

### backend/
```bash
pnpm install
pnpm start:dev            # dev server watch mode, http://localhost:4000
pnpm build
pnpm start:prod
pnpm test                 # unit test (Jest)
pnpm test:e2e
pnpm lint
pnpm format
pnpm dlx prisma migrate dev --name <nama_migrasi>   # migrasi database
pnpm dlx prisma generate                             # generate ulang Prisma Client
pnpm dlx prisma studio                               # GUI database lokal
```

### backend-ai/
```bash
uv sync                                              # install dependency
uv run uvicorn src.main:app --reload --port 8000     # dev server
uv run pytest                                        # test
uv run ruff check .                                   # lint
uv run ruff format .                                  # format
```

### Root (orkestrasi lokal)
```bash
docker compose up -d      # jalankan Postgres dan Redis lokal
docker compose down
```

---

## 3. Struktur Folder (Feature-Based, WAJIB)

Kelompok per fitur, bukan per jenis file. Nama folder fitur dalam Bahasa Indonesia (lihat Bagian 5). Daftar fitur mengikuti epic di PRD.md Bagian 4.

```
project-root/
  docker-compose.yml          (Postgres + Redis untuk local dev)
  frontend/
    src/
      features/
        autentikasi/
          components/
          hooks/
          services/            (pemanggilan API)
          types/                (schema Zod + tipe form)
          autentikasi.test.ts
        profil/
        dokumen-kontrak/
        audit-klausul/
        negosiasi/
        dashboard/
        notifikasi/
        langganan/
        privasi/
        edukasi/
      components/              (komponen shadcn/ui dan Magic UI global, hasil `shadcn add`)
      lib/                     (util bersama, klien API, helper cn)
  backend/
    prisma/
      schema.prisma
      migrations/
    src/
      features/
        autentikasi/
          controller/          (tipis, cuma routing dan validasi input)
          service/               (logika bisnis)
          repository/            (satu-satunya lapisan yang bicara ke database)
          autentikasi.test.ts
        profil/
        dokumen-kontrak/
        audit-klausul/          (terima callback hasil dari backend-ai, simpan skor risiko)
        negosiasi/
        dashboard/
        notifikasi/
        langganan/
        privasi/
        edukasi/
      internal/                 (endpoint callback khusus dipanggil backend-ai, bukan publik)
  backend-ai/
    src/
      pipelines/
        ekstraksi-ocr/
        audit-klausul/
        draf-negosiasi/
      main.py
```

**Keputusan eksplisit:** `shared/` atau `packages/` TIDAK dipakai. Tipe dan kontrak API didefinisikan terpisah di tiap sisi (Zod schema di `frontend`, DTO class-validator di `backend`, model Pydantic di `backend-ai`), disinkronkan manual mengikuti kontrak yang didokumentasikan tiap controller/route. Alasan: TypeScript dan Python tidak bisa berbagi tipe langsung, memaksakan shared package lintas bahasa cuma menambah kompleksitas tanpa manfaat nyata di tahap ini.

---

## 4. Tumpukan Teknologi dan Inisialisasi

### frontend/
- **Bahasa/runtime:** TypeScript 5, Node.js 24 (Active LTS).
- **Framework:** Next.js 16, App Router. Dipilih karena React Server Components dan Server Actions sudah matang untuk kebutuhan form-heavy seperti audit kontrak.
- **Package manager:** pnpm 10, dipilih untuk efisiensi disk dan dukungan workspace kalau nanti perlu monorepo.
- **Init:**
```bash
pnpm create next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend
pnpm dlx shadcn@latest init -t next
pnpm add motion
pnpm add @lottiefiles/dotlottie-react
pnpm add react-hook-form zod @hookform/resolvers
```
- **UI final:** shadcn/ui sebagai fondasi (komponen di-copy jadi milik proyek lewat `pnpm dlx shadcn@latest add <komponen>`, bukan dependency biasa). Motion (`import { motion } from "motion/react"`, bukan `framer-motion`, package sudah rename) untuk animasi transisi, gestur, interaksi. Magic UI untuk komponen animasi siap pakai lewat registry shadcn (`pnpm dlx shadcn@latest add @magicui/<komponen>`). 21st.dev sebagai referensi visual manual kalau shadcn dan Magic UI belum cukup, bukan lewat instalasi CLI otomatis. `@lottiefiles/dotlottie-react` dengan format `.lottie` (taruh di `public/animations/`) khusus untuk animasi vektor kompleks seperti maskot atau ilustrasi onboarding dan empty state, BUKAN untuk animasi UI sederhana (itu tugas Motion).
- **DESIGN.md belum ada saat file ini ditulis.** Keputusan UI di atas berlaku sementara, wajib disinkronkan ulang begitu DESIGN.md selesai dibuat.
- **Validasi form:** React Hook Form + Zod lewat `@hookform/resolvers/zod`. Satu schema Zod per fitur didefinisikan di `features/<nama-fitur>/types/`, dipakai di client (`useForm({ resolver: zodResolver(schema) })`) DAN divalidasi ulang di server (`backend` controller pakai DTO class-validator terpisah dengan aturan yang sama, jangan percaya payload client). Pesan error Zod wajib Bahasa Indonesia, ditampilkan inline lewat `formState.errors` di bawah tiap field.

### backend/
- **Bahasa/runtime:** TypeScript 5, Node.js 24 (Active LTS).
- **Framework:** NestJS 11. Dipilih karena struktur module/controller/service bawaan cocok langsung dengan aturan controller tipis, service, repository di Bagian 5.
- **Package manager:** pnpm 10.
- **ORM:** Prisma 7 dengan PostgreSQL.
- **Init:**
```bash
pnpm dlx @nestjs/cli new backend --package-manager pnpm --strict
cd backend
pnpm add @prisma/client @nestjs/config class-validator class-transformer ioredis @nestjs/throttler
pnpm add -D prisma
pnpm dlx prisma init --datasource-provider postgresql
pnpm dlx prisma migrate dev --name init
```

### backend-ai/
- **Bahasa/runtime:** Python 3.12+.
- **Framework:** FastAPI, dipilih karena async native dan integrasi Pydantic untuk validasi output AI terstruktur.
- **Orkestrasi AI:** LangGraph untuk pipeline bertahap (ekstraksi OCR → klasifikasi klausul → skor risiko → generasi draf negosiasi), LangChain untuk integrasi provider LLM.
- **Package manager:** uv, jauh lebih cepat dari pip biasa dan sudah jadi standar tooling resmi LangGraph.
- **Init:**
```bash
uv init backend-ai --python 3.12
cd backend-ai
uv add "fastapi[standard]" langgraph langchain langchain-anthropic redis pydantic-settings
uv add --dev pytest pytest-asyncio ruff httpx
```
- **Provider LLM default:** Anthropic Claude (kelas Sonnet) lewat `langchain-anthropic`. Dipilih sementara karena dukungan tool use/structured output yang matang dan konteks panjang untuk dokumen kontrak multi halaman. Provider diabstraksi lewat LangChain sehingga bisa diganti lewat konfigurasi tanpa mengubah logika bisnis inti. **Keputusan final wajib dikonfirmasi pemilik produk di PRD.md Bagian 7.2 sebelum rilis produksi.** Ganti lewat environment variable `LLM_PROVIDER`, jangan hardcode.

### Pola Integrasi backend ↔ backend-ai (konvensi non-standar, WAJIB diikuti)
- `backend` push job: `LPUSH antrian:audit-kontrak <payload JSON: jobId, kontrakId, tipeJob>`.
- `backend-ai` worker loop: `BRPOP antrian:audit-kontrak 0`, proses, lalu callback `POST` ke endpoint internal `backend` (`/internal/jobs/:jobId/selesai`) memakai shared secret di header (env `INTERNAL_CALLBACK_SECRET`), bukan lewat akses langsung ke database.
- `backend-ai` TIDAK punya akses tulis ke PostgreSQL. `backend` adalah satu-satunya pemilik data (single source of truth), `backend-ai` murni service pemrosesan AI stateless.

---

## 5. Konvensi Kode dan Penamaan

- **Bahasa Indonesia WAJIB** untuk semua string tampilan ke pengguna, nama variabel, nama fungsi, dan komentar.
- **Bahasa Inggris tetap** untuk: nama file, nama folder teknis (`components`, `hooks`, `services`, `controller`, `repository`, dst), nama library/dependency, DAN identifier infrastruktur (nama tabel database, kolom database, environment variable, Redis key, path route API) karena berinteraksi langsung dengan tooling yang berbahasa Inggris.
- **Penamaan file dan folder:** kebab-case konsisten di seluruh proyek (frontend, backend, backend-ai). Nama komponen React tetap PascalCase sesuai keharusan sintaks JSX meskipun nama filenya kebab-case (contoh: file `kartu-hasil-audit.tsx` mengekspor komponen `KartuHasilAudit`). Identifier di dalam kode ikut konvensi baku tiap bahasa: camelCase untuk variabel/fungsi TypeScript, snake_case untuk variabel/fungsi Python.
- Controller tipis (cuma routing dan validasi input), service isi logika bisnis, repository satu-satunya lapisan yang bicara ke database. Jangan ada logika bisnis nyasar ke controller.
- Terapkan DRY dan SOLID. Sebelum menambah file atau fungsi baru, cek dulu apakah sudah ada yang serupa. Kalau ada, gabungkan atau reuse, jangan bikin duplikat.

---

## 6. Testing

| Layer | Framework | Cakupan minimum | Catatan |
|---|---|---|---|
| frontend | Vitest + React Testing Library, Playwright untuk E2E | 70% untuk hooks/services/utils | Komponen UI murni tidak wajib dikejar cakupannya |
| backend | Jest (bawaan NestJS), Supertest untuk integration test controller | 80% untuk service dan repository | Mock Prisma Client di unit test |
| backend-ai | pytest + pytest-asyncio, httpx untuk test endpoint FastAPI | 80% untuk pipelines | Mock provider LLM di unit test, jangan panggil API sungguhan saat test |

Test wajib ditulis untuk setiap logika bisnis baru (service, repository, pipeline AI) SEBELUM PR di-merge. Test merah memblokir merge (lihat Bagian 10).

---

## 7. Keamanan dan Data

- **Autentikasi:** JWT access token (short-lived, sekitar 15 menit) + refresh token disimpan sebagai httpOnly cookie.
- **Otorisasi:** guard NestJS per endpoint. Kepemilikan data (`userId` di request harus cocok pemilik data) dicek di layer repository, bukan cuma di controller.
- **Secret:** seluruh kredensial (database URL, API key LLM, JWT secret, `INTERNAL_CALLBACK_SECRET`) wajib lewat environment variable. `.env` dan `.env.*` masuk `.gitignore` sejak commit pertama, jangan pernah di-commit.
- **Enkripsi:** dokumen kontrak dan kolom data pribadi dienkripsi at rest. TLS wajib di semua environment kecuali local development.
- **Rate limiting:** `@nestjs/throttler` di endpoint upload dan endpoint autentikasi, batas angka disepakati tim sebelum rilis.

---

## 8. Batasan Tegas

- Jangan ubah `backend/prisma/schema.prisma` tanpa mencatat perubahan skema di PRD.md Bagian 7 dan izin eksplisit.
- Jangan ganti provider AI/LLM di `backend-ai` tanpa persetujuan eksplisit (lihat PRD.md Bagian 7.2 dan Bagian 11).
- Jangan tambah dependency baru di `package.json` manapun atau `pyproject.toml` tanpa mendiskusikannya lewat PRD.md dulu.
- Jangan ubah struktur folder feature-based di Bagian 3 jadi struktur per jenis file.
- Jangan hapus atau sembunyikan disclaimer hukum di frontend (lihat PRD.md F-EDU-01), itu keputusan produk yang dikunci.

### Dependency yang Disetujui (frontend)

Daftar dependency yang sudah disetujui untuk ditambahkan ke `frontend/package.json` di luar inisialisasi awal:

| Package | Versi | Fitur | Alasan |
|---|---|---|---|
| `@react-pdf/renderer` | `^4` | F-NEGO-03 Ekspor Draf | Render komponen React menjadi PDF di browser (client-side, tanpa server). Dipilih atas `jsPDF` karena pendekatan deklaratif berbasis komponen konsisten dengan pola React yang sudah dipakai, dan mendukung font Unicode untuk teks hukum Indonesia. |
| `docx` | `^9` | F-NEGO-03 Ekspor Draf | Generate file `.docx` (Word) di browser via Blob. Satu-satunya library mature untuk client-side Word generation tanpa server. |

---

## 9. Protokol Perubahan (WAJIB dipatuhi untuk setiap task ke depan)

Sebelum mengubah kode yang sudah ada:
1. Analisis dampak perubahan ke sistem yang sudah berjalan, cek semua bagian yang mungkin terpengaruh.
2. Implementasikan bertahap, jangan sekaligus besar, supaya kalau ada yang salah gampang dilacak.
3. Pastikan tidak merusak fungsionalitas lain, jalankan test yang relevan.
4. Di akhir perubahan, sebutkan eksplisit file mana saja yang terpengaruh dan alasan tiap perubahan.
5. Sebelum menambah file atau kode baru, cek dulu apakah ada file atau kode duplikat yang sudah melakukan hal serupa. Kalau ada, bersihkan atau gabungkan, jangan menumpuk.

---

## 10. Git Workflow

- **Branching:** trunk-based dengan feature branch pendek, format `fitur/<nama-fitur>` atau `perbaikan/<nama-bug>`. Cocok untuk tim kecil di tahap awal ini.
- **Commit message:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`), subjek singkat Bahasa Inggris (standar tooling changelog), badan commit boleh Bahasa Indonesia kalau butuh detail tambahan.
- **Syarat merge PR:** seluruh test hijau, lint bersih tanpa warning, minimal satu review disetujui.

---

## 11. Kategori Aturan Keselamatan

- **SELALU boleh tanpa tanya:** baca file, jalankan test, jalankan lint, jalankan format check, jalankan build lokal.
- **TANYA DULU:** hapus file, ubah skema database (`schema.prisma`, migration), tambah dependency baru, force push, ubah environment variable di deployment, ganti provider AI/LLM.
- **TIDAK BOLEH SAMA SEKALI:** commit credential atau secret, push langsung ke branch `main`/`production`, hapus migration yang sudah jalan di production, hardcode API key di kode.

---

## Catatan

Kalau proyek berkembang jadi monorepo besar dengan banyak modul, boleh tambah AGENTS.md bersarang di tiap folder fitur untuk aturan lebih spesifik. File root ini tetap yang utama. PRD.md tetap dokumen yang harus diperbarui duluan untuk setiap keputusan baru, sebelum kode ditulis.
