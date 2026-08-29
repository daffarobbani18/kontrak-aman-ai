// ============================================================
// SkeletonNegosiasi — loading state saat polling draf negosiasi
// DESIGN.md: flat, animate-pulse, tidak ada animasi berlebihan
// ============================================================

export function SkeletonNegosiasi() {
  return (
    <div
      className="animate-pulse space-y-4"
      aria-busy="true"
      aria-label="Membuat draf negosiasi..."
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="h-4 w-48 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
        <div className="h-3 w-64 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
      </div>

      {/* Tiga kartu versi draf */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-4 space-y-3"
        >
          <div className="h-4 w-40 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="h-3 w-full rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="h-3 w-3/4 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
          </div>
          <div className="h-8 w-24 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
        </div>
      ))}
    </div>
  );
}