// ============================================================
// Helper test — mock apiClient di boundary (@/lib/api-client)
// Dipakai via vi.mock di tiap file test:
//
// vi.mock("@/lib/api-client", async (importOriginal) => ({
//   ...(await importOriginal<typeof import("@/lib/api-client")>()),
//   apiClient: buatApiClientMock(),
// }));
// ============================================================

import { vi } from "vitest";

// Hapus apiClient dari modul asli lalu ganti dengan stub vi.fn()
export function buatApiClientMock(): Record<
  "get" | "post" | "patch" | "delete" | "postForm",
  ReturnType<typeof vi.fn>
> {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    postForm: vi.fn(),
  };
}
