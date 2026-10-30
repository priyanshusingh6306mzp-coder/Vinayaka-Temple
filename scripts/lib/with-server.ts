import { spawn, ChildProcess } from "child_process";
import http from "http";
import net from "net";
import { chromium, Browser, Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

export const PORT = 3000;
export const BASE_URL = `http://127.0.0.1:${PORT}`;
export const prisma = new PrismaClient();

/**
 * Checks if a TCP port is in use.
 */
export function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

/**
 * Starts `next start -p 3000` and waits up to 60s for HTTP 200.
 */
export function startServerManaged(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const npxCmd = isWindows ? "npx.cmd" : "npx";

    const proc = spawn(npxCmd, ["next", "start", "-p", String(PORT)], {
      stdio: "pipe",
      shell: true,
    });

    const startTime = Date.now();
    const timeoutMs = 60000;

    const poll = () => {
      if (Date.now() - startTime > timeoutMs) {
        proc.kill("SIGTERM");
        return reject(new Error("SERVER NOT READY: Timed out waiting for 127.0.0.1:3000"));
      }

      http
        .get(BASE_URL, (res) => {
          if (res.statusCode === 200) {
            resolve(proc);
          } else {
            setTimeout(poll, 500);
          }
        })
        .on("error", () => {
          setTimeout(poll, 500);
        });
    };

    setTimeout(poll, 1000);
  });
}

/**
 * Safe execution harness wrapping server, browser, Prisma, and hard timeout guards.
 */
export async function withServer(
  testFn: (tools: { browser: Browser; createPage: (viewport?: { width: number; height: number }) => Promise<Page> }) => Promise<void>
): Promise<void> {
  let serverProc: ChildProcess | null = null;
  let browser: Browser | null = null;

  try {
    const portFree = await isPortFree(PORT);
    if (!portFree) {
      console.error(`Port ${PORT} is already in use. Please free port ${PORT} before running.`);
      throw new Error(`PORT ${PORT} IN USE`);
    }

    console.log(`[withServer] Starting Next.js managed server on port ${PORT}...`);
    serverProc = await startServerManaged();
    console.log(`[withServer] Server ready at ${BASE_URL}`);

    console.log(`[withServer] Launching Microsoft Edge via Playwright...`);
    browser = await chromium.launch({ channel: "msedge", headless: true });

    const createPage = async (viewport = { width: 360, height: 740 }) => {
      const context = await browser!.newContext({ viewport });
      const page = await context.newPage();
      page.setDefaultTimeout(60000);
      return page;
    };

    await testFn({ browser, createPage });
  } finally {
    console.log("[withServer] Cleanup: Closing browser, stopping server, disconnecting Prisma...");
    if (browser) {
      await browser.close().catch(() => {});
    }
    if (serverProc) {
      try {
        if (process.platform === "win32" && serverProc.pid) {
          spawn("taskkill", ["/pid", serverProc.pid.toString(), "/f", "/t"]);
        } else {
          serverProc.kill("SIGTERM");
        }
      } catch {}
    }
    await prisma.$disconnect().catch(() => {});
    console.log("[withServer] Done.");
  }
}
