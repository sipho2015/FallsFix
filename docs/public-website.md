# Public website

The public website introduces FallsFix, its Victoria Falls service area, and twelve service categories. All request buttons lead to `/request-service`, optionally with a known category selected. Verified customers can submit a request for administrator review and receive a stored reference. Anonymous visitors receive login and registration links. A request does not guarantee a booking or technician availability.

Home, Services, How It Works, About, Become a Technician, and Contact use shared navigation, footer, and the supplied logo. Each service card includes an optimized local illustration. Browser icons and social preview images also use the logo. See [image provenance](service-images.md).

The service catalogue supports search and group filters. Technician applications are available through the customer workspace. Owner-provided phone/email links and business hours remain on the contact page.

Public routes have titles, headings, main landmarks, and a skip link. Forms provide labels and pending/error feedback. The mobile menu exposes expanded state and Escape handling; FAQ controls use native details elements. These measures do not replace a browser accessibility audit.

`npm run test:smoke` checks public routes, navigation, category selection, and 404 recovery against `TEST_BASE_URL`. Interactive mobile and keyboard checks remain pending because the in-app browser has no available session in this environment. Operational integration tests cover authenticated request submission separately.
