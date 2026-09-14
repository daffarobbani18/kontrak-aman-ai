# Product Requirements Document (PRD)

## KontrakAman AI

**Versi:** 0.1 (Draf Awal)
**Tanggal:** 23 Agustus 2026
**Status:** Draf, menunggu validasi dan penguncian keputusan oleh pemilik produk
**Sifat dokumen:** Living document. Dokumen ini adalah single source of truth bagi seluruh tim, termasuk AI coding agent lain yang akan menyusun AGENTS.md dan DESIGN.md. Setiap keputusan baru atau perubahan fitur wajib diperbarui di sini terlebih dahulu sebelum kode ditulis.

---

## 1. Ringkasan Eksekutif

KontrakAman AI adalah layanan SaaS yang mengaudit draf kontrak kerja freelance secara instan menggunakan AI, dirancang khusus untuk pekerja gig independen di Indonesia seperti desainer grafis, penulis lepas, dan programmer. Produk ini hadir untuk menutup kesenjangan yang tidak dilayani asisten hukum AI korporat yang mahal dan ditujukan untuk legal officer perusahaan besar. Ketimpangan kuasa antara pemberi kerja dan pekerja lepas membuat banyak freelancer menandatangani kontrak yang memuat klausul jebakan, atau lazim disebut pasal karet, tanpa sanggup membayar jasa pengacara untuk mereview draf tersebut terlebih dahulu.

Dengan mengunggah foto atau dokumen PDF kontrak, pengguna mendapatkan skor risiko instan (Hijau, Kuning, Merah), penjelasan klausul bermasalah dalam bahasa sehari-hari, serta draf kalimat negosiasi tandingan yang siap diajukan kembali ke klien. Proyek ini penting dikerjakan sekarang karena adopsi kerja lepas di Indonesia terus tumbuh, sementara literasi hukum kontrak di kalangan pekerja gig masih rendah dan solusi legal-tech konsumer yang berfokus pada individu, bukan korporasi, masih jarang tersedia di pasar Indonesia.

---

## 2. Latar Belakang dan Tujuan Bisnis

### Masalah yang Mendasari

Freelancer di sektor jasa kreatif dan teknologi umumnya terikat pada perjanjian kerja sama perdata dengan klien, bukan hubungan kerja formal yang tunduk pada UU Ketenagakerjaan. Karena berada di ranah hukum perdata yang menganut asas kebebasan berkontrak, isi kontrak sangat bergantung pada siapa yang menyusun draf pertama, dan dalam praktiknya draf hampir selalu disusun sepihak oleh pemberi kerja. Ketimpangan kuasa ini melahirkan pasal karet seperti denda keterlambatan sepihak yang tidak masuk akal, pengalihan hak cipta tanpa pembayaran lunas, dan termin pembayaran yang ditunda hingga 90 hari setelah proyek selesai.

Freelancer individu jarang mampu membayar jasa pengacara untuk mereview tiap draf kontrak yang diterima. Sementara itu, solusi AI hukum yang sudah ada di pasar Indonesia, seperti Ask Hukumonline AI, dirancang untuk kebutuhan riset hukum praktisi, akademisi, dan perusahaan, bukan untuk audit kontrak personal seorang pekerja gig lepas dengan relasi kuasa yang timpang terhadap kliennya.

### Tujuan Bisnis

1. Menurunkan hambatan biaya dan waktu bagi pekerja gig untuk memahami risiko hukum dalam kontrak sebelum menandatanganinya.
2. Memberikan posisi tawar yang lebih setara kepada freelancer melalui draf negosiasi tandingan yang siap pakai dan berbahasa profesional.
3. Membangun produk legal-tech konsumer B2C pertama di Indonesia yang berfokus khusus pada audit kontrak pekerja gig lepas, sebagai diferensiasi dari pemain yang sudah ada dan menyasar segmen korporat.

### Metrik Keberhasilan atau KPI yang Diusulkan

Catatan asumsi: dokumentasi sumber tidak menyebutkan target angka spesifik. Target di bawah ini bersifat indikatif sebagai titik awal diskusi dan wajib dikonfirmasi serta dikunci oleh pemilik produk.

| Metrik | Target Awal (usulan) | Cara Ukur |
|---|---|---|
| Waktu penyelesaian audit awal | Kurang dari 60 detik untuk dokumen hingga 10 halaman | Waktu antara dokumen selesai diunggah dan skor risiko tampil |
| Akurasi deteksi klausul berisiko | Minimal 80 persen klausul yang diverifikasi ahli hukum berhasil terdeteksi otomatis | Sampling berkala dibandingkan review manual mitra hukum |
| Retensi pengguna | Pengguna kembali mengaudit kontrak kedua dalam 90 hari | Analitik penggunaan per akun |
| Konversi ke draf negosiasi | Persentase hasil audit berisiko Kuning atau Merah yang berlanjut ke pembuatan draf negosiasi | Analitik funnel dari hasil audit ke fitur negosiasi |
| Tingkat kegagalan pemrosesan dokumen | Persentase upload yang gagal diproses (OCR gagal, format tidak didukung) tetap di bawah ambang batas yang disepakati tim | Log error backend-ai |

---

## 3. Target Pengguna dan Persona

### Persona 1: Rani, Desainer Grafis Freelance (27 tahun)

**Latar belakang:** Bekerja mandiri dari rumah, mengerjakan proyek desain visual untuk startup dan UMKM, rutin menerima kontrak kerja sama dari klien baru setiap bulan.
**Kebutuhan:** Memahami dengan cepat apakah kontrak yang dikirim klien aman ditandatangani, tanpa perlu membaca puluhan pasal berbahasa hukum yang rumit.
**Titik sakit:** Pernah mengalami pembayaran ditahan hingga 90 hari karena klausul termin pembayaran yang tidak jelas, dan tidak tahu cara menegosiasikan ulang tanpa terkesan menyulitkan klien.
**Skenario penggunaan utama:** Memfoto kontrak yang dikirim lewat pesan instan, mengunggahnya lewat ponsel, dan mendapatkan skor risiko dalam hitungan menit sebelum membalas klien.

### Persona 2: Bima, Programmer Freelance (31 tahun)

**Latar belakang:** Mengerjakan proyek pengembangan software untuk beberapa klien korporat sekaligus, kontrak sering berasal dari tim legal klien yang jauh lebih berpengalaman secara hukum.
**Kebutuhan:** Audit cepat terhadap klausul pengalihan hak cipta kode dan klausul non-compete yang terlalu luas, serta draf bahasa negosiasi yang terdengar profesional saat dikirim ke tim legal klien.
**Titik sakit:** Khawatir klausul non-compete membatasi dirinya mengambil proyek lain di industri sejenis untuk jangka waktu yang tidak wajar.
**Skenario penggunaan utama:** Mengunggah dokumen PDF kontrak sebelum tanda tangan, membandingkan beberapa klausul kritikal, lalu mengekspor draf klausul tandingan untuk dikirim ke tim legal klien.

### Persona 3: Sari, Penulis Lepas atau Content Writer (24 tahun)

**Latar belakang:** Baru merintis karier sebagai penulis lepas, sering menerima kontrak dari agensi konten dan media daring.
**Kebutuhan:** Memahami implikasi klausul pengalihan hak cipta tulisan dan klausul kill fee jika artikel dibatalkan sepihak.
**Titik sakit:** Minim pengalaman membaca kontrak, sehingga rentan menandatangani klausul yang merugikan karena takut kehilangan klien pertama.
**Skenario penggunaan utama:** Menggunakan penjelasan bahasa awam dan basis pengetahuan edukasi untuk belajar istilah kontrak sebelum benar-benar menegosiasikan apa pun.

---

