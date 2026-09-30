import assert from "node:assert/strict";
import test from "node:test";

const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3100";
const authRoutes = ["/login", "/register", "/forgot-password", "/verify-email", "/reset-password"];
const routes = ["/", "/services", "/how-it-works", "/about", "/become-a-technician", "/contact", "/request-service", ...authRoutes];

test("public routes render unique titles, landmarks, and prelaunch safeguards", async () => {
  const titles = new Set();
  for (const route of routes) {
    const response = await fetch(new URL(route, base));
    assert.equal(response.status, 200, route);
    assert.equal(response.headers.get("x-frame-options"), "DENY", route);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff", route);
    assert.equal(response.headers.get("x-powered-by"), null, route);
    const html = await response.text();
    assert.equal((html.match(/<main\b/g) ?? []).length, 1, route);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, route);
    assert.match(html, /id="main-content"/, route);
    assert.match(html, /name="robots" content="noindex/, route);
    assert.match(html, /Local service requests, reviewed personally/, route);
    if (authRoutes.includes(route) || route === "/request-service") assert.match(html, /<form\b/, route);
    else assert.doesNotMatch(html, /type="password"|<form\b/, route);
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title, route);
    assert.ok(!titles.has(title), `Duplicate page title on ${route}`);
    titles.add(title);
  }
});

test("all public navigation and catalogue links resolve", async () => {
  const links = new Set();
  for (const route of routes) {
    const html = await (await fetch(new URL(route, base))).text();
    for (const match of html.matchAll(/<a\b[^>]*href="([^"#]+)"/g)) {
      const href = match[1].replaceAll("&amp;", "&");
      if (href.startsWith("/") && !href.startsWith("//")) links.add(href);
    }
  }
  assert.ok(links.size >= routes.length, "Expected public and service links");
  for (const href of links) {
    const response = await fetch(new URL(href, base), { redirect: "manual" });
    if (href === "/account") {
      if (response.status === 307) assert.equal(response.headers.get("location"), "/login");
      else {
        assert.equal(response.status, 200);
        const html = await response.text();
        assert.match(html, /<meta[^>]*http-equiv="refresh"[^>]*content="[^\"]*url=\/login"/);
        assert.doesNotMatch(html, /Your account is ready/);
      }
      continue;
    }
    assert.equal(response.status, 200, href);
  }
});

test("catalogue previews use known categories and do not submit requests", async () => {
  const catalogue = await (await fetch(new URL("/services", base))).text();
  assert.equal((catalogue.match(/class="service-card"/g) ?? []).length, 12);
  for (const [query, heading] of [
    ["service=plumbing", "Plumbing"],
    ["service=unknown-service", "What do you need help with?"],
    ["service=plumbing&service=electrical", "What do you need help with?"],
    ["service=%3Cscript%3Ealert(1)%3C%2Fscript%3E", "What do you need help with?"],
  ]) {
    const response = await fetch(new URL(`/request-service?${query}`, base));
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(`>${heading}</h2>`), `Missing heading: ${heading}`);
    assert.match(html, /Submit service request/);
    assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  }
});

test("unknown pages return an actual 404 with a recovery link", async () => {
  const response = await fetch(new URL("/does-not-exist", base));
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Back to FallsFix/);
});
