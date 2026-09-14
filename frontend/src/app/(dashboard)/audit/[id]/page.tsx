import type { Metadata } from "next";
import KontenHasilAudit from "./konten-hasil-audit";

export const metadata: Metadata = {
  title: "Hasil Audit — KontrakAman AI",
  description: "Detail hasil audit klausul kontrak kerja freelance.",
};

// ============================================================
// Halaman detail hasil audit — F-DASH-02 PRD
// Route: /audit/[id] — id adalah audit_id (aud_xxx) dari api.md 7.2
// Server Component tipis, logika UI ada di KontenHasilAudit (Client Component)
// ============================================================
export default async function HalamanHasilAudit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KontenHasilAudit auditId={id} />;
}
