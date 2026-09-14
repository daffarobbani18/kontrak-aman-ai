// ============================================================
// SkeletonHasilAudit — loading state halaman hasil audit
// Sesuai DESIGN.md: flat, tidak ada animasi berlebihan
// ============================================================

export function SkeletonHasilAudit() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Memuat hasil audit...">
      {/* Skeleton kartu skor risiko */}
      <div className="rounded-[var(--jernih-radius-lg)] border-2 border-[var(--jernih-neutral)]/15 p-6">
        <div className="flex gap-4">
          <div className="h-14 w-14 shrink-0 rounded-[var(--jernih-radius-lg)] bg-[var(--jernih-neutral)]/10" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-32 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="h-7 w-48 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="h-4 w-full rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="h-4 w-3/4 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
          </div>
        </div>
      </div>

      {/* Skeleton statistik */}
      <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 p-5">
        <div className="mb-4 h-6 w-40 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/10 bg-[var(--jernih-neutral)]/5 p-4"
            >
              <div className="h-8 w-8 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
              <div className="h-3 w-20 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton daftar klausul */}
      <div className="space-y-3">
        <div className="mb-4 h-6 w-36 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 border-l-4 border-l-[var(--jernih-neutral)]/20 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-24 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
              <div className="h-5 flex-1 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
              <div className="h-4 w-4 rounded-full bg-[var(--jernih-neutral)]/10" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton disclaimer */}
      <div className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/15 bg-[var(--jernih-neutral)]/5 p-4">
        <div className="flex gap-3">
          <div className="h-4 w-4 shrink-0 rounded-full bg-[var(--jernih-neutral)]/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-full rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="h-3 w-2/3 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
          </div>
        </div>
      </div>
    </div>
  );
}