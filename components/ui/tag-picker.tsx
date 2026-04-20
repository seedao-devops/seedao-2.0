"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TagPickerProps<T extends string> {
  options: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
  max?: number;
  labelMap?: Partial<Record<T, string>>;
  className?: string;
}

/** Pill-style multi-select. Honors `max` and toggles on click. */
export function TagPicker<T extends string>({
  options,
  value,
  onChange,
  max,
  labelMap,
  className,
}: TagPickerProps<T>) {
  function toggle(opt: T) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      if (max && value.length >= max) return;
      onChange([...value, opt]);
    }
  }
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-colors",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-accent/10",
            )}
          >
            {labelMap?.[opt] ?? opt}
          </button>
        );
      })}
    </div>
  );
}
