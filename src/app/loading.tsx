export default function Loading() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <p role="status" className="loading-message">
        Getting the page ready…
      </p>
    </main>
  );
}
