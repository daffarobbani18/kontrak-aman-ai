// ============================================================
// KartuInfoProfil — tampilan info profil: avatar, nama, email, tier
// Data dari GET /pengguna/saya (api.md 5.1) via useProfil hook
// DESIGN.md: kartu flat, badge tier, Avatar inisial
// ============================================================

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { DataProfilPengguna } from "@/features/dashboard/types";

interface PropKartuInfoProfil {
  profil: DataProfilPengguna;
}

const KONFIGURASI_TIER: Record<
  string,
  { label: string; kelasWarna: string }
> = {
  gratis: {
    label: "Tier Gratis",
    kelasWarna: "bg-[var(--jernih-neutral)]/10 text-[var(--jernih-neutral)] border-[var(--jernih-neutral)]/30",
  },
  pro: {
    label: "Tier Pro",
    // secondary (slate) bukan primary — primary hanya untuk satu aksi terpenting per layar (DESIGN.md)
    kelasWarna:
      "bg-[var(--jernih-secondary)]/10 text-[var(--jernih-secondary)] border-[var(--jernih-secondary)]/30",
  },
  bisnis: {
    label: "Tier Bisnis",
    // tertiary (teal) untuk aksen informasional non-kritikal (DESIGN.md)
    kelasWarna:
      "bg-[var(--jernih-tertiary)]/10 text-[var(--jernih-tertiary)] border-[var(--jernih-tertiary)]/30",
  },
};

function inisialNama(namaLengkap: string): string {
  return namaLengkap
    .split(" ")
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("");
}

export function KartuInfoProfil({ profil }: PropKartuInfoProfil) {
  const konfigTier = KONFIGURASI_TIER[profil.tier] ?? KONFIGURASI_TIER.gratis;

  return (
    <div
      className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6"
      aria-label="Informasi profil"
    >
      <div className="flex items-center gap-4">
        {/* Avatar inisial */}
        <Avatar className="h-16 w-16 shrink-0">
          <AvatarFallback className="bg-[var(--jernih-primary)]/10 text-headline-md font-bold text-[var(--jernih-primary)]">
            {inisialNama(profil.nama_lengkap)}
          </AvatarFallback>
        </Avatar>

        {/* Info teks */}
        <div className="min-w-0">
          <h2
            className="truncate text-headline-md text-[var(--jernih-on-surface)]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {profil.nama_lengkap}
          </h2>
          <p className="mt-0.5 truncate text-body-md text-[var(--jernih-neutral)]">
            {profil.email}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Badge tier */}
            <span
              className={`rounded-[var(--jernih-radius-sm)] border px-2 py-0.5 text-label-sm font-medium ${
                konfigTier.kelasWarna
              }`}
            >
              {konfigTier.label}
            </span>
            {/* Status verifikasi email */}
            {!profil.email_terverifikasi && (
              <span className="rounded-[var(--jernih-radius-sm)] border border-[var(--jernih-warning)]/30 bg-[var(--jernih-warning)]/10 px-2 py-0.5 text-label-sm font-medium text-[var(--jernih-warning)]">
                Email belum diverifikasi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info kuota */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--jernih-neutral)]/10 pt-5">
        <div>
          <p className="text-label-sm text-[var(--jernih-neutral)]">Audit digunakan</p>
          <p className="mt-0.5 text-body-md font-medium text-[var(--jernih-on-surface)]">
            {profil.kuota.audit.batas === null
              ? `${profil.kuota.audit.digunakan} (tidak terbatas)`
              : `${profil.kuota.audit.digunakan} / ${profil.kuota.audit.batas}`}
          </p>
        </div>
        <div>
          <p className="text-label-sm text-[var(--jernih-neutral)]">Negosiasi digunakan</p>
          <p className="mt-0.5 text-body-md font-medium text-[var(--jernih-on-surface)]">
            {profil.kuota.negosiasi.batas === null
              ? `${profil.kuota.negosiasi.digunakan} (tidak terbatas)`
              : `${profil.kuota.negosiasi.digunakan} / ${profil.kuota.negosiasi.batas}`}
          </p>
        </div>
      </div>
    </div>
  );
}