## 4. Daftar Fitur Lengkap dan Workflow

Fitur dikelompokkan menjadi 10 epic. Setiap fitur ditandai kode unik, prioritas MoSCoW, user story, alur kerja termasuk jalur kegagalan, dan kriteria penerimaan yang bisa diverifikasi. Fitur berprioritas Could Have dan Won't Have pada rilis pertama diberikan detail lebih ringkas karena bukan fokus MVP.

### Epic A. Autentikasi dan Manajemen Akun

#### F-AUTH-01 Registrasi Akun (Must have)

**User Story:** Sebagai calon pengguna, saya ingin mendaftar akun menggunakan email atau akun Google, supaya saya bisa mulai mengaudit kontrak saya.

**Alur Kerja:**
1. Pengguna membuka halaman registrasi dan memilih mendaftar dengan email atau dengan Google.
2. Jika memilih email, pengguna mengisi email, password, dan konfirmasi password.
3. Sistem memvalidasi format email dan kekuatan password.
   3a. Jika validasi gagal, sistem menampilkan pesan error spesifik pada kolom terkait tanpa menghapus data yang sudah diisi pengguna.
4. Sistem mengirim email verifikasi dan mengarahkan pengguna ke halaman konfirmasi.

**Kriteria Penerimaan:**
- Pengguna baru berhasil membuat akun dengan email unik yang belum terdaftar.
- Password minimal memenuhi standar keamanan yang disepakati tim (contoh delapan karakter dengan kombinasi huruf dan angka).
- Registrasi dengan Google OAuth berhasil membuat akun tanpa memerlukan password terpisah.
- Percobaan registrasi dengan email yang sudah terdaftar menampilkan pesan error yang jelas dan tidak membuat akun duplikat.

#### F-AUTH-02 Login Email atau Google OAuth (Must have)

**User Story:** Sebagai pengguna terdaftar, saya ingin masuk ke akun saya dengan email dan password atau akun Google, supaya saya bisa mengakses riwayat kontrak saya.

**Alur Kerja:**
1. Pengguna membuka halaman login dan memasukkan kredensial atau memilih login dengan Google.
2. Sistem memverifikasi kredensial ke backend-api.
   2a. Jika kredensial salah, sistem menampilkan pesan error umum yang tidak membocorkan apakah email terdaftar atau tidak, demi keamanan.
   2b. Jika koneksi terputus saat proses login, sistem menampilkan opsi coba lagi tanpa mengharuskan pengguna mengisi ulang form dari kosong.
3. Sistem membuat sesi pengguna dan mengarahkan ke Dashboard.

**Kriteria Penerimaan:**
- Login berhasil dengan kredensial yang benar mengarahkan pengguna ke Dashboard dalam waktu kurang dari 3 detik pada kondisi jaringan normal.
- Login dengan kredensial salah menampilkan pesan error umum, bukan pesan yang membocorkan status akun.
- Sesi pengguna tetap aktif sesuai kebijakan durasi sesi yang disepakati tim.

#### F-AUTH-03 Lupa Password atau Reset Password (Must have)

**User Story:** Sebagai pengguna yang lupa password, saya ingin mengatur ulang password lewat email, supaya saya tetap bisa mengakses akun saya.

**Alur Kerja:**
1. Pengguna menekan tautan lupa password di halaman login dan memasukkan email.
2. Sistem mengirim tautan reset password yang berlaku dalam waktu terbatas.
   2a. Jika email tidak terdaftar, sistem tetap menampilkan pesan konfirmasi generik demi keamanan, tanpa membocorkan status akun.
3. Pengguna membuka tautan, memasukkan password baru, dan mengonfirmasinya.
   3a. Jika tautan sudah kedaluwarsa, sistem menampilkan pesan yang jelas dan menawarkan opsi mengirim ulang tautan baru.

**Kriteria Penerimaan:**
- Tautan reset password kedaluwarsa setelah jangka waktu yang disepakati tim.
- Password baru berhasil menggantikan password lama dan pengguna bisa login dengan password baru tersebut.
- Tautan reset yang sudah dipakai tidak bisa dipakai ulang.

#### F-AUTH-04 Verifikasi Email (Must have)

**User Story:** Sebagai pengguna baru, saya ingin memverifikasi email saya, supaya akun saya terjamin keasliannya dan saya bisa menerima notifikasi hasil audit.

**Alur Kerja:**
1. Sistem mengirim email berisi tautan verifikasi segera setelah registrasi.
2. Pengguna menekan tautan tersebut untuk mengaktifkan status verified pada akunnya.
   2a. Jika tautan sudah kedaluwarsa, sistem menyediakan opsi kirim ulang email verifikasi dari halaman akun.

**Kriteria Penerimaan:**
- Akun yang belum diverifikasi tetap dapat login namun mendapat peringatan untuk memverifikasi email sebelum mengunggah kontrak.
- Tautan verifikasi hanya berlaku satu kali pakai.

#### F-AUTH-05 Logout dan Manajemen Sesi (Must have)

**User Story:** Sebagai pengguna, saya ingin keluar dari akun saya kapan saja, supaya data saya tetap aman terutama saat memakai perangkat bersama.

**Alur Kerja:**
1. Pengguna menekan tombol logout dari menu akun.
2. Sistem menghapus sesi aktif dan mengarahkan pengguna ke halaman login.
3. Jika sesi habis karena idle terlalu lama, sistem otomatis logout dan menampilkan pesan sesi telah berakhir saat pengguna mencoba melakukan aksi berikutnya.

**Kriteria Penerimaan:**
- Setelah logout, seluruh halaman yang memerlukan autentikasi tidak bisa diakses tanpa login ulang.
- Sesi otomatis berakhir sesuai kebijakan durasi idle yang disepakati tim, dan data yang sedang dikerjakan pengguna (jika ada) tidak hilang begitu saja karena hasil audit tersimpan di server, bukan hanya di sesi browser.

### Epic B. Manajemen Profil dan Onboarding

#### F-PROF-01 Onboarding Pemilihan Profesi (Should have)

**User Story:** Sebagai pengguna baru, saya ingin memilih profesi saya saat pertama kali masuk, supaya sistem bisa memberi konteks yang relevan pada hasil audit saya.

**Alur Kerja:**
1. Setelah verifikasi email, pengguna diarahkan ke layar onboarding singkat.
2. Pengguna memilih kategori profesi seperti desainer, penulis, programmer, atau lainnya.
3. Pengguna dapat melewati langkah ini dan mengisinya nanti lewat halaman profil.

**Kriteria Penerimaan:**
- Pilihan profesi tersimpan di profil pengguna dan dapat diubah kapan saja.
- Pengguna yang melewati onboarding tetap bisa langsung mengunggah kontrak tanpa terhambat.

#### F-PROF-02 Edit Profil Dasar (Could have)

**User Story:** Sebagai pengguna, saya ingin mengubah data profil dasar saya, supaya informasi akun saya tetap akurat.

**Alur Kerja singkat:** Pengguna membuka halaman profil, mengubah data seperti nama tampilan atau profesi, lalu menyimpan perubahan.

**Kriteria Penerimaan:**
- Perubahan profil tersimpan dan langsung terlihat di halaman profil setelah disimpan.

#### F-PROF-03 Preferensi Notifikasi (Could have)

**User Story:** Sebagai pengguna, saya ingin mengatur jenis notifikasi yang saya terima, supaya saya tidak terganggu notifikasi yang tidak relevan bagi saya.

**Alur Kerja singkat:** Pengguna membuka pengaturan notifikasi, mengaktifkan atau menonaktifkan kategori notifikasi seperti email hasil audit atau pengingat tindak lanjut.

