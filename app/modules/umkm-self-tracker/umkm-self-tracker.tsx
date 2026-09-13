"use client";

import { useMemo, useState } from "react";
import { Dropdown } from "@/app/components/ui/dropdown";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import { useGrid } from "@/app/hooks/use-grid";
import { useUmkm } from "@/app/hooks/use-umkm";
import type { UmkmBusiness } from "@/app/types/umkm";

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "0", label: "Aman" },
  { value: "1", label: "Waspada" },
  { value: "2", label: "Bahaya" },
] as const;

const SORT_OPTIONS = [
  { value: "none", label: "Tanpa Urutan" },
  { value: "desc", label: "Kerentanan Tertinggi" },
  { value: "asc", label: "Kerentanan Terendah" },
] as const;

const PAGE_SIZE = 10;

// A small status pill for a table cell -- not the ui/badge.tsx `Badge`
// component, which is sized as a large standalone filter chip
// (min-w-36, h-10+) and looks oversized crammed into a table row.
function StatusPill({ label, variant }: { label: string; variant: "aman" | "waspada" | "bahaya" }) {
  const styles: Record<typeof variant, string> = {
    aman: "border-secondary-500 bg-secondary-50 text-secondary-700",
    waspada: "border-amber-400 bg-amber-50 text-amber-700",
    bahaya: "border-primary-500 bg-primary-50 text-primary-700",
  };
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2.5 text-b9 font-semibold ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

export default function UMKMSelfTracker() {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("all");
  const [ewsFilter, setEwsFilter] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("none");
  const [page, setPage] = useState(0);
  const [detailUmkm, setDetailUmkm] = useState<UmkmBusiness | null>(null);

  const { data: grid } = useGrid();
  const districtOptions = useMemo(() => {
    const names = new Set<string>();
    for (const feature of grid?.features ?? []) {
      if (feature.properties.district_name) names.add(feature.properties.district_name);
    }
    return [
      { value: "all", label: "Semua Blok" },
      ...Array.from(names)
        .sort()
        .map((name) => ({ value: name, label: name })),
    ];
  }, [grid]);

  const { data, isLoading, isError } = useUmkm({
    search: search || undefined,
    district: district === "all" ? undefined : district,
    ews_code: ewsFilter,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const rows = useMemo(() => {
    const base = data?.rows ?? [];
    if (sort === "none") return base;
    return [...base].sort((a, b) => {
      const av = a.vulnerability_index ?? -1;
      const bv = b.vulnerability_index ?? -1;
      return sort === "desc" ? bv - av : av - bv;
    });
  }, [data, sort]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Real EWS-derived counts, not a fabricated operational status (Aktif/
  // Non-Aktif/Menunggu Validasi) -- no data source tracks business
  // closures or registration approval yet (auth/forms are out of scope
  // for now, see DESIGN.md). This is the honest status dimension the
  // model actually produces; the cards below double as status filters.
  const amanCount = rows.filter((r) => r.zone_label === "aman").length;
  const waspadaCount = rows.filter((r) => r.zone_label === "waspada").length;
  const bahayaCount = rows.filter((r) => r.zone_label === "bahaya").length;

  function selectEws(code: number | undefined) {
    setEwsFilter(code);
    setPage(0);
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <h1 className="text-h6 font-semibold text-secondary-800">UMKM Self-Tracker</h1>
        <p className="text-b8 text-neutral-600">
          Pantau status dan kerentanan seluruh UMKM yang tercatat dari data survei riil.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => selectEws(undefined)}
          className={`rounded-xl border p-4 text-left transition-colors ${
            ewsFilter === undefined ? "border-primary-500 bg-primary-50" : "border-border hover:bg-neutral-50"
          }`}
        >
          <p className="text-b9 text-neutral-500">Total Terdaftar</p>
          <p className="text-h6 font-semibold text-neutral-900">{total} Usaha</p>
        </button>
        <button
          type="button"
          onClick={() => selectEws(0)}
          className={`rounded-xl border p-4 text-left transition-colors ${
            ewsFilter === 0 ? "border-secondary-500 bg-secondary-50" : "border-border hover:bg-neutral-50"
          }`}
        >
          <p className="text-b9 text-neutral-500">Aman (halaman ini)</p>
          <p className="text-h6 font-semibold text-secondary-700">{amanCount} Usaha</p>
        </button>
        <button
          type="button"
          onClick={() => selectEws(1)}
          className={`rounded-xl border p-4 text-left transition-colors ${
            ewsFilter === 1 ? "border-amber-400 bg-amber-50" : "border-border hover:bg-neutral-50"
          }`}
        >
          <p className="text-b9 text-neutral-500">Waspada (halaman ini)</p>
          <p className="text-h6 font-semibold text-neutral-900">{waspadaCount} Usaha</p>
        </button>
        <button
          type="button"
          onClick={() => selectEws(2)}
          className={`rounded-xl border p-4 text-left transition-colors ${
            ewsFilter === 2 ? "border-primary-500 bg-primary-50" : "border-border hover:bg-neutral-50"
          }`}
        >
          <p className="text-b9 text-neutral-500">Bahaya (halaman ini)</p>
          <p className="text-h6 font-semibold text-primary-700">{bahayaCount} Usaha</p>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          options={districtOptions}
          value={district}
          onValueChange={(value) => {
            setDistrict(value);
            setPage(0);
          }}
          className="w-40"
        />
        <Dropdown
          options={[...STATUS_OPTIONS]}
          value={ewsFilter === undefined ? "all" : String(ewsFilter)}
          onValueChange={(value) => selectEws(value === "all" ? undefined : Number(value))}
          className="w-44"
        />
        <Dropdown
          options={[...SORT_OPTIONS]}
          value={sort}
          onValueChange={(value) => setSort(value as typeof sort)}
          className="w-48"
        />
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
              <th className="p-3 font-semibold text-neutral-700">Blok / Grid ID</th>
              <th className="p-3 font-semibold text-neutral-700">Status</th>
              <th className="p-3 font-semibold text-neutral-700">Indeks Kerentanan</th>
              <th className="p-3 font-semibold text-neutral-700">Keyakinan</th>
              <th className="p-3 font-semibold text-neutral-700">Detail</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-border last:border-0">
                  <td className="p-3" colSpan={7}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-neutral-500" colSpan={7}>
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
                      <StatusPill label={umkm.zone_label.toUpperCase()} variant={umkm.zone_label} />
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
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => setDetailUmkm(umkm)}
                      className="font-semibold text-primary-600 hover:underline"
                    >
                      Detail
                    </button>
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

      <Sheet open={detailUmkm !== null} onOpenChange={(open) => !open && setDetailUmkm(null)}>
        <SheetContent>
          {detailUmkm && (
            <>
              <SheetHeader>
                <SheetTitle>{detailUmkm.name ?? "Detail Usaha"}</SheetTitle>
                <SheetDescription>{detailUmkm.category ?? "-"}</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4 pb-4">
                {detailUmkm.zone_label && (
                  <StatusPill label={detailUmkm.zone_label.toUpperCase()} variant={detailUmkm.zone_label} />
                )}
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-b9">
                  <dt className="text-neutral-500">Blok / Grid ID</dt>
                  <dd className="text-neutral-800">{detailUmkm.grid_id}</dd>
                  <dt className="text-neutral-500">Kawasan</dt>
                  <dd className="text-neutral-800">
                    {detailUmkm.district_name ?? "-"} &middot; {detailUmkm.kecamatan ?? "-"}
                  </dd>
                  <dt className="text-neutral-500">Indeks Kerentanan</dt>
                  <dd className="text-neutral-800">
                    {detailUmkm.vulnerability_index !== null ? detailUmkm.vulnerability_index.toFixed(3) : "-"}
                  </dd>
                  <dt className="text-neutral-500">Matching Score</dt>
                  <dd className="text-neutral-800">
                    {detailUmkm.matching_score !== null ? `${Math.round(detailUmkm.matching_score)}%` : "-"}
                  </dd>
                  <dt className="text-neutral-500">Keyakinan Data</dt>
                  <dd className="text-neutral-800">
                    {detailUmkm.data_confidence !== null
                      ? `${Math.round(detailUmkm.data_confidence * 100)}%`
                      : "-"}
                  </dd>
                  <dt className="text-neutral-500">Jarak ke Stasiun</dt>
                  <dd className="text-neutral-800">
                    {detailUmkm.dist_to_station_m !== null
                      ? `${Math.round(detailUmkm.dist_to_station_m)} m`
                      : "-"}
                  </dd>
                  <dt className="text-neutral-500">Sumber Data</dt>
                  <dd className="text-neutral-800">{detailUmkm.source}</dd>
                </dl>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
