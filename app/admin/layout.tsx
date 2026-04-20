// Plain pass-through. Authed admin pages live under app/admin/(authed)/ with
// their own layout that mounts AdminShell; /admin/login renders bare.
export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
