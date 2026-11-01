import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getSiteUrl, getAbsoluteUrl } from "@/lib/site-url";

describe("Canonical Site URL Safety Suite", () => {
  const originalEnv = { ...process.env };

  const setNodeEnv = (val: string) => {
    (process.env as Record<string, string | undefined>).NODE_ENV = val;
  };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    setNodeEnv("test");
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("prioritizes NEXT_PUBLIC_SITE_URL and strips trailing slashes", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://vinayakatemple.org///";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "vinayaka-temple.vercel.app";

    expect(getSiteUrl()).toBe("https://vinayakatemple.org");
    expect(getAbsoluteUrl("/schedule")).toBe("https://vinayakatemple.org/schedule");
    expect(getAbsoluteUrl("gallery")).toBe("https://vinayakatemple.org/gallery");
  });

  it("uses VERCEL_PROJECT_PRODUCTION_URL and prepends https:// when NEXT_PUBLIC_SITE_URL is unset", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "vinayaka-temple.vercel.app/";

    expect(getSiteUrl()).toBe("https://vinayaka-temple.vercel.app");
    expect(getAbsoluteUrl("/pooja")).toBe("https://vinayaka-temple.vercel.app/pooja");
  });

  it("uses VERCEL_PROJECT_PRODUCTION_URL as-is if it already starts with https://", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "https://vinayaka-temple.vercel.app";

    expect(getSiteUrl()).toBe("https://vinayaka-temple.vercel.app");
  });

  it("fails with an explicit error in production when neither URL is configured", () => {
    setNodeEnv("production");

    expect(() => getSiteUrl()).toThrowError(
      /Missing NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL in production environment/
    );
  });

  it("falls back safely to localhost:3000 in development / test when unset", () => {
    setNodeEnv("development");
    expect(getSiteUrl()).toBe("http://localhost:3000");

    setNodeEnv("test");
    expect(getSiteUrl()).toBe("http://localhost:3000");
    expect(getAbsoluteUrl("/api/events")).toBe("http://localhost:3000/api/events");
  });
});
