import type { Metadata } from "next";
import { PageIntro } from "@/frontend/components/page-intro";
import { photographs } from "@/shared/data/photography";

export const metadata: Metadata = { title: "Photo credits" };

export default function PhotoCreditsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="THE PHOTOGRAPHY"
        title="Real work. Thoughtful imagery."
      >
        <p>
          The service photographs are licensed stock images showing the kinds of
          work and equipment associated with each category. They do not identify
          FallsFix staff, customers or completed jobs, or imply endorsement by
          the people pictured.
        </p>
      </PageIntro>
      <div className="table-scroll">
        <table>
          <caption>Photographers and original sources</caption>
          <thead>
            <tr>
              <th scope="col">Subject</th>
              <th scope="col">Photographer</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {photographs.map((photo) => (
              <tr key={photo.slug}>
                <th scope="row">{photo.alt}</th>
                <td>{photo.photographer}</td>
                <td>
                  <a
                    className="text-link"
                    href={photo.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View original on Pexels
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Used under the{" "}
        <a
          className="text-link"
          href="https://www.pexels.com/license/"
          target="_blank"
          rel="noreferrer"
        >
          Pexels license
        </a>
        . The FallsFix logo is separate owner-supplied branding.
      </p>
    </main>
  );
}
