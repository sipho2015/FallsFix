"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { chargeTypes } from "@/shared/validation/commercial";
export type Field = { name: string; label: string; type?: string; required?: boolean; value?: string; options?: { value: string; label: string }[]; maxLength?: number };
export function ActionForm({ action, title, fixed = {}, fields = [], redirectToJob = false, initialLines }: { action: string; title: string; fixed?: Record<string, unknown>; fields?: Field[]; redirectToJob?: boolean; initialLines?: { type: string; description: string; quantity: string; unitAmount: string }[] }) {
  const id = useId(), router = useRouter(), key = useRef<string | null>(null);
  const [pending, setPending] = useState(false), [message, setMessage] = useState("");
  const [lines, setLines] = useState(initialLines ?? [{ type: "LABOUR", description: "", quantity: "1", unitAmount: "" }, { type: "CALLOUT", description: "Call-out / travel fee", quantity: "1", unitAmount: "" }]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return; setPending(true); setMessage("");
    const data: Record<string, unknown> = { action, ...fixed, ...Object.fromEntries(new FormData(event.currentTarget)) };
    if (action === "request" || action === "payment" || action === "approveRefund") { key.current ??= crypto.randomUUID(); data[action === "request" ? "requestKey" : "operationId"] = key.current; }
    if (action === "quote") { data.lines = lines.map(l => ({ ...l, quantity: Number(l.quantity) })); data.send = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") !== "draft"; }
    try {
      const response = await fetch("/api/operations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json(); setMessage(result.message);
      if (response.ok) { if (redirectToJob && result.jobId) router.push(`/jobs/${result.jobId}`); router.refresh(); }
      if (response.status === 401) setMessage("Please log in with a verified account, then return to submit your request.");
    } catch { setMessage("Could not connect. Your inputs are still here; please try again."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="action-form" aria-busy={pending}>
    <fieldset disabled={pending}><legend>{title}</legend>
      {fields.map(field => <div className="auth-field" key={field.name}>
        <label htmlFor={`${id}-${field.name}`}>{field.label}</label>
        {field.options ? <select id={`${id}-${field.name}`} name={field.name} defaultValue={field.value ?? ""} required={field.required !== false}><option value="" disabled>Select an option</option>{field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          : field.type === "textarea" ? <textarea id={`${id}-${field.name}`} name={field.name} defaultValue={field.value} rows={4} maxLength={field.maxLength ?? 5000} required={field.required !== false} />
          : <input id={`${id}-${field.name}`} name={field.name} type={field.type ?? "text"} defaultValue={field.value} maxLength={field.maxLength ?? 300} required={field.required !== false} />}
      </div>)}
      {action === "quote" && <div className="quote-lines">{lines.map((line,index) => <div className="quote-line" key={index}><label>Charge type<select required value={line.type} onChange={e => setLines(lines.map((l,i) => i === index ? {...l,type:e.target.value} : l))}><option value="" disabled>Select type</option>{chargeTypes.map(type=><option key={type} value={type}>{type}</option>)}</select></label>{(["description", "quantity", "unitAmount"] as const).map(name => <label key={name}>{name === "unitAmount" ? "Unit price" : name === "quantity" ? "Quantity" : "Item description"}<input required value={line[name]} type={name === "quantity" ? "number" : "text"} min={1} max={1000} onChange={e => setLines(lines.map((l,i) => i === index ? { ...l, [name]: e.target.value } : l))} /></label>)}{lines.length > 1 && <button type="button" onClick={() => setLines(lines.filter((_,i) => i !== index))}>Remove item {index + 1}</button>}</div>)}<button type="button" disabled={lines.length >= 30} onClick={() => setLines([...lines, { type: "LABOUR", description: "", quantity: "1", unitAmount: "" }])}>Add item</button></div>}
      <button type="submit" className="button">{pending ? "Saving…" : title}</button>
      {action === "quote" && <button type="submit" value="draft" className="button">Save draft</button>}
    </fieldset><p role="status" className="auth-message">{message}</p>
  </form>;
}