**Kriteria Penerimaan:**
- Preferensi yang dimatikan pengguna tidak lagi mengirimkan notifikasi terkait sampai diaktifkan kembali.

### Epic C. Upload dan Manajemen Dokumen Kontrak

#### F-DOC-01 Upload Dokumen PDF (Must have)

**User Story:** Sebagai pekerja gig, saya ingin mengunggah kontrak dalam format PDF, supaya saya bisa langsung mengaudit isinya.

**Alur Kerja:**
1. Pengguna menekan tombol audit kontrak baru dan memilih unggah file PDF.
2. Sistem memvalidasi format dan ukuran file.
   2a. Jika format bukan PDF atau ukuran melebihi batas yang disepakati tim, sistem menolak upload dan menjelaskan format serta ukuran yang didukung.
3. Sistem menyimpan dokumen terenkripsi dan mengarahkan ke proses audit.

**Kriteria Penerimaan:**
- File PDF hingga batas ukuran yang disepakati tim berhasil diunggah.
- File dengan format tidak didukung ditolak dengan pesan error yang jelas, bukan error generik.

#### F-DOC-02 Upload Foto Kontrak dan OCR (Must have)

**User Story:** Sebagai pekerja gig yang menerima kontrak lewat foto, saya ingin mengunggah foto kontrak, supaya saya tidak perlu mengubahnya ke PDF terlebih dahulu.

**Alur Kerja:**
1. Pengguna memilih unggah foto dari galeri atau mengambil foto langsung lewat kamera perangkat.
2. Sistem melakukan OCR untuk mengekstraksi teks dari foto.
   2a. Jika confidence score OCR di bawah ambang batas yang disepakati tim (foto buram, pencahayaan buruk, atau tulisan terpotong), sistem memberi tahu pengguna dan menyarankan mengunggah ulang dengan kualitas lebih baik atau menggunakan PDF asli.
3. Sistem menampilkan hasil ekstraksi teks untuk konfirmasi cepat sebelum lanjut ke audit.

**Kriteria Penerimaan:**
- Foto dengan kualitas baik menghasilkan teks terekstraksi dengan tingkat akurasi yang disepakati tim sebagai target minimum.
- Foto dengan kualitas buruk memicu peringatan sebelum audit dilanjutkan, bukan langsung diproses dengan hasil yang berpotensi keliru.

#### F-DOC-03 Riwayat dan Daftar Kontrak (Must have)

**User Story:** Sebagai pengguna, saya ingin melihat daftar seluruh kontrak yang pernah saya audit, supaya saya bisa mengaksesnya kembali kapan saja.

**Alur Kerja:**
1. Pengguna membuka menu riwayat kontrak.
2. Sistem menampilkan daftar kontrak berurutan dari yang terbaru, lengkap dengan skor risiko masing-masing.
3. Pengguna dapat menekan salah satu kontrak untuk melihat detail hasil audit.

**Kriteria Penerimaan:**
- Seluruh kontrak yang pernah diaudit pengguna muncul di daftar riwayat miliknya sendiri, tidak tercampur dengan milik pengguna lain.
- Daftar dapat difilter berdasarkan skor risiko.

#### F-DOC-04 Hapus Dokumen (Must have)

**User Story:** Sebagai pengguna, saya ingin menghapus dokumen kontrak yang sudah tidak saya perlukan, supaya data sensitif saya tidak tersimpan lebih lama dari kebutuhan saya.

**Alur Kerja:**
1. Pengguna memilih kontrak di riwayat dan menekan opsi hapus.
2. Sistem meminta konfirmasi karena tindakan ini tidak bisa dibatalkan.
3. Sistem menghapus dokumen asli dan hasil audit terkait secara permanen dari penyimpanan.

**Kriteria Penerimaan:**
- Dokumen yang dihapus tidak lagi muncul di riwayat maupun dapat diakses lewat tautan lama.
- Penghapusan bersifat permanen sesuai kebijakan retensi data (lihat F-PRIV-02).

#### F-DOC-05 Unggah Ulang Versi Revisi Kontrak (Could have)

**User Story:** Sebagai pengguna yang menerima revisi kontrak dari klien, saya ingin mengunggah versi baru dan membandingkannya dengan versi lama, supaya saya tahu perubahan apa saja yang terjadi.

**Alur Kerja singkat:** Pengguna mengunggah dokumen baru dan menautkannya sebagai revisi dari kontrak lama, sistem menjalankan audit ulang untuk versi baru.

**Kriteria Penerimaan:**
- Versi lama dan versi baru tetap dapat diakses terpisah, keduanya tertaut dalam satu riwayat kontrak yang sama.

### Epic D. Modul AI Audit Klausul dan Skor Risiko

#### F-AUDIT-01 Deteksi Klausul Jebakan Otomatis (Must have)

**User Story:** Sebagai pekerja gig, saya ingin AI otomatis mendeteksi klausul jebakan dalam kontrak saya, supaya saya tidak perlu membaca dan memahami sendiri seluruh bahasa hukum yang rumit.

**Alur Kerja:**
1. Teks kontrak yang sudah diekstraksi dikirim ke backend-ai lewat job asinkron.
2. Modul AI menganalisis setiap klausul dan menandai klausul yang berpola sebagai klausul berisiko.
   2a. Jika job gagal karena timeout atau error pemanggilan model AI, sistem mencatat kegagalan, menampilkan pesan error yang jelas, dan menawarkan opsi coba audit ulang tanpa memotong kuota audit pengguna.
3. Hasil deteksi disimpan dan dikaitkan dengan dokumen kontrak terkait.

**Kriteria Penerimaan:**
- Setiap klausul yang terdeteksi berisiko tertaut ke lokasi persis di dokumen asli.
- Tingkat deteksi diverifikasi berkala terhadap sampel review manual mitra hukum sesuai target akurasi di Bagian 2.

#### F-AUDIT-02 Skor Risiko Hijau, Kuning, Merah (Must have)

**User Story:** Sebagai pekerja gig, saya ingin melihat skor risiko keseluruhan kontrak dalam bentuk warna sederhana, supaya saya bisa langsung memahami tingkat bahayanya tanpa membaca detail teknis.

**Alur Kerja:**
1. Sistem menghitung skor risiko keseluruhan berdasarkan jumlah dan tingkat keparahan klausul bermasalah yang ditemukan.
2. Sistem menampilkan skor sebagai satu dari tiga warna, Hijau untuk risiko rendah, Kuning untuk risiko sedang, Merah untuk risiko tinggi.

**Kriteria Penerimaan:**
- Skema skor konsisten menggunakan tiga warna sesuai keputusan yang dikunci di Bagian 7, tidak menggunakan skala lain.
- Logika penentuan ambang batas warna terdokumentasi dan dapat diaudit kembali oleh tim.

#### F-AUDIT-03 Penjelasan Bahasa Awam per Klausul (Must have)

**User Story:** Sebagai pekerja gig tanpa latar belakang hukum, saya ingin membaca penjelasan sederhana tiap klausul bermasalah, supaya saya benar-benar memahami risikonya, bukan hanya melihat istilah hukum yang asing.

**Alur Kerja:**
1. Untuk setiap klausul yang ditandai berisiko, sistem menghasilkan penjelasan dalam bahasa sehari-hari yang menjelaskan apa arti klausul tersebut dan mengapa berisiko.
2. Penjelasan ditampilkan berdampingan dengan kutipan klausul asli.

**Kriteria Penerimaan:**
- Penjelasan tidak mengandung istilah hukum tanpa disertai penjabaran sederhana.
- Setiap penjelasan mencantumkan kategori risiko yang relevan (lihat F-AUDIT-05).

#### F-AUDIT-04 Highlight Klausul Bermasalah pada Dokumen Asli (Should have)

