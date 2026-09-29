"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function SignOut() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return <><button className="button button-primary" disabled={pending} onClick={async () => {
    setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error();
      router.replace("/login"); router.refresh();
    } catch { setError("Unable to sign out. Please try again."); }
    finally { setPending(false); }
  }}>{pending ? "Signing out…" : "Sign out"}</button><p role="status">{error}</p></>;
}
