import type { Metadata } from "next";
import KontenVerifikasiEmail from "@/features/autentikasi/components/konten-verifikasi-email";

export const metadata: Metadata = {
  title: "Verifikasi Email — KontrakAman AI",
  description: "Verifikasi alamat email akun KontrakAman AI milikmu.",
};

interface HalamanVerifikasiEmailProps {
  searchParams: Promise<{ token?: string }>;
}

// Server Component — baca token dari query param URL
// Token dikirim via link di email verifikasi (api.md 4.2)
export default async function HalamanVerifikasiEmail({
  searchParams,
}: HalamanVerifikasiEmailProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return <KontenVerifikasiEmail token={token} />;
}
