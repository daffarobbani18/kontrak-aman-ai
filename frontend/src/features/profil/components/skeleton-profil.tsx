// ============================================================
// SkeletonProfil — loading state halaman profil
// DESIGN.md: flat, animate-pulse
// ============================================================

export function SkeletonProfil() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Memuat profil...">
      {/* Skeleton kartu info */}
      <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-full bg-[var(--jernih-neutral)]/10" />
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="h-4 w-48 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="h-4 w-20 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
          </div>
        </div>
      </div>

      {/* Skeleton form edit */}
      <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6 space-y-4">
        <div className="h-6 w-32 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
        <div className="space-y-2">
          <div className="h-4 w-24 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
          <div className="h-10 w-full rounded-[var(--jernih-radius-md)] bg-[var(--jernih-neutral)]/10" />
        </div>
        <div className="h-10 w-28 rounded-[var(--jernih-radius-md)] bg-[var(--jernih-neutral)]/10" />
      </div>

      {/* Skeleton form kata sandi */}
      <div className="rounded-[var(--jernih-radius-lg)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)] p-6 space-y-4">
        <div className="h-6 w-40 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 rounded-[var(--jernih-radius-sm)] bg-[var(--jernih-neutral)]/10" />
            <div className="h-10 w-full rounded-[var(--jernih-radius-md)] bg-[var(--jernih-neutral)]/10" />
          </div>
        ))}
        <div className="h-10 w-36 rounded-[var(--jernih-radius-md)] bg-[var(--jernih-neutral)]/10" />
      </div>
    </div>
  );
}