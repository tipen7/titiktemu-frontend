"use client";

import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useUmkm } from "@/app/hooks/use-umkm";
import type { ZoneLabel } from "@/app/types/zones";

const ZONE_BADGE_VARIANT: Record<ZoneLabel, "secondary" | "default" | "primary"> = {
  aman: "secondary",
  waspada: "default",
  bahaya: "primary",
};

const PAGE_SIZE = 10;

export default function UMKMSelfTracker() {
  const [search, setSearch] = useState("");
  const [ewsFilter, setEwsFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useUmkm({
    search: search || undefined,
    ews_code: ewsFilter,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Real EWS-derived counts, not a fabricated operational status (Aktif/
  // Non-Aktif/Menunggu Validasi) -- no data source tracks business
  // closures or registration approval yet (auth/forms are out of scope
  // for now, see DESIGN.md). This is the honest status dimension the
  // model actually produces.
  const amanCount = rows.filter((r) => r.zone_label === "aman").length;
  const waspadaCount = rows.filter((r) => r.zone_label === "waspada").length;
  const bahayaCount = rows.filter((r) => r.zone_label === "bahaya").length;

  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <h1 className="text-h6 font-semibold">UMKM Self-Tracker</h1>
        <p className="text-b8 text-neutral-600">
          Pantau status dan kerentanan seluruh UMKM yang tercatat dari data survei riil.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-b9 text-neutral-500">Total Terdaftar</p>
          <p className="text-h6 font-semibold text-neutral-900">{total} Usaha</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-b9 text-neutral-500">Aman (halaman ini)</p>
          <p className="text-h6 font-semibold text-secondary-700">{amanCount} Usaha</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-b9 text-neutral-500">Waspada (halaman ini)</p>
          <p className="text-h6 font-semibold text-neutral-900">{waspadaCount} Usaha</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-b9 text-neutral-500">Bahaya (halaman ini)</p>
          <p className="text-h6 font-semibold text-primary-700">{bahayaCount} Usaha</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {([undefined, 2, 1, 0] as const).map((code) => (
            <button
              key={code ?? "all"}
              type="button"
              onClick={() => {
                setEwsFilter(code);
                setPage(0);
              }}
              aria-pressed={ewsFilter === code}
              className={`h-10 rounded-full border-2 px-4 text-b9 font-semibold transition-colors ${
                ewsFilter === code
                  ? "border-primary-500 bg-primary-500 text-neutral-0"
                  : "border-primary-500 text-primary-600 hover:bg-primary-100"
              }`}
            >
              {code === undefined ? "Semua Status" : code === 2 ? "Bahaya" : code === 1 ? "Waspada" : "Aman"}
            </button>
          ))}
        </div>
        <div className="ml-auto w-full sm:w-64">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Cari UMKM"
            aria-label="Cari UMKM"
          />
        </div>
      </div>

      {isError && (
        <p className="text-b8 text-destructive">
          Tidak dapat memuat data UMKM -- pastikan backend berjalan.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-b9">
          <thead className="border-b border-border bg-neutral-50">
            <tr>
              <th className="p-3 font-semibold text-neutral-700">Nama Usaha</th>
              <th className="p-3 font-semibold text-neutral-700">Kategori</th>
              <th className="p-3 font-semibold text-neutral-700">Kawasan / Grid ID</th>
              <th className="p-3 font-semibold text-neutral-700">Status</th>
              <th className="p-3 font-semibold text-neutral-700">Indeks Kerentanan</th>
              <th className="p-3 font-semibold text-neutral-700">Keyakinan</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-border last:border-0">
                  <td className="p-3" colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-neutral-500" colSpan={6}>
                  Tidak ada UMKM yang cocok dengan filter ini.
                </td>
              </tr>
            )}
            {!isLoading &&
              rows.map((umkm) => (
                <tr key={umkm.id} className="border-b border-border last:border-0 hover:bg-neutral-50">
                  <td className="p-3 font-medium text-neutral-900">{umkm.name ?? "-"}</td>
                  <td className="p-3 text-neutral-600">{umkm.category ?? "-"}</td>
                  <td className="p-3 text-neutral-600">
                    {umkm.district_name ?? "-"} &middot; {umkm.grid_id}
                  </td>
                  <td className="p-3">
                    {umkm.zone_label ? (
                      <Badge variant={ZONE_BADGE_VARIANT[umkm.zone_label]}>
                        {umkm.zone_label.toUpperCase()}
                      </Badge>
                    ) : (
                      <span className="text-neutral-400">Belum dinilai</span>
                    )}
                  </td>
                  <td className="p-3 text-neutral-600">
                    {umkm.vulnerability_index !== null ? umkm.vulnerability_index.toFixed(3) : "-"}
                  </td>
                  <td className="p-3 text-neutral-600">
                    {umkm.data_confidence !== null ? `${Math.round(umkm.data_confidence * 100)}%` : "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-b9 text-neutral-600">
        <span>
          Halaman {page + 1} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Halaman sebelumnya"
            className="flex size-7 items-center justify-center rounded-lg border border-primary-500 text-primary-600 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Halaman berikutnya"
            className="flex size-7 items-center justify-center rounded-lg border border-primary-500 text-primary-600 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
