import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto w-full max-w-md min-h-dvh flex flex-col bg-background">
      <header className="px-5 py-4">
        <Link href="/" className="text-lg font-serif font-bold tracking-tight">
          SeeDAO
        </Link>
      </header>
      <main className="flex-1 px-5 pb-10">{children}</main>
    </div>
  );
}
