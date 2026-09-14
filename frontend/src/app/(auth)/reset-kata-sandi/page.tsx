import type { Metadata } from "next";
import FormResetKataSandi from "@/features/autentikasi/components/form-reset-kata-sandi";

export const metadata: Metadata = {
  title: "Reset Kata Sandi — KontrakAman AI",
  description: "Buat kata sandi baru untuk akun KontrakAman AI milikmu.",
};

interface HalamanResetKataSandiProps {
  searchParams: Promise<{ token?: string }>;
}

// Server Component — baca token dari query param URL
// Token dikirim via link di email, berlaku 1 jam (api.md 4.8)
export default async function HalamanResetKataSandi({ searchParams }: HalamanResetKataSandiProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return <FormResetKataSandi token={token} />;
}