**User Story:** Sebagai pengguna, saya ingin klausul bermasalah ditandai langsung pada tampilan dokumen asli saya, supaya saya bisa langsung melihat konteks lengkapnya.

**Alur Kerja singkat:** Sistem menampilkan pratinjau dokumen dengan klausul berisiko diberi highlight warna sesuai tingkat risikonya, pengguna dapat menekan highlight untuk melihat penjelasan terkait.

**Kriteria Penerimaan:**
- Setiap highlight pada dokumen tertaut akurat ke penjelasan klausul yang sesuai.

#### F-AUDIT-05 Kategorisasi Jenis Risiko (Must have)

**User Story:** Sebagai pengguna, saya ingin klausul bermasalah dikelompokkan berdasarkan jenis risikonya, supaya saya bisa fokus pada kategori yang paling relevan dengan situasi saya.

**Alur Kerja:**
1. Sistem mengklasifikasikan setiap klausul berisiko ke kategori yang relevan, misalnya penalti sepihak, pengalihan hak cipta tanpa kompensasi penuh, keterlambatan pembayaran berlebihan, klausul non-compete terlalu luas, dan terminasi sepihak tanpa alasan jelas.
2. Kategori ditampilkan sebagai label pada setiap hasil temuan.

**Kriteria Penerimaan:**
- Setiap klausul berisiko memiliki minimal satu kategori yang tercantum.
- Daftar kategori terdokumentasi dan dapat diperluas tanpa mengubah struktur data inti (lihat larangan perubahan skema di Bagian 11).

### Epic E. Modul AI Draf Negosiasi Tandingan

#### F-NEGO-01 Generate Draf Klausul Tandingan Otomatis (Must have)

**User Story:** Sebagai pekerja gig, saya ingin AI membuatkan draf kalimat tandingan untuk klausul bermasalah, supaya saya punya bahan konkret untuk bernegosiasi dengan klien tanpa perlu menyusunnya sendiri dari nol.

**Alur Kerja:** Dijabarkan detail sebagai Alur Kritikal 2 pada Bagian 4.11.

**Kriteria Penerimaan:**
- Setiap draf tandingan disertai penjelasan singkat mengapa perubahan tersebut wajar diajukan.
- Draf selalu disertai disclaimer bahwa ini adalah bantuan referensi, bukan nasihat hukum final (lihat F-EDU-01).

#### F-NEGO-02 Edit Manual Draf (Should have)

**User Story:** Sebagai pengguna, saya ingin mengedit draf negosiasi yang dihasilkan AI, supaya bahasanya sesuai dengan gaya komunikasi saya sendiri sebelum dikirim ke klien.

**Alur Kerja singkat:** Pengguna menekan draf yang ingin diubah, mengedit teks langsung di editor, perubahan tersimpan otomatis.

**Kriteria Penerimaan:**
- Perubahan manual pengguna tidak hilang saat halaman dimuat ulang.
- Draf hasil edit tetap dapat dibedakan dari draf asli hasil AI untuk kebutuhan audit internal.

#### F-NEGO-03 Ekspor Draf sebagai PDF, Word, atau Salin Teks (Should have)

**User Story:** Sebagai pengguna, saya ingin mengekspor draf negosiasi saya, supaya saya bisa mengirimkannya lewat email atau kanal komunikasi lain ke klien.

**Alur Kerja:** Dijabarkan detail sebagai bagian dari Alur Kritikal 2 pada Bagian 4.11.

**Kriteria Penerimaan:**
- Dokumen hasil ekspor menyertakan disclaimer otomatis sesuai F-EDU-01.
- Opsi salin teks tetap tersedia sebagai jalan keluar cadangan jika ekspor file gagal.

#### F-NEGO-04 Template Pengantar Profesional untuk Klien (Could have)

**User Story:** Sebagai pengguna yang kurang percaya diri berkomunikasi formal, saya ingin template kalimat pengantar untuk mengirim draf negosiasi ke klien, supaya pesan saya terdengar profesional dan tidak konfrontatif.

**Alur Kerja singkat:** Sistem menyediakan beberapa pilihan template pengantar yang bisa disesuaikan pengguna sebelum disalin bersama draf negosiasi.

**Kriteria Penerimaan:**
- Template tersedia dalam nada yang sopan dan tidak terkesan menuduh klien.

### Epic F. Dashboard dan Riwayat

#### F-DASH-01 Ringkasan Dashboard (Should have)

**User Story:** Sebagai pengguna aktif, saya ingin melihat ringkasan aktivitas audit saya di satu halaman, supaya saya punya gambaran cepat tanpa membuka tiap kontrak satu per satu.

**Alur Kerja singkat:** Dashboard menampilkan jumlah kontrak yang sudah diaudit, distribusi skor risiko, dan kontrak terbaru yang perlu ditindaklanjuti.

**Kriteria Penerimaan:**
- Data ringkasan diperbarui otomatis setiap kali ada audit baru selesai.

#### F-DASH-02 Detail Hasil Audit per Kontrak (Must have)

**User Story:** Sebagai pengguna, saya ingin membuka detail lengkap hasil audit satu kontrak, supaya saya bisa meninjau seluruh temuan sebelum mengambil keputusan.

**Alur Kerja:** Dijabarkan detail sebagai bagian dari Alur Kritikal 1 pada Bagian 4.11.

**Kriteria Penerimaan:**
- Halaman detail menampilkan skor risiko, daftar klausul bermasalah, penjelasan bahasa awam, dan opsi lanjut ke pembuatan draf negosiasi dalam satu tampilan yang runtut.

#### F-DASH-03 Perbandingan Kontrak dari Waktu ke Waktu (Won't have pada rilis pertama)

**User Story:** Sebagai pengguna yang sering menerima kontrak serupa dari klien berbeda, saya ingin membandingkan pola risiko antar kontrak dari waktu ke waktu, supaya saya bisa mengenali klien yang cenderung memberi kontrak berisiko tinggi.

**Catatan:** Fitur ini dicatat sebagai kandidat roadmap masa depan, tidak dikerjakan pada rilis pertama (lihat Bagian 9).

### Epic G. Notifikasi

#### F-NOTIF-01 Notifikasi Audit Selesai (Must have)

**User Story:** Sebagai pengguna, saya ingin mendapat notifikasi saat proses audit kontrak saya selesai, supaya saya tidak perlu menunggu di halaman yang sama sambil memantau prosesnya.

**Alur Kerja:**
1. Setelah job audit selesai diproses backend-ai, sistem mengirim notifikasi in-app dan email ke pengguna.
2. Pengguna dapat menekan notifikasi untuk langsung menuju halaman detail hasil audit.

**Kriteria Penerimaan:**
- Notifikasi terkirim dalam waktu kurang dari satu menit setelah job audit selesai.
- Notifikasi tidak terkirim apabila pengguna menonaktifkan kategori ini di preferensi (lihat F-PROF-03).

#### F-NOTIF-02 Notifikasi Pengingat Tindak Lanjut (Could have)

**User Story:** Sebagai pengguna dengan kontrak berisiko tinggi yang belum ditindaklanjuti, saya ingin diingatkan, supaya saya tidak lupa menegosiasikan ulang sebelum menandatangani kontrak.

**Alur Kerja singkat:** Sistem mengirim pengingat berkala jika kontrak berskor Merah belum menghasilkan draf negosiasi dalam jangka waktu tertentu.

**Kriteria Penerimaan:**
- Pengingat berhenti terkirim setelah pengguna membuat draf negosiasi atau menandai kontrak sebagai selesai ditindaklanjuti.

### Epic H. Pengaturan dan Langganan

#### F-BILL-01 Free Tier dengan Batas Kuota (Must have)

