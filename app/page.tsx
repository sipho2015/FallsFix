export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-20 sm:px-10 sm:py-28">
      <section aria-labelledby="welcome-title" className="max-w-3xl">
        <p className="mb-7 inline-flex rounded-full border border-ink/20 px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase">Preparing to launch</p>
        <h1 id="welcome-title" className="text-4xl leading-[1.08] font-semibold tracking-tight sm:text-6xl">A little help.<br />A better cared-for home.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-muted">We’re building a simpler way to arrange repairs and property maintenance in Victoria Falls.</p>
        <p className="mt-6 max-w-xl border-l-2 border-[#678a32] pl-5 text-base leading-7">FallsFix is not accepting service requests yet. Please check back as we prepare to open.</p>
      </section>
    </main>
  );
}
