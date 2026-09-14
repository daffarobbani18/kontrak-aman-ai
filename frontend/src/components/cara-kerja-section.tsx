import { Upload, Cpu, MessageSquare } from "lucide-react";

// Cara kerja — 3 langkah sederhana yang mudah dipahami pemula
const langkah = [
  {
    nomor: "01",
    ikon: Upload,
    judul: "Unggah kontrakmu",
    deskripsi:
      "Foto kontrak pakai kamera ponselmu, atau unggah file PDF langsung. Format apapun yang kamu terima dari klien, kami terima.",
  },
  {
    nomor: "02",
    ikon: Cpu,
    judul: "AI menganalisis dalam hitungan detik",
    deskripsi:
      "Teknologi AI kami membaca setiap klausul dan mendeteksi pasal-pasal yang berpotensi merugikanmu. Selesai kurang dari 60 detik.",
  },
  {
    nomor: "03",
    ikon: MessageSquare,
    judul: "Negosiasikan dengan percaya diri",
    deskripsi:
      "Dapatkan draf kalimat negosiasi siap kirim ke klienmu. Tiga pilihan nada — dari sopan sampai tegas — sesuai situasimu.",
  },
];

export default function CaraKerjaSection() {
  return (
    <section id="cara-kerja" className="bg-[var(--jernih-on-surface)]/[0.02] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header section */}
        <div className="mb-12 text-center">
          <h2 className="text-headline-lg text-[var(--jernih-on-surface)]">
            Tiga langkah, satu menit
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body-lg text-[var(--jernih-neutral)]">
            Tidak perlu paham hukum. Tidak perlu pengacara. Cukup kamu dan kontrakmu.
          </p>
        </div>

        {/* Langkah-langkah */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {langkah.map((item) => {
            const Ikon = item.ikon;
            return (
              <div key={item.nomor} className="flex flex-col gap-4">
                {/* Nomor + ikon */}
                <div className="flex items-center gap-3">
                  <span
                    className="font-headline text-4xl font-bold leading-none text-[var(--jernih-primary)]/20"
                    aria-hidden="true"
                  >
                    {item.nomor}
                  </span>
                  <div className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-2">
                    <Ikon
                      className="h-5 w-5 text-[var(--jernih-primary)]"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Konten — kartu flat sesuai DESIGN.md, shadow none */}
                <div>
                  <h3 className="text-headline-md text-[var(--jernih-on-surface)]">{item.judul}</h3>
                  <p className="mt-2 text-body-md text-[var(--jernih-neutral)]">{item.deskripsi}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
