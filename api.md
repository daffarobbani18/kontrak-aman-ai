# API Documentation — KontrakAman AI

**Versi API:** v1  
**Base URL:** `https://api.kontrakaman.id/v1`  
**Format:** JSON (`Content-Type: application/json`)  
**Autentikasi:** Bearer Token (JWT Access Token) via header `Authorization: Bearer <token>`  
**Tanggal:** 23 Agustus 2026  
**Status:** Living Document — sinkron dengan `PRD.md`

---

## Daftar Isi

1. [Konvensi Umum](#1-konvensi-umum)
2. [Format Respons](#2-format-respons)
3. [Kode Error](#3-kode-error)
4. [Autentikasi — `/auth`](#4-autentikasi--auth)
5. [Pengguna — `/pengguna`](#5-pengguna--pengguna)
6. [Dokumen Kontrak — `/dokumen-kontrak`](#6-dokumen-kontrak--dokumen-kontrak)
7. [Audit — `/audit`](#7-audit--audit)
8. [Negosiasi — `/negosiasi`](#8-negosiasi--negosiasi)
9. [Langganan — `/langganan`](#9-langganan--langganan)
10. [Webhook Mayar — `/webhook`](#10-webhook-mayar--webhook)
11. [Notifikasi — `/notifikasi`](#11-notifikasi--notifikasi)
12. [Admin — `/admin`](#12-admin--admin)
13. [Rate Limiting](#13-rate-limiting)
14. [Versioning](#14-versioning)

---

## 1. Konvensi Umum

### Autentikasi

Semua endpoint yang memerlukan autentikasi menggunakan JWT Bearer Token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Access token berlaku selama **15 menit**. Gunakan endpoint `POST /auth/perbarui-token` dengan refresh token untuk memperbarui.

### Paginasi

Endpoint yang mengembalikan daftar mendukung paginasi berbasis cursor:

| Parameter | Tipe     | Default | Deskripsi                            |
|-----------|----------|---------|--------------------------------------|
| `limit`   | `number` | `20`    | Jumlah item per halaman (maks: `100`) |
| `cursor`  | `string` | —       | Cursor dari respons sebelumnya        |

### Timestamp

Semua timestamp menggunakan format **ISO 8601 UTC**: `2026-08-23T09:02:30Z`

### Bahasa

Semua pesan error dan notifikasi dikembalikan dalam **Bahasa Indonesia**.

---

## 2. Format Respons

### Respons Sukses

```json
{
  "berhasil": true,
  "pesan": "Operasi berhasil.",
  "data": { ... },
  "paginasi": {
    "cursor_berikutnya": "eyJpZCI6IjEyMyJ9",
    "ada_lagi": true,
    "total": 50
  }
}
```

> `paginasi` hanya ada pada endpoint yang mengembalikan daftar.

### Respons Error

```json
{
  "berhasil": false,
  "pesan": "Penjelasan error yang ramah pengguna.",
  "kesalahan": {
    "kode": "KODE_ERROR",
    "detail": { ... }
  }
}
```

---

## 3. Kode Error

| Kode HTTP | Kode Error                  | Deskripsi                                              |
|-----------|-----------------------------|--------------------------------------------------------|
| `400`     | `PERMINTAAN_TIDAK_VALID`     | Body/parameter request tidak valid atau tidak lengkap  |
| `400`     | `VALIDASI_GAGAL`             | Validasi field gagal (lihat `kesalahan.detail`)        |
| `401`     | `TOKEN_TIDAK_VALID`          | Token JWT tidak valid atau sudah kedaluwarsa           |
| `401`     | `TOKEN_TIDAK_ADA`            | Header Authorization tidak ditemukan                  |
| `403`     | `AKSES_DITOLAK`              | Pengguna tidak punya izin untuk resource ini           |
| `403`     | `KUOTA_HABIS`                | Kuota tier gratis untuk bulan ini sudah habis          |
| `403`     | `LANGGANAN_DIPERLUKAN`       | Fitur hanya tersedia untuk tier berbayar               |
| `404`     | `TIDAK_DITEMUKAN`            | Resource yang diminta tidak ditemukan                  |
| `409`     | `EMAIL_SUDAH_TERDAFTAR`      | Email sudah digunakan akun lain                        |
| `422`     | `FORMAT_FILE_TIDAK_DIDUKUNG` | Tipe file tidak didukung (hanya PDF, JPG, PNG, WEBP)   |
| `422`     | `UKURAN_FILE_MELEBIHI_BATAS` | Ukuran file melebihi batas maksimum                    |
| `422`     | `FILE_TIDAK_DAPAT_DIBACA`    | File tidak dapat di-parse (corrupt / kualitas rendah)  |
| `429`     | `TERLALU_BANYAK_PERMINTAAN`  | Rate limit terlampaui                                  |
| `500`     | `KESALAHAN_INTERNAL`         | Kesalahan server internal                              |
| `503`     | `LAYANAN_TIDAK_TERSEDIA`     | Backend AI sedang tidak tersedia                       |

---

## 4. Autentikasi — `/auth`

### 4.1 Daftar Akun

**`POST /auth/daftar`**

Mendaftarkan akun baru dengan email dan password. Mengirim email verifikasi.

**Akses:** Publik

**Request Body:**

```json
{
  "nama_lengkap": "Budi Santoso",
  "email": "budi@example.com",
  "kata_sandi": "P@ssw0rd!Aman",
  "konfirmasi_kata_sandi": "P@ssw0rd!Aman"
}
```

| Field                   | Tipe     | Wajib | Validasi                                              |
|-------------------------|----------|-------|-------------------------------------------------------|
| `nama_lengkap`          | `string` | Ya    | Min 2 karakter, maks 100 karakter                     |
| `email`                 | `string` | Ya    | Format email valid, unik di sistem                    |
| `kata_sandi`            | `string` | Ya    | Min 8 karakter, min 1 huruf besar, 1 angka, 1 simbol  |
| `konfirmasi_kata_sandi` | `string` | Ya    | Harus sama dengan `kata_sandi`                        |

**Respons `201 Created`:**

```json
{
  "berhasil": true,
  "pesan": "Akun berhasil dibuat. Silakan cek email untuk verifikasi.",
  "data": {
    "id": "usr_01j5z1k2m3n4p5q6r7s8t9u0",
    "nama_lengkap": "Budi Santoso",
    "email": "budi@example.com",
    "email_terverifikasi": false,
    "dibuat_pada": "2026-08-23T09:02:30Z"
  }
}
```

**Respons Error:**

- `409 EMAIL_SUDAH_TERDAFTAR` — Email sudah terdaftar di sistem.

---

### 4.2 Verifikasi Email

**`GET /auth/verifikasi-email?token={token}`**

Memverifikasi email pengguna menggunakan token yang dikirim via email.

**Akses:** Publik

| Parameter | Tipe     | Wajib | Deskripsi                  |
|-----------|----------|-------|----------------------------|
| `token`   | `string` | Ya    | Token verifikasi dari email |

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Email berhasil diverifikasi. Silakan masuk.",
  "data": null
}
```

---

### 4.3 Masuk

**`POST /auth/masuk`**

Login dengan email dan password. Mengembalikan access token dan refresh token.

**Akses:** Publik

**Request Body:**

```json
{
  "email": "budi@example.com",
  "kata_sandi": "P@ssw0rd!Aman"
}
```

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Berhasil masuk.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "tipe_token": "Bearer",
    "kedaluwarsa_dalam": 900,
    "pengguna": {
      "id": "usr_01j5z1k2m3n4p5q6r7s8t9u0",
      "nama_lengkap": "Budi Santoso",
      "email": "budi@example.com",
      "tier": "gratis",
      "avatar_url": null
    }
  }
}
```

**Respons Error:**

- `401 TOKEN_TIDAK_VALID` — Email atau kata sandi salah.
- `403 AKSES_DITOLAK` — Email belum diverifikasi.

---

### 4.4 Masuk dengan Google OAuth

**`GET /auth/google`**

Redirect ke halaman OAuth Google. Setelah autentikasi, Google redirect ke callback.

**Akses:** Publik

**Respons:** `302 Redirect` ke Google OAuth consent screen.

---

**`GET /auth/google/callback`**

Callback dari Google setelah autentikasi berhasil.

**Akses:** Publik (dipanggil oleh Google)

**Respons `200 OK`:** Sama dengan respons `POST /auth/masuk`.

---

### 4.5 Perbarui Token

**`POST /auth/perbarui-token`**

Memperbarui access token menggunakan refresh token yang masih valid.

**Akses:** Publik

**Request Body:**

```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Token berhasil diperbarui.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "bmV3UmVmcmVzaFRva2Vu...",
    "tipe_token": "Bearer",
    "kedaluwarsa_dalam": 900
  }
}
```

**Respons Error:**

- `401 TOKEN_TIDAK_VALID` — Refresh token tidak valid, sudah digunakan, atau kedaluwarsa.

---

### 4.6 Keluar

**`POST /auth/keluar`**

Mencabut refresh token aktif (logout).

**Akses:** Autentikasi diperlukan

**Request Body:**

```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Berhasil keluar.",
  "data": null
}
```

---

### 4.7 Lupa Kata Sandi

**`POST /auth/lupa-kata-sandi`**

Mengirim email berisi link reset kata sandi.

**Akses:** Publik

**Request Body:**

```json
{
  "email": "budi@example.com"
}
```

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Jika email terdaftar, instruksi reset kata sandi telah dikirim.",
  "data": null
}
```

> Selalu mengembalikan `200` untuk mencegah enumerasi email.

---

### 4.8 Reset Kata Sandi

**`POST /auth/reset-kata-sandi`**

Mengatur ulang kata sandi menggunakan token dari email.

**Akses:** Publik

**Request Body:**

```json
{
  "token": "abc123resettoken",
  "kata_sandi_baru": "P@ssw0rdBaru!123",
  "konfirmasi_kata_sandi_baru": "P@ssw0rdBaru!123"
}
```

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.",
  "data": null
}
```

**Respons Error:**

- `400 TOKEN_TIDAK_VALID` — Token reset tidak valid atau sudah kedaluwarsa (berlaku 1 jam).

---

## 5. Pengguna — `/pengguna`

### 5.1 Profil Saya

**`GET /pengguna/saya`**

Mendapatkan profil dan status kuota pengguna yang sedang login.

**Akses:** Autentikasi diperlukan

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Data profil berhasil diambil.",
  "data": {
    "id": "usr_01j5z1k2m3n4p5q6r7s8t9u0",
    "nama_lengkap": "Budi Santoso",
    "email": "budi@example.com",
    "email_terverifikasi": true,
    "avatar_url": "https://cdn.kontrakaman.id/avatars/budi.jpg",
    "tier": "pro",
    "profesi": "programmer",
    "onboarding_selesai": true,
    "dibuat_pada": "2026-08-23T09:02:30Z",
    "kuota": {
      "audit": {
        "digunakan": 3,
        "batas": null,
        "reset_pada": null
      },
      "negosiasi": {
        "digunakan": 1,
        "batas": null,
        "reset_pada": null
      }
    },
    "langganan_aktif": {
      "id": "sub_01j5z1k2m3n4p5q6r7s8t9u1",
      "tier": "pro",
      "aktif_hingga": "2026-09-23T00:00:00Z"
    }
  }
}
```

> `batas: null` artinya tidak ada batas (tier pro/bisnis). `reset_pada: null` artinya kuota tidak direset bulanan.
> `profesi: null` artinya pengguna belum memilih profesi saat onboarding. `onboarding_selesai: false` artinya pengguna belum melewati layar onboarding.

---

### 5.2 Perbarui Profil

**`PATCH /pengguna/saya`**

Memperbarui profil pengguna (nama lengkap dan/atau avatar).

**Akses:** Autentikasi diperlukan

**Request Body (`multipart/form-data` atau `application/json`):**

```json
{
  "nama_lengkap": "Budi Santoso Wijaya"
}
```

| Field                | Tipe     | Wajib | Validasi                                                |
|----------------------|----------|-------|---------------------------------------------------------|
| `nama_lengkap`       | `string` | Tidak | Min 2 karakter, maks 100 karakter                       |
| `avatar`             | `file`   | Tidak | JPG/PNG/WEBP, maks 2MB (hanya via `multipart/form-data`) |
| `profesi`            | `string` | Tidak | `desainer`, `penulis`, `programmer`, `lainnya`          |
| `onboarding_selesai` | `boolean`| Tidak | `true` setelah pengguna melewati atau melewatkan layar onboarding |

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Profil berhasil diperbarui.",
  "data": {
    "id": "usr_01j5z1k2m3n4p5q6r7s8t9u0",
    "nama_lengkap": "Budi Santoso Wijaya",
    "email": "budi@example.com",
    "avatar_url": "https://cdn.kontrakaman.id/avatars/budi-updated.jpg",
    "profesi": "programmer",
    "onboarding_selesai": true
  }
}
```

---

### 5.3 Ubah Kata Sandi



**`POST /pengguna/saya/ubah-kata-sandi`**

Mengubah kata sandi pengguna yang sudah login (bukan via reset).

**Akses:** Autentikasi diperlukan

**Request Body:**

```json
{
  "kata_sandi_lama": "P@ssw0rd!Aman",
  "kata_sandi_baru": "P@ssw0rdBaru!456",
  "konfirmasi_kata_sandi_baru": "P@ssw0rdBaru!456"
}
```

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Kata sandi berhasil diubah.",
  "data": null
}
```

**Respons Error:**

- `400 VALIDASI_GAGAL` — Kata sandi lama tidak cocok.

### 5.4 Hapus Akun

**`DELETE /pengguna/saya`**

Memulai proses penghapusan akun (soft delete + jadwal penghapusan data setelah 30 hari).

**Akses:** Autentikasi diperlukan

**Request Body:**

```json
{
  "konfirmasi": "HAPUS AKUN SAYA",
  "kata_sandi": "P@ssw0rd!Aman"
}
```

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Permintaan penghapusan akun diterima. Akun dan seluruh data akan dihapus permanen dalam 30 hari. Masuk kembali sebelum batas waktu untuk membatalkan.",
  "data": {
    "dihapus_pada": "2026-09-22T09:02:30Z"
  }
}
```

---

### 5.5 Ajukan Ekspor Data Pribadi

**`POST /pengguna/saya/ekspor-data`**

Mengajukan permintaan ekspor seluruh data pribadi pengguna. Backend menyiapkan berkas dan mengirimkan tautan unduhan ke email pengguna. Mendukung hak subjek data sesuai UU Pelindungan Data Pribadi.

**Akses:** Autentikasi diperlukan

**Request Body:** tidak ada

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Permintaan ekspor data diterima. Tautan unduhan akan dikirim ke email kamu dalam beberapa menit.",
  "data": {
    "diminta_pada": "2026-08-23T09:02:30Z",
    "estimasi_selesai_menit": 5
  }
}
```

**Respons Error:**

- `429 TERLALU_BANYAK_PERMINTAAN` — Permintaan ekspor sudah ada yang sedang diproses.

---

### 5.6 Status Permintaan Ekspor Data

**`GET /pengguna/saya/ekspor-data/status`**

Mengecek status permintaan ekspor data yang sedang diproses.

**Akses:** Autentikasi diperlukan

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Status ekspor data.",
  "data": {
    "status": "memproses",
    "diminta_pada": "2026-08-23T09:02:30Z",
    "selesai_pada": null
  }
}
```

> `status` dapat berupa `memproses`, `selesai`, atau `tidak_ada` jika belum pernah mengajukan permintaan.

---

### 5.7 Ambil Preferensi Notifikasi

**`GET /pengguna/saya/preferensi-notifikasi`**

Mendapatkan preferensi notifikasi pengguna. Default semua kategori aktif untuk pengguna baru.

**Akses:** Autentikasi diperlukan

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Preferensi notifikasi berhasil diambil.",
  "data": {
    "audit_selesai": true,
    "pengingat_tindak_lanjut": true,
    "info_langganan": true,
    "diperbarui_pada": "2026-08-23T09:02:30Z"
  }
}
```

---

### 5.8 Perbarui Preferensi Notifikasi

**`PATCH /pengguna/saya/preferensi-notifikasi`**

Memperbarui preferensi notifikasi pengguna. Partial update — hanya field yang dikirim yang diperbarui.

**Akses:** Autentikasi diperlukan

**Request Body:**

```json
{
  "audit_selesai": false
}
```

| Field                      | Tipe      | Wajib | Deskripsi                                              |
|----------------------------|-----------|-------|--------------------------------------------------------|
| `audit_selesai`            | `boolean` | Tidak | Notifikasi saat audit kontrak selesai (F-NOTIF-01)     |
| `pengingat_tindak_lanjut`  | `boolean` | Tidak | Pengingat kontrak berisiko yang belum ditindaklanjuti  |
| `info_langganan`           | `boolean` | Tidak | Info pembayaran, perpanjangan, dan perubahan tier      |

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Preferensi notifikasi berhasil diperbarui.",
  "data": {
    "audit_selesai": false,
    "pengingat_tindak_lanjut": true,
    "info_langganan": true,
    "diperbarui_pada": "2026-08-23T09:05:00Z"
  }
}
```

**Respons Error:**

- `400 VALIDASI_GAGAL` — Field tidak dikenal atau tipe bukan boolean.

---

## 6. Dokumen Kontrak — `/dokumen-kontrak`

### 6.1 Unggah Dokumen

**`POST /dokumen-kontrak`**

Mengunggah dokumen kontrak (PDF, foto JPG/PNG/WEBP) untuk diproses.

**Akses:** Autentikasi diperlukan

**Request:** `multipart/form-data`

| Field          | Tipe     | Wajib | Validasi                                      |
|----------------|----------|-------|-----------------------------------------------|
| `file`         | `file`   | Ya    | PDF, JPG, PNG, WEBP; maks 10MB                |
| `nama`         | `string` | Tidak | Maks 200 karakter. Default: nama file asli     |
| `kategori`     | `string` | Tidak | `desain`, `penulisan`, `pemrograman`, `lainnya`|

**Respons `202 Accepted`:**

```json
{
  "berhasil": true,
  "pesan": "Dokumen berhasil diunggah dan sedang diproses.",
  "data": {
    "id": "dok_01j5z1k2m3n4p5q6r7s8t9u2",
    "nama": "kontrak-project-xyz.pdf",
    "kategori": "pemrograman",
    "status": "menunggu",
    "ukuran_bytes": 512000,
    "tipe_file": "pdf",
    "diunggah_pada": "2026-08-23T09:02:30Z"
  }
}
```

**Respons Error:**

- `403 KUOTA_HABIS` — Kuota audit bulan ini sudah habis (tier gratis).
- `422 FORMAT_FILE_TIDAK_DIDUKUNG` — Tipe file tidak didukung.
- `422 UKURAN_FILE_MELEBIHI_BATAS` — File lebih dari 10MB.

---

### 6.2 Daftar Dokumen Saya

**`GET /dokumen-kontrak`**

Mendapatkan daftar dokumen kontrak milik pengguna yang sedang login.

**Akses:** Autentikasi diperlukan

**Query Parameters:**

| Parameter  | Tipe     | Default     | Deskripsi                                        |
|------------|----------|-------------|--------------------------------------------------|
| `status`   | `string` | —           | Filter: `menunggu`, `memproses`, `selesai`, `gagal`|
| `limit`    | `number` | `20`        | Jumlah item (maks: `100`)                        |
| `cursor`   | `string` | —           | Cursor paginasi                                  |

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Daftar dokumen berhasil diambil.",
  "data": [
    {
      "id": "dok_01j5z1k2m3n4p5q6r7s8t9u2",
      "nama": "kontrak-project-xyz.pdf",
      "kategori": "pemrograman",
      "status": "selesai",
      "skor_risiko": "kuning",
      "diunggah_pada": "2026-08-23T09:02:30Z",
      "audit_id": "aud_01j5z1k2m3n4p5q6r7s8t9u3"
    }
  ],
  "paginasi": {
    "cursor_berikutnya": null,
    "ada_lagi": false,
    "total": 1
  }
}
```

---

### 6.3 Detail Dokumen

**`GET /dokumen-kontrak/:id`**

Mendapatkan detail lengkap satu dokumen kontrak.

**Akses:** Autentikasi diperlukan (hanya milik sendiri atau admin)

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Detail dokumen berhasil diambil.",
  "data": {
    "id": "dok_01j5z1k2m3n4p5q6r7s8t9u2",
    "nama": "kontrak-project-xyz.pdf",
    "kategori": "pemrograman",
    "status": "selesai",
    "skor_risiko": "kuning",
    "ukuran_bytes": 512000,
    "tipe_file": "pdf",
    "url_pratinjau": "https://cdn.kontrakaman.id/preview/dok_xxx.jpg",
    "diunggah_pada": "2026-08-23T09:02:30Z",
    "dihapus_pada": "2026-11-21T09:02:30Z",
    "audit_id": "aud_01j5z1k2m3n4p5q6r7s8t9u3",
    "revisi_dari_id": null,
    "nomor_revisi": 0,
    "total_revisi": 0
  }
}
```

> `revisi_dari_id: null` artinya ini dokumen pertama (bukan revisi). `nomor_revisi: 0` adalah dokumen asal, bertambah tiap revisi diunggah. `total_revisi` adalah jumlah revisi yang sudah diunggah untuk rantai dokumen ini.

---

### 6.4 Hapus Dokumen

**`DELETE /dokumen-kontrak/:id`**

Menghapus dokumen dan semua data terkait (audit, negosiasi) secara permanen.

**Akses:** Autentikasi diperlukan (hanya milik sendiri atau admin)

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Dokumen berhasil dihapus.",
  "data": null
}
```

---

### 6.5 Unggah Revisi Dokumen

**`POST /dokumen-kontrak/:id/revisi`**

Mengunggah versi revisi dari dokumen kontrak yang sudah ada. Sistem menautkan dokumen baru sebagai revisi dan menjalankan audit ulang otomatis.

**Akses:** Autentikasi diperlukan

**Request:** `multipart/form-data`

| Field             | Tipe     | Wajib | Validasi                                      |
|-------------------|----------|-------|-----------------------------------------------|
| `file`            | `file`   | Ya    | PDF, JPG, PNG, WEBP; maks 10MB                |
| `nama`            | `string` | Tidak | Maks 200 karakter                             |
| `catatan_revisi`  | `string` | Tidak | Deskripsi singkat apa yang berubah, maks 500 karakter |

**Respons `202 Accepted`:**

```json
{
  "berhasil": true,
  "pesan": "Revisi kontrak berhasil diunggah dan sedang diaudit.",
  "data": {
    "id": "dok_01j5z1k2m3n4p5q6r7s8t9u9",
    "nama": "kontrak-project-xyz-revisi-1.pdf",
    "status": "menunggu",
    "revisi_dari_id": "dok_01j5z1k2m3n4p5q6r7s8t9u2",
    "nomor_revisi": 1,
    "diunggah_pada": "2026-08-24T10:00:00Z"
  }
}
```

**Respons Error:**

- `403 KUOTA_HABIS` — Kuota audit bulan ini sudah habis.
- `404 TIDAK_DITEMUKAN` — Dokumen asal tidak ditemukan atau bukan milik pengguna.
- `422 FORMAT_FILE_TIDAK_DIDUKUNG` — Tipe file tidak didukung.
- `422 UKURAN_FILE_MELEBIHI_BATAS` — File lebih dari 10MB.

---

### 6.6 Riwayat Revisi Dokumen

**`GET /dokumen-kontrak/:id/revisi`**

Mendapatkan semua versi revisi dari satu dokumen kontrak, urut dari terlama ke terbaru.

**Akses:** Autentikasi diperlukan (hanya milik sendiri atau admin)

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Riwayat revisi berhasil diambil.",
  "data": [
    {
      "id": "dok_01j5z1k2m3n4p5q6r7s8t9u2",
      "nama": "kontrak-project-xyz.pdf",
      "nomor_revisi": 0,
      "status": "selesai",
      "skor_risiko": "merah",
      "diunggah_pada": "2026-08-23T09:02:30Z",
      "audit_id": "aud_01j5z1k2m3n4p5q6r7s8t9u3"
    },
    {
      "id": "dok_01j5z1k2m3n4p5q6r7s8t9u9",
      "nama": "kontrak-project-xyz-revisi-1.pdf",
      "nomor_revisi": 1,
      "catatan_revisi": "Klien sudah hapus klausul denda tanpa batas",
      "status": "selesai",
      "skor_risiko": "kuning",
      "diunggah_pada": "2026-08-24T10:00:00Z",
      "audit_id": "aud_01j5z1k2m3n4p5q6r7s8t9u10"
    }
  ]
}
```

---

## 7. Audit — `/audit`

### 7.1 Mulai Audit

**`POST /audit`**

Memulai proses audit AI terhadap dokumen yang sudah diunggah.

**Akses:** Autentikasi diperlukan

**Request Body:**

```json
{
  "dokumen_kontrak_id": "dok_01j5z1k2m3n4p5q6r7s8t9u2"
}
```

**Respons `202 Accepted`:**

```json
{
  "berhasil": true,
  "pesan": "Audit sedang diproses. Anda akan mendapat notifikasi saat selesai.",
  "data": {
    "id": "aud_01j5z1k2m3n4p5q6r7s8t9u3",
    "dokumen_kontrak_id": "dok_01j5z1k2m3n4p5q6r7s8t9u2",
    "status": "memproses",
    "dimulai_pada": "2026-08-23T09:02:35Z",
    "estimasi_selesai_detik": 60
  }
}
```

**Respons Error:**

- `403 KUOTA_HABIS` — Kuota audit bulan ini sudah habis.
- `409 KONFLIK` — Dokumen sedang atau sudah diaudit.

---

### 7.2 Hasil Audit

**`GET /audit/:id`**

Mendapatkan hasil audit lengkap termasuk skor risiko dan analisis klausul.

**Akses:** Autentikasi diperlukan (hanya milik sendiri atau admin)

**Respons `200 OK` (audit selesai):**

```json
{
  "berhasil": true,
  "pesan": "Hasil audit berhasil diambil.",
  "data": {
    "id": "aud_01j5z1k2m3n4p5q6r7s8t9u3",
    "dokumen_kontrak_id": "dok_01j5z1k2m3n4p5q6r7s8t9u2",
    "status": "selesai",
    "skor_risiko": "kuning",
    "ringkasan": "Kontrak ini mengandung 2 klausul berisiko sedang dan 1 klausul berisiko tinggi yang perlu dinegosiasikan sebelum ditandatangani.",
    "dimulai_pada": "2026-08-23T09:02:35Z",
    "selesai_pada": "2026-08-23T09:03:10Z",
    "klausul": [
      {
        "id": "kls_01j5z1k2m3n4p5q6r7s8t9u4",
        "nomor_urut": 1,
        "judul": "Klausul 5 — Denda Keterlambatan",
        "teks_asli": "Freelancer wajib membayar denda sebesar 5% per hari keterlambatan dari total nilai proyek tanpa batas maksimum.",
        "tingkat_risiko": "merah",
        "penjelasan": "Denda 5% per hari tanpa batas adalah klausul sangat memberatkan. Dalam proyek senilai Rp10 juta, keterlambatan 7 hari saja sudah melampaui nilai proyek. Tidak ada kontrak kerja profesional yang menerapkan denda tanpa batas maksimum.",
        "rekomendasi": "Negosiasikan batas maksimum denda (lazimnya 10-20% dari nilai kontrak) dan definisikan 'keterlambatan' secara jelas — termasuk keterlambatan akibat revisi yang diminta klien.",
        "ada_draft_negosiasi": true
      },
      {
        "id": "kls_01j5z1k2m3n4p5q6r7s8t9u5",
        "nomor_urut": 2,
        "judul": "Klausul 8 — Pengalihan Hak Cipta",
        "teks_asli": "Seluruh hasil karya menjadi milik klien sejak pekerjaan dimulai.",
        "tingkat_risiko": "kuning",
        "penjelasan": "Pengalihan hak cipta sebelum pelunasan adalah risiko sedang. Jika klien tidak membayar, Anda kehilangan karya tetapi juga hak untuk menggunakannya.",
        "rekomendasi": "Tambahkan klausul bahwa pengalihan hak cipta efektif hanya setelah pembayaran penuh diterima.",
        "ada_draft_negosiasi": false
      }
    ],
    "statistik": {
      "total_klausul": 12,
      "klausul_merah": 1,
      "klausul_kuning": 2,
      "klausul_hijau": 9
    }
  }
}
```

**Respons `200 OK` (audit masih memproses):**

```json
{
  "berhasil": true,
  "pesan": "Audit masih diproses.",
  "data": {
    "id": "aud_01j5z1k2m3n4p5q6r7s8t9u3",
    "status": "memproses",
    "progres_persen": 45
  }
}
```

**Respons Error:**

- `404 TIDAK_DITEMUKAN` — Audit dengan ID tersebut tidak ditemukan.

---

### 7.3 Daftar Audit Saya

**`GET /audit`**

Mendapatkan daftar semua audit milik pengguna.

**Akses:** Autentikasi diperlukan

**Query Parameters:**

| Parameter | Tipe     | Default | Deskripsi                                                |
|-----------|----------|---------|----------------------------------------------------------|
| `status`  | `string` | —       | Filter: `memproses`, `selesai`, `gagal`                  |
| `limit`   | `number` | `20`    | Jumlah item (maks: `100`)                                |
| `cursor`  | `string` | —       | Cursor paginasi                                          |

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Daftar audit berhasil diambil.",
  "data": [
    {
      "id": "aud_01j5z1k2m3n4p5q6r7s8t9u3",
      "dokumen_kontrak_id": "dok_01j5z1k2m3n4p5q6r7s8t9u2",
      "nama_dokumen": "kontrak-project-xyz.pdf",
      "status": "selesai",
      "skor_risiko": "kuning",
      "selesai_pada": "2026-08-23T09:03:10Z"
    }
  ],
  "paginasi": {
    "cursor_berikutnya": null,
    "ada_lagi": false,
    "total": 1
  }
}
```

---

## 8. Negosiasi — `/negosiasi`

### 8.1 Minta Draft Negosiasi

**`POST /negosiasi`**

Meminta AI membuat draft kalimat negosiasi tandingan untuk klausul bermasalah.

**Akses:** Autentikasi diperlukan

**Request Body:**

```json
{
  "klausul_id": "kls_01j5z1k2m3n4p5q6r7s8t9u4",
  "konteks_tambahan": "Proyek ini bernilai Rp 15 juta dengan timeline 30 hari. Saya sudah terlanjur sepakat di beberapa poin lain."
}
```

| Field               | Tipe     | Wajib | Validasi                 |
|---------------------|----------|-------|--------------------------|
| `klausul_id`        | `string` | Ya    | ID klausul dari hasil audit|
| `konteks_tambahan`  | `string` | Tidak | Maks 1000 karakter        |

**Respons `202 Accepted`:**

```json
{
  "berhasil": true,
  "pesan": "Draft negosiasi sedang dibuat. Anda akan mendapat notifikasi saat selesai.",
  "data": {
    "id": "neg_01j5z1k2m3n4p5q6r7s8t9u6",
    "klausul_id": "kls_01j5z1k2m3n4p5q6r7s8t9u4",
    "status": "memproses",
    "dimulai_pada": "2026-08-23T09:05:00Z"
  }
}
```

**Respons Error:**

- `403 KUOTA_HABIS` — Kuota draft negosiasi bulan ini sudah habis.
- `403 LANGGANAN_DIPERLUKAN` — Fitur negosiasi memerlukan tier Pro atau Bisnis.
- `409 KONFLIK` — Draft negosiasi untuk klausul ini sudah ada.

---

### 8.2 Hasil Draft Negosiasi

**`GET /negosiasi/:id`**

Mendapatkan hasil draft kalimat negosiasi.

**Akses:** Autentikasi diperlukan (hanya milik sendiri atau admin)

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Draft negosiasi berhasil diambil.",
  "data": {
    "id": "neg_01j5z1k2m3n4p5q6r7s8t9u6",
    "klausul_id": "kls_01j5z1k2m3n4p5q6r7s8t9u4",
    "status": "selesai",
    "teks_asli_klausul": "Freelancer wajib membayar denda sebesar 5% per hari keterlambatan dari total nilai proyek tanpa batas maksimum.",
    "draft_negosiasi": {
      "versi": [
        {
          "label": "Negosiasi Lunak — Cocok jika hubungan baik dengan klien",
          "teks": "Mengenai Pasal 5, saya ingin mengusulkan perubahan kecil: denda keterlambatan ditetapkan 1% per hari dengan batas maksimum 10% dari total nilai kontrak. Ini masih memberikan perlindungan yang wajar bagi klien sambil memastikan proyek tetap layak secara ekonomis bagi saya."
        },
        {
          "label": "Negosiasi Standar — Pendekatan profesional",
          "teks": "Saya mengusulkan revisi Pasal 5 menjadi: denda keterlambatan sebesar 0,5% dari nilai milestone yang terlambat per hari kerja, dengan batas maksimum 15% dari total nilai proyek, dan tidak berlaku untuk keterlambatan yang disebabkan oleh keterlambatan persetujuan revisi dari pihak klien lebih dari 3 hari kerja."
        },
        {
          "label": "Negosiasi Tegas — Jika posisi tawar kuat",
          "teks": "Klausul denda pada Pasal 5 tidak dapat saya setujui dalam bentuk saat ini karena tidak memiliki batas maksimum. Saya meminta klausul ini direvisi mengikuti praktik industri standar: denda maksimum 10% dari nilai kontrak, berlaku hanya untuk keterlambatan yang murni disebabkan kelalaian freelancer, dengan mekanisme force majeure yang jelas."
        }
      ]
    },
    "selesai_pada": "2026-08-23T09:05:45Z"
  }
}
```

---

### 8.3 Daftar Draft Negosiasi Saya

**`GET /negosiasi`**

Mendapatkan daftar semua draft negosiasi milik pengguna.

**Akses:** Autentikasi diperlukan

**Query Parameters:**

| Parameter | Tipe     | Default | Deskripsi               |
|-----------|----------|---------|-------------------------|
| `limit`   | `number` | `20`    | Jumlah item (maks: `100`)|
| `cursor`  | `string` | —       | Cursor paginasi          |

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Daftar draft negosiasi berhasil diambil.",
  "data": [
    {
      "id": "neg_01j5z1k2m3n4p5q6r7s8t9u6",
      "klausul_id": "kls_01j5z1k2m3n4p5q6r7s8t9u4",
      "judul_klausul": "Klausul 5 — Denda Keterlambatan",
      "status": "selesai",
      "selesai_pada": "2026-08-23T09:05:45Z"
    }
  ],
  "paginasi": {
    "cursor_berikutnya": null,
    "ada_lagi": false,
    "total": 1
  }
}
```

---

## 9. Langganan — `/langganan`

### 9.1 Daftar Paket Harga

**`GET /langganan/paket`**

Mendapatkan daftar semua paket harga yang tersedia.

**Akses:** Publik

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Daftar paket berhasil diambil.",
  "data": [
    {
      "id": "pkg_gratis",
      "nama": "Gratis",
      "harga_bulanan": 0,
      "mata_uang": "IDR",
      "fitur": {
        "audit_per_bulan": null,
        "negosiasi_per_bulan": null,
        "keterangan_kuota": "Dikonfigurasi via env variable"
      }
    },
    {
      "id": "pkg_pro",
      "nama": "Pro",
      "harga_bulanan": 99000,
      "mata_uang": "IDR",
      "fitur": {
        "audit_per_bulan": -1,
        "negosiasi_per_bulan": -1,
        "keterangan_kuota": "Tidak terbatas"
      }
    },
    {
      "id": "pkg_bisnis",
      "nama": "Bisnis",
      "harga_bulanan": 299000,
      "mata_uang": "IDR",
      "fitur": {
        "audit_per_bulan": -1,
        "negosiasi_per_bulan": -1,
        "keterangan_kuota": "Tidak terbatas, multi-pengguna"
      }
    }
  ]
}
```

---

### 9.2 Buat Sesi Pembayaran (Mayar)

**`POST /langganan/buat-sesi-pembayaran`**

Membuat sesi pembayaran Mayar untuk upgrade ke tier berbayar. Mengembalikan URL checkout Mayar.

**Akses:** Autentikasi diperlukan

**Request Body:**

```json
{
  "paket_id": "pkg_pro",
  "periode": "bulanan"
}
```

| Field      | Tipe     | Wajib | Validasi                  |
|------------|----------|-------|---------------------------|
| `paket_id` | `string` | Ya    | `pkg_pro` atau `pkg_bisnis`|
| `periode`  | `string` | Ya    | `bulanan` atau `tahunan`   |

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Sesi pembayaran berhasil dibuat.",
  "data": {
    "sesi_id": "sesi_01j5z1k2m3n4p5q6r7s8t9u7",
    "url_checkout": "https://mayar.id/pay/checkout/abc123",
    "kedaluwarsa_pada": "2026-08-23T10:02:30Z"
  }
}
```

---

### 9.3 Langganan Aktif

**`GET /langganan/aktif`**

Mendapatkan detail langganan aktif pengguna.

**Akses:** Autentikasi diperlukan

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Langganan aktif berhasil diambil.",
  "data": {
    "id": "sub_01j5z1k2m3n4p5q6r7s8t9u1",
    "tier": "pro",
    "status": "aktif",
    "periode": "bulanan",
    "harga": 99000,
    "mata_uang": "IDR",
    "aktif_sejak": "2026-08-23T09:03:10Z",
    "aktif_hingga": "2026-09-23T09:03:10Z",
    "perbarui_otomatis": true,
    "mayar_subscription_id": "mayar_sub_abc123"
  }
}
```

**Respons `200 OK` (tidak ada langganan aktif):**

```json
{
  "berhasil": true,
  "pesan": "Tidak ada langganan aktif.",
  "data": null
}
```

---

### 9.4 Batalkan Langganan

**`POST /langganan/batalkan`**

Membatalkan langganan aktif. Tetap aktif hingga akhir periode yang sudah dibayar.

**Akses:** Autentikasi diperlukan

**Request Body:**

```json
{
  "alasan": "Tidak terpakai"
}
```

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Langganan berhasil dibatalkan. Akses Pro tetap aktif hingga 23 September 2026.",
  "data": {
    "aktif_hingga": "2026-09-23T09:03:10Z",
    "perbarui_otomatis": false
  }
}
```

---

### 9.5 Riwayat Transaksi

**`GET /langganan/transaksi`**

Mendapatkan riwayat transaksi pembayaran pengguna.

**Akses:** Autentikasi diperlukan

**Query Parameters:**

| Parameter | Tipe     | Default | Deskripsi               |
|-----------|----------|---------|-------------------------|
| `limit`   | `number` | `20`    | Jumlah item (maks: `100`)|
| `cursor`  | `string` | —       | Cursor paginasi          |

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Riwayat transaksi berhasil diambil.",
  "data": [
    {
      "id": "trx_01j5z1k2m3n4p5q6r7s8t9u8",
      "jenis": "langganan_baru",
      "jumlah": 99000,
      "mata_uang": "IDR",
      "status": "berhasil",
      "paket": "Pro",
      "periode": "bulanan",
      "dibayar_pada": "2026-08-23T09:03:10Z",
      "mayar_payment_id": "mayar_pay_xyz789"
    }
  ],
  "paginasi": {
    "cursor_berikutnya": null,
    "ada_lagi": false,
    "total": 1
  }
}
```

---

## 10. Webhook Mayar — `/webhook`

### 10.1 Penerima Webhook Mayar

**`POST /webhook/mayar`**

Endpoint untuk menerima event dari Mayar payment gateway. **Hanya dipanggil oleh Mayar.**

**Akses:** Publik (diverifikasi via HMAC signature)

**Headers yang diperlukan dari Mayar:**

```
X-Mayar-Signature: sha256=abc123...
```

Backend wajib memverifikasi signature menggunakan `MAYAR_WEBHOOK_SECRET` sebelum memproses event.

**Event yang ditangani:**

| Event Mayar                            | Aksi Backend                                                         |
|----------------------------------------|----------------------------------------------------------------------|
| `payment.received`                     | Aktifkan/perbarui langganan, buat record transaksi                   |
| `membership.newMemberRegistered`       | Aktifkan langganan baru, kirim email selamat datang                  |
| `membership.memberUnsubscribed`        | Tandai langganan sebagai dibatalkan, jadwalkan downgrade             |
| `membership.memberExpired`             | Downgrade ke tier gratis, kirim notifikasi ke pengguna               |
| `membership.changeTierMemberRegistered`| Upgrade/downgrade tier, perbarui kuota                               |

**Request Body (contoh `payment.received`):**

```json
{
  "event": "payment.received",
  "data": {
    "id": "mayar_pay_xyz789",
    "amount": 99000,
    "currency": "IDR",
    "customer_email": "budi@example.com",
    "product_id": "mayar_product_pro_monthly",
    "status": "paid",
    "created_at": "2026-08-23T09:03:00Z"
  }
}
```

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Event diterima."
}
```

> Backend harus selalu mengembalikan `200` sesegera mungkin dan memproses event secara asinkron untuk menghindari timeout dari Mayar (maks 30 detik).

**Respons Error:**

- `400 PERMINTAAN_TIDAK_VALID` — Signature tidak valid atau body tidak dapat di-parse.
- `401 TOKEN_TIDAK_VALID` — HMAC signature gagal verifikasi.

---

## 11. Notifikasi — `/notifikasi`

### 11.1 Daftar Notifikasi

**`GET /notifikasi`**

Mendapatkan daftar notifikasi in-app milik pengguna yang sedang login.

**Akses:** Autentikasi diperlukan

**Query Parameters:**

| Parameter      | Tipe      | Default | Deskripsi                                  |
|----------------|-----------|---------|--------------------------------------------|
| `sudah_dibaca` | `boolean` | —       | Filter notifikasi sudah/belum dibaca        |
| `limit`        | `number`  | `20`    | Jumlah item (maks: `100`)                  |
| `cursor`       | `string`  | —       | Cursor paginasi                            |

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Daftar notifikasi berhasil diambil.",
  "data": [
    {
      "id": "notif_01j5z1k2m3n4p5q6r7s8t9u0",
      "jenis": "audit_selesai",
      "judul": "Audit kontrak selesai",
      "pesan": "kontrak-project-xyz.pdf — Skor risiko: Risiko Tinggi.",
      "sudah_dibaca": false,
      "dibuat_pada": "2026-08-23T09:03:10Z",
      "href_tujuan": "/audit/aud_01j5z1k2m3n4p5q6r7s8t9u3",
      "meta": {
        "audit_id": "aud_01j5z1k2m3n4p5q6r7s8t9u3",
        "dokumen_id": "dok_01j5z1k2m3n4p5q6r7s8t9u2",
        "nama_dokumen": "kontrak-project-xyz.pdf",
        "skor_risiko": "merah"
      }
    }
  ],
  "paginasi": {
    "cursor_berikutnya": null,
    "ada_lagi": false,
    "total": 1
  }
}
```

> `jenis` dapat berupa `audit_selesai` atau `pengingat_tindak_lanjut`.

---

### 11.2 Tandai Notifikasi Dibaca

**`PATCH /notifikasi/:id/baca`**

Menandai satu notifikasi sebagai sudah dibaca.

**Akses:** Autentikasi diperlukan (hanya milik sendiri)

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Notifikasi ditandai sudah dibaca.",
  "data": null
}
```

**Respons Error:**

- `404 TIDAK_DITEMUKAN` — Notifikasi tidak ditemukan atau bukan milik pengguna.

---

### 11.3 Tandai Semua Notifikasi Dibaca

**`PATCH /notifikasi/baca-semua`**

Menandai seluruh notifikasi milik pengguna sebagai sudah dibaca sekaligus.

**Akses:** Autentikasi diperlukan

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Semua notifikasi ditandai sudah dibaca.",
  "data": null
}
```

