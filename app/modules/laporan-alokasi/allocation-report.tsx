"use client";

import { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import { Skeleton } from "@/app/components/ui/skeleton";
import { usePolicy } from "@/app/hooks/use-policy";
import type { PolicyRecommendation } from "@/app/types/umkm";

const TYPE_LABEL: Record<PolicyRecommendation["recommendation_type"], string> = {
  mitigasi: "Mitigasi",
  realokasi: "Realokasi",
  pemantauan: "Pemantauan",
};

const FILTERS = [undefined, "mitigasi", "realokasi", "pemantauan"] as const;

function NarrativeCell({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 160;
  const shown = expanded || !isLong ? text : `${text.slice(0, 160)}...`;

  return (
    <p className="text-b9 text-neutral-700">
      {shown}{" "}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="font-semibold text-primary-600 hover:underline"
        >
          {expanded ? "See less..." : "See more..."}
        </button>
      )}
    </p>
  );
}

export default function AllocationReport() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>(undefined);
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState<PolicyRecommendation | null>(null);
  const { data, isLoading, isError } = usePolicy(filter);

  const recommendations = useMemo(() => {
    const all = data ?? [];
    if (!search.trim()) return all;
    const query = search.trim().toLowerCase();
    return all.filter(
      (item) =>
        item.grid_id.toLowerCase().includes(query) ||
        (item.district_name ?? "").toLowerCase().includes(query) ||
        item.narrative.toLowerCase().includes(query),
    );
  }, [data, search]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <h1 className="text-h6 font-semibold text-secondary-800">Laporan Alokasi</h1>
        <p className="text-b8 text-neutral-600">
          Usulan pemanfaatan ruang per blok beserta dasar pertimbangannya.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((type) => (
            <button
              key={type ?? "all"}
              type="button"
              onClick={() => setFilter(type)}
              aria-pressed={filter === type}
              className={`h-10 rounded-full border-2 px-4 text-b9 font-semibold transition-colors ${
                filter === type
                  ? "border-primary-500 bg-primary-500 text-neutral-0"
                  : "border-primary-500 text-primary-600 hover:bg-primary-100"
              }`}
            >
              {type ? TYPE_LABEL[type] : "Semua Laporan"}
            </button>
          ))}
        </div>
        <div className="ml-auto w-full sm:w-64">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari Laporan"
            aria-label="Cari laporan alokasi"
          />
        </div>
      </div>

      {isError && (
        <p className="text-b8 text-destructive">
          Tidak dapat memuat laporan alokasi -- pastikan backend berjalan.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-b9">
          <thead className="border-b border-border bg-neutral-50">
            <tr>
              <th className="w-32 p-3 font-semibold text-neutral-700">Blok / Grid ID</th>
              <th className="w-40 p-3 font-semibold text-neutral-700">Indeks Kerentanan</th>
              <th className="p-3 font-semibold text-neutral-700">Usulan Alokasi</th>
              <th className="w-28 p-3 font-semibold text-neutral-700">Jenis</th>
              <th className="w-32 p-3 font-semibold text-neutral-700">Detail</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="border-b border-border last:border-0">
                  <td className="p-3" colSpan={5}>
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ))}
            {!isLoading && recommendations.length === 0 && (
              <tr>
                <td className="p-6 text-center text-neutral-500" colSpan={5}>
                  Belum ada laporan alokasi. Laporan dibuat otomatis oleh AI untuk setiap grid berstatus
                  waspada/bahaya pada siklus batch berikutnya -- coba lagi setelah batch run berikutnya selesai.
                </td>
              </tr>
            )}
            {!isLoading &&
              recommendations.map((item) => (
                <tr key={item.grid_id} className="border-b border-border last:border-0 align-top">
                  <td className="p-3 font-medium text-neutral-900">
                    {item.district_name ?? "-"}
                    <br />
                    <span className="text-neutral-500">{item.grid_id}</span>
                  </td>
                  <td className="p-3 text-neutral-600">{item.vulnerability_index.toFixed(3)}</td>
                  <td className="p-3">
                    <NarrativeCell text={item.narrative} />
                  </td>
                  <td className="p-3 text-neutral-600">{TYPE_LABEL[item.recommendation_type]}</td>
                  <td className="p-3">
                    <Button variant="secondary-ghost" size="sm" onClick={() => setDetailItem(item)}>
                      Tinjau Usulan
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Sheet open={detailItem !== null} onOpenChange={(open) => !open && setDetailItem(null)}>
        <SheetContent>
          {detailItem && (
            <>
              <SheetHeader>
                <SheetTitle>{detailItem.district_name ?? detailItem.grid_id}</SheetTitle>
                <SheetDescription>
                  Blok {detailItem.grid_id} &middot; {TYPE_LABEL[detailItem.recommendation_type]}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4 pb-4">
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-b9">
                  <dt className="text-neutral-500">Indeks Kerentanan</dt>
                  <dd className="text-neutral-800">{detailItem.vulnerability_index.toFixed(3)}</dd>
                  <dt className="text-neutral-500">Dibuat</dt>
                  <dd className="text-neutral-800">
                    {new Date(detailItem.generated_at).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </dd>
                </dl>
                <div>
                  <p className="mb-1 text-b9 font-semibold text-neutral-500">Usulan Alokasi</p>
                  <p className="text-b9 text-neutral-700">{detailItem.narrative}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
