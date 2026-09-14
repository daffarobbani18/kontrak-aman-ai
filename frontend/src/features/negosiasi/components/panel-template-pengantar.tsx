"use client";

// ============================================================
// PanelTemplatePengantar — pilih dan salin template pengantar profesional
// F-NEGO-04 PRD: konten statis, tidak ada API endpoint
// Tiga nada: santai, standar, tegas — sesuai persona PRD
// DESIGN.md: minimalism, flat card, primary untuk aksi utama
// ============================================================

import { useState, useCallback, useId } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  TEMPLATE_PENGANTAR,
  isiPlaceholder,
} from "../data/template-pengantar";

interface PropPanelTemplatePengantar {
  // Teks draf klausul terpilih — untuk digabung saat salin sekaligus
  teksDrafTerpilih?: string;
}

export function PanelTemplatePengantar({
  teksDrafTerpilih,
}: PropPanelTemplatePengantar) {
  const idKomponen = useId();
  const [terbuka, setTerbuka] = useState(false);
  const [idTemplateDipilih, setIdTemplateDipilih] = useState(
    TEMPLATE_PENGANTAR[1].id // default: standar
  );
  const [namaKlien, setNamaKlien] = useState("");
  const [namaKamu, setNamaKamu] = useState("");
  const [sudahDisalin, setSudahDisalin] = useState(false);
  const [sudahDisalinGabungan, setSudahDisalinGabungan] = useState(false);

  const templateDipilih =
    TEMPLATE_PENGANTAR.find((t) => t.id === idTemplateDipilih) ??
    TEMPLATE_PENGANTAR[1];

  const teksPreview = isiPlaceholder(
    templateDipilih.teks,
    namaKlien,
    namaKamu
  );

  const salinTeks = useCallback(
    async (teks: string, setSudah: (v: boolean) => void) => {
      try {
        await navigator.clipboard.writeText(teks);
        setSudah(true);
        setTimeout(() => setSudah(false), 2000);
      } catch {
        // Fallback jika clipboard API tidak tersedia
        const el = document.createElement("textarea");
        el.value = teks;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setSudah(true);
        setTimeout(() => setSudah(false), 2000);
      }
    },
    []
  );

  const tanganiSalinPengantar = useCallback(() => {
    salinTeks(teksPreview, setSudahDisalin);
  }, [salinTeks, teksPreview]);

  const tanganiSalinGabungan = useCallback(() => {
    if (!teksDrafTerpilih) return;
    const gabungan = `${teksPreview}\n\n---\n\nUsulan Revisi Klausul:\n\n${teksDrafTerpilih}`;
    salinTeks(gabungan, setSudahDisalinGabungan);
  }, [salinTeks, teksPreview, teksDrafTerpilih]);

  return (
    <div className="rounded-[var(--jernih-radius-md)] border border-[var(--jernih-neutral)]/20 bg-[var(--jernih-surface)]">
      {/* Header — tombol toggle */}
      <button
        type="button"
        onClick={() => setTerbuka((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left
          transition-colors duration-150 hover:bg-[var(--jernih-neutral)]/5"
        aria-expanded={terbuka}
        aria-controls={`${idKomponen}-konten`}
      >
        <div>
          <p className="text-body-md font-medium text-[var(--jernih-on-surface)]">
            Template Pengantar ke Klien
          </p>
          <p className="text-label-sm text-[var(--jernih-neutral)]">
            Kalimat pembuka profesional sebelum mengirim usulan revisi
          </p>
        </div>
        <span
          className="ml-3 shrink-0 text-[var(--jernih-neutral)]"
          aria-hidden="true"
        >
          {terbuka ? (
            <ChevronUp className="h-4 w-4" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          )}
        </span>
      </button>

      {/* Konten */}
      {terbuka && (
        <div
          id={`${idKomponen}-konten`}
          className="divide-y divide-[var(--jernih-neutral)]/10"
        >
          {/* Isi nama — opsional */}
          <div className="px-4 py-4">
            <p className="mb-3 text-label-sm font-semibold uppercase tracking-widest text-[var(--jernih-neutral)]">
              Personalisasi (opsional)
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${idKomponen}-nama-klien`}
                  className="mb-1 block text-label-sm text-[var(--jernih-neutral)]"
                >
                  Nama klien
                </label>
                <input
                  id={`${idKomponen}-nama-klien`}
                  type="text"
                  value={namaKlien}
                  onChange={(e) => setNamaKlien(e.target.value)}
                  placeholder="contoh: Pak Andi"
                  className="w-full rounded-[var(--jernih-radius-sm)]
                    border border-[var(--jernih-neutral)]/30
                    bg-[var(--jernih-surface)]
                    px-3 py-2
                    text-body-md text-[var(--jernih-on-surface)]
                    placeholder:text-[var(--jernih-neutral)]/50
                    focus:border-[var(--jernih-primary)]
                    focus:outline-none focus:ring-0"
                />
              </div>
              <div>
                <label
                  htmlFor={`${idKomponen}-nama-kamu`}
                  className="mb-1 block text-label-sm text-[var(--jernih-neutral)]"
                >
                  Nama kamu
                </label>
                <input
                  id={`${idKomponen}-nama-kamu`}
                  type="text"
                  value={namaKamu}
                  onChange={(e) => setNamaKamu(e.target.value)}
                  placeholder="contoh: Rani"
                  className="w-full rounded-[var(--jernih-radius-sm)]
                    border border-[var(--jernih-neutral)]/30
                    bg-[var(--jernih-surface)]
                    px-3 py-2
                    text-body-md text-[var(--jernih-on-surface)]
                    placeholder:text-[var(--jernih-neutral)]/50
                    focus:border-[var(--jernih-primary)]
                    focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Pilih nada */}
          <div className="px-4 py-4">
            <p className="mb-3 text-label-sm font-semibold uppercase tracking-widest text-[var(--jernih-neutral)]">
              Pilih Nada
            </p>
            <div className="flex flex-col gap-2">
              {TEMPLATE_PENGANTAR.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setIdTemplateDipilih(template.id)}
                  aria-pressed={idTemplateDipilih === template.id}
                  className={[
                    "rounded-[var(--jernih-radius-md)] border-2 px-4 py-3 text-left",
                    "transition-colors duration-150",
                    idTemplateDipilih === template.id
                      ? "border-[var(--jernih-primary)] bg-[var(--jernih-primary)]/5"
                      : "border-[var(--jernih-neutral)]/20 hover:border-[var(--jernih-neutral)]/40",
                  ].join(" ")}
                >
                  <p
                    className={[
                      "text-body-md font-medium",
                      idTemplateDipilih === template.id
                        ? "text-[var(--jernih-primary)]"
                        : "text-[var(--jernih-on-surface)]",
                    ].join(" ")}
                  >
                    {template.label}
                  </p>
                  <p className="mt-0.5 text-label-sm text-[var(--jernih-neutral)]">
                    {template.deskripsi}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview template */}
          <div className="px-4 py-4">
            <p className="mb-2 text-label-sm font-semibold uppercase tracking-widest text-[var(--jernih-neutral)]">
              Pratinjau
            </p>
            <pre
              className="whitespace-pre-wrap rounded-[var(--jernih-radius-md)]
                border border-[var(--jernih-neutral)]/15
                bg-[var(--jernih-neutral)]/5
                px-4 py-3
                font-[var(--font-body)] text-body-md
                leading-loose text-[var(--jernih-on-surface)]"
              aria-label="Pratinjau template pengantar"
            >
              {teksPreview}
            </pre>
          </div>

          {/* Tombol salin */}
          <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row">
            {/* Salin pengantar saja */}
            <button
              type="button"
              onClick={tanganiSalinPengantar}
              className="inline-flex items-center justify-center gap-2
                rounded-[var(--jernih-radius-md)]
                border border-[var(--jernih-neutral)]/30
                bg-[var(--jernih-surface)]
                px-4 py-2.5
                text-body-md font-medium text-[var(--jernih-on-surface)]
                transition-colors duration-150
                hover:bg-[var(--jernih-neutral)]/8
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[var(--jernih-primary)]/50"
              aria-label="Salin teks pengantar"
            >
              {sudahDisalin ? (
                <Check className="h-4 w-4 text-[var(--jernih-success)]" strokeWidth={2} aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              )}
              {sudahDisalin ? "Tersalin!" : "Salin Pengantar"}
            </button>

            {/* Salin pengantar + draf klausul sekaligus — hanya tampil jika ada draf */}
            {teksDrafTerpilih && (
              <button
                type="button"
                onClick={tanganiSalinGabungan}
                className="btn-brutal inline-flex items-center justify-center gap-2
                  px-4 py-2.5 text-body-md font-medium"
                aria-label="Salin pengantar beserta draf klausul sekaligus"
              >
                {sudahDisalinGabungan ? (
                  <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                )}
                {sudahDisalinGabungan ? "Tersalin!" : "Salin Pengantar + Draf"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}