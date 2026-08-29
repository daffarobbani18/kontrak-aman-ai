// ============================================================
// Tipe data langganan — KontrakAman AI
// Selaras dengan api.md Bagian 9 (GET/POST /langganan/*)
// Mencakup: paket harga, langganan aktif, transaksi, pembayaran
// ============================================================

// ============================================================
// Tipe paket harga — api.md 9.1
// ============================================================
export type IdPaket = "pkg_gratis" | "pkg_pro" | "pkg_bisnis";
export type Periode = "bulanan" | "tahunan";

export interface FiturPaket {
  audit_per_bulan: number | null; // null = dikonfigurasi via env, -1 = tidak terbatas
  negosiasi_per_bulan: number | null;
  keterangan_kuota: string;
}

export interface PaketHarga {
  id: IdPaket;
  nama: string;
  harga_bulanan: number;
  mata_uang: string;
  fitur: FiturPaket;
}

// ============================================================
// Tipe sesi pembayaran Mayar — api.md 9.2
// Frontend hanya menerima url_checkout lalu redirect
// Tidak ada SDK Mayar di frontend
// ============================================================
export interface ResponsBuatSesiPembayaran {
  sesi_id: string;
  url_checkout: string; // URL halaman checkout Mayar — redirect ke sini
  kedaluwarsa_pada: string;
}

// ============================================================
// Tipe langganan aktif — api.md 9.3
// ============================================================
export type StatusLangganan = "aktif" | "dibatalkan" | "kedaluwarsa";

export interface LanggananAktif {
  id: string;
  tier: string;
  status: StatusLangganan;
  periode: Periode;
  harga: number;
  mata_uang: string;
  aktif_sejak: string;
  aktif_hingga: string;
  perbarui_otomatis: boolean;
  mayar_subscription_id: string;
}

// ============================================================
// Tipe hasil batalkan — api.md 9.4
// ============================================================
export interface HasilBatalkanLangganan {
  aktif_hingga: string;
  perbarui_otomatis: false;
}

// ============================================================
// Tipe transaksi — api.md 9.5
// ============================================================
export type StatusTransaksi = "berhasil" | "gagal" | "menunggu";
export type JenisTransaksi =
  | "langganan_baru"
  | "perpanjangan"
  | "upgrade"
  | "refund";

export interface ItemTransaksi {
  id: string;
  jenis: JenisTransaksi;
  jumlah: number;
  mata_uang: string;
  status: StatusTransaksi;
  paket: string;
  periode: string;
  dibayar_pada: string;
  mayar_payment_id: string;
}

// ============================================================
// State machine hooks
// ============================================================

// use-paket-harga
export type StatusMuatPaket = "idle" | "memuat" | "selesai" | "gagal";
export interface StatePaketHarga {
  status: StatusMuatPaket;
  paket: PaketHarga[];
  pesanError: string | null;
}

// use-langganan-aktif
export type StatusMuatLangganan = "idle" | "memuat" | "selesai" | "gagal";
export interface StateLanggananAktif {
  status: StatusMuatLangganan;
  data: LanggananAktif | null; // null = tidak ada langganan aktif (tier gratis)
  pesanError: string | null;
}

// use-buat-sesi-pembayaran
export type StatusBuatSesi = "idle" | "memproses" | "gagal";
export interface StateBuatSesiPembayaran {
  status: StatusBuatSesi;
  // ID paket yang sedang diproses — untuk disable tombol spesifik
  paketIdDiproses: IdPaket | null;
  pesanError: string | null;
}

// use-batalkan-langganan
export type StatusBatalkan =
  | "idle"
  | "mengkonfirmasi"
  | "membatalkan"
  | "selesai"
  | "gagal";
export interface StateBatalkanLangganan {
  status: StatusBatalkan;
  pesanError: string | null;
  aktifHingga: string | null; // dari respons batalkan — tampil di dialog
}

// use-riwayat-transaksi
export type StatusMuatTransaksi =
  | "idle"
  | "memuat"
  | "memuat-lebih"
  | "selesai"
  | "gagal";
export interface StateRiwayatTransaksi {
  status: StatusMuatTransaksi;
  transaksi: ItemTransaksi[];
  paginasi: { cursor_berikutnya: string | null; ada_lagi: boolean; total: number } | null;
  pesanError: string | null;
  sedangMemuatLebih: boolean; // helper eksplisit — hindari type cast di komponen
}

// ============================================================
// Status pembayaran dari query param setelah redirect Mayar
// URL: /langganan?status=berhasil | dibatalkan | gagal
// ============================================================
export type StatusPembayaranMayar = "berhasil" | "dibatalkan" | "gagal";