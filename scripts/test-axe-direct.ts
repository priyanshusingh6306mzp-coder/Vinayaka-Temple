import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE_URL = "http://127.0.0.1:3000";

async function runAudit() {
  console.log("\n=======================================================");
  console.log("STARTING PART A AXE, COOKIE, HEADING & LCP AUDIT");
  console.log("=======================================================\n");

  const browser = await chromium.launch({ channel: "msedge", headless: true });

  try {
    for (const width of [360, 1280]) {
      console.log(`\n-------------------------------------------------------`);
      console.log(`AUDITING AT ${width}px VIEWPORT`);
      console.log(`-------------------------------------------------------`);

      const context = await browser.newContext({
        viewport: { width, height: 800 },
      });
      const page = await context.newPage();
      page.setDefaultTimeout(60000);

      // Navigate to homepage
      await page.goto(BASE_URL, { waitUntil: "networkidle" });

      // Check Cookies
      const cookies = await context.cookies();
      console.log(`\nCookies present on initial load at ${width}px (${cookies.length}):`);
      if (cookies.length === 0) {
        console.log("  ✓ ZERO cookies set on initial load.");
      } else {
        cookies.forEach((c) => {
          console.log(`  - ${c.name} (domain: ${c.domain}, path: ${c.path})`);
        });
      }
      const thirdPartyCookies = cookies.filter(
        (c) => !c.domain.includes("127.0.0.1") && !c.domain.includes("localhost")
      );
      console.log(`  ✓ Third-party cookies count: ${thirdPartyCookies.length}`);

      // Heading Outline
      if (width === 360) {
        console.log("\nHomepage Heading Outline:");
        const headings = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((el) => ({
            tag: el.tagName.toUpperCase(),
            text: el.textContent?.trim().replace(/\s+/g, " "),
          }));
        });
        headings.forEach((h) => console.log(`  ${h.tag}: ${h.text}`));
      }

      // LCP element & breakdown inspection
      if (width === 360) {
        console.log("\nMobile LCP Metric Breakdown (Performance API):");
        const lcpMetrics = await page.evaluate(async () => {
          return new Promise((resolve) => {
            const observer = new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries();
              const lastEntry = entries[entries.length - 1] as any;
              resolve({
                renderTime: Math.round(lastEntry.renderTime || lastEntry.loadTime),
                loadTime: Math.round(lastEntry.loadTime),
                startTime: Math.round(lastEntry.startTime),
                elementTag: lastEntry.element?.tagName || "UNKNOWN",
                elementClass: lastEntry.element?.className || "",
                size: lastEntry.size,
                url: lastEntry.url || "",
              });
            });
            observer.observe({ type: "largest-contentful-paint", buffered: true });
            setTimeout(() => resolve(null), 3000);
          });
        });

        const navTiming = await page.evaluate(() => {
          const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
          if (!nav) return null;
          return {
            ttfb: Math.round(nav.responseStart - nav.requestStart),
            loadDelay: Math.round(nav.responseEnd - nav.responseStart),
            domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.requestStart),
            loadComplete: Math.round(nav.loadEventEnd - nav.requestStart),
          };
        });

        console.log("  Navigation Timing (TTFB & Load Delay):", JSON.stringify(navTiming, null, 2));
        console.log("  LCP Entry Detail:", JSON.stringify(lcpMetrics, null, 2));
      }

      // Axe-core audit
      console.log("\nRunning Axe Accessibility Audit...");
      const axeResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const contrastViolations = axeResults.violations.filter((v) => v.id === "color-contrast");
      const headingViolations = axeResults.violations.filter(
        (v) => v.id.includes("heading") || v.id.includes("hierarchy")
      );

      console.log(`  Total Violations: ${axeResults.violations.length}`);
      console.log(`  Color Contrast Violations: ${contrastViolations.length}`);
      console.log(`  Heading Order Violations: ${headingViolations.length}`);

      if (contrastViolations.length > 0) {
        console.warn("  Contrast violations detected:");
        contrastViolations.forEach((v) => {
          v.nodes.forEach((n) => console.log(`    - Selector: ${n.target.join(" ")} (${n.html})`));
        });
      }

      if (headingViolations.length > 0) {
        console.warn("  Heading violations detected:");
        headingViolations.forEach((v) => {
          v.nodes.forEach((n) => console.log(`    - Selector: ${n.target.join(" ")} (${n.html})`));
        });
      }

      await context.close();
    }

    console.log("\n=======================================================");
    console.log("ALL PART A VERIFICATIONS COMPLETED!");
    console.log("=======================================================\n");
  } finally {
    await browser.close();
  }
}

runAudit().catch(console.error);