**User Story:** Sebagai pengguna baru, saya ingin mencoba fitur audit tanpa biaya terlebih dahulu, supaya saya yakin dengan kualitas produk sebelum berlangganan.

**Alur Kerja:**
1. Setiap akun baru otomatis mendapat kuota audit gratis bulanan sesuai batas yang ditetapkan pemilik produk.
2. Saat kuota habis, sistem menampilkan pemberitahuan dan menawarkan upgrade ke tier berbayar tanpa memblokir akses ke hasil audit yang sudah ada sebelumnya.

**Kriteria Penerimaan:**
- Penghitungan kuota akurat dan tereset otomatis sesuai siklus yang ditentukan.
- Pengguna yang kuotanya habis tetap bisa membuka riwayat kontrak lamanya.

#### F-BILL-02 Upgrade ke Paid Tier (Should have)

**User Story:** Sebagai pengguna yang sering mengaudit kontrak, saya ingin berlangganan tier berbayar, supaya saya mendapat kuota audit lebih banyak dan fitur tambahan.

**Alur Kerja singkat:** Pengguna memilih paket berbayar, melakukan pembayaran lewat penyedia payment gateway yang dipilih tim, sistem mengaktifkan tier baru setelah pembayaran terverifikasi.

**Kriteria Penerimaan:**
- Tier baru aktif segera setelah pembayaran berhasil diverifikasi.
- Kegagalan pembayaran menampilkan pesan error yang jelas dan tidak mengubah status tier pengguna.

#### F-BILL-03 Riwayat Pembayaran atau Invoice (Should have)

**User Story:** Sebagai pengguna berlangganan, saya ingin melihat riwayat pembayaran saya, supaya saya punya catatan untuk kebutuhan administrasi pribadi.

**Alur Kerja singkat:** Pengguna membuka halaman billing dan melihat daftar transaksi beserta status masing-masing.

**Kriteria Penerimaan:**
- Setiap transaksi yang berhasil menghasilkan catatan invoice yang dapat diunduh pengguna.

#### F-BILL-04 Pembatalan Langganan (Must have)

**User Story:** Sebagai pengguna berlangganan, saya ingin membatalkan langganan saya kapan saja, supaya saya tidak dikenakan biaya berkelanjutan yang tidak saya inginkan.

**Alur Kerja:**
1. Pengguna membuka pengaturan langganan dan menekan tombol batalkan.
2. Sistem meminta konfirmasi dan menjelaskan kapan tier berbayar akan berakhir.
3. Langganan tetap aktif hingga akhir periode yang sudah dibayar, kemudian otomatis turun ke free tier.

**Kriteria Penerimaan:**
- Pembatalan tidak memicu penagihan ulang pada siklus berikutnya.
- Pengguna tetap bisa mengakses fitur berbayar hingga akhir periode yang sudah dibayar.

### Epic I. Kepatuhan, Keamanan, dan Privasi Data

#### F-PRIV-01 Persetujuan Pengumpulan Data (Must have)

**User Story:** Sebagai pengguna, saya ingin diberi tahu secara jelas bagaimana dokumen dan data saya akan diproses sebelum saya mengunggah kontrak, supaya saya bisa memberi persetujuan berdasarkan informasi yang cukup.

**Alur Kerja:**
1. Saat registrasi, pengguna diminta menyetujui kebijakan privasi yang menjelaskan pemrosesan data sesuai UU Pelindungan Data Pribadi.
2. Pengguna dapat meninjau kembali kebijakan ini kapan saja lewat halaman pengaturan.

**Kriteria Penerimaan:**
- Pengguna tidak dapat mengunggah dokumen sebelum menyetujui kebijakan privasi.
- Riwayat persetujuan tercatat dengan stempel waktu untuk kebutuhan kepatuhan.

#### F-PRIV-02 Kebijakan Retensi dan Penghapusan Otomatis Dokumen (Must have)

**User Story:** Sebagai pengguna, saya ingin dokumen kontrak saya otomatis dihapus setelah jangka waktu tertentu jika saya tidak menghapusnya sendiri, supaya data sensitif saya tidak tersimpan tanpa batas.

**Alur Kerja:**
1. Sistem menjalankan proses terjadwal yang memeriksa dokumen yang sudah melewati batas retensi.
2. Dokumen yang melewati batas retensi dihapus otomatis beserta metadatanya.
3. Pengguna mendapat notifikasi sebelum penghapusan otomatis terjadi, dengan opsi memperpanjang jika masih dibutuhkan.

**Kriteria Penerimaan:**
- Tidak ada dokumen yang tersimpan melebihi batas retensi yang ditetapkan tanpa persetujuan eksplisit pengguna untuk memperpanjang.

#### F-PRIV-03 Unduh atau Ekspor Data Pribadi (Should have)

**User Story:** Sebagai pengguna, saya ingin mengunduh salinan seluruh data pribadi saya, supaya saya bisa menggunakan hak saya sebagai subjek data sesuai UU Pelindungan Data Pribadi.

**Alur Kerja singkat:** Pengguna mengajukan permintaan ekspor data dari halaman pengaturan, sistem menyiapkan berkas berisi seluruh data akun dan mengirimkan tautan unduhan aman ke email pengguna.

**Kriteria Penerimaan:**
- Berkas ekspor mencakup seluruh data pribadi yang tersimpan terkait akun pengguna.

#### F-PRIV-04 Hapus Akun dan Seluruh Data (Must have)

**User Story:** Sebagai pengguna, saya ingin menghapus akun saya beserta seluruh data terkait, supaya saya bisa sepenuhnya berhenti menggunakan layanan ini kapan saja.

**Alur Kerja:**
1. Pengguna membuka pengaturan akun dan memilih hapus akun.
2. Sistem meminta konfirmasi ganda karena tindakan ini permanen dan tidak bisa dibatalkan.
3. Sistem menghapus seluruh dokumen, hasil audit, data langganan, dan data profil terkait akun tersebut.

**Kriteria Penerimaan:**
- Setelah penghapusan selesai, akun tidak bisa lagi digunakan untuk login dan seluruh data terkait tidak lagi dapat diakses lewat sistem manapun.

### Epic J. Edukasi dan Disclaimer Hukum

#### F-EDU-01 Disclaimer Bukan Pengganti Pengacara (Must have)

**User Story:** Sebagai pengguna, saya ingin selalu diingatkan bahwa hasil audit ini bukan nasihat hukum final, supaya saya tidak salah mengambil keputusan besar hanya berdasarkan AI tanpa mempertimbangkan konsultasi profesional untuk kasus yang kompleks.

**Alur Kerja:**
1. Disclaimer ditampilkan di setiap halaman hasil audit dan setiap dokumen hasil ekspor draf negosiasi.
2. Disclaimer tidak dapat disembunyikan atau dinonaktifkan oleh pengguna maupun pengaturan sistem manapun.

**Kriteria Penerimaan:**
- Disclaimer selalu muncul tanpa terkecuali pada setiap hasil audit dan setiap ekspor dokumen (lihat larangan di Bagian 11).

#### F-EDU-02 Basis Pengetahuan Pasal Karet Umum (Could have)

**User Story:** Sebagai pengguna yang ingin belajar lebih jauh, saya ingin membaca artikel edukasi tentang pola pasal karet yang umum ditemukan, supaya saya lebih siap membaca kontrak secara mandiri di masa depan.

**Alur Kerja singkat:** Pengguna membuka menu edukasi dan membaca artikel yang dikelola tim konten atau mitra hukum.

**Kriteria Penerimaan:**
- Artikel edukasi ditinjau dan disetujui mitra hukum sebelum dipublikasikan.

