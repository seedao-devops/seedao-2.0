"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Base } from "@/lib/features/_shared/fake-db";
import { Card } from "@/components/ui/card";

/**
 * Lightweight visual placeholder for the basemap.
 *
 * The plan flagged the map library (MapLibre GL vs Leaflet vs CN provider)
 * as an open question, so this component renders a structured "geo summary"
 * grouped by province to keep the page useful without locking in a vendor.
 * Swap the body for `react-map-gl` / `leaflet` later — interface stays the
 * same: `<BasesMap bases={...} />`.
 */
export function BasesMap({ bases }: { bases: Base[] }) {
  const byProvince = new Map<string, Base[]>();
  for (const b of bases) {
    const arr = byProvince.get(b.province) ?? [];
    arr.push(b);
    byProvince.set(b.province, arr);
  }
  if (bases.length === 0) return null;
  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="size-4 text-primary" />
        <p className="text-sm font-medium">地图视图（按省份分组）</p>
      </div>
      <div className="space-y-3">
        {Array.from(byProvince.entries()).map(([prov, arr]) => (
          <div key={prov} className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
              {prov}
            </p>
            <div className="flex flex-wrap gap-2">
              {arr.map((b) => (
                <Link
                  key={b.id}
                  href={`/bases/${b.id}`}
                  className="px-2.5 py-1 rounded-full text-xs bg-background border hover:border-primary transition-colors"
                >
                  {b.emoji} {b.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
