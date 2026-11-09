import { describe, it, expect } from "vitest";
import React from "react";

// Ensure React is available globally for JSX runtime in unit tests
(globalThis as any).React = React;

import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "@/app/page";
import GalleryPage from "@/app/gallery/page";
import GalleryOtherPage from "@/app/gallery/other/page";
import SchedulePage from "@/app/schedule/page";
import PoojaPage from "@/app/pooja/page";
import NotFound from "@/app/not-found";
import { JsonLd } from "@/components/public/JsonLd";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("Rendered-HTML Guard: Public Routes Phone Isolation", () => {
  // Regex guards
  const TEL_HREF_REGEX = /<a[^>]+href=["']tel:[^"']*["']/i;
  const WA_ME_NUMBER_REGEX = /wa\.me\/\d+/i;

  function stripAllowedDevoteePlaceholders(html: string): string {
    // Devotee phone input placeholder attribute (e.g. placeholder="98765 43210") is allowed sample guidance
    return html.replace(/placeholder=["'][^"']*["']/gi, "");
  }

  function assertCleanPublicHtml(html: string, routeName: string) {
    // 1. Fails if HTML contains any href starting with "tel:"
    expect(
      TEL_HREF_REGEX.test(html),
      `Route ${routeName} rendered a tel: link: ${html.match(TEL_HREF_REGEX)?.[0]}`
    ).toBe(false);

    // 2. Fails if HTML contains a wa.me link containing a phone number
    expect(
      WA_ME_NUMBER_REGEX.test(html),
      `Route ${routeName} rendered a wa.me link containing a telephone number: ${html.match(WA_ME_NUMBER_REGEX)?.[0]}`
    ).toBe(false);

    // 3. Fails if HTML contains a 10-digit mobile number starting 6-9
    const strippedHtml = stripAllowedDevoteePlaceholders(html);
    const tenDigitMatch = strippedHtml.match(/\b[6-9]\d{9}\b/g);
    expect(
      tenDigitMatch,
      `Route ${routeName} rendered raw 10-digit mobile number(s): ${tenDigitMatch?.join(", ")}`
    ).toBeNull();
  }

  it("ensures Homepage (/) renders cleanly with no phone numbers, no tel: links, and no wa.me numbers", async () => {
    const html = renderToStaticMarkup(await HomePage());
    assertCleanPublicHtml(html, "/");
    expect(html).toContain("Request a Pooja");
    expect(html).toContain("Contact");
  });

  it("ensures Gallery (/gallery) renders cleanly with no phone numbers or tel: links", async () => {
    const html = renderToStaticMarkup(await GalleryPage({ searchParams: Promise.resolve({}) }));
    assertCleanPublicHtml(html, "/gallery");
  });

  it("ensures Gallery Other (/gallery/other) renders cleanly with no phone numbers or tel: links", async () => {
    const html = renderToStaticMarkup(await GalleryOtherPage({ searchParams: Promise.resolve({}) }));
    assertCleanPublicHtml(html, "/gallery/other");
  });

  it("ensures Schedule (/schedule) renders cleanly with WhatsApp share without phone number", async () => {
    const html = renderToStaticMarkup(await SchedulePage());
    assertCleanPublicHtml(html, "/schedule");
    // Share on WhatsApp button should exist without phone number: wa.me/?text=...
    if (html.includes("wa.me")) {
      expect(html).toContain("wa.me/?text=");
    }
  });

  it("ensures Pooja page (/pooja) renders the calm sentence above the form and dropdown option", () => {
    const html = renderToStaticMarkup(PoojaPage());
    assertCleanPublicHtml(html, "/pooja");

    // Must have calm sentence directly above form
    expect(html).toContain(
      "To reach the temple, send a request here. The temple will contact you on the mobile number you enter."
    );

    // Dropdown option must be 'Other / general enquiry'
    expect(html).toContain("Other / general enquiry");
    expect(html).not.toContain("Other / not sure, I will call");

    // Devotee phone input must exist
    expect(html).toContain('id="phone"');
    expect(html).toContain('type="tel"');
  });

  it("ensures Not Found page (/not-found) renders cleanly without phone numbers", () => {
    const html = renderToStaticMarkup(NotFound());
    assertCleanPublicHtml(html, "/not-found");
  });

  it("ensures robots.txt output contains no telephone or phone-like data", () => {
    const r = robots();
    const str = JSON.stringify(r);
    expect(str).not.toMatch(/tel:/i);
    expect(str).not.toMatch(/\b[6-9]\d{9}\b/);
  });

  it("ensures sitemap.xml output contains no telephone or phone-like data", async () => {
    const s = await sitemap();
    const str = JSON.stringify(s);
    expect(str).not.toMatch(/tel:/i);
    expect(str).not.toMatch(/\b[6-9]\d{9}\b/);
  });

  it("ensures JsonLd output omits telephone property when unconfigured", () => {
    const html = renderToStaticMarkup(React.createElement(JsonLd));
    assertCleanPublicHtml(html, "JsonLd");
    expect(html).not.toContain('"telephone"');
  });
});
