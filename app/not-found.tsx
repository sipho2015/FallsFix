import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-6 py-24 sm:px-10">
      <p className="text-sm font-bold text-muted">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-5 max-w-lg leading-7 text-muted">This page may have moved, or the address may be incorrect.</p>
      <Link href="/" className="mt-8 inline-block rounded-lg bg-ink px-5 py-3 font-semibold text-white hover:bg-[#285548]">Back to FallsFix</Link>
    </main>
  );
}
