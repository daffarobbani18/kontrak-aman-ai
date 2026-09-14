// ============================================================
// Data statis template pengantar profesional — KontrakAman AI
// F-NEGO-04 PRD.md — Could Have, konten statis (tidak ada API endpoint)
// Dikelola manual oleh tim konten
// Tiga nada sesuai persona PRD: santai, standar, tegas
// Placeholder {{NAMA_KLIEN}} dan {{NAMA_KAMU}} diganti di komponen
// ============================================================

export interface TemplatePengantar {
  id: string;
  label: string;
  deskripsi: string; // penjelasan singkat kapan cocok dipakai
  teks: string;      // teks template dengan placeholder
}

// Placeholder yang dipakai di semua template
export const PLACEHOLDER_NAMA_KLIEN = "{{NAMA_KLIEN}}";
export const PLACEHOLDER_NAMA_KAMU = "{{NAMA_KAMU}}";

// Isi placeholder dengan nilai aktual dari pengguna
export function isiPlaceholder(
  teks: string,
  namaKlien: string,
  namaKamu: string
): string {
  const klien = namaKlien.trim() || "Bapak/Ibu";
  const kamu = namaKamu.trim() || "saya";
  return teks
    .replace(new RegExp(PLACEHOLDER_NAMA_KLIEN, "g"), klien)
    .replace(new RegExp(PLACEHOLDER_NAMA_KAMU, "g"), kamu);
}

export const TEMPLATE_PENGANTAR: TemplatePengantar[] = [
  {
    id: "santai",
    label: "Santai & Kolaboratif",
    deskripsi: "Cocok untuk klien yang sudah kamu kenal atau hubungan kerja jangka panjang.",
    teks: `Halo {{NAMA_KLIEN}},

Terima kasih sudah mengirimkan draf kontraknya. Secara keseluruhan saya senang dengan arah kerja sama ini.

Ada beberapa poin yang ingin saya diskusikan bersama supaya kita bisa memulai proyek dengan landasan yang nyaman bagi kedua pihak. Saya sudah menyiapkan beberapa usulan revisi berikut ini.

Saya terbuka untuk mendiskusikan lebih lanjut jika ada yang perlu disesuaikan.

Terima kasih,
{{NAMA_KAMU}}`,
  },
  {
    id: "standar",
    label: "Profesional & Netral",
    deskripsi: "Cocok untuk klien korporat, tim legal, atau klien baru yang belum dikenal.",
    teks: `Yth. {{NAMA_KLIEN}},

Terima kasih atas pengiriman draf perjanjian kerja sama. Saya telah mempelajarinya dengan saksama.

Dalam rangka memastikan perjanjian ini dapat berjalan dengan baik bagi kedua belah pihak, saya ingin mengajukan beberapa usulan penyesuaian pada klausul berikut. Usulan ini dimaksudkan untuk menciptakan keseimbangan hak dan kewajiban yang lebih proporsional.

Mohon berkenan meninjau dan memberikan tanggapan Bapak/Ibu.

Hormat saya,
{{NAMA_KAMU}}`,
  },
  {
    id: "tegas",
    label: "Langsung & Jelas",
    deskripsi: "Cocok saat kamu perlu menetapkan batasan yang jelas sejak awal.",
    teks: `Halo {{NAMA_KLIEN}},

Terima kasih atas draf kontraknya. Sebelum saya dapat menyetujuinya, ada beberapa klausul yang perlu direvisi terlebih dahulu.

Saya melampirkan usulan perubahan spesifik di bawah ini. Revisi ini merupakan syarat saya untuk dapat melanjutkan kerja sama ini.

Silakan hubungi saya jika ingin mendiskusikan lebih lanjut.

Salam,
{{NAMA_KAMU}}`,
  },
];