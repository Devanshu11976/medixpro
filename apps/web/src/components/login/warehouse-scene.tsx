import { Boxes, ScanLine, Users, Activity } from "lucide-react";

const CRATES = [
  { id: "c1", left: 8, top: 8, color: "from-brand-amber to-[#D9852A]" },
  { id: "c2", left: 74, top: 8, color: "from-white to-[#CFE2E0]" },
  { id: "c3", left: 140, top: 8, color: "from-brand-blue to-[#125488]" },
  { id: "c4", left: 8, top: 74, color: "from-white to-[#CFE2E0]" },
  { id: "c5", left: 74, top: 74, color: "from-brand-teal-mid to-[#0E6068]" },
  { id: "c6", left: 140, top: 74, color: "from-brand-amber to-[#D9852A]" },
  { id: "c7", left: 41, top: 140, color: "from-white to-[#CFE2E0]" },
  { id: "c8", left: 107, top: 140, color: "from-brand-blue to-[#125488]" },
] as const;

export function WarehouseScene() {
  return (
    <div
      className="relative flex flex-1 items-center justify-center py-4"
      style={{ perspective: "1300px" }}
    >
      <div
        className="relative h-[240px] w-[240px] animate-[rack-hover_7s_ease-in-out_infinite]"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(58deg) rotateZ(45deg)",
        }}
      >
        {[0, 58, 116].map((z, tierIndex) => (
          <div
            key={z}
            className="absolute left-5 top-5 h-[200px] w-[200px]"
            style={{ transformStyle: "preserve-3d", transform: `translateZ(${z}px)` }}
          >
            <div
              className="absolute inset-0 rounded-[2px] border border-brand-teal-deep/20 bg-gradient-to-br from-[#F7FBFA] to-[#DCEDEA]"
              style={{
                boxShadow:
                  "0 2px 0 rgba(14,63,76,0.12), 0 18px 26px -6px rgba(0,0,0,0.35)",
              }}
            />

            {tierIndex < 2 &&
              CRATES.slice(tierIndex * 3, tierIndex * 3 + (tierIndex === 0 ? 3 : 3)).map(
                (crate) => (
                  <div
                    key={crate.id}
                    className={`absolute h-[52px] w-[52px] rounded-[5px] bg-gradient-to-br ${crate.color}`}
                    style={{
                      left: crate.left,
                      top: crate.top,
                      boxShadow:
                        "0 14px 18px -6px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.3)",
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-[5px]"
                      style={{ transform: "translateZ(34px)", background: "inherit" }}
                    />
                  </div>
                )
              )}

            {tierIndex === 2 && (
              <>
                {CRATES.slice(6, 8).map((crate) => (
                  <div
                    key={crate.id}
                    className={`absolute h-[52px] w-[52px] rounded-[5px] bg-gradient-to-br ${crate.color}`}
                    style={{
                      left: crate.left,
                      top: crate.top,
                      boxShadow:
                        "0 14px 18px -6px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.3)",
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-[5px]"
                      style={{ transform: "translateZ(34px)", background: "inherit" }}
                    />
                  </div>
                ))}

                {/* signature element: the barcode scan beam */}
                <div
                  className="absolute left-0 top-0 h-1 w-[200px] animate-[scan-move_3.4s_ease-in-out_infinite] rounded-full"
                  style={{
                    transform: "translateZ(150px)",
                    background:
                      "linear-gradient(90deg, transparent, #F2A33B 18%, #FFD89A 50%, #F2A33B 82%, transparent)",
                    boxShadow: "0 0 16px 4px rgba(242,163,59,0.9)",
                  }}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturePills() {
  const pills = [
    { icon: Boxes, label: "Inventory by batch" },
    { icon: ScanLine, label: "OCR invoice scan" },
    { icon: Users, label: "Retailer accounts" },
  ];

  return (
    <div className="flex flex-wrap gap-2.5">
      {pills.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md backdrop-blur-sm"
        >
          <Icon className="h-4 w-4 shrink-0 text-brand-amber" />
          {label}
        </div>
      ))}
    </div>
  );
}

export function BrandChip() {
  return (
    <div className="inline-flex w-fit items-center gap-2.5 self-start rounded-full bg-white/95 py-2 pl-2 pr-4 shadow-lg backdrop-blur-sm">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-teal-mid">
        <Activity className="h-4 w-4 text-white" strokeWidth={2.4} />
      </div>
      <span className="font-display text-sm font-semibold tracking-tight text-brand-teal-deep">
        Medixpro
      </span>
    </div>
  );
}
