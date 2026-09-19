---
name: Jernih Design System
description: Sistem desain KontrakAman AI. Minimalism sebagai fondasi, neo-brutalism yang dijaga ketat sebagai aksen di elemen aksi dan status risiko, bento grid sebagai pola tata letak Dashboard.
colors:
  primary: "#4F46E5"
  primary-hover: "#4338CA"
  secondary: "#334155"
  tertiary: "#0D9488"
  neutral: "#71717A"
  surface: "#FAFAF9"
  on-surface: "#18181B"
  success: "#16A34A"
  warning: "#D97706"
  error: "#DC2626"
colors-dark:
  primary: "#818CF8"
  primary-hover: "#A5B4FC"
  secondary: "#94A3B8"
  tertiary: "#2DD4BF"
  neutral: "#A1A1AA"
  surface: "#18181B"
  on-surface: "#FAFAFA"
  success: "#4ADE80"
  warning: "#FBBF24"
  error: "#F87171"
typography:
  headline-lg: "Space Grotesk, 32px/40px, 700 (judul halaman, angka skor risiko besar)"
  headline-md: "Space Grotesk, 22px/28px, 600 (judul kartu, judul section)"
  body-lg: "Inter, 16px/26px, 400 (kutipan klausul kontrak, teks yang dibaca lama)"
  body-md: "Inter, 14px/22px, 400 (teks UI standar, deskripsi, label form)"
  label-sm: "Inter, 12px/16px, 500 (badge, metadata, caption)"
radius:
  sm: "4px"
  md: "8px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary: "bg primary, teks surface, border 2px solid on-surface, radius md, shadow offset keras 4px 4px 0 on-surface (tanpa blur, ciri neo-brutalism)"
  button-primary-hover: "translate -2px -2px, shadow membesar jadi 6px 6px 0 on-surface"
  button-primary-active: "translate 2px 2px, shadow hilang jadi 0px 0px 0 on-surface (efek tombol ditekan)"
  card: "bg surface, border 1px solid neutral pada opacity 20 persen, radius lg, shadow none (flat, prioritas keterbacaan konten panjang)"
  input: "border 1px solid neutral, radius sm, on-focus border 2px solid primary"
  input-error: "border 2px solid error, pesan error di bawah field pakai label-sm warna error"
  badge-risiko-hijau: "bg success opacity 10 persen, teks success, border 1px solid success, radius sm"
  badge-risiko-kuning: "bg warning opacity 10 persen, teks warning, border 1px solid warning, radius sm"
  badge-risiko-merah: "bg error opacity 10 persen, teks error, border 1px solid error, radius sm"
---

# Jernih: Design System KontrakAman AI

### Ringkasan

KontrakAman AI terasa seperti teman yang jujur dan berpihak pada pengguna, bukan seperti firma hukum yang dingin atau aplikasi korporat yang kaku. Nada visual dibagi dua konteks: tenang saat pengguna membaca (area kontrak dan penjelasan klausul), tegas dan percaya diri saat pengguna mengambil keputusan (skor risiko, tombol aksi, draf negosiasi). Target emosi: pengguna merasa akhirnya ada pihak yang berpihak dan menjelaskan situasinya dengan jujur, bukan merasa makin terintimidasi seperti saat membaca dokumen hukum asli. Kalau ada keputusan desain yang belum diatur eksplisit di tempat lain, defaultkan ke prinsip ini: sederhanakan tampilan, jangan hias berlebihan, dan jujur soal risiko. Skor Merah tidak boleh dihaluskan supaya terlihat baik-baik saja.

### Alasan Pemilihan Gaya Visual

Gaya yang dipilih adalah kombinasi dua gaya sesuai batas maksimal di aturan kerja, **Minimalism/Flat Design sebagai fondasi**, dan **Neo-brutalism yang dijaga ketat (disciplined, bukan chaotic)** khusus untuk elemen aksi dan status risiko. Bento grid dipakai sebagai pola tata letak Dashboard, tapi diperlakukan sebagai pola grid, bukan gaya visual ketiga yang bersaing, karena sifatnya soal penataan ruang, bukan bahasa warna/border/shadow.

Perbandingan gaya lain yang diriset dan alasan tidak dipakai:

