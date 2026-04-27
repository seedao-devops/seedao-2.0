"use client";

import { HeaderSection } from "./sections/header-section";
import { StaysSection } from "./sections/stays-section";
import { LearningSection } from "./sections/learning-section";
import { TeachingSection } from "./sections/teaching-section";
import { WorksSection } from "./sections/works-section";
import { WishesSection } from "./sections/wishes-section";

/**
 * Profile editor as a list of summary cards. Each card opens its own sheet
 * for focused editing — no single-form-with-everything anymore. All sections
 * share the same SWR-backed `useJourney()` cache, and each save merges its
 * slice into the cached journey before PUT'ing `/api/journey/me`.
 *
 * Bases and co-learning events are pulled by the sections that need them
 * via SWR, so this shell takes no props and works directly off the cache.
 */
export function ProfileEditor() {
  return (
    <div className="space-y-3">
      <HeaderSection />
      <StaysSection />
      <LearningSection />
      <TeachingSection />
      <WorksSection />
      <WishesSection />
    </div>
  );
}