---

## 12. Admin — `/admin`

> Semua endpoint `/admin` memerlukan role `ADMIN`. Pengguna biasa akan mendapat respons `403 AKSES_DITOLAK`.

### 12.1 Daftar Semua Pengguna

**`GET /admin/pengguna`**

Mendapatkan daftar semua pengguna terdaftar.

**Akses:** Admin

**Query Parameters:**

| Parameter | Tipe     | Default | Deskripsi                                     |
|-----------|----------|---------|-----------------------------------------------|
| `cari`    | `string` | —       | Cari berdasarkan nama atau email               |
| `tier`    | `string` | —       | Filter: `gratis`, `pro`, `bisnis`              |
| `limit`   | `number` | `20`    | Jumlah item (maks: `100`)                      |
| `cursor`  | `string` | —       | Cursor paginasi                                |

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Daftar pengguna berhasil diambil.",
  "data": [
    {
      "id": "usr_01j5z1k2m3n4p5q6r7s8t9u0",
      "nama_lengkap": "Budi Santoso",
      "email": "budi@example.com",
      "tier": "pro",
      "email_terverifikasi": true,
      "dibuat_pada": "2026-08-23T09:02:30Z",
      "total_audit": 12,
      "total_negosiasi": 5
    }
  ],
  "paginasi": {
    "cursor_berikutnya": null,
    "ada_lagi": false,
    "total": 1
  }
}
```

---

### 12.2 Detail Pengguna (Admin)

**`GET /admin/pengguna/:id`**

Mendapatkan detail lengkap satu pengguna beserta statistik penggunaan.

**Akses:** Admin

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Detail pengguna berhasil diambil.",
  "data": {
    "id": "usr_01j5z1k2m3n4p5q6r7s8t9u0",
    "nama_lengkap": "Budi Santoso",
    "email": "budi@example.com",
    "tier": "pro",
    "role": "user",
    "email_terverifikasi": true,
    "dibuat_pada": "2026-08-23T09:02:30Z",
    "terakhir_aktif": "2026-08-23T09:03:10Z",
    "statistik": {
      "total_dokumen": 15,
      "total_audit": 12,
      "total_negosiasi": 5,
      "audit_bulan_ini": 3
    },
    "langganan": {
      "tier": "pro",
      "aktif_hingga": "2026-09-23T09:03:10Z"
    }
  }
}
```

