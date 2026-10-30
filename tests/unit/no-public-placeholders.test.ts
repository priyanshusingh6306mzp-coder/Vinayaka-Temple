import { describe, it, expect } from "vitest";
import { SITE_CONFIG } from "@/content/site";

describe("Public Website - No Placeholders Rendered Guard", () => {
  it("ensures no public SITE_CONFIG field contains the substring [PLACEHOLDER]", () => {
    // Fields intended for public consumption
    const publicSections = [
      SITE_CONFIG.name,
      SITE_CONFIG.nameHindi,
      SITE_CONFIG.tagline,
      SITE_CONFIG.taglineHindi,
      SITE_CONFIG.description,
      SITE_CONFIG.location.campus,
      SITE_CONFIG.location.plot,
      SITE_CONFIG.location.block,
      SITE_CONFIG.location.sector,
      SITE_CONFIG.location.city,
      SITE_CONFIG.location.state,
      SITE_CONFIG.location.pincode,
      SITE_CONFIG.location.streetAddress,
      SITE_CONFIG.location.fullAddress,
      SITE_CONFIG.location.campusEntryInstructions,
      SITE_CONFIG.contact.displayPhone,
      SITE_CONFIG.transit.nearestMetro,
      ...SITE_CONFIG.timings.map((t) => `${t.session} ${t.sessionHindi} ${t.time} ${t.description}`),
      ...SITE_CONFIG.amenities.map((a) => `${a.title} ${a.titleHindi} ${a.description}`),
      SITE_CONFIG.architecture.style,
      SITE_CONFIG.architecture.idol,
      SITE_CONFIG.architecture.atmosphere,
      ...SITE_CONFIG.poojaTypes.map((p) => `${p.name} ${p.nameHindi} ${p.description}`),
    ];

    for (const val of publicSections) {
      expect(val).not.toContain("[PLACEHOLDER]");
    }
  });

  it("ensures unconfirmed items remain strictly encapsulated inside unconfirmed block", () => {
    // Unconfirmed block exists for internal notes but is not referenced in public pages
    expect(SITE_CONFIG.unconfirmed).toBeDefined();
    expect(SITE_CONFIG.unconfirmed.poojaListPendingConfirmation).toBe(true);
  });

  it("ensures transit does not render unconfirmed bus routes or distances", () => {
    const transitAny = SITE_CONFIG.transit as Record<string, unknown>;
    expect(transitAny.busRoute).toBeUndefined();
    expect(transitAny.distanceFromMetro).toBeUndefined();
    expect(SITE_CONFIG.transit.nearestMetro).not.toContain("Blue Line");
    expect(SITE_CONFIG.transit.nearestMetro).toBe("Noida Sector 62 Metro Station");
  });

  it("ensures fullAddress contains C-20/1 in exact expected form", () => {
    const expected =
      "Inside the campus of JSS Academy of Technical Education, C-20/1, C Block, Phase 2, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309";
    expect(SITE_CONFIG.location.fullAddress).toBe(expected);
    expect(SITE_CONFIG.location.streetAddress).toBe(expected);
  });
});
