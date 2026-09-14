import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Options as MailOptions } from 'nodemailer/lib/mailer';

export interface OpsiEmail {
  ke: string | string[];
  subjek: string;
  html: string;
  teks?: string;
}

export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly pengirim: string;

  constructor(cfg: ConfigService) {
    this.pengirim = cfg.get<string>(
      'SMTP_FROM',
      'KontrakAman AI <noreply@kontrakaman.id>',
    );
    this.transporter = nodemailer.createTransport({
      host: cfg.getOrThrow<string>('SMTP_HOST'),
      port: cfg.get<number>('SMTP_PORT', 587),
      secure: cfg.get<number>('SMTP_PORT', 587) === 465,
      auth: {
        user: cfg.getOrThrow<string>('SMTP_USER'),
        pass: cfg.getOrThrow<string>('SMTP_PASS'),
      },
    });
  }

  /** Kirim email */
  async kirim(opsi: OpsiEmail): Promise<void> {
    const pesan: MailOptions = {
      from: this.pengirim,
      to: Array.isArray(opsi.ke) ? opsi.ke.join(', ') : opsi.ke,
      subject: opsi.subjek,
      html: opsi.html,
      text: opsi.teks,
    };
    await this.transporter.sendMail(pesan);
  }

  /** Template: verifikasi email */
  htmlVerifikasiEmail(params: { nama: string; tautanVerifikasi: string }): string {
    return `
      <h2>Halo, ${params.nama}!</h2>
      <p>Terima kasih telah mendaftar di KontrakAman AI.</p>
      <p>Silakan verifikasi email Anda dengan mengklik tautan berikut:</p>
      <p><a href="${params.tautanVerifikasi}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Verifikasi Email</a></p>
      <p>Tautan ini akan kedaluwarsa dalam 24 jam.</p>
      <p>Jika Anda tidak mendaftar, abaikan email ini.</p>
    `;
  }

  /** Template: reset kata sandi */
  htmlResetKataSandi(params: { nama: string; tautanReset: string }): string {
    return `
      <h2>Halo, ${params.nama}!</h2>
      <p>Anda meminta reset kata sandi untuk akun KontrakAman AI Anda.</p>
      <p>Klik tautan berikut untuk mengatur kata sandi baru:</p>
      <p><a href="${params.tautanReset}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Kata Sandi</a></p>
      <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
      <p>Jika Anda tidak meminta reset, abaikan email ini.</p>
    `;
  }

  /** Template: audit selesai */
  htmlAuditSelesai(params: { nama: string; namaKontrak: string; tautanHasil: string }): string {
    return `
      <h2>Halo, ${params.nama}!</h2>
      <p>Audit kontrak <strong>${params.namaKontrak}</strong> telah selesai.</p>
      <p><a href="${params.tautanHasil}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Lihat Hasil Audit</a></p>
    `;
  }

  /** Template: negosiasi selesai */
  htmlNegosiasiSelesai(params: { nama: string; tautanHasil: string }): string {
    return `
      <h2>Halo, ${params.nama}!</h2>
      <p>Draf negosiasi kontrak Anda telah selesai dibuat oleh KontrakAman AI.</p>
      <p>Silakan tinjau dan edit draf dokumen Anda:</p>
      <p><a href="${params.tautanHasil}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Lihat Hasil Negosiasi</a></p>
      <p>Jika Anda memiliki pertanyaan, hubungi tim kami di support@kontrakaman.id.</p>
    `;
  }

  /** Template: konfirmasi pembayaran & aktivasi langganan berhasil */
  htmlPembayaranBerhasil(params: {
    nama: string;
    namaPaket: string;
    periodeAkhir: Date;
  }): string {
    const tanggalFormat = params.periodeAkhir.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `
      <h2>Halo, ${params.nama}!</h2>
      <p>Pembayaran Anda telah berhasil diproses dan langganan <strong>${params.namaPaket}</strong> kini aktif.</p>
      <p>Langganan Anda berlaku hingga <strong>${tanggalFormat}</strong>.</p>
      <p>Nikmati fitur audit kontrak dan negosiasi tanpa batas sesuai paket Anda.</p>
      <p>Jika ada pertanyaan, hubungi kami di support@kontrakaman.id.</p>
      <p>Salam,<br/>Tim KontrakAman AI</p>
    `;
  }

  /** Template: notifikasi langganan berakhir/dibatalkan */
  htmlLanggananBerakhir(params: { nama: string; namaPaket: string; alasan: 'expired' | 'cancelled' }): string {
    const judul = params.alasan === 'cancelled' ? 'Langganan Dibatalkan' : 'Langganan Berakhir';
    const pesan =
      params.alasan === 'cancelled'
        ? `Langganan <strong>${params.namaPaket}</strong> Anda telah dibatalkan. Anda masih dapat menggunakan fitur gratis KontrakAman AI.`
        : `Masa aktif langganan <strong>${params.namaPaket}</strong> Anda telah berakhir. Perpanjang sekarang untuk terus menikmati fitur premium.`;
    return `
      <h2>Halo, ${params.nama}!</h2>
      <p>${pesan}</p>
      <p>Jika Anda ingin berlangganan kembali, kunjungi halaman langganan di aplikasi KontrakAman AI.</p>
      <p>Jika ada pertanyaan, hubungi kami di support@kontrakaman.id.</p>
      <p>Salam,<br/>Tim KontrakAman AI</p>
    `;
  }

  /** Template: notifikasi ekspor data pribadi */
  htmlEksporData(params: { nama: string }): string {
    return `
      <h2>Halo, ${params.nama}!</h2>
      <p>Permintaan ekspor data pribadi Anda telah berhasil diproses.</p>
      <p>Data Anda tersedia sebagai respons langsung dari endpoint <code>GET /v1/pengguna/saya/ekspor-data</code>.</p>
      <p>Jika Anda tidak melakukan permintaan ini, segera hubungi kami di support@kontrakaman.id.</p>
      <p>Salam,<br/>Tim KontrakAman AI</p>
    `;
  }
}

@Global()
@Module({
  providers: [
    {
      provide: EmailService,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => new EmailService(cfg),
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
