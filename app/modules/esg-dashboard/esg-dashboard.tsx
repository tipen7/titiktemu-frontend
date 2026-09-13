"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Dropdown } from "@/app/components/ui/dropdown";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useDashboardSummary } from "@/app/hooks/use-dashboard-summary";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Same zone-color convention as ZONE_BADGE_VARIANT elsewhere (discovery-map,
// tenant-matching, umkm-self-tracker) -- kept consistent rather than
// introducing a 4th ad-hoc color for this one chart.
const COLORS = { aman: "#39b332", waspada: "#00a6a8", bahaya: "#D90E10" };

function vulnerabilityTier(index: number): string {
  if (index >= 0.66) return "Tinggi";
  if (index >= 0.33) return "Sedang";
  return "Rendah";
}

export default function EsgDashboard() {
  const { data: summary, isLoading, isError } = useDashboardSummary();
  const [selectedDistrict, setSelectedDistrict] = useState("all");

  const districts = useMemo(
    () => (summary ? Object.entries(summary.by_district) : []),
    [summary],
  );
  const districtOptions = useMemo(
    () => [
      { value: "all", label: "Semua Kawasan" },
      ...districts.map(([name]) => ({ value: name, label: name })),
    ],
    [districts],
  );

  const distribution = useMemo(() => {
    if (selectedDistrict !== "all") {
      const found = summary?.by_district[selectedDistrict];
      return found
        ? { safe: found.safe, moderate: found.moderate, danger: found.danger }
        : { safe: 0, moderate: 0, danger: 0 };
    }
    return districts.reduce(
      (acc, [, d]) => ({
        safe: acc.safe + d.safe,
        moderate: acc.moderate + d.moderate,
        danger: acc.danger + d.danger,
      }),
      { safe: 0, moderate: 0, danger: 0 },
    );
  }, [summary, selectedDistrict, districts]);
  const distributionTotal = distribution.safe + distribution.moderate + distribution.danger;
  const pct = (n: number) => (distributionTotal > 0 ? Math.round((n / distributionTotal) * 100) : 0);

  const umkmProtected = summary
    ? summary.total_tenants_tracked - summary.tenants_needing_reallocation
    : null;

  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <h1 className="text-h6 font-semibold text-secondary-800">ESG Dashboard</h1>
        <p className="text-b8 text-neutral-600">
          Pantau distribusi risiko dan dampak sosial kawasan secara real-time.
        </p>
      </header>

      {isError && (
        <p className="text-b8 text-destructive">
          Tidak dapat memuat ringkasan dashboard -- pastikan backend berjalan.
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && !summary && !isError && (
        <p className="text-b8 text-neutral-500">
          Belum ada data dashboard -- jalankan batch pipeline analytics terlebih dahulu.
        </p>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-b9 text-neutral-500">Grid Berstatus Bahaya</p>
              <p className="text-h5 font-semibold text-neutral-900">{summary.danger_zone_pct}%</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-primary-500"
                  style={{ width: `${Math.min(100, summary.danger_zone_pct)}%` }}
                />
              </div>
              <p className="mt-2 text-b9 text-neutral-500">
                {summary.danger_zone_count} dari {summary.total_grid_cells} grid cell
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-b9 text-neutral-500">UMKM Terlindungi (zona subsidi)</p>
              <p className="text-h5 font-semibold text-neutral-900">{umkmProtected} Usaha</p>
              <p className="mt-2 text-b9 text-neutral-500">
                dari {summary.total_tenants_tracked} total UMKM yang dipantau
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-b9 text-neutral-500">Rata-rata Indeks Kerentanan</p>
              <p className="text-h5 font-semibold text-neutral-900">
                {vulnerabilityTier(summary.avg_vulnerability_index)}
              </p>
              <p className="mt-2 text-b9 text-neutral-500">
                skor {summary.avg_vulnerability_index.toFixed(3)} dari 1.000
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-s6 font-semibold text-neutral-900">
                    Distribusi Tingkat Perhatian per Blok
                  </h2>
                  {summary.ews_validation_accuracy_pct !== null && (
                    <p className="text-b9 text-neutral-500">
                      Akurasi model tervalidasi: {summary.ews_validation_accuracy_pct}% (n=
                      {summary.ews_validation_n}, keyakinan {summary.confidence_level})
                    </p>
                  )}
                </div>
                {districtOptions.length > 1 && (
                  <Dropdown
                    options={districtOptions}
                    value={selectedDistrict}
                    onValueChange={setSelectedDistrict}
                    placeholder="Pilih Kawasan"
                    className="w-48"
                  />
                )}
              </div>
              {districts.length > 0 ? (
                <div className="mt-4 h-80">
                  <Bar
                    data={{
                      labels: districts.map(([name]) => name),
                      datasets: [
                        {
                          label: "Relatif Aman",
                          data: districts.map(([, d]) => d.safe),
                          backgroundColor: COLORS.aman,
                        },
                        {
                          label: "Butuh Perhatian",
                          data: districts.map(([, d]) => d.moderate),
                          backgroundColor: COLORS.waspada,
                        },
                        {
                          label: "Perlu Diperbaiki",
                          data: districts.map(([, d]) => d.danger),
                          backgroundColor: COLORS.bahaya,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: { x: { stacked: false }, y: { beginAtZero: true } },
                      plugins: { legend: { position: "bottom" } },
                    }}
                  />
                </div>
              ) : (
                <p className="mt-4 text-b9 text-neutral-500">Belum ada data kawasan.</p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                <div>
                  <p className="text-s6 font-semibold" style={{ color: COLORS.aman }}>
                    {distribution.safe} ({pct(distribution.safe)}%)
                  </p>
                  <p className="text-b9 text-neutral-500">Relatif Aman</p>
                </div>
                <div>
                  <p className="text-s6 font-semibold" style={{ color: COLORS.waspada }}>
                    {distribution.moderate} ({pct(distribution.moderate)}%)
                  </p>
                  <p className="text-b9 text-neutral-500">Butuh Perhatian</p>
                </div>
                <div>
                  <p className="text-s6 font-semibold" style={{ color: COLORS.bahaya }}>
                    {distribution.danger} ({pct(distribution.danger)}%)
                  </p>
                  <p className="text-b9 text-neutral-500">Perlu Diperbaiki</p>
                </div>
              </div>
            </div>

            <aside className="w-full shrink-0 rounded-xl border border-border p-4 lg:w-80">
              <h2 className="text-s6 font-semibold text-neutral-900">Riwayat Perubahan Status</h2>
              <p className="mt-3 text-b9 text-neutral-500">
                Fitur riwayat perubahan status memerlukan pencatatan histori (event log) yang belum
                tersedia di data saat ini -- setiap batch run hanya menyimpan snapshot terbaru, bukan
                riwayat perubahannya. Belum ditampilkan agar tidak menampilkan data buatan.
              </p>
              <p className="mt-3 text-b9 text-neutral-400">
                Terakhir diperbarui:{" "}
                {new Date(summary.computed_at).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
