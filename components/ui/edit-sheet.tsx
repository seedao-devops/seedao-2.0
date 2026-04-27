"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * Bottom-drawer shell for focused detail / edit panels. Mobile-first: slides
 * up from the bottom with a drag-handle hint and rounded top corners,
 * scrolls inside while the title stays sticky, and respects iOS
 * `safe-area-inset-bottom`. Centered with a max width on desktop so it
 * doesn't span the full viewport.
 *
 * Used by the journey profile-editor sections and the admin tables that need
 * a focused operations panel — keeps the whole product on one drawer style
 * instead of a mix of side sheets + center dialogs.
 */
export function EditSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="gap-0">
        <div
          aria-hidden
          className="sticky top-0 z-10 flex justify-center bg-background pt-2.5 pb-1"
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>
        <SheetHeader className="sticky top-[18px] z-10 border-b bg-background px-5 pt-2 pb-3 text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className={description ? undefined : "sr-only"}>
            {description ?? `编辑${title}`}
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
