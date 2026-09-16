// ============================================================
// Service privasi — KontrakAman AI
// F-PRIV-03: POST /pengguna/saya/ekspor-data (api.md 5.5)
//            GET  /pengguna/saya/ekspor-data/status (api.md 5.6)
// F-PRIV-04: DELETE /pengguna/saya (api.md 5.4) — hapus akun
// ============================================================

import { permintaanAPI, apiClient } from "@/lib/api-client";
import type {
  ResponsHapusAkun,
  ResponsAjukanEkspor,
  ResponsStatusEkspor,
} from "../types";
import type { ResponsAPI } from "@/features/autentikasi/types";

// ------------------------------------------------------------
// DELETE /pengguna/saya — api.md 5.4
// Soft delete: akun + data dihapus permanen 30 hari kemudian
// ------------------------------------------------------------
export async function hapusAkun(
  konfirmasi: string,
  kataSandi: string
): Promise<ResponsAPI<ResponsHapusAkun>> {
  // DELETE /pengguna/saya membutuhkan body — gunakan permintaanAPI langsung
  // karena apiClient.delete tidak mendukung body (api.md 5.4)
  return permintaanAPI<ResponsHapusAkun>("/pengguna/saya", {
    method: "DELETE",
    body: { konfirmasi, kata_sandi: kataSandi },
    butuhAuth: true,
  });
}

// ============================================================
// ajukanEksporData — POST /pengguna/saya/ekspor-data (api.md 5.5)
// Mengajukan permintaan ekspor seluruh data pribadi pengguna.
// Backend menyiapkan berkas dan mengirim tautan unduhan ke email.
// Mendukung hak subjek data sesuai UU Pelindungan Data Pribadi.
// ============================================================
export async function ajukanEksporData(): Promise<
  ResponsAPI<ResponsAjukanEkspor>
> {
  return permintaanAPI<ResponsAjukanEkspor>("/pengguna/saya/ekspor-data", {
    method: "POST",
    butuhAuth: true,
  });
}

// ============================================================
// ambilStatusEkspor — GET /pengguna/saya/ekspor-data/status (api.md 5.6)
// Mengecek status permintaan ekspor data yang sedang diproses.
// status: "memproses" | "selesai" | "tidak_ada"
// ============================================================
export async function ambilStatusEkspor(): Promise<
  ResponsAPI<ResponsStatusEkspor>
> {
  // apiClient.get<T> sudah mengembalikan ResponsAPI<T> — tidak perlu cast tambahan
  return apiClient.get<ResponsStatusEkspor>("/pengguna/saya/ekspor-data/status");
}
