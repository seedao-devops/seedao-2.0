import Link from "next/link";

/**
 * Visitor-only shell for shared profile pages. Intentionally avoids
 * `UserShell` so the bottom navigation (探索基地 / 共学 / 我的旅程)
 * never appears for unauthenticated visitors. Keeps a slim SeeDAO
 * brand header so the page is recognizable, and reserves space at
 * the bottom for the page-level sticky CTA.
 */
export default function ShareLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto w-full max-w-md min-h-dvh flex flex-col bg-background relative">
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-background/80 backdrop-blur border-b">
        <Link href="/" className="text-h4 font-serif font-bold">
          SeeDAO
        </Link>
      </header>
      <main className="flex-1 pb-28">{children}</main>
    </div>
  );
}
