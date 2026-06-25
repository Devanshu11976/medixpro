"use client";

import { useMemo } from "react";

export interface WarehouseRackProps {
  zoneId?: string;
  occupancy?: number;
}

interface Box {
  left: number;
  top: number;
  color: 'orange' | 'blue' | 'teal' | 'white' | 'red' | 'purple';
}

const getBoxesForZone = (zoneId: string): { tier1: Box[]; tier2: Box[]; tier3: Box[] } => {
  switch (zoneId) {
    case 'B': // Antibiotics & Vials (88% occupancy, high density warning)
      return {
        tier1: [
          { left: 6, top: 6, color: 'red' },
          { left: 55, top: 6, color: 'blue' },
          { left: 105, top: 6, color: 'red' },
          { left: 6, top: 55, color: 'blue' },
          { left: 55, top: 55, color: 'teal' },
          { left: 105, top: 55, color: 'white' },
          { left: 6, top: 105, color: 'white' },
          { left: 105, top: 105, color: 'blue' },
        ],
        tier2: [
          { left: 6, top: 6, color: 'white' },
          { left: 55, top: 6, color: 'teal' },
          { left: 105, top: 6, color: 'red' },
          { left: 6, top: 55, color: 'blue' },
          { left: 55, top: 55, color: 'white' },
          { left: 105, top: 55, color: 'teal' },
          { left: 55, top: 105, color: 'red' },
          { left: 105, top: 105, color: 'blue' },
        ],
        tier3: [
          { left: 6, top: 6, color: 'blue' },
          { left: 55, top: 6, color: 'white' },
          { left: 105, top: 6, color: 'teal' },
          { left: 30, top: 105, color: 'red' },
          { left: 80, top: 105, color: 'blue' },
        ]
      };
    case 'C': // Cold Chain (45% occupancy, vaccines/insulin)
      return {
        tier1: [
          { left: 6, top: 6, color: 'blue' },
          { left: 105, top: 6, color: 'white' },
          { left: 55, top: 55, color: 'teal' },
          { left: 6, top: 105, color: 'white' },
        ],
        tier2: [
          { left: 55, top: 6, color: 'teal' },
          { left: 6, top: 55, color: 'blue' },
          { left: 105, top: 55, color: 'white' },
        ],
        tier3: [
          { left: 30, top: 105, color: 'blue' },
        ]
      };
    case 'D': // OTC & General Syrups (61% occupancy)
      return {
        tier1: [
          { left: 6, top: 6, color: 'purple' },
          { left: 55, top: 6, color: 'white' },
          { left: 105, top: 6, color: 'orange' },
          { left: 6, top: 55, color: 'purple' },
          { left: 105, top: 55, color: 'white' },
        ],
        tier2: [
          { left: 6, top: 6, color: 'white' },
          { left: 55, top: 6, color: 'purple' },
          { left: 105, top: 6, color: 'orange' },
          { left: 55, top: 55, color: 'white' },
          { left: 105, top: 55, color: 'purple' },
        ],
        tier3: [
          { left: 30, top: 105, color: 'orange' },
          { left: 80, top: 105, color: 'purple' },
        ]
      };
    case 'A': // Primary & Tablets (72% occupancy)
    default:
      return {
        tier1: [
          { left: 6, top: 6, color: 'orange' },
          { left: 55, top: 6, color: 'white' },
          { left: 105, top: 6, color: 'blue' },
          { left: 6, top: 55, color: 'white' },
          { left: 55, top: 55, color: 'teal' },
          { left: 105, top: 55, color: 'orange' },
        ],
        tier2: [
          { left: 6, top: 6, color: 'white' },
          { left: 55, top: 6, color: 'teal' },
          { left: 105, top: 6, color: 'orange' },
          { left: 6, top: 55, color: 'blue' },
          { left: 55, top: 55, color: 'white' },
          { left: 105, top: 55, color: 'teal' },
        ],
        tier3: [
          { left: 30, top: 105, color: 'white' },
          { left: 80, top: 105, color: 'blue' },
        ]
      };
  }
};