- **Glassmorphism** (contoh nyata: dashboard cuaca dan musik, sistem notifikasi iOS/Android). Riset menunjukkan permukaan translusen secara struktural rawan gagal rasio kontras 4.5:1 saat teks berada di atas latar yang berubah-ubah, dan butuh solusi tambahan seperti overlay semi-opaque dan fallback solid untuk aman dipakai. Untuk domain yang isinya kutipan klausul hukum yang harus terbaca jelas, risiko tambahan ini tidak sepadan dengan nilai estetikanya.
- **Neumorphism/Soft UI** (contoh: sejumlah aplikasi kesehatan dan smart home). Ditolak total. Riset menegaskan neumorphism secara sengaja menghilangkan kontras dengan membuat elemen interaktif sewarna dengan latarnya, cuma dibedakan bayangan lembut, sehingga bertentangan langsung dengan syarat WCAG AA di aturan kerja. Tidak masuk akal dipakai untuk produk yang isinya keputusan berisiko finansial dan hukum bagi pengguna.
- **Skeuomorphism** (contoh: era awal iOS sebelum iOS 7). Ditolak, gaya ini berat secara visual dan terasa usang untuk SaaS 2026, menambah dekorasi yang justru berlawanan dengan misi produk menyederhanakan dokumen hukum yang rumit.
- **Material Design** (contoh: mayoritas aplikasi Android, Google Workspace). Dipertimbangkan karena sistem elevation-nya rapi untuk hierarki kartu, tapi tidak dipilih sebagai sistem utuh karena terasa generik dan kurang membangun identitas visual yang khas untuk brand konsumer Indonesia yang ingin terasa personal.
- **Bento grid**: tetap dipakai, tapi sebagai pola tata letak Dashboard (lihat bagian Breakpoint Responsif), bukan gaya visual yang berdiri sendiri.

Alasan kombinasi Minimalism dan Neo-brutalism dipilih:

1. **Kecocokan dengan misi produk.** KontrakAman AI menerjemahkan bahasa hukum rumit jadi jelas. Minimalism sebagai fondasi memastikan tampilan tidak menambah beban kognitif saat pengguna membaca kutipan klausul yang sudah berat isinya.
2. **Kecocokan dengan kepribadian brand.** KontrakAman AI memposisikan diri sebagai pembela pekerja gig menghadapi ketimpangan kuasa kontrak. Riset menyebut neo-brutalism terasa jujur dan percaya diri karena tidak bersembunyi di balik polesan visual, sejalan dengan produk yang blak-blakan menyebut pasal karet apa adanya.
3. **Kecocokan dengan target pengguna.** Ketiga persona di PRD.md, desainer grafis, programmer, dan penulis lepas, adalah pekerja kreatif dan teknis muda yang akrab dengan estetika digital kontemporer, bukan pengguna korporat yang mengharapkan tampilan aplikasi bank tradisional.
4. **Batasan yang dijaga ketat.** Riset eksplisit memperingatkan neo-brutalism penuh kurang cocok untuk industri yang butuh terasa aman, termasuk konteks legal. Karena itu neo-brutalism DIBATASI hanya untuk elemen aksi (tombol, badge risiko, CTA), dengan sudut yang tetap sedikit membulat, bukan sudut tajam 0px, mengikuti pendekatan soft brutalism yang lebih ramah. Area yang berisi teks kontrak dan penjelasan panjang tetap murni minimalism, flat, tanpa border tebal atau shadow keras, supaya tidak mengganggu keterbacaan dan tidak terasa terlalu ringan untuk konteks yang serius secara finansial dan hukum.

### Warna

