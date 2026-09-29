# Public website — Phase 3

The public site explains FallsFix's planned service in Victoria Falls. It is a prelaunch website, not an operating booking service. No database, API, authentication, messaging provider, or new runtime dependency was added in this phase.

## Routes and current behavior

| Route | Behavior |
| --- | --- |
| `/` | Introduction, six featured categories, planned process, local purpose, and technician information link |
| `/services` | Twelve planned categories, text search, group filters, result count, and clearable empty state |
| `/how-it-works` | Planned request-to-completion process and native expandable FAQs |
| `/about` | Business purpose and intended operating principles, without invented operational statistics |
| `/become-a-technician` | Planned network and verification expectations; applications not collected |
| `/contact` | Owner-provided phone/email links and hours: Monday–Friday and Sunday 08:00–17:00 CAT; Saturday closed |
| `/request-service` | Booking availability explanation and preparation checklist; no submission |
| `/request-service?service=plumbing` | Known category preview; unknown/repeated values safely fall back to general availability |
| `/login`, `/register` | Phase 5 customer login/registration forms; verification required |
| `/forgot-password`, `/verify-email`, `/reset-password` | Phase 5 recovery and verification forms |
| `/account` | Phase 5 protected account summary and sign out; anonymous visitors redirect to login |

Every public page has a unique title, meaningful description, one main landmark, a main heading, shared navigation/footer, and a skip-link target. The mobile menu exposes expanded state and closes on selection; Escape inside the menu closes it and returns focus to its button. Search result counts use a polite status announcement. FAQ controls use native `details`/`summary`. A reduced-motion rule disables transitions. These are implemented accessibility measures, not a completed accessibility audit.

## Content and architecture

`data/services.ts` is an editorial preview of the Phase 0 categories, not a pricing table or promise of technician availability. Phase 4's explicit seed reuses the category names/descriptions to create inactive database reference rows; public pages still do not query operational availability. No prices, ratings, technician counts, or claims of an existing verified network are fabricated.

Pages and common content components render on the server. `SiteHeader` and `ServiceCatalogue` are client components because menu/search state needs browser interaction. Search/filter state is local to the page; it is not stored or sent to a service. Selecting a category links to the request availability page; the server matches a single query value against known slugs and never trusts arbitrary query content as a service name.

The CSS uses responsive grids and breakpoints at 1000, 850, and 550 pixels, with mobile-friendly control sizing. The house illustration, service icons, and favicon are local SVG artwork. System fonts and local artwork avoid third-party asset requests. No stock technician photos or fake customer testimonials are used.

`loading.tsx` provides pending-route feedback. `error.tsx` provides a generic retry view without showing internal error details. It cannot guarantee recovery from network outages or failures in the root layout. There is no offline caching or offline submission.

All pages retain noindex metadata until launch details are verified. No sitemap, canonical production URL, business opening hours, or contact schema is invented. No contact form or technician application pretends to save data.

## Verification

From a stopped development server:

```powershell
npm run check
npm run build
npm start -- --port 3100
```

In another terminal:

```powershell
npm run test:smoke
```

For a different test server, set `$env:TEST_BASE_URL = 'http://127.0.0.1:3101'` before the test command. Tests use Node's built-in runner and `fetch`. They check HTTP status, shared protections, unique titles, landmarks, noindex, forms only on account routes, local navigation links, the anonymous account redirect, category preview links, invalid/repeated query handling, and genuine 404 responses. See [authentication tests](authentication.md#verification) for account behavior.

Browser connection was attempted but no browser was available. The following remain unverified and are required before marking Phase 3 fully complete:

- Visual layout and horizontal overflow at 360, 768, 1280, and 1920 CSS pixels.
- Mobile menu open/close, Escape focus return, navigation after selection, and browser back navigation.
- Search, group filtering, zero-result clearing, and screen-reader announcements.
- Keyboard skip link, focus visibility, FAQ operation, and client-side navigation.
- Error recovery and loading presentation under real failure/slow-network conditions.

HTTP tests do not replace these interactive checks. No deployment or production readiness is claimed.

### Recorded results

On the Phase 3 implementation, `npm run check` and `npm run build` passed. All four `npm run test:smoke` tests passed against the production server on port 3100. ESLint was also rerun after adding the test file and passed with zero warnings. No new dependency was added. The existing ESLint 9 support limitation documented in the development guide remains open.

## Before launch

The owner supplied `siphomoyo893@gmail.com`, phone `+263 789 652 298`, and hours of 08:00–17:00 Monday–Friday and Sunday, with Saturday closed. The contact page publishes those details with `mailto:` and `tel:` links. WhatsApp availability has not been separately specified.

Confirm service boundaries and commercial policies. The database, authentication, and role/ownership read guards exist; operational dashboards and the request workflow remain planned. Verify forms, SMTP delivery, deployment protections, and privacy notices before public personal-information collection. Only then replace booking availability notices with working operational flows.
