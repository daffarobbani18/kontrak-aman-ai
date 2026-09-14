// ============================================================
// KartuKebijakanPrivasi — F-PRIV-01 PRD.md
// Info kebijakan privasi + link untuk ditinjau ulang
// Konten statis — tidak ada API endpoint
// DESIGN.md: flat, warna neutral, ikon Lucide
// ============================================================

import { Shield } from "lucide-react";

export function KartuKebijakanPrivasi() {
  return (
    <div
      className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6"
      aria-label="Informasi kebijakan privasi"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--jernih-radius-md)] bg-[var(--jernih-tertiary)]/10">
          <Shield
            className="h-5 w-5 text-[var(--jernih-tertiary)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-headline-md text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Kebijakan Privasi
          </h3>
          <p className="mt-1 text-body-md text-[var(--jernih-neutral)]">
            Kamu telah menyetujui kebijakan privasi KontrakAman AI saat mendaftar.
            Kebijakan ini mengatur bagaimana dokumen dan data pribadimu diproses
            sesuai UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.
          </p>
          <ul className="mt-3 space-y-1.5">
            {[
              "Dokumen kontrakmu hanya dapat diakses olehmu sendiri",
              "Data dienkripsi saat disimpan dan saat dikirim",
              "Dokumen dihapus otomatis sesuai kebijakan retensi (90 hari)",
              "Kamu bisa menghapus akun dan seluruh datamu kapan saja",
            ].map((poin) => (
              <li
                key={poin}
                className="flex items-start gap-2 text-body-md text-[var(--jernih-neutral)]"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--jernih-tertiary)]"
                  aria-hidden="true"
                />
                {poin}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}