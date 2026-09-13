"use client";

// UMKM-facing self-service form for the "UMKM Self-Tracker" page
// (Figma frames 15004:6228, 6249, 6270, 6293, 6348 + alerts 6403/6404/6405).
//
// UI-ONLY: there is no backend support yet for a UMKM to submit or edit
// their own business, no approval-status field, and no submission-tracking
// tied to an account (confirmed by full backend research). Every field
// below is scaffolding: the whole draft/saved/pending/approved/rejected
// state machine, the "Riwayat Laporan" history, and the operator-approval
// simulation links are all persisted to this browser's localStorage only,
// so the flow can be demoed end-to-end across reloads without a real
// backend. None of it is shared across devices or visible to an operator.
// The photo field never uploads a file anywhere -- only the chosen
// filename string is kept, standing in for a future real upload.

import { useMemo, useState } from "react";
import {
  Alert,
  AlertClose,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@/app/components/ui/alert";
import { Dropdown, type DropdownOption } from "@/app/components/ui/dropdown";
import { FieldLabel, Input } from "@/app/components/ui/input";
import { FileInput } from "@/app/components/ui/file-input";
import { CheckCircle2, Info, XCircle } from "lucide-react";

const STORAGE_PREFIX = "titiktemu:umkm-self-tracker:";
const FORM_KEY = `${STORAGE_PREFIX}form`;
const STATUS_KEY = `${STORAGE_PREFIX}status`;
const HISTORY_KEY = `${STORAGE_PREFIX}history`;
const HISTORY_LIMIT = 20;

type SubmissionStatus = "draft" | "saved" | "pending" | "approved" | "rejected";

type FormState = {
  fotoUsahaName: string;
  namaUsaha: string;
  kategori: string;
  rentangHarga: string;
  titikLokasi: string;
  statusUsaha: string;
};

type HistoryEntry = {
  id: string;
  action: string;
  timestamp: string; // ISO -- real local timestamp of the action, not fabricated.
};

const EMPTY_FORM: FormState = {
  fotoUsahaName: "",
  namaUsaha: "",
  kategori: "",
  rentangHarga: "",
  titikLokasi: "",
  statusUsaha: "",
};

// Fixed option lists for the form's own dropdown choices -- these are just
// form inputs, not fabricated business data.
const KATEGORI_OPTIONS: DropdownOption[] = [
  { value: "makanan-ringan", label: "Makanan Ringan" },
  { value: "kuliner", label: "Kuliner" },
  { value: "kerajinan", label: "Kerajinan" },
  { value: "jasa", label: "Jasa" },
  { value: "dagang-retail", label: "Dagang / Retail" },
  { value: "lainnya", label: "Lainnya" },
];

const HARGA_OPTIONS: DropdownOption[] = [
  { value: "10-50", label: "Rp 10.000 - Rp 50.000" },
  { value: "50-100", label: "Rp 50.000 - Rp 100.000" },
  { value: "100-250", label: "Rp 100.000 - Rp 250.000" },
  { value: "250-500", label: "Rp 250.000 - Rp 500.000" },
  { value: "500-plus", label: "> Rp 500.000" },
];

const STATUS_USAHA_OPTIONS: DropdownOption[] = [
  { value: "aktif", label: "Aktif" },
  { value: "non-aktif", label: "Non-Aktif" },
];

function isFormComplete(form: FormState): boolean {
  return (
    form.fotoUsahaName.trim().length > 0 &&
    form.namaUsaha.trim().length > 0 &&
    form.kategori.trim().length > 0 &&
    form.rentangHarga.trim().length > 0 &&
    form.titikLokasi.trim().length > 0 &&
    form.statusUsaha.trim().length > 0
  );
}

function loadForm(): FormState {
  try {
    const raw = window.localStorage.getItem(FORM_KEY);
    if (!raw) return EMPTY_FORM;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_FORM, ...parsed };
  } catch {
    return EMPTY_FORM;
  }
}

