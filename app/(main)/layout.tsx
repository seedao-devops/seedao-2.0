import { MobileNav } from "@/components/layout/mobile-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col pb-16">
      <main className="mx-auto w-full max-w-lg flex-1">{children}</main>
      <MobileNav />
    </div>
  );
}
