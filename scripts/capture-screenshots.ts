import { chromium } from "@playwright/test";
import { spawn } from "child_process";
import http from "http";
import path from "path";
import fs from "fs";

const PORT = 3006;
const URL = `http://127.0.0.1:${PORT}`;

async function startNextServer() {
  const isWindows = process.platform === "win32";
  const npmCmd = isWindows ? "npm.cmd" : "npm";
  const proc = spawn(npmCmd, ["run", "start", "--", "-p", String(PORT)], {
    stdio: "ignore",
    shell: true,
  });

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const ok = await new Promise((res) => {
        http
          .get(URL, (response) => res(response.statusCode === 200))
          .on("error", () => res(false));
      });
      if (ok) return proc;
    } catch {
      // retry
    }
  }
  proc.kill("SIGTERM");
  throw new Error("Server failed to start on port " + PORT);
}

async function main() {
  const outDir = path.resolve(process.cwd(), "tests/screenshots");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log("Starting production server...");
  const server = await startNextServer();
  console.log("Server ready on " + URL);

  let browser;
  try {
    console.log("Launching installed browser (channel: msedge)...");
    browser = await chromium.launch({ channel: "msedge", headless: true });
  } catch (err: unknown) {
    console.log("msedge failed, trying channel: chrome...");
    try {
      browser = await chromium.launch({ channel: "chrome", headless: true });
    } catch (e: unknown) {
      console.log("Could not launch system browser:", e instanceof Error ? e.message : String(e));
      server.kill("SIGTERM");
      process.exit(0);
    }
  }

  try {
    const page = await browser.newPage();

    // 1. Mobile Viewport (360px)
    console.log("Capturing 360px mobile view...");
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(outDir, "temple-mobile-360px.png"),
      fullPage: true,
    });
    console.log("Saved: tests/screenshots/temple-mobile-360px.png");

    // 2. Desktop Viewport (1280px)
    console.log("Capturing 1280px desktop view...");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(outDir, "temple-desktop-1280px.png"),
      fullPage: true,
    });
    console.log("Saved: tests/screenshots/temple-desktop-1280px.png");

    console.log("Screenshots captured successfully!");
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch((e) => {
  console.error("Screenshot error:", e);
  process.exit(1);
});
