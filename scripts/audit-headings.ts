import { withServer, BASE_URL } from "./lib/with-server";

async function main() {
  await withServer(async ({ createPage }) => {
    const page = await createPage({ width: 1280, height: 800 });
    console.log(`\nNavigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    const headings = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      return items.map((el) => {
        const landmark = el.closest("header, main, footer, nav, aside")?.tagName.toLowerCase() || "body";
        return {
          tag: el.tagName.toUpperCase(),
          landmark,
          text: el.textContent?.trim().replace(/\s+/g, " "),
        };
      });
    });

    console.log("\n=======================================================");
    console.log("HOMEPAGE HEADING OUTLINE (WITH HTML5 LANDMARKS)");
    console.log("=======================================================");
    headings.forEach((h) => {
      console.log(`  <${h.landmark}> ${h.tag}: "${h.text}"`);
    });
    console.log("=======================================================\n");
  });
  process.exit(0);
}

main().catch((err) => {
  console.error("Error running heading audit:", err.message);
  process.exit(1);
});
