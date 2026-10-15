import { PageIntro } from "./page-intro";
import { AuthForm } from "./auth-form";
import type { AuthMode } from "@/shared/validation/auth";
export function AuthPage({ mode, title, description, token, notice, returnTo }: { mode: AuthMode; title: string; description: string; token?: string; notice?: string; returnTo?: string }) {
  return <main id="main-content" tabIndex={-1} className="shell page-content">
    <PageIntro eyebrow="YOUR FALLSFIX ACCOUNT" title={title}><p>{description}</p></PageIntro>
    {notice && <p className="notice-panel" role="status">{notice}</p>}
    <AuthForm mode={mode} token={token} returnTo={returnTo} />
  </main>;
}
