// ============================================================
// SkeletonRiwayat — loading state halaman riwayat kontrak
// DESIGN.md: flat, animate-pulse, tidak ada animasi berlebihan
// ============================================================

export function SkeletonRiwayat() {
  return (
    <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Memuat riwayat kontrak...">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-4"
        >
          {/* Ikon */}
          <div className="h-9 w-9 shrink-0 rounded-[var(--jernih-radius-md)] bg-[var(--jernih-neutral)]/10" />

          {/* Info */}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="h-3 w-1/3 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
          </div>

          {/* Badge */}
          <div className="h-5 w-20 shrink-0 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
        </div>
      ))}
    </div>
  );
}