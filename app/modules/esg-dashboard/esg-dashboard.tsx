"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useDashboardSummary } from "@/app/hooks/use-dashboard-summary";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Same zone-color convention as ZONE_BADGE_VARIANT elsewhere (discovery-map,
// tenant-matching, umkm-self-tracker) -- kept consistent rather than
// introducing a 4th ad-hoc color for this one chart.
const COLORS = { aman: "#39b332", waspada: "#00a6a8", bahaya: "#D90E10" };

export default function EsgDashboard() {
  const { data: summary, isLoading, isError } = useDashboardSummary();

  const districts = summary ? Object.entries(summary.by_district) : [];

  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <h1 className="text-h6 font-semibold">ESG Dashboard</h1>
        <p className="text-b8 text-neutral-600">
          Pantau distribusi risiko dan dampak sosial kawasan dari hasil batch run terakhir.
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
              <p className="text-b9 text-neutral-500">UMKM Perlu Realokasi</p>
              <p className="text-h5 font-semibold text-neutral-900">
                {summary.tenants_needing_reallocation} / {summary.total_tenants_tracked} Usaha
              </p>
              <p className="mt-2 text-b9 text-neutral-500">
                dari total UMKM yang tercatat dari data survei riil
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-b9 text-neutral-500">Grid Berstatus Bahaya</p>
              <p className="text-h5 font-semibold text-neutral-900">{summary.danger_zone_pct}%</p>
              <p className="mt-2 text-b9 text-neutral-500">
                {summary.danger_zone_count} dari {summary.total_grid_cells} grid cell
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-b9 text-neutral-500">Akurasi Model Tervalidasi</p>
              <p className="text-h5 font-semibold text-neutral-900">
                {summary.ews_validation_accuracy_pct ?? "-"}%
              </p>
              <p className="mt-2 text-b9 text-neutral-500">
                n={summary.ews_validation_n ?? "-"}, tingkat keyakinan: {summary.confidence_level ?? "-"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 rounded-xl border border-border p-4">
              <h2 className="text-s6 font-semibold text-neutral-900">Distribusi Status EWS per Kawasan</h2>
              {districts.length > 0 ? (
                <div className="mt-4 h-80">
                  <Bar
                    data={{
                      labels: districts.map(([name]) => name),
                      datasets: [
                        { label: "Aman", data: districts.map(([, d]) => d.safe), backgroundColor: COLORS.aman },
                        { label: "Waspada", data: districts.map(([, d]) => d.moderate), backgroundColor: COLORS.waspada },
                        { label: "Bahaya", data: districts.map(([, d]) => d.danger), backgroundColor: COLORS.bahaya },
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
            </div>

            <aside className="w-full shrink-0 rounded-xl border border-border p-4 lg:w-80">
              <h2 className="text-s6 font-semibold text-neutral-900">Riwayat Perubahan Status</h2>
              <p className="mt-3 text-b9 text-neutral-500">
                Fitur riwayat perubahan status memerlukan pencatatan histori (event log) yang belum
                tersedia di data saat ini -- setiap batch run hanya menyimpan snapshot terbaru, bukan
                riwayat perubahannya. Belum ditampilkan agar tidak menampilkan data buatan.
              </p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
