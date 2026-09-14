import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BarisKontrak from "@/features/dashboard/components/baris-kontrak";
import EmptyStateKontrak from "@/features/dashboard/components/empty-state-kontrak";
import type { ItemDokumenKontrak } from "@/features/dashboard/types";

// ============================================================
// KartuKontrakTerbaru — tile daftar kontrak di dashboard
// Data dari GET /dokumen-kontrak (api.md 6.2)
// Sesuai F-DASH-01 dan F-DOC-03 PRD
// ============================================================
interface PropKartuKontrakTerbaru {
  dokumen: ItemDokumenKontrak[];
  totalDokumen: number;
}

export default function KartuKontrakTerbaru({ dokumen, totalDokumen }: PropKartuKontrakTerbaru) {
  return (
    <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-headline-md text-[var(--jernih-on-surface)]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Kontrak Terbaru
        </h2>
        {totalDokumen > 5 && (
          <Link
            href="/riwayat"
            className="flex items-center gap-1 text-body-md text-[var(--jernih-primary)] hover:underline"
          >
            Lihat semua
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* Daftar atau empty state */}
      {dokumen.length === 0 ? (
        <EmptyStateKontrak />
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {dokumen.slice(0, 5).map((dok) => (
            <BarisKontrak key={dok.id} dokumen={dok} />
          ))}
        </div>
      )}
    </div>
  );
}
