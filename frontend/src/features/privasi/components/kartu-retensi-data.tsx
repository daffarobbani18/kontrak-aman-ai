// ============================================================
// KartuRetensiData — F-PRIV-02 PRD.md
// Info kebijakan retensi dokumen — konten statis + informatif
// Catatan: nilai "90 hari" mengikuti kebijakan yang ditetapkan di
// halaman kebijakan privasi (/privasi) dan api.md Bagian 5.4.
// Jika kebijakan retensi berubah, perbarui juga konten di:
//   - halaman /privasi (app/privasi/page.tsx, seksi retensi-data)
//   - kartu ini
// DESIGN.md: flat, warna neutral/warning, ikon Lucide
// ============================================================

import { Clock } from "lucide-react";

export function KartuRetensiData() {
  return (
    <div
      className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6"
      aria-label="Informasi kebijakan retensi data"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-warning)]/10">
          <Clock
            className="h-5 w-5 text-[var(--jernih-warning)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-headline-md text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Retensi Data Dokumen
          </h3>
          <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
            Dokumen kontrak yang kamu unggah disimpan selama{" "}
            <strong className="font-medium text-[var(--jernih-on-surface)]">
              90 hari
            </strong>{" "}
            sejak tanggal pengunggahan. Setelah melewati batas ini, dokumen
            dihapus otomatis beserta seluruh data auditnya.
          </p>
          <div className="mt-4 space-y-2">
            {[
              {
                label: "Periode retensi",
                nilai: "90 hari sejak tanggal unggah",
              },
              {
                label: "Yang dihapus otomatis",
                nilai: "Dokumen, hasil audit, dan draf negosiasi terkait",
              },
              {
                label: "Notifikasi",
                nilai: "Email dikirim sebelum penghapusan otomatis terjadi",
              },
              {
                label: "Hapus lebih awal",
                nilai: "Kamu bisa menghapus dokumen kapan saja dari halaman riwayat",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-0.5 sm:flex-row sm:gap-2"
              >
                <span className="w-full shrink-0 text-label-sm font-medium text-[var(--jernih-on-surface)] sm:w-40">
                  {item.label}
                </span>
                <span className="text-label-sm text-[var(--jernih-neutral)]">
                  {item.nilai}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}