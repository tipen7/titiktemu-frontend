// Shared zone-color legend, per DESIGN.md: "Always provide a textual
// legend, label, or detail panel for color-coded map regions." Same
// aman/waspada/bahaya semantics as ZONE_BADGE_VARIANT elsewhere, colored
// with the shared behavior-red/green/yellow risk-status tokens.
const ITEMS = [
  { dotClassName: "bg-behavior-red-20", label: "Zona tinggi risiko" },
  { dotClassName: "bg-behavior-green-20", label: "Zona relatif aman" },
  { dotClassName: "bg-behavior-yellow-20", label: "Zona waspada" },
] as const;

export function MapLegend({ caption }: { caption?: string }) {
  return (
    <div className="absolute bottom-3 left-3 z-[900] flex max-w-xs flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-100/95 px-3 py-2 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3 text-b9">
        {ITEMS.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              className={`size-2.5 shrink-0 rounded-full ${item.dotClassName}`}
              aria-hidden="true"
            />
            <span className="text-neutral-700">{item.label}</span>
          </span>
        ))}
      </div>
      {caption && (
        <p className="border-t border-neutral-200 pt-2 text-fig-b10 text-neutral-600">{caption}</p>
      )}
    </div>
  );
}
