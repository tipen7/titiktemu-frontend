// Shared zone-color legend, per DESIGN.md: "Always provide a textual
// legend, label, or detail panel for color-coded map regions." Same
// aman/waspada/bahaya color convention as ZONE_BADGE_VARIANT elsewhere.
const ITEMS = [
  { color: "#D90E10", label: "Zona tinggi risiko" },
  { color: "#39b332", label: "Zona relatif aman" },
  { color: "#00a6a8", label: "Zona waspada" },
] as const;

export function MapLegend({ caption }: { caption?: string }) {
  return (
    <div className="absolute bottom-3 left-3 z-[900] flex flex-wrap items-center gap-3 rounded-lg border border-border bg-neutral-0/95 px-3 py-2 text-b9 shadow-sm backdrop-blur-sm">
      {ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="text-neutral-700">{item.label}</span>
        </span>
      ))}
      {caption && <span className="border-l border-border pl-3 text-neutral-500">{caption}</span>}
    </div>
  );
}
