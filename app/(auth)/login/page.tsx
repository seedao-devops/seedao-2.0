import { Suspense } from "react";
import { LoginForm } from "./login-form";

// `useSearchParams()` inside <LoginForm/> requires a Suspense boundary so the
// page can statically prerender; without it Next bails the whole route out of
// SSG. The fallback is intentionally empty — the form mounts immediately on
// the client.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