const getColorGradient = (color: string) => {
  switch (color) {
    case 'orange':
      return 'bg-gradient-to-br from-[#F2A33B] to-[#D9852A] shadow-[0_14px_18px_-6px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.3)]';
    case 'blue':
      return 'bg-gradient-to-br from-[#1B7FC4] to-[#125488] shadow-[0_14px_18px_-6px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.3)]';
    case 'teal':
      return 'bg-gradient-to-br from-[#1A8B96] to-[#0E6068] shadow-[0_14px_18px_-6px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.3)]';
    case 'red':
      return 'bg-gradient-to-br from-[#EF4444] to-[#B91C1C] shadow-[0_14px_18px_-6px_rgba(239,68,68,0.4),inset_0_0_0_1px_rgba(255,255,255,0.3)] animate-pulse';
    case 'purple':
      return 'bg-gradient-to-br from-[#A855F7] to-[#7E22CE] shadow-[0_14px_18px_-6px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.3)]';
    case 'white':
    default:
      return 'bg-gradient-to-br from-[#FFFFFF] to-[#CFE2E0] shadow-[0_14px_18px_-6px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.3)]';
  }
};

export function WarehouseRack({ zoneId = "A" }: WarehouseRackProps) {
  const { tier1, tier2, tier3 } = useMemo(() => getBoxesForZone(zoneId), [zoneId]);

  return (
    <div className="flex items-center justify-center perspective-1300">
      <div className="relative w-[180px] h-[180px] animate-hover" style={{ transformStyle: 'preserve-3d' }}>
        {/* Tier 1 */}
        <div className="absolute left-[15px] top-[15px] w-[150px] h-[150px]" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0px)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFA] to-[#DCEDEA] border border-[rgba(14,63,76,0.22)] shadow-[0_2px_0_rgba(14,63,76,0.12),0_18px_26px_-6px_rgba(0,0,0,0.35)]" />
          {tier1.map((box, index) => (
            <div
              key={`t1-${index}`}
              className={`absolute w-[39px] h-[39px] rounded-[4px] ${getColorGradient(box.color)}`}
              style={{ left: `${box.left}px`, top: `${box.top}px` }}
            />
          ))}
        </div>

        {/* Tier 2 */}
        <div className="absolute left-[15px] top-[15px] w-[150px] h-[150px]" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(43px)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFA] to-[#DCEDEA] border border-[rgba(14,63,76,0.22)] shadow-[0_2px_0_rgba(14,63,76,0.12),0_18px_26px_-6px_rgba(0,0,0,0.35)]" />
          {tier2.map((box, index) => (
            <div
              key={`t2-${index}`}
              className={`absolute w-[39px] h-[39px] rounded-[4px] ${getColorGradient(box.color)}`}
              style={{ left: `${box.left}px`, top: `${box.top}px` }}
            />
          ))}
        </div>

        {/* Tier 3 with scan beam */}
        <div className="absolute left-[15px] top-[15px] w-[150px] h-[150px]" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(86px)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFA] to-[#DCEDEA] border border-[rgba(14,63,76,0.22)] shadow-[0_2px_0_rgba(14,63,76,0.12),0_18px_26px_-6px_rgba(0,0,0,0.35)]" />
          {tier3.map((box, index) => (
            <div
              key={`t3-${index}`}
              className={`absolute w-[39px] h-[39px] rounded-[4px] ${getColorGradient(box.color)}`}
              style={{ left: `${box.left}px`, top: `${box.top}px` }}
            />
          ))}
          
          {/* Scan beam (hovering 4px above the shelves/boxes) */}
          <div className="absolute left-0 top-0 w-[150px] h-1 bg-gradient-to-r from-transparent via-[#F2A33B] to-transparent shadow-[0_0_16px_4px_rgba(242,163,59,0.9)] animate-scan" style={{ transform: 'translateZ(4px)' }} />
        </div>
      </div>
    </div>
  );
}