#### F-EDU-03 Rekomendasi Konsultasi Profesional untuk Kasus Kompleks (Should have)

**User Story:** Sebagai pengguna dengan kontrak berisiko tinggi atau bernilai besar, saya ingin diarahkan untuk berkonsultasi dengan pengacara sungguhan, supaya saya tidak hanya mengandalkan AI untuk keputusan yang berdampak besar.

**Alur Kerja singkat:** Saat skor risiko Merah muncul atau nilai kontrak yang disebutkan pengguna melewati ambang batas tertentu, sistem menampilkan rekomendasi eksplisit untuk berkonsultasi dengan profesional hukum.

**Kriteria Penerimaan:**
- Rekomendasi konsultasi profesional selalu muncul bersamaan dengan skor risiko Merah.

### 4.11 Alur Kritikal Terperinci

Dua alur berikut adalah yang paling kompleks dan paling krusial bagi nilai jual produk, sehingga diuraikan secara lebih detail termasuk seluruh jalur kegagalannya.

#### Alur Kritikal 1: Audit Kontrak dari Upload hingga Hasil Skor Risiko

1. Pengguna login dan berada di halaman Dashboard.
2. Pengguna menekan tombol audit kontrak baru.
3. Sistem menampilkan pilihan metode input, unggah file PDF atau unggah foto kontrak.
   3a. Jika file yang dipilih bukan PDF, JPG, atau PNG, atau ukurannya melebihi batas yang disepakati tim, sistem menolak upload dan menampilkan pesan error yang menjelaskan format serta ukuran yang didukung, pengguna diminta mengunggah ulang.
4. Pengguna mengunggah dokumen, progress bar upload ditampilkan.
   4a. Jika koneksi terputus saat upload, sistem mendeteksi kegagalan, tidak menghapus progres pengguna yang sudah ada, dan menampilkan tombol coba lagi tanpa memaksa pengguna mengulang seluruh proses dari awal.
5. Sistem melakukan pra-pemrosesan. Jika input berupa foto, modul OCR mengekstraksi teks dari gambar.
   5a. Jika kualitas foto terlalu buram sehingga confidence score OCR di bawah ambang batas, sistem memberi tahu pengguna dan menyarankan mengunggah ulang foto dengan pencahayaan lebih baik atau menggunakan file PDF asli.
6. Sistem mengirim teks kontrak yang sudah diekstraksi ke modul AI audit klausul di backend-ai lewat job asinkron, dan menampilkan status sedang menganalisis kepada pengguna.
   6a. Jika sesi pengguna habis saat menunggu, hasil tetap tersimpan terhadap akun pengguna karena proses berjalan di server, bukan di sesi browser. Saat pengguna login kembali, notifikasi dan hasil audit tetap tersedia di Dashboard tanpa kehilangan progres.
7. Modul AI mengklasifikasikan setiap klausul kontrak ke dalam kategori risiko sesuai F-AUDIT-05.
8. Sistem menghitung skor risiko keseluruhan Hijau, Kuning, atau Merah berdasarkan jumlah dan tingkat keparahan klausul bermasalah yang ditemukan.
9. Sistem menampilkan hasil audit kepada pengguna, skor risiko keseluruhan, daftar klausul bermasalah dengan highlight pada dokumen asli, dan penjelasan tiap klausul dalam bahasa sehari-hari.
   9a. Jika job audit gagal karena timeout pemanggilan model AI atau error internal, sistem menampilkan pesan error yang jelas, mencatat kegagalan untuk investigasi tim, dan menawarkan opsi coba audit ulang tanpa mengurangi kuota audit pengguna.
10. Hasil audit otomatis tersimpan di riwayat kontrak pengguna, dan notifikasi email serta in-app dikirim bahwa audit telah selesai.
11. Pengguna dapat melanjutkan ke pembuatan draf negosiasi tandingan (Alur Kritikal 2) langsung dari halaman hasil audit ini.

#### Alur Kritikal 2: Pembuatan dan Ekspor Draf Negosiasi Tandingan

1. Pengguna berada di halaman hasil audit kontrak yang sudah selesai diproses, dengan skor risiko Kuning atau Merah pada satu atau lebih klausul.
2. Pengguna memilih klausul bermasalah yang ingin dinegosiasikan ulang dan menekan tombol buat draf negosiasi.
3. Sistem mengirim konteks klausul asli beserta kategori risikonya ke modul AI drafting di backend-ai.
   3a. Jika pengguna berada di tier gratis dan sudah mencapai batas kuota draf negosiasi bulanan, sistem menampilkan pesan batas kuota tercapai dan menawarkan upgrade ke tier berbayar, tanpa memblokir akses ke hasil audit yang sudah ada.
4. Modul AI menghasilkan draf kalimat tandingan yang lebih seimbang untuk tiap klausul terpilih, beserta penjelasan singkat mengapa perubahan tersebut wajar diajukan.
   4a. Jika model AI gagal merespons dalam batas waktu yang ditentukan, sistem menampilkan pesan error dan tombol coba lagi tanpa mengurangi kuota draf pengguna.
5. Sistem menampilkan draf negosiasi tandingan berdampingan dengan klausul asli untuk perbandingan.
6. Pengguna dapat mengedit langsung teks draf sebelum diekspor sesuai F-NEGO-02.
7. Pengguna memilih format ekspor, unduh PDF, unduh dokumen Word, atau salin teks.
   7a. Jika proses pembuatan file ekspor gagal, sistem menampilkan pesan error dan tetap menyediakan opsi salin teks langsung sebagai jalan keluar cadangan.
8. Sistem menyertakan disclaimer otomatis pada dokumen hasil ekspor bahwa draf ini adalah bantuan referensi, bukan nasihat hukum final yang mengikat, dan tetap disarankan diperiksa profesional untuk kontrak bernilai tinggi atau kompleks.
9. Draf yang sudah dibuat tersimpan di riwayat kontrak terkait, sehingga pengguna dapat mengaksesnya kembali kapan saja tanpa perlu membuat ulang dari nol.

---

## 5. Kebutuhan Non-Fungsional

### Performa
- Hasil audit awal, skor risiko dan daftar klausul bermasalah, tersedia dalam waktu kurang dari 60 detik untuk dokumen hingga 10 halaman, sejalan dengan praktik umum tools audit kontrak konsumer sejenis di pasar global.
- Waktu muat halaman utama seperti Dashboard dan halaman upload berada di bawah 2 detik pada koneksi 4G standar.
- Proses OCR foto kontrak selesai dalam waktu kurang dari 15 detik per halaman.

### Keamanan
- Seluruh data dalam transit dienkripsi menggunakan TLS 1.3, dan data tersimpan termasuk dokumen kontrak dan data akun dienkripsi saat disimpan.
- Password disimpan menggunakan algoritma hashing yang aman seperti bcrypt atau argon2, tidak pernah disimpan dalam bentuk teks biasa.
- Autentikasi mendukung email dan password serta Google OAuth 2.0.
- Sistem wajib mematuhi UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, yang telah berlaku penuh sejak Oktober 2024. Kewajiban yang relevan antara lain memiliki dasar hukum pemrosesan data, memberi tahu subjek data dan otoritas terkait dalam waktu 3x24 jam apabila terjadi insiden kebocoran data, serta memfasilitasi hak subjek data seperti akses, koreksi, dan penghapusan data pribadi.
- Tim produk perlu mengevaluasi apakah skala pemrosesan data kontrak, yang bisa memuat data pribadi dan informasi bisnis sensitif, mewajibkan penunjukan Pejabat Pelindungan Data seiring pertumbuhan jumlah pengguna, sesuai ketentuan UU Pelindungan Data Pribadi.
- Setiap dokumen kontrak yang diunggah hanya dapat diakses oleh pemilik akun yang bersangkutan, tidak ada akses lintas pengguna.
- Audit log dicatat untuk setiap akses dan pemrosesan dokumen kontrak, untuk kebutuhan investigasi insiden dan kepatuhan.

