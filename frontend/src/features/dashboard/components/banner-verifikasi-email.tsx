import { Mail, X } from "lucide-react";

// ============================================================
// BannerVerifikasiEmail — peringatan email belum diverifikasi
// Sesuai F-AUTH-04 PRD — pengguna belum verifikasi tetap bisa
// login tapi mendapat peringatan sebelum mengunggah kontrak
// ============================================================
interface PropBannerVerifikasiEmail {
  email: string;
  onTutup?: () => void;
}

export default function BannerVerifikasiEmail({ email, onTutup }: PropBannerVerifikasiEmail) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-4 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-warning)]/30 bg-[color-mix(in_srgb,var(--jernih-warning)_8%,transparent)] px-4 py-3"
    >
      <div className="flex items-start gap-3">
        <Mail
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--jernih-warning)]"
          strokeWidth={2}
          aria-hidden="true"
        />
        <div>
          <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
            Verifikasi emailmu untuk mulai mengaudit
          </p>
          <p className="mt-0.5 text-body-md text-[var(--jernih-neutral)]">
            Kami mengirim tautan verifikasi ke{" "}
            <span className="font-medium text-[var(--jernih-on-surface)]">{email}</span>. Cek kotak
            masuk atau folder spam.
          </p>
        </div>
      </div>

      {onTutup && (
        <button
          type="button"
          onClick={onTutup}
          className="shrink-0 text-[var(--jernih-neutral)] hover:text-[var(--jernih-on-surface)]"
          aria-label="Tutup banner verifikasi email"
        >
          <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