- **primary (indigo)**: dipakai hanya untuk satu aksi terpenting per layar (submit, unggah kontrak, buat draf negosiasi). Melambangkan kepercayaan tanpa terasa seperti biru korporat generik.
- **secondary (slate gelap)**: aksi sekunder dan navigasi, elemen pendukung yang sengaja tidak menonjol.
- **tertiary (teal)**: aksen informasional dan ilustrasi non-kritikal, dipakai jarang, misalnya ikon fitur edukasi.
- **neutral**: teks sekunder, border, placeholder.
- **surface dan on-surface**: latar utama hangat, bukan putih steril, memberi kesan approachable, bukan klinis seperti aplikasi bank.
- **success, warning, error**: dipakai untuk status sistem umum (form berhasil atau gagal) dan sengaja memakai keluarga warna yang sama dengan skor risiko Hijau/Kuning/Merah di PRD.md, karena maknanya memang selaras (baik, waspada, bahaya). Kuning murni ditolak karena secara umum gagal rasio kontras 4.5:1 di atas latar terang, dipakai turunan amber yang lebih gelap supaya tetap accessible sekaligus tetap terbaca sebagai peringatan.
- **Aturan eksplisit**: warna risiko (success, warning, error) TIDAK PERNAH dipakai untuk elemen dekoratif atau tombol biasa. Begitu warna ini muncul di layar, artinya harus benar-benar tentang status risiko, supaya maknanya tidak pernah ambigu bagi pengguna.

### Tipografi

Space Grotesk dipakai terbatas untuk headline (judul halaman, angka skor risiko besar). Karakter geometrisnya yang sedikit tidak biasa cocok untuk brand teknologi yang ingin terasa berani dan tidak generik, tapi berisiko kalau dipakai di teks panjang karena proporsinya agak rapat. Inter dipakai untuk seluruh body text dan UI, pasangan yang dianggap paling aman untuk Space Grotesk karena x-height tinggi dan sangat legible di ukuran kecil, penting karena pengguna banyak membaca kutipan klausul kontrak yang padat. Skala: headline-lg untuk judul halaman dan skor risiko, headline-md untuk judul kartu dan section, body-lg untuk kutipan klausul kontrak yang butuh baris lebih lapang, body-md untuk teks UI standar, label-sm untuk badge dan metadata.

### Motion dan Animasi

- **Prinsip:** durasi 150 sampai 200 milidetik untuk micro-interaction (hover, tap), 250 sampai 300 milidetik untuk transisi masuk-keluar komponen (modal, dialog, transisi halaman). Easing ease-out untuk elemen masuk, ease-in untuk elemen keluar, konsisten di seluruh produk. Animasi selalu memberi umpan balik atas aksi pengguna, bukan sekadar dekorasi.
- **Transisi:** Motion (`motion/react`) menangani seluruh transisi masuk-keluar, hover, dan gestur, termasuk efek translate dan shadow tombol primary yang didefinisikan di token components lewat `whileHover` dan `whileTap`.
- **Micro-interaction Magic UI:** shimmer button dipakai spesifik saat status sedang menganalisis (job audit asinkron berjalan, lihat PRD.md Alur Kritikal 1), animated list dipakai di panel notifikasi.
- **Animasi vektor kompleks (dotLottie, format .lottie):** dipakai hanya di momen yang benar-benar bermakna, ilustrasi onboarding pemilihan profesi, empty state belum ada kontrak diaudit, dan hasil akhir audit selesai dengan variasi ekspresi berbeda untuk skor Hijau dibanding Merah. Bukan untuk spinner loading biasa, itu cukup CSS atau Motion.
- **Aksesibilitas gerakan:** wajib hormati `prefers-reduced-motion`, matikan animasi masuk berskala besar (translate, scale) untuk pengguna yang mengaktifkan preferensi ini, ganti dengan fade sederhana atau langsung tampil. Jangan animasikan teks hasil audit atau kutipan klausul dengan gerakan besar saat pertama muncul, itu menunda keterbacaan konten yang justru paling penting dibaca cepat.

### Mode Gelap

Token warna terpisah didefinisikan di `colors-dark` pada Lapisan 1. Prinsip: warna semantik (primary, success, warning, error) dinaikkan tingkat kecerahannya, bukan sekadar invert warna terang, supaya tetap mencapai rasio kontras 4.5:1 di atas latar gelap. Latar gelap memakai abu-abu sangat gelap hangat, bukan hitam pekat murni, supaya tidak terlalu keras di mata untuk sesi membaca kontrak yang panjang. Badge risiko di mode gelap tetap memakai logika yang sama, latar opacity rendah dari warna semantik dengan border solid dan teks warna semantik. Rasio kontras kedua mode diverifikasi terpisah, tidak boleh diasumsikan otomatis lolos hanya karena mode terang sudah lolos.