### Skalabilitas
- Target awal mendukung hingga 10.000 pengguna terdaftar pada tahun pertama, dengan arsitektur yang mampu diskalakan ke lebih dari 100.000 pengguna tanpa perombakan besar. Angka ini bersifat asumsi dan perlu dikonfirmasi pemilik produk.
- Proses audit AI dijalankan lewat job queue asinkron sehingga lonjakan permintaan tidak memblokir performa fitur lain di sistem.

### Aksesibilitas
- Target kepatuhan WCAG 2.2 Level AA, standar aksesibilitas web yang berlaku umum secara global pada tahun 2026 dan menjadi acuan berbagai regulasi aksesibilitas internasional.

### Lokalisasi
- Bahasa Indonesia sebagai bahasa utama antarmuka dan hasil audit.
- Cakupan analisis kontrak pada versi awal difokuskan pada kontrak berbahasa Indonesia. Dukungan bahasa Inggris dicatat sebagai kemungkinan pengembangan lanjutan (lihat Bagian 9).

### Kompatibilitas Platform
- Aplikasi web responsif yang optimal diakses lewat browser mobile, mengingat mayoritas pekerja gig kemungkinan besar mengunggah kontrak langsung dari ponsel mereka.
- Kompatibel dengan browser modern utama yaitu Chrome, Safari, Firefox, dan Edge versi dua tahun terakhir.

---

## 6. Arah Teknis Tingkat Tinggi

Produk ini dibangun sebagai aplikasi web responsif, bukan aplikasi mobile native pada versi awal, dengan pertimbangan pengembangan Progressive Web App di iterasi berikutnya untuk mendukung akses kamera langsung saat memfoto kontrak.

Kebutuhan real-time tidak signifikan pada MVP. Proses audit kontrak dan pembuatan draf negosiasi berjalan sebagai job asinkron, bukan respons instan sinkron, karena melibatkan pemrosesan OCR dan pemanggilan model AI yang memakan waktu. Status job cukup diperbarui lewat polling berkala atau notifikasi saat selesai, tanpa memerlukan koneksi WebSocket permanen pada MVP.

Fitur AI/ML pada produk ini bersifat substansial dan menjadi inti nilai jual produk, bukan sekadar pelengkap. Cakupannya meliputi ekstraksi teks lewat OCR, klasifikasi klausul berisiko, penilaian skor risiko, dan generasi draf negosiasi tandingan berbasis LLM. Karena beban kerja AI ini berbeda karakteristik dari operasi data biasa, yaitu memerlukan pengelolaan job queue, rate limiting terhadap provider AI eksternal, kontrol biaya token, serta kemungkinan pergantian model atau provider AI di masa depan tanpa mengganggu logika bisnis inti, backend direkomendasikan dipisah menjadi dua layanan berikut.

- **backend-api** menangani autentikasi, manajemen akun, manajemen dokumen, billing, dan seluruh operasi data inti.
- **backend-ai** menangani pipeline OCR, orkestrasi prompt ke provider LLM, klasifikasi klausul, dan generasi draf negosiasi.

Pemisahan ini memudahkan penskalaan independen karena backend-ai membutuhkan pola scaling yang berbeda akibat ketergantungan pada latensi provider AI eksternal, memudahkan kontrol biaya AI secara terpisah dari biaya infrastruktur inti, dan memudahkan pergantian provider AI di masa depan tanpa menyentuh logika bisnis di backend-api.

---

## 7. Keputusan yang Sudah Ditetapkan

### 7.1 Keputusan Produk (mengikat, berdasarkan dokumentasi sumber)

- Nama produk adalah KontrakAman AI.
- Model skor risiko menggunakan tiga tingkat warna, Hijau, Kuning, dan Merah. Perubahan ke skema skor lain, misalnya skala numerik, memerlukan persetujuan eksplisit dan pembaruan dokumen ini terlebih dahulu.
- Fitur draf negosiasi tandingan dihasilkan secara otonom oleh AI, bukan hanya menampilkan highlight masalah tanpa solusi konkret.
- Segmentasi pasar adalah individu pekerja gig lepas dengan model B2C, secara eksplisit bukan legal officer korporat atau tim legal perusahaan.
- Dua metode input dokumen wajib didukung sejak awal, yaitu unggah file PDF dan unggah foto kontrak dalam format JPG atau PNG.

### 7.2 Keputusan Teknis yang Masih Terbuka

Dokumentasi sumber tidak menyebutkan pilihan teknis konkret untuk butir-butir berikut. Agar tidak ditebak sepihak oleh agent lain, opsi berikut diusulkan sebagai titik awal diskusi dengan mempertimbangkan stack yang sudah terbukti dipakai pada proyek-proyek sebelumnya, dan HARUS dikonfirmasi secara eksplisit oleh pemilik produk sebelum ditulis final di AGENTS.md.

- **Database utama:** usulan PostgreSQL dengan Prisma sebagai ORM untuk backend-api.
- **Job queue untuk pemrosesan AI asinkron:** usulan Redis sebagai broker.
- **Provider autentikasi:** usulan email dan password kustom ditambah Google OAuth 2.0. Penggunaan penyedia layanan pihak ketiga seperti Firebase Auth, Supabase Auth, atau Auth0 masih terbuka untuk dipilih.
- **Provider AI/LLM** untuk OCR, klasifikasi klausul, dan generasi draf negosiasi belum ditentukan. Opsi yang dapat dipertimbangkan termasuk Anthropic Claude, OpenAI GPT, atau Google Gemini, dengan kriteria pemilihan meliputi akurasi terhadap teks hukum berbahasa Indonesia dan biaya per audit.
- **Batas anggaran atau tier gratis** belum ditentukan, perlu ditetapkan pemilik produk mengingat biaya panggilan API AI langsung memengaruhi margin tiap audit gratis yang diberikan.
- **Kerangka backend:** usulan NestJS atau FastAPI untuk backend-api, dan FastAPI untuk backend-ai mengingat ekosistem Python yang lebih matang untuk pipeline OCR dan orkestrasi LLM.
- **Frontend:** usulan Next.js.
- **Deployment dan infrastruktur:** usulan kontainerisasi dengan Docker dan CI/CD lewat GitHub Actions, dapat dijalankan di GCP, AWS, atau Azure sesuai ketersediaan kredit atau preferensi tim.

---

## 8. Batasan dan Asumsi

Dokumentasi proyek yang dilampirkan berupa deskripsi masalah dan workflow tingkat tinggi tanpa rincian teknis atau bisnis lebih lanjut. PRD ini disusun dengan sejumlah asumsi eksplisit berikut, yang wajib divalidasi pemilik produk. Setiap perubahan terhadap asumsi ini wajib diperbarui di dokumen ini sebelum memengaruhi pengembangan.

