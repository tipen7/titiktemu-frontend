"use client";

import { useState } from "react";
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
  const { data, isLoading, isError } = usePolicy(filter);
  const recommendations = data ?? [];

  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <h1 className="text-h6 font-semibold">Laporan Alokasi</h1>
        <p className="text-b8 text-neutral-600">
          Usulan pemanfaatan ruang per grid beserta dasar pertimbangannya, disusun oleh AI dari data model.
        </p>
      </header>

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

      {isError && (
        <p className="text-b8 text-destructive">
          Tidak dapat memuat laporan alokasi -- pastikan backend berjalan.
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-b9">
          <thead className="border-b border-border bg-neutral-50">
            <tr>
              <th className="w-32 p-3 font-semibold text-neutral-700">Grid ID</th>
              <th className="w-40 p-3 font-semibold text-neutral-700">Indeks Kerentanan</th>
              <th className="p-3 font-semibold text-neutral-700">Usulan Alokasi</th>
              <th className="w-28 p-3 font-semibold text-neutral-700">Jenis</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="border-b border-border last:border-0">
                  <td className="p-3" colSpan={4}>
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              ))}
            {!isLoading && recommendations.length === 0 && (
              <tr>
                <td className="p-6 text-center text-neutral-500" colSpan={4}>
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
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