function loadStatus(): SubmissionStatus {
  try {
    const raw = window.localStorage.getItem(STATUS_KEY);
    if (
      raw === "draft" ||
      raw === "saved" ||
      raw === "pending" ||
      raw === "approved" ||
      raw === "rejected"
    ) {
      return raw;
    }
    return "draft";
  } catch {
    return "draft";
  }
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveForm(form: FormState) {
  try {
    window.localStorage.setItem(FORM_KEY, JSON.stringify(form));
  } catch {
    // localStorage unavailable (private mode, quota, etc) -- degrade silently.
  }
}

function saveStatus(status: SubmissionStatus) {
  try {
    window.localStorage.setItem(STATUS_KEY, status);
  } catch {
    // ignore
  }
}

function saveHistory(history: HistoryEntry[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diffMs = Date.now() - then;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return "baru saja";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} menit lalu`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} jam lalu`;
  if (diffMs < 2 * day) return "kemarin";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFull(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type BannerState = { variant: "info" | "success" | "error"; title: string; description: string } | null;

const STATUS_PANEL_LABEL: Record<Extract<SubmissionStatus, "pending" | "approved" | "rejected">, string> = {
  pending: "Menunggu Peninjauan",
  approved: "Aktif",
  rejected: "Ditolak",
};

const STATUS_PANEL_CHIP: Record<Extract<SubmissionStatus, "pending" | "approved" | "rejected">, string> = {
  pending: "bg-behavior-yellow-10 text-behavior-yellow-30",
  approved: "bg-behavior-green-10 text-behavior-green-30",
  rejected: "bg-behavior-red-10 text-behavior-red-30",
};

export default function UmkmSelfTrackerForm() {
  // Hydrated once from localStorage via lazy `useState` initializers (see
  // the same convention in profil-usaha.tsx) rather than an effect, so
  // there's no extra render pass and no cascading setState-in-effect.
  const [status, setStatus] = useState<SubmissionStatus>(() => loadStatus());
  const [form, setForm] = useState<FormState>(() => loadForm());
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [banner, setBanner] = useState<BannerState>(null);

  function pushHistory(action: string) {
    setHistory((prev) => {
      const next = [{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, action, timestamp: new Date().toISOString() }, ...prev].slice(
        0,
        HISTORY_LIMIT,
      );
      saveHistory(next);
      return next;
    });
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      saveForm(next);
      return next;
    });
  }

  function handleSimpan() {
    if (!isFormComplete(form)) return;
    saveForm(form);
    setStatus("saved");
    saveStatus("saved");
    pushHistory("Data usaha disimpan");
  }

  function handleEdit() {
    setStatus("draft");
    saveStatus("draft");
    setBanner(null);
  }

  function handleAjukan() {
    setStatus("pending");
    saveStatus("pending");
    pushHistory("Formulir diajukan");
    setBanner({
      variant: "info",
      title: "Pengajuan Terkirim",
      description: "Formulir usaha kamu telah dikirim dan sedang menunggu peninjauan.",
    });
  }

  function handleDemoApprove() {
    setStatus("approved");
    saveStatus("approved");
    pushHistory("Pengajuan disetujui");
    setBanner({
      variant: "success",
      title: "Pengajuan disetujui",
      description: "Data usaha kamu telah disetujui dan kini aktif tercatat.",
    });
  }

  function handleDemoReject() {
    setStatus("rejected");
    saveStatus("rejected");
    pushHistory("Pengajuan ditolak");
    setBanner({
      variant: "error",
      title: "Pengajuan ditolak",
      description: "Pengajuan usaha kamu ditolak. Silakan periksa kembali data lalu ajukan ulang.",
    });
  }

  const complete = useMemo(() => isFormComplete(form), [form]);
  const isEditable = status === "draft";
  const showStatusPanel = status === "pending" || status === "approved" || status === "rejected";
  const lastUpdate = history[0]?.timestamp;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-fig-sh4 text-neutral-900">UMKM Self-Tracker</h1>
        <p className="text-b7 text-neutral-600">
          Kelola dan ajukan data usahamu sendiri untuk tercatat pada program TOD.
        </p>
      </header>

      {banner && (
        <Alert variant={banner.variant} className="w-full">
          <AlertIcon>
            {banner.variant === "info" && <Info className="size-6" />}
            {banner.variant === "success" && <CheckCircle2 className="size-6" />}
            {banner.variant === "error" && <XCircle className="size-6" />}
          </AlertIcon>
          <AlertTitle>{banner.title}</AlertTitle>
          <AlertDescription>{banner.description}</AlertDescription>
          <AlertClose onClick={() => setBanner(null)} />
        </Alert>
      )}

      <section className="flex flex-col gap-5 rounded-xl border border-neutral-300 bg-neutral-0 p-6">
        <h2 className="text-fig-sh6 text-neutral-900">Data Usaha</h2>

        <div className="flex flex-col gap-2">
          <FieldLabel required>Foto Usaha</FieldLabel>
          <FileInput
            disabled={!isEditable}
            selectedLabel={form.fotoUsahaName || undefined}
            placeholder="Unggah foto usaha"
            onFileChange={(file) => updateField("fotoUsahaName", file?.name ?? "")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel required>Nama Usaha</FieldLabel>
          <Input
            value={form.namaUsaha}
            disabled={!isEditable}
            onChange={(event) => updateField("namaUsaha", event.target.value)}
            placeholder="Contoh: Warung Sari Rasa"
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel required>Kategori</FieldLabel>
          <Dropdown
            options={KATEGORI_OPTIONS}
            value={form.kategori || undefined}
            disabled={!isEditable}
            onValueChange={(value) => updateField("kategori", value)}
            placeholder="Pilih kategori usaha"
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel required>Rentang Harga Produk</FieldLabel>
          <Dropdown
            options={HARGA_OPTIONS}
            value={form.rentangHarga || undefined}
            disabled={!isEditable}
            onValueChange={(value) => updateField("rentangHarga", value)}
            placeholder="Pilih rentang harga"
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel required>Titik Lokasi</FieldLabel>
          <Input
            value={form.titikLokasi}
            disabled={!isEditable}
            onChange={(event) => updateField("titikLokasi", event.target.value)}
            placeholder="Contoh: Blok B (DA-1231)"
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel required>Status Usaha</FieldLabel>
          <Dropdown
            options={STATUS_USAHA_OPTIONS}
            value={form.statusUsaha || undefined}
            disabled={!isEditable}
            onValueChange={(value) => updateField("statusUsaha", value)}
            placeholder="Pilih status usaha"
          />
        </div>

        {status === "draft" && (
          <button
            type="button"
            disabled={!complete}
            onClick={handleSimpan}
            className={`mt-2 flex h-12 w-full items-center justify-center rounded-lg text-fig-sh7 transition-opacity disabled:cursor-not-allowed ${
              complete ? "bg-primary-teal-60 text-neutral-0 hover:opacity-90" : "bg-neutral-200 text-neutral-500"
            }`}
          >
            Simpan Data
          </button>
        )}

        {status !== "draft" && (
          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={handleEdit}
              className="flex h-12 flex-1 items-center justify-center rounded-lg border-[1.6px] border-primary-teal-60 text-fig-sh7 text-primary-teal-60 transition-opacity hover:opacity-90"
            >
              Edit Data
            </button>
            {status === "saved" && (
              <button
                type="button"
                onClick={handleAjukan}
                className="flex h-12 flex-1 items-center justify-center rounded-lg bg-primary-teal-60 text-fig-sh7 text-neutral-0 transition-opacity hover:opacity-90"
              >
                Ajukan Formulir
              </button>
            )}
          </div>
        )}
      </section>

      {showStatusPanel && (
        <section
          className={`flex flex-col gap-5 rounded-xl border border-neutral-300 bg-neutral-0 p-6 transition-opacity ${
            status === "pending" ? "opacity-40" : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-fig-sh7 text-neutral-900">Status Pengajuan</h2>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-fig-sh8 ${STATUS_PANEL_CHIP[status as "pending" | "approved" | "rejected"]}`}
            >
              {STATUS_PANEL_LABEL[status as "pending" | "approved" | "rejected"]}
            </span>
          </div>
          {lastUpdate && (
            <p className="text-b9 text-neutral-500">Terakhir update pada {formatFull(lastUpdate)}</p>
          )}

          <div className="flex flex-col gap-1">
            <h3 className="text-fig-sh8 text-neutral-900">Riwayat Laporan</h3>
            <div className="flex flex-col divide-y divide-neutral-200 border-t border-neutral-200">
              {history.length === 0 && (
                <p className="py-3 text-b8 text-neutral-500">Belum ada riwayat.</p>
              )}
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-b8 text-neutral-800">{entry.action}</span>
                  <span className="shrink-0 text-b9 text-neutral-500">{formatRelative(entry.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>

          {status === "pending" && (
            <p className="text-b9 text-neutral-400">
              ( demo: tandai{" "}
              <button type="button" onClick={handleDemoApprove} className="underline hover:text-primary-teal-60">
                disetujui
              </button>{" "}
              /{" "}
              <button type="button" onClick={handleDemoReject} className="underline hover:text-behavior-red-20">
                ditolak
              </button>{" "}
              -- belum ada alur operator sungguhan )
            </p>
          )}
        </section>
      )}
    </div>
  );
}
