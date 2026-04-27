import Link from "next/link";
import { AuthBackLink } from "@/components/layout/auth-back-link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto w-full max-w-md min-h-dvh flex flex-col bg-background">
      <header className="px-5 py-4 flex items-center justify-between gap-3">
        <AuthBackLink />
        <Link
          href="/"
          className="text-h4 font-serif font-bold ml-auto"
        >
          SeeDAO
        </Link>
      </header>
      <main className="flex-1 px-5 pb-10">{children}</main>
    </div>
  );
}