1. **Kerangka hukum yang dianalisis AI.** Karena mayoritas hubungan kerja freelancer di Indonesia berbentuk perjanjian kerja sama perdata dan bukan hubungan kerja formal di bawah UU Ketenagakerjaan, diasumsikan modul audit klausul AI mengacu pada prinsip hukum perjanjian dalam Kitab Undang-Undang Hukum Perdata, termasuk asas kebebasan berkontrak dan itikad baik, bukan pada norma pengupahan atau perlindungan ketenagakerjaan formal.
2. **Model bisnis.** Diasumsikan model freemium, yaitu kuota audit gratis terbatas per bulan dan fitur atau kuota tambahan berbayar, karena dokumentasi sumber menyebut produk ini sebagai SaaS namun tidak merinci skema harga.
3. **Cakupan bahasa kontrak.** Diasumsikan versi awal hanya menangani kontrak berbahasa Indonesia. Kontrak berbahasa Inggris atau campuran dicatat sebagai kemungkinan pengembangan lanjutan.
4. **Format dokumen.** Diasumsikan dukungan format PDF dan foto JPG atau PNG sudah memadai untuk versi awal, mengingat kontrak freelance di Indonesia sering dikirim lewat pesan instan dalam bentuk foto atau hasil pindai.
5. **Skala tim dan waktu pengembangan.** Dokumentasi sumber tidak menyebutkan batas waktu, anggaran, atau ukuran tim pengembang, sehingga PRD ini tidak mengasumsikan tenggat waktu tertentu. Bagian ini perlu dilengkapi pemilik produk.
6. **Ketersediaan tenaga ahli hukum untuk validasi.** Diasumsikan tersedia setidaknya satu mitra atau konsultan hukum yang dapat memvalidasi keakuratan hasil deteksi AI secara berkala, mengingat akurasi deteksi klausul berisiko adalah inti kualitas produk ini.
7. **Batasan nilai kontrak yang dicakup.** Diasumsikan produk ini ditujukan untuk kontrak bernilai kecil hingga menengah yang lazim dihadapi individu freelancer, bukan kontrak korporat bernilai besar yang tetap memerlukan pendampingan pengacara langsung.

---

## 9. Di Luar Cakupan

- Pembuatan kontrak baru dari nol (contract drafting atau generator), produk ini hanya mengaudit draf yang sudah ada.
- Representasi hukum langsung, mediasi sengketa, atau pendampingan litigasi apabila terjadi perselisihan dengan klien.
- Integrasi tanda tangan elektronik untuk kontrak yang sudah dinegosiasikan.
- Dukungan bahasa selain Bahasa Indonesia pada versi awal.
- Fitur kolaborasi tim legal atau multi-pengguna dalam satu akun. Produk ini eksplisit ditujukan untuk pengguna individu, bukan tim legal korporat.
- Integrasi langsung dengan kanal penyelesaian sengketa pemerintah, misalnya mediasi Disnaker.
- Fitur invoicing, escrow pembayaran, atau manajemen proyek freelance secara umum.
- Aplikasi mobile native iOS atau Android terpisah. Versi awal berbentuk web responsif saja.

Seluruh butir di atas dapat dicatat sebagai kandidat roadmap masa depan, namun secara sadar tidak dikerjakan pada rilis pertama.

---

## 10. Risiko dan Mitigasi

### 1. Risiko Hukum: Praktik Hukum Tanpa Izin

**Risiko:** AI dapat dianggap memberikan nasihat hukum tanpa lisensi advokat apabila hasil audit atau draf negosiasi diposisikan sebagai keputusan hukum final. Preseden di industri legal-tech global menunjukkan regulator dapat menindak platform yang memasarkan asisten AI seolah menggantikan pengacara sungguhan.
**Mitigasi:** Seluruh hasil audit dan draf negosiasi selalu disertai disclaimer eksplisit bahwa produk ini adalah alat bantu edukasi dan analisis risiko, bukan pengganti nasihat hukum profesional, dengan rekomendasi konsultasi advokat untuk kontrak bernilai tinggi atau kompleks (lihat F-EDU-01 dan F-EDU-03).

### 2. Risiko Teknis: Akurasi Deteksi Klausul Berisiko

**Risiko:** Bahasa hukum kontrak Indonesia sangat beragam, ditambah potensi kualitas foto kontrak yang buram, dapat menurunkan akurasi deteksi klausul jebakan dan menimbulkan hasil negatif keliru yang berbahaya bagi pengguna. Praktik industri menunjukkan model AI hukum yang terspesialisasi dan divalidasi cenderung lebih andal mendeteksi klausul berisiko tinggi dibanding model AI serba guna.
**Mitigasi:** Kombinasikan pendekatan berbasis pola atau aturan untuk klausul yang sudah dikenal dengan model LLM untuk klausul yang lebih kompleks, lakukan validasi berkala oleh mitra hukum, sediakan mekanisme umpan balik pengguna untuk melaporkan hasil yang keliru, dan tampilkan tingkat keyakinan hasil audit kepada pengguna.

### 3. Risiko Privasi dan Keamanan Data

**Risiko:** Dokumen kontrak dapat memuat data pribadi dan informasi bisnis sensitif milik pengguna maupun klien mereka. Kebocoran data akan berdampak serius secara hukum dan reputasi, mengingat UU Pelindungan Data Pribadi mengatur sanksi administratif dan pidana yang berat bagi pengendali data yang lalai.
**Mitigasi:** Terapkan enkripsi menyeluruh, kebijakan retensi dan penghapusan otomatis dokumen, opsi pengguna menghapus dokumen kapan saja, serta kepatuhan penuh terhadap kewajiban UU Pelindungan Data Pribadi termasuk notifikasi insiden dalam 3x24 jam kepada subjek data dan otoritas terkait.

### 4. Risiko Produk: Keengganan Pengguna Mengunggah Dokumen Sensitif

**Risiko:** Freelancer mungkin ragu mengunggah kontrak asli karena khawatir data klien bocor, atau khawatir hubungan dengan klien memburuk jika negosiasi terkesan terlalu agresif.
**Mitigasi:** Sediakan opsi tidak menyimpan dokumen setelah audit selesai, bangun edukasi UX tentang cara menyampaikan draf negosiasi secara profesional dan tidak konfrontatif, serta bangun kepercayaan lewat transparansi kebijakan privasi yang mudah dipahami.

### 5. Risiko Operasional: Biaya API AI yang Membengkak

**Risiko:** Setiap audit dan draf negosiasi memanggil model AI berbayar. Volume pengguna yang tumbuh cepat pada tier gratis dapat membuat biaya operasional tidak berkelanjutan.
**Mitigasi:** Terapkan rate limiting dan kuota jelas pada tier gratis, gunakan model AI berbiaya lebih rendah untuk tahap deteksi awal dan model yang lebih mahal hanya untuk tahap akhir yang membutuhkan kualitas bahasa tinggi, serta pantau biaya per audit sebagai metrik operasional rutin.

---

## 11. Larangan Eksplisit

- Jangan menghapus atau menyembunyikan disclaimer bukan pengganti nasihat hukum profesional dari hasil audit maupun draf negosiasi dalam bentuk apa pun.
- Jangan mengubah skema skor risiko dari tiga warna, Hijau, Kuning, Merah, ke skema lain tanpa mencatat perubahan dan alasannya di Bagian 7 terlebih dahulu.
- Jangan mengganti provider AI/LLM yang sudah dikunci di Bagian 7 tanpa persetujuan eksplisit dan pembaruan dokumen ini.
- Jangan install dependency baru di luar yang sudah disepakati di AGENTS.md tanpa mencatatnya di sini dulu.
- Jangan mengubah skema database atau struktur data kontrak pengguna tanpa mencatatnya di sini dulu.
- Jangan menyimpan dokumen kontrak pengguna melebihi kebijakan retensi yang ditentukan tanpa persetujuan eksplisit pengguna.
- Jangan menambahkan fitur di luar cakupan pada Bagian 9 tanpa proses perubahan scope yang terdokumentasi di PRD ini.
- Jangan membangun fitur kolaborasi tim atau multi-seat sebelum ada keputusan eksplisit yang mengubah segmentasi pasar dari B2C individu ke B2B korporat.

---

*Akhir dokumen. PRD ini adalah living document, seluruh keputusan baru wajib diperbarui di sini sebelum kode ditulis.*
