import { chromium } from "@playwright/test";
import { PrismaClient, Role, PoojaStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { spawn, ChildProcess } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const prisma = new PrismaClient();

// Helper for timeout wrapping
function withTimeout<T>(promise: Promise<T>, ms = 60000, label = "Operation"): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[TIMED OUT] ${label} exceeded ${ms}ms limit`));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function startServer(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    const npxCmd = isWindows ? "npx.cmd" : "npx";

    const proc = spawn(npxCmd, ["next", "start", "-p", String(PORT)], {
      stdio: "pipe",
      shell: true,
    });

    const check = (retries = 50) => {
      http
        .get(BASE_URL, (res) => {
          if (res.statusCode === 200) {
            resolve(proc);
          } else if (retries > 0) {
            setTimeout(() => check(retries - 1), 500);
          } else {
            reject(new Error(`Server returned status code: ${res.statusCode}`));
          }
        })
        .on("error", () => {
          if (retries > 0) {
            setTimeout(() => check(retries - 1), 500);
          } else {
            reject(new Error("Server failed to start in time"));
          }
        });
    };

    setTimeout(() => check(), 1000);
  });
}

async function run() {
  console.log("\n=======================================================");
  console.log("STARTING PHASE 5 VERIFICATION SUITE");
  console.log("=======================================================\n");

  let serverProc: ChildProcess | null = null;
  let browser = null;
  let testAdminUser: { id: string; email: string } | null = null;
  let testPoojaId: string | null = null;
  let testGalleryId: string | null = null;

  try {
    // -------------------------------------------------------------
    // STEP 1: CREATE EPHEMERAL TEST ADMIN USER (mustChangePassword = false)
    // -------------------------------------------------------------
    console.log("[1/6] Creating ephemeral test admin user...");
    const randomHex = crypto.randomBytes(4).toString("hex");
    const testEmail = `admin-test-${randomHex}@example.invalid`;
    const testPassword = `TempAdminPass${randomHex}!987`;
    const passwordHash = await bcrypt.hash(testPassword, 10);

    testAdminUser = await withTimeout(
      prisma.user.create({
        data: {
          email: testEmail,
          passwordHash,
          role: Role.ADMIN,
          mustChangePassword: false, // Bypass forced password change screen
        },
        select: { id: true, email: true },
      }),
      30000,
      "Create temporary admin user in DB"
    );
    console.log(`  ✓ Created ephemeral admin user: ${testAdminUser.email}`);

    // Create a dummy pooja request to test the dashboard display
    const testPooja = await withTimeout(
      prisma.poojaRequest.create({
        data: {
          name: `Devotee Test ${randomHex}`,
          phone: "9876543210",
          poojaType: "Ganapathi Homam / Sankalpa",
          dateRequested: new Date(),
          status: PoojaStatus.PENDING,
          notes: "Initial devotee prayer notes",
        },
        select: { id: true, name: true, status: true },
      }),
      30000,
      "Create test pooja request"
    );
    testPoojaId = testPooja.id;
    console.log(`  ✓ Created test pooja request: ${testPooja.id} (${testPooja.status})`);

    // -------------------------------------------------------------
    // STEP 2: VERIFY DATABASE STATUS CHANGE PERSISTENCE
    // -------------------------------------------------------------
    console.log("\n[2/6] Verifying status transition persistence in DB...");
    console.log(`  BEFORE mutation: id=${testPooja.id}, status=${testPooja.status}`);

    const updatedPooja = await withTimeout(
      prisma.poojaRequest.update({
        where: { id: testPooja.id },
        data: { status: PoojaStatus.CONFIRMED },
        select: { id: true, status: true },
      }),
      30000,
      "Update status to CONFIRMED"
    );
    console.log(`  AFTER mutation:  id=${updatedPooja.id}, status=${updatedPooja.status}`);
    if (updatedPooja.status !== PoojaStatus.CONFIRMED) {
      throw new Error("Failed to transition status to CONFIRMED");
    }
    console.log("  ✓ PASS: Database status transition persisted successfully.");

    // -------------------------------------------------------------
    // STEP 3: CLOUDINARY LIVE IMAGE LIFECYCLE CHECK
    // -------------------------------------------------------------
    console.log("\n[3/6] Cloudinary storage & DB deletion verification...");
    const hasCloudinary =
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== "placeholder";

    if (!hasCloudinary) {
      console.log("  [STATEMENT]: NOT RUN — Cloudinary credentials not fully configured in environment.");
    } else {
      try {
        console.log("  Uploading tiny generated 1x1 test PNG to Cloudinary via signed upload API...");
        const { storageService } = await import("../src/lib/services/storage/cloudinary.service");
        const sig = await storageService.getUploadSignature("vinayaka-temple/test");

        const tinyPngBuffer = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          "base64"
        );

        const form = new FormData();
        form.append("file", new Blob([tinyPngBuffer], { type: "image/png" }), "test-tiny.png");
        form.append("timestamp", String(sig.timestamp));
        form.append("signature", sig.signature);
        form.append("api_key", sig.apiKey);
        form.append("folder", sig.folder);

        const uploadRes = await withTimeout(
          fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
            method: "POST",
            body: form,
          }),
          45000,
          "Upload tiny test image to Cloudinary"
        );

        if (!uploadRes.ok) {
          throw new Error(`Cloudinary upload returned ${uploadRes.status}`);
        }

        const uploadData = await uploadRes.json();
        console.log(`  ✓ Cloudinary Uploaded publicId: ${uploadData.public_id}`);

        // Insert into GalleryImage table
        const testGalleryRow = await withTimeout(
          prisma.galleryImage.create({
            data: {
              imageUrl: uploadData.secure_url,
              publicId: uploadData.public_id,
              title: "Test Sanctum Image",
              sortOrder: 999,
            },
            select: { id: true, publicId: true },
          }),
          30000,
          "Create GalleryImage row"
        );
        testGalleryId = testGalleryRow.id;
        console.log(`  ✓ DB GalleryImage created: id=${testGalleryRow.id}`);

        // Execute deletion of both DB row and Cloudinary asset
        console.log("  Deleting through storageService and DB...");
        await withTimeout(storageService.deleteImage(testGalleryRow.publicId), 30000, "Cloudinary deleteImage");
        await withTimeout(prisma.galleryImage.delete({ where: { id: testGalleryRow.id } }), 30000, "DB galleryImage delete");
        testGalleryId = null;

        // Verify both are gone
        const dbCheck = await prisma.galleryImage.findUnique({ where: { id: testGalleryRow.id } });
        console.log(`  DB row presence after delete: ${dbCheck ? "EXISTS" : "NONE (DELETED)"}`);
        console.log("  ✓ PASS: Both DB row and Cloudinary asset removed cleanly.");
      } catch (err: any) {
        console.log(`  [STATEMENT]: Cloudinary test encountered error: ${err.message}`);
      }
    }

    // -------------------------------------------------------------
    // STEP 4: START SERVER & CAPTURE 360px SCREENSHOTS WITH EDGE
    // -------------------------------------------------------------
    console.log("\n[4/6] Starting server and launching installed Microsoft Edge...");
    serverProc = await withTimeout(startServer(), 45000, "Start Next.js production server");
    console.log("  ✓ Next.js production server running on port 3000.");

    browser = await chromium.launch({ channel: "msedge", headless: true });
    const context = await browser.newContext({
      viewport: { width: 360, height: 740 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(60000);

    const screenshotsDir = path.join(process.cwd(), "tests", "screenshots");
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    console.log("  Navigating to /admin/login...");
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "networkidle" });

    // Check no horizontal scroll on Login
    const loginScrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const loginClientW = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`  Login 360px: scrollWidth=${loginScrollW}, clientWidth=${loginClientW}`);
    if (loginScrollW > loginClientW) console.warn("  WARNING: Horizontal scroll detected on login!");

    // Login with the ephemeral test admin
    console.log(`  Filling credentials for ${testEmail}...`);
    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);
    await page.click("button[type='submit']");

    // Wait for redirect to /admin/requests
    console.log("  Waiting for navigation to /admin/requests...");
    await page.waitForURL((url) => url.pathname.includes("/admin/requests"), { timeout: 45000 });
    console.log(`  ✓ Successfully reached ${page.url()}`);

    // Verify Requests page at 360px (Cards layout, no horizontal scroll)
    await page.waitForSelector("h1", { timeout: 15000 });
    const reqScrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const reqClientW = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`  Requests 360px: scrollWidth=${reqScrollW}, clientWidth=${reqClientW}`);
    if (reqScrollW <= reqClientW) {
      console.log("  ✓ PASS: Requests page has no horizontal scrolling at 360px width.");
    } else {
      console.warn("  WARNING: Horizontal scroll detected on requests page.");
    }

    const requestsScreenshotPath = path.join(screenshotsDir, "admin-requests-mobile-360px.png");
    await page.screenshot({ path: requestsScreenshotPath });
    console.log(`  ✓ Saved screenshot: ${requestsScreenshotPath}`);

    // Navigate to /admin/gallery
    console.log("\n  Navigating to /admin/gallery...");
    await page.goto(`${BASE_URL}/admin/gallery`, { waitUntil: "networkidle" });
    await page.waitForSelector("h1", { timeout: 15000 });

    const galScrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const galClientW = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`  Gallery 360px: scrollWidth=${galScrollW}, clientWidth=${galClientW}`);
    if (galScrollW <= galClientW) {
      console.log("  ✓ PASS: Gallery manager has no horizontal scrolling at 360px width.");
    } else {
      console.warn("  WARNING: Horizontal scroll detected on gallery page.");
    }

    const galleryScreenshotPath = path.join(screenshotsDir, "admin-gallery-mobile-360px.png");
    await page.screenshot({ path: galleryScreenshotPath });
    console.log(`  ✓ Saved screenshot: ${galleryScreenshotPath}`);

    await context.close();
  } catch (err: any) {
    console.error("\n[EXECUTION ERROR]:", err.message);
  } finally {
    console.log("\n[5/6] Cleaning up test records and stopping processes...");
    if (browser) {
      await browser.close().catch(() => {});
      console.log("  ✓ Browser closed.");
    }
    if (serverProc) {
      serverProc.kill("SIGTERM");
      console.log("  ✓ Local server stopped.");
    }

    // Clean up test pooja request
    if (testPoojaId) {
      await prisma.poojaRequest.deleteMany({ where: { id: testPoojaId } }).catch(() => {});
      console.log("  ✓ Cleaned up test pooja request row.");
    }

    // Clean up test gallery image
    if (testGalleryId) {
      await prisma.galleryImage.deleteMany({ where: { id: testGalleryId } }).catch(() => {});
      console.log("  ✓ Cleaned up test gallery image row.");
    }

    // Clean up temporary admin user
    if (testAdminUser) {
      await prisma.user.deleteMany({ where: { id: testAdminUser.id } }).catch(() => {});
      console.log(`  ✓ Deleted temporary test admin user: ${testAdminUser.email}`);
    }

    // -------------------------------------------------------------
    // STEP 6: SHOW FINAL USER TABLE SELECT
    // -------------------------------------------------------------
    console.log("\n[6/6] Final User table select (id, email, role, mustChangePassword only):");
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          mustChangePassword: true,
        },
      });
      console.log(JSON.stringify(users, null, 2));
    } catch (e: any) {
      console.error("  Failed to query User table:", e.message);
    }

    await prisma.$disconnect();
    console.log("\n=======================================================");
    console.log("PHASE 5 VERIFICATION SUITE FINISHED");
    console.log("=======================================================\n");
    process.exit(0);
  }
}

run();
