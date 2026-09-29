"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authPaths, authSchemas, type AuthMode } from "@/shared/validation/auth";

const labels: Record<AuthMode, string> = { register: "Create customer account", login: "Log in", forgot: "Send reset link", resend: "Send verification link", reset: "Save new password" };
export function AuthForm({ mode, token = "" }: { mode: AuthMode; token?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input: Record<string, unknown> = Object.fromEntries(new FormData(form));
    if (mode === "reset") input.token = token;
    const parsed = authSchemas[mode].safeParse(input);
    setMessage("");
    if (!parsed.success) {
      const fields = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));
      setErrors(fields); setMessage("Please check the highlighted details.");
      form.querySelector<HTMLInputElement>(`[name="${Object.keys(fields)[0]}"]`)?.focus();
      return;
    }
    setErrors({}); setPending(true);
    try {
      const result = await fetch(`/api/auth/${authPaths[mode]}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      if (!result.ok) {
        setMessage(result.status === 429 ? "Too many attempts. Wait a minute and try again." : result.status === 503 ? "Account services are temporarily unavailable. Please try again later." : mode === "login" ? "Unable to log in. Check your details and make sure you have verified your email." : mode === "reset" ? "This reset link may have expired or already been used. Request a new link." : "Unable to complete this request. Please try again.");
        return;
      }
      form.reset();
      if (mode === "login") { router.replace("/account"); router.refresh(); }
      else if (mode === "reset") { router.replace("/login?reset=1"); router.refresh(); }
      else setMessage(mode === "forgot" ? "If an account exists for that address, you will receive a password-reset link. Check your email." : "If this address needs verification, you will receive a link. Check your email before logging in.");
    } catch { setMessage("Unable to connect. Check your connection and try again."); }
    finally { setPending(false); }
  }
  const field = (name: string, label: string, type: string, autoComplete: string, maxLength: number) => (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} autoComplete={autoComplete} maxLength={maxLength} required aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : type === "password" && mode !== "login" ? "password-help" : undefined} />
      {errors[name] && <span className="auth-error" id={`${name}-error`}>{errors[name]}</span>}
    </div>
  );
  return <div className="auth-panel">
    <form onSubmit={submit} noValidate aria-busy={pending}>
      <fieldset disabled={pending}>
        <legend className="sr-only">{labels[mode]}</legend>
        {mode === "register" && field("name", "Your name", "text", "name", 120)}
        {mode !== "reset" && field("email", "Email address", "email", "email", 254)}
        {["login", "register", "reset"].includes(mode) && field(mode === "reset" ? "newPassword" : "password", mode === "reset" ? "New password" : "Password", "password", mode === "login" ? "current-password" : "new-password", 128)}
        {(mode === "register" || mode === "reset") && <p id="password-help">Use 12–128 characters. A long, unique passphrase works well.</p>}
        <button className="button button-primary" type="submit" disabled={pending || (mode === "reset" && !token)}>{pending ? "Please wait…" : labels[mode]}</button>
      </fieldset>
      <p className="auth-message" role="status" aria-live="polite">{message}</p>
    </form>
    <nav className="auth-links" aria-label="Account help">
      {mode !== "login" && <Link href="/login">Back to login</Link>}
      {mode === "login" && <><Link href="/register">Create a customer account</Link><Link href="/forgot-password">Forgot your password?</Link><Link href="/verify-email">Resend verification email</Link></>}
      {mode === "reset" && <Link href="/forgot-password">Request a new reset link</Link>}
    </nav>
  </div>;
}
