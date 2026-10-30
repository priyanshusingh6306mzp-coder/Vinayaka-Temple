import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function audit() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  for (const width of [360, 1280]) {
    console.log(`\n========================================`);
    console.log(`Running axe-core audit at ${width}px...`);
    console.log(`========================================`);
    const context = await browser.newContext({
      viewport: { width, height: 800 },
    });
    const page = await context.newPage();
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

    // Initial cookies check
    const cookies = await context.cookies();
    console.log(`Initial cookies present at ${width}px (${cookies.length}):`);
    cookies.forEach((c) => console.log(`  - ${c.name} (${c.domain}, path: ${c.path})`));

    // Headings check
    const headings = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      return elements.map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().replace(/\s+/g, " "),
      }));
    });
    console.log(`\nHeading Outline (${headings.length} headings):`);
    headings.forEach((h) => console.log(`  ${h.tag.toUpperCase()}: ${h.text}`));

    // Axe audit
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    console.log(`\nAxe audit completed: ${results.violations.length} violation(s) found.`);

    for (const v of results.violations) {
      console.log(`\n[VIOLATION] ${v.id} (${v.impact}): ${v.help}`);
      console.log(`Help URL: ${v.helpUrl}`);
      for (const node of v.nodes) {
        console.log(`  Selector: ${node.target.join(" ")}`);
        console.log(`  HTML: ${node.html}`);
        if (node.any && node.any.length > 0) {
          for (const item of node.any) {
            console.log(`  Detail: ${item.message}`);
            if (item.data) {
              console.log(`  Data: ${JSON.stringify(item.data)}`);
            }
          }
        }
      }
    }

    await context.close();
  }

  await browser.close();
}

audit().catch(console.error);
