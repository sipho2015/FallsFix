"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
export function PhotoUpload({ jobId }: { jobId: string }) {
  const [pending,setPending] = useState(false), [message,setMessage] = useState(""); const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget, file = new FormData(form).get("photo");
    if (!(file instanceof File) || !file.size || file.size > 5*1024*1024) { setMessage("Choose a photo up to 5 MB."); return; }
    setPending(true);
    try { const response = await fetch(`/api/photos?jobId=${jobId}`, { method: "POST", headers: { "Content-Type": file.type }, body: file }); const result = await response.json(); setMessage(result.message); if(response.ok) { form.reset(); router.refresh(); } }
    catch { setMessage("Could not upload. Please try again."); } finally { setPending(false); }
  }
  return <form onSubmit={submit} className="action-form"><fieldset disabled={pending}><legend>Add a private photo</legend><label htmlFor="job-photo">JPEG, PNG or WebP; up to 5 MB. Maximum 10 photos per request.</label><input id="job-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required /><button className="button">{pending ? "Uploading…" : "Upload photo"}</button></fieldset><p role="status">{message}</p></form>;
}
export function PrintInvoice() { return <button className="button no-print" onClick={() => window.print()}>Print / save as PDF</button>; }
