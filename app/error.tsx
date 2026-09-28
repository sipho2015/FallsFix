"use client";
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <div className="notice-panel">
        <h1>We couldn’t load this page.</h1>
        <p>
          Check your connection and try again. If the problem continues, please
          come back later.
        </p>
        <button className="button" onClick={retry}>
          Try again
        </button>
      </div>
    </main>
  );
}