---

### 12.3 Statistik Platform

**`GET /admin/statistik`**

Mendapatkan statistik agregat platform (dashboard admin).

**Akses:** Admin

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Statistik berhasil diambil.",
  "data": {
    "pengguna": {
      "total": 1250,
      "baru_bulan_ini": 87,
      "aktif_7_hari": 340
    },
    "konversi": {
      "total_gratis": 980,
      "total_pro": 230,
      "total_bisnis": 40,
      "tingkat_konversi_persen": 21.6
    },
    "penggunaan": {
      "total_audit": 8750,
      "total_negosiasi": 3200,
      "audit_bulan_ini": 620,
      "negosiasi_bulan_ini": 280
    },
    "pendapatan": {
      "bulan_ini_idr": 24570000,
      "mrr_idr": 24570000
    }
  }
}
```

---

### 12.4 Kelola Kuota Pengguna (Override)

**`PATCH /admin/pengguna/:id/kuota`**

Override kuota pengguna tertentu (misal: untuk uji coba atau kompensasi).

**Akses:** Admin

**Request Body:**

```json
{
  "audit_tambahan": 10,
  "negosiasi_tambahan": 5,
  "catatan": "Kompensasi gangguan layanan tanggal 20 Agustus"
}
```

**Respons `200 OK`:**

```json
{
  "berhasil": true,
  "pesan": "Kuota pengguna berhasil diperbarui.",
  "data": {
    "pengguna_id": "usr_01j5z1k2m3n4p5q6r7s8t9u0",
    "audit_tambahan": 10,
    "negosiasi_tambahan": 5
  }
}
```

---

## 13. Rate Limiting

Semua endpoint menerapkan rate limiting berbasis IP dan user ID.

| Tier           | Endpoint         | Batas                         |
|----------------|------------------|-------------------------------|
| Semua          | `/auth/*`        | 10 req/menit per IP           |
| Gratis         | `/dokumen-kontrak`, `/audit`, `/negosiasi` | 30 req/menit per user |
| Pro            | Semua endpoint   | 120 req/menit per user        |
| Bisnis         | Semua endpoint   | 300 req/menit per user        |
| Admin          | `/admin/*`       | 60 req/menit per user         |

Header respons saat rate limit terlampaui:

```
Retry-After: 60
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1724407350
```

---

## 14. Versioning

API menggunakan versioning via URL path (`/v1`, `/v2`, dst).

- Versi lama dipertahankan minimal **6 bulan** setelah versi baru rilis.
- Breaking changes hanya diperbolehkan pada major version baru.
- Endpoint deprecated ditandai dengan header `Deprecation: true` dan `Sunset: <tanggal>`.

---

*Dokumen ini adalah living document. Setiap perubahan endpoint wajib diperbarui di sini sebelum implementasi, mengikuti ketentuan di `PRD.md` dan `AGENTS.md`.*

> **Terakhir diperbarui:** 23 Agustus 2026 — Ditambahkan: Bagian 5.5–5.8 (ekspor data, preferensi notifikasi), field `profesi` dan `onboarding_selesai` di 5.1 dan 5.2, Bagian 6.5–6.6 (revisi kontrak), field revisi di 6.3, Bagian 11 (Notifikasi). Bagian Admin, Rate Limiting, Versioning digeser menjadi 12, 13, 14.