### Breakpoint Responsif

- **mobile:** di bawah 640px, jadi acuan dasar karena mayoritas pekerja gig mengunggah kontrak lewat ponsel (lihat PRD.md Bagian 5).
- **tablet:** 640px sampai 1024px.
- **desktop:** di atas 1024px.

Prinsip adaptasi mobile-first. Bento grid Dashboard jadi satu kolom bertumpuk penuh di mobile, urutan tumpukan mengikuti prioritas informasi, dua kolom di tablet, dan tata letak bento penuh (kombinasi tile besar dan kecil) di desktop. Halaman berisi konten kontrak dan hasil audit tetap satu kolom di semua ukuran layar, dokumen hukum panjang tidak cocok dipecah jadi grid.

### Pustaka Komponen dan Alasannya

Konfirmasi tumpukan dari AGENTS.md: shadcn/ui sebagai fondasi komponen yang di-copy jadi milik proyek, Motion untuk animasi transisi dan gestur, Magic UI untuk komponen animasi siap pakai lewat registry shadcn, 21st.dev sebagai referensi visual tambahan manual, dotLottie untuk animasi vektor kompleks. Tumpukan ini tidak menyimpang dari default karena dua alasan. Ant Design dan MUI cocok untuk admin panel data berat, sementara KontrakAman AI adalah produk konsumer dengan interaksi terbatas (unggah, baca hasil, edit draf), bukan tabel data kompleks bergaya enterprise. Chakra UI dan daisyUI lebih ringan tapi kurang leluasa untuk kustomisasi visual sedalam yang dibutuhkan kombinasi minimalism dan neo-brutalism di atas, sementara model shadcn yang meng-copy kode langsung ke proyek justru paling cocok untuk sistem token custom seperti ini.

### Do's and Don'ts

1. Jangan campur sudut tajam dan sudut membulat di satu tampilan yang sama. Konsisten pakai radius-lg untuk kartu, radius-sm atau radius-md untuk elemen kecil.
2. Warna primary hanya untuk satu aksi terpenting per layar. Jangan warnai banyak tombol dengan primary sekaligus, itu menghilangkan hierarki.
3. Warna risiko (hijau, kuning, merah) eksklusif untuk skor risiko dan badge terkait. Jangan pakai untuk elemen dekoratif atau tombol biasa.
4. Jangan lebih dari dua font family dalam satu tampilan (Space Grotesk untuk headline, Inter untuk sisanya), dan jangan lebih dari tiga font weight berbeda dalam satu layar.
5. Shadow offset keras ala neo-brutalism hanya untuk elemen interaktif seperti tombol dan CTA card di Dashboard. Kartu berisi teks kontrak atau penjelasan panjang tetap flat, jangan pakai shadow keras di situ.
6. Jangan pernah pakai dotLottie untuk spinner loading sederhana, itu tugas Motion atau CSS. dotLottie cuma untuk momen bermakna.
7. Hormati `prefers-reduced-motion` di semua komponen animasi, tanpa terkecuali.
8. Jangan pakai glassmorphism atau efek blur transparan di mana pun teks penting ditampilkan, terutama hasil audit dan kutipan klausul kontrak.

### Ikonografi

Lucide, bawaan default shadcn/ui, gaya garis atau outline dengan stroke width 1.5 sampai 2px. Ukuran 16px untuk ikon inline di dalam teks atau label, 20px untuk ikon standar di tombol dan navigasi, 24px untuk ikon penekanan di empty state atau header section. Gaya outline dipilih konsisten dengan fondasi minimalism, ikon filled atau solid dihindari kecuali untuk menandai status aktif atau terpilih, misalnya tab navigasi yang sedang dibuka.

---

*Nilai kontras di Lapisan 1 dipilih dari palet yang umum terdokumentasi mendekati atau melewati ambang 4.5 banding 1, tapi tetap wajib diverifikasi ulang dengan contrast checker (atau tooling `npx @google/design.md lint` kalau dipakai di CI) sebelum dikunci final, terutama kombinasi warna dark mode yang baru didefinisikan di dokumen ini.*
