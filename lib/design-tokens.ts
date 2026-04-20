/**
 * Single source of truth for visual design.
 *
 * Edit values here to retheme the whole app. The CSS variables in
 * `app/globals.css` mirror these names; if you change a key, update both.
 *
 * Palette inspired by nomad-craft-vine.lovable.app — warm earthy tones,
 * deep forest green primary, terracotta accent, generous radii.
 */

export const tokens = {
  colors: {
    // Light mode
    light: {
      background: "oklch(0.98 0.012 85)",          // warm cream
      foreground: "oklch(0.22 0.025 70)",          // deep warm brown
      card: "oklch(0.995 0.008 85)",
      cardForeground: "oklch(0.22 0.025 70)",
      popover: "oklch(0.995 0.008 85)",
      popoverForeground: "oklch(0.22 0.025 70)",
      primary: "oklch(0.42 0.075 155)",            // deep forest green
      primaryForeground: "oklch(0.98 0.012 85)",
      secondary: "oklch(0.93 0.022 85)",           // warm taupe
      secondaryForeground: "oklch(0.32 0.04 70)",
      muted: "oklch(0.94 0.018 85)",
      mutedForeground: "oklch(0.5 0.025 70)",
      accent: "oklch(0.65 0.155 45)",              // terracotta
      accentForeground: "oklch(0.99 0.005 85)",
      destructive: "oklch(0.55 0.22 25)",
      destructiveForeground: "oklch(0.98 0.012 85)",
      border: "oklch(0.88 0.022 85)",
      input: "oklch(0.92 0.018 85)",
      ring: "oklch(0.42 0.075 155)",
      chart1: "oklch(0.42 0.075 155)",
      chart2: "oklch(0.65 0.155 45)",
      chart3: "oklch(0.7 0.12 90)",
      chart4: "oklch(0.55 0.08 200)",
      chart5: "oklch(0.5 0.1 320)",
      sidebar: "oklch(0.96 0.015 85)",
      sidebarForeground: "oklch(0.22 0.025 70)",
      sidebarPrimary: "oklch(0.42 0.075 155)",
      sidebarPrimaryForeground: "oklch(0.98 0.012 85)",
      sidebarAccent: "oklch(0.92 0.022 85)",
      sidebarAccentForeground: "oklch(0.32 0.04 70)",
      sidebarBorder: "oklch(0.88 0.022 85)",
      sidebarRing: "oklch(0.42 0.075 155)",
    },
    // Dark mode
    dark: {
      background: "oklch(0.18 0.018 70)",
      foreground: "oklch(0.95 0.012 85)",
      card: "oklch(0.22 0.022 70)",
      cardForeground: "oklch(0.95 0.012 85)",
      popover: "oklch(0.22 0.022 70)",
      popoverForeground: "oklch(0.95 0.012 85)",
      primary: "oklch(0.72 0.105 155)",
      primaryForeground: "oklch(0.18 0.018 70)",
      secondary: "oklch(0.3 0.025 70)",
      secondaryForeground: "oklch(0.95 0.012 85)",
      muted: "oklch(0.28 0.022 70)",
      mutedForeground: "oklch(0.7 0.022 85)",
      accent: "oklch(0.72 0.155 45)",
      accentForeground: "oklch(0.18 0.018 70)",
      destructive: "oklch(0.65 0.22 25)",
      destructiveForeground: "oklch(0.95 0.012 85)",
      border: "oklch(1 0 0 / 12%)",
      input: "oklch(1 0 0 / 18%)",
      ring: "oklch(0.72 0.105 155)",
      chart1: "oklch(0.72 0.105 155)",
      chart2: "oklch(0.72 0.155 45)",
      chart3: "oklch(0.78 0.12 90)",
      chart4: "oklch(0.65 0.08 200)",
      chart5: "oklch(0.6 0.1 320)",
      sidebar: "oklch(0.22 0.022 70)",
      sidebarForeground: "oklch(0.95 0.012 85)",
      sidebarPrimary: "oklch(0.72 0.105 155)",
      sidebarPrimaryForeground: "oklch(0.18 0.018 70)",
      sidebarAccent: "oklch(0.3 0.025 70)",
      sidebarAccentForeground: "oklch(0.95 0.012 85)",
      sidebarBorder: "oklch(1 0 0 / 12%)",
      sidebarRing: "oklch(0.72 0.105 155)",
    },
  },
  fonts: {
    // Loaded in app/layout.tsx via next/font; --font-sans is the var to swap.
    sans: "var(--font-sans)",
    serif: "var(--font-serif)",
    mono: "var(--font-mono)",
  },
  radii: {
    base: "0.875rem", // generous, like the reference
  },
  spacing: {
    shellMaxWidth: "28rem", // mobile-first user shell (max-w-md)
    adminMaxWidth: "96rem",
  },
} as const;

export type DesignTokens = typeof tokens;
