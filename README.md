# Shri Vinayaka Temple — Production Website & Priest Portal

> A production-grade, zero-budget informational website and mobile-first administrative portal for **Shri Vinayaka Temple** (located inside the campus of JSS University, C-20/1, C Block, Phase 2, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309). Built with Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma, Neon PostgreSQL, and Auth.js v5.

---

## 1. Project Overview & Architecture

- **Total Operational & Hosting Cost:** **₹0** (permanent free-tier services, zero credit card requirements).
- **Public Website:** Fast, static-first with ISR, accessible (WCAG AA compliant, 0 violations in axe-core), click-to-load Google Maps facade with 0 third-party cookies on initial load, high-contrast traditional Chola Dravidian aesthetic.
- **Admin Portal (`/admin`):** Mobile-first design for a non-technical temple priest on a phone. Features devotee pooja request management, one-tap Call (`tel:`) and WhatsApp (`wa.me`) integration, inline priest notes, photo gallery manager with client-side canvas compression, and forced password change.
- **Security:** Layered defense-in-depth: middleware route guards, per-handler session verification in all server actions and API routes, database-backed IP and email rate limiting, honeypot spam protection, CSP, and timing-attack mitigation.
- **Neon Database Cold Starts:** Neon's free-tier compute automatically suspends during idle periods to conserve free compute hours. Do not set up automated pingers or external cron jobs (such as UptimeRobot), as frequent pings consume free compute allowances and a daily ping does not prevent idle suspension. Note that the first request after quiet periods may experience a brief cold-start delay (3-5s) while the database awakens.

---

## 2. Environment Variables Reference

Copy `.env.example` to `.env` to configure your environment. **Never commit `.env` or print secret values.**

| Variable Name | Required | Provider / Scope | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | App / Vercel | Public canonical origin (e.g. `https://vinayaka-temple.vercel.app`) |
| `DATABASE_URL` | **Yes** | Neon PostgreSQL | Pooled connection string (`pgbouncer=true`, port 5432 / 6543) |
| `DIRECT_URL` | **Yes** | Neon PostgreSQL | Direct connection string for Prisma DDL migrations |
| `AUTH_SECRET` | **Yes** | Auth.js v5 | Secret key used to encrypt and sign JWT session tokens (32+ chars) |
| `AUTH_URL` | **Yes** | Auth.js v5 | Canonical authentication base URL (must match deployment URL) |
| `AUTH_TRUST_HOST` | **Yes** | Auth.js v5 | Set to `"true"` on Vercel to trust reverse-proxy `x-forwarded-host` |
| `ADMIN_EMAIL` | **Yes** | Local / Seed | Initial seed email address for the administrator |
| `ADMIN_INITIAL_PASSWORD` | **Yes** | Local / Seed | Initial seed password (must be changed upon first login) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary | Cloud name for signed client uploads and delivery |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary | API key for generating upload signatures and deletion |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary | API secret for generating upload signatures and deletion |
| `SMTP_HOST` | Optional | Gmail / SMTP | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | Optional | Gmail / SMTP | SMTP server port (`465` for SSL or `587` for TLS) |
| `SMTP_SECURE` | Optional | Gmail / SMTP | `"true"` for port 465, `"false"` for port 587 |
| `SMTP_USER` | Optional | Gmail / SMTP | Authenticated SMTP account email |
| `SMTP_PASS` | Optional | Gmail / SMTP | 16-character Google App Password |
| `SMTP_FROM_NAME` | Optional | Gmail / SMTP | Display name in outgoing email alerts |
| `NOTIFICATION_RECIPIENT_EMAIL` | Optional | Temple | Priest email to receive new pooja booking alerts |

| `NEXT_PUBLIC_MAPS_LINK` | Optional Override | Google Maps | Optional override for Google Maps app directions link (defaults to `site.ts`) |

---

## 3. Pre-Launch Checklist (Before Launch)

Before announcing or launching the public website, complete this essential verification checklist:

- [ ] **Temple Phone Number:** Replace the test phone number in `src/content/site.ts` (`displayPhone`, `telHref`, `whatsappNumber`, `whatsappLink`) with the temple's number.
- [ ] **Admin Account:** Replace the test admin account (`priest@vinayaka.example.com`) with the priest/admin's verified real email address in the database or via initial seed, and guide them through forced password change.

- [ ] **Pooja Offerings Confirmation:** Confirm the pooja list, suggested timings, and descriptions with the priest/client in `src/content/site.ts`.
- [ ] **Campus Entry Instructions:** Confirm visitor gate access protocol with JSS University administration and update `campusEntryInstructions` in `src/content/site.ts`.
- [ ] **Real Photography:** Upload genuine high-resolution photos of the sanctum sanctorum, black stone Ganesha idol, and temple via `/admin/gallery`.
- [ ] **Cloudinary Production Keys:** Add real Cloudinary production credentials (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) in Vercel environment variables.
- [ ] **Google Maps Verification:** Verify the live Google Maps directions link in `src/content/site.ts` (or override via `NEXT_PUBLIC_MAPS_LINK`).
- [ ] **Production Environment Variables:** Set `NEXT_PUBLIC_SITE_URL`, `AUTH_URL`, `AUTH_SECRET`, and `AUTH_TRUST_HOST="true"` on Vercel.

---

## 4. Step-by-Step Free-Tier Account Creation

### A. Neon Serverless PostgreSQL (Permanent Free Tier)
1. Visit [neon.tech](https://neon.tech) and sign up with GitHub or Google (no credit card required).
2. Create a project named `vinayaka-temple` in region **Asia Pacific (Singapore) - `ap-southeast-1`** for lowest latency to India.
3. In the Dashboard:
   - Copy the **Pooled connection string** and set it as `DATABASE_URL` in `.env`.
   - Toggle to **Direct connection string** and set it as `DIRECT_URL` in `.env`.

### B. Cloudinary Image Storage (Permanent Free Tier)
1. Sign up for a free account at [cloudinary.com](https://cloudinary.com) (no credit card required).
2. Go to the **Dashboard** and note:
   - **Cloud name** -> `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** -> `CLOUDINARY_API_KEY`
   - **API Secret** -> `CLOUDINARY_API_SECRET`
3. In Settings > Security, ensure "Signed uploads only" is enabled (default behavior).

### C. Gmail App Password for SMTP Notifications (Free Tier)
1. Log into your Google account (e.g., `temple.notifications@gmail.com`).
2. Go to **Google Account Settings > Security**.
3. Enable **2-Step Verification**.
4. Search for **App passwords**, create an app named `Vinayaka Website`, and copy the generated 16-character password into `SMTP_PASS` in `.env`.
5. Note: If SMTP is omitted, the website functions normally without error; pooja requests are saved directly to PostgreSQL for the priest to view in `/admin/requests`.

---

## 5. Local Setup, Migration & Seeding

```bash
# 1. Install dependencies (pinned versions)
npm install

# 2. Generate Prisma Client
npm run db:generate

# 3. Apply database migrations to Neon PostgreSQL
npm run db:deploy

# 4. Provision initial Admin user (reads ADMIN_EMAIL & ADMIN_INITIAL_PASSWORD from .env)
npm run db:seed

# 5. Start development server
npm run dev
```

---

## 6. Priest Onboarding & Admin Workflow

1. Navigate to `/admin/login` on desktop or mobile.
2. Enter the temporary admin email and password configured during seed.
3. **Forced First-Time Password Change:**
   - The priest will be automatically redirected to `/admin/change-password`.
   - The priest enters the temporary password followed by their new personal password (minimum 10 characters).
   - Once updated, `mustChangePassword` is set to `false`, and the priest is redirected to the `/admin/requests` dashboard.
4. **Managing Devotee Pooja Requests:**
   - On a phone, requests appear as clean cards with devotee name, phone number, requested date, and prayer notes.
   - Tap **Call** to launch a phone call (`tel:`).
   - Tap **WhatsApp** to launch WhatsApp pre-filled with a courteous greeting and the devotee's request details.
   - Tap **Confirm** once scheduled, **Complete** after the ritual is performed, or **Cancel** if necessary.
   - Tap **Add/Edit Notes** to record gotra, nakshatra, or specific timing details.
5. **Managing Gallery Photos:**
   - Navigate to `/admin/gallery`.
   - Tap **Upload Photos from Phone** to select one or multiple photos from the camera or photo library.
   - Photos are automatically resized and compressed client-side (max 1600px, ~250KB) before uploading to Cloudinary.
   - Use the **Up/Down arrows** to reorder images on the public homepage.
   - Tap **Delete** to permanently remove an image from both the database and cloud storage.

---

## 7. Single Source of Truth (`src/content/site.ts`)

All public facts, address details, timings, and content placeholders are centralized in [`src/content/site.ts`](src/content/site.ts). To modify temple information, update this single file:
- **Temple Name & Taglines:** `SITE_CONFIG.name`, `SITE_CONFIG.tagline`
- **Location & Address:** `SITE_CONFIG.location.fullAddress` ("Inside the campus of JSS University, C-20/1, C Block, Phase 2, Industrial Area, Sector 62, Noida, Uttar Pradesh 201309"), `SITE_CONFIG.location.campusEntryInstructions`
- **Timings:** `SITE_CONFIG.timings` (Morning & Evening sessions)
- **Contact & Phone:** `SITE_CONFIG.contact.displayPhone`, `SITE_CONFIG.contact.telHref`
- **Pooja Offerings:** `SITE_CONFIG.poojaTypes`

---

## 8. Deploying to Vercel (Production)

1. Push your repository to GitHub.
2. In [vercel.com](https://vercel.com), import the repository.
3. In **Project Settings > General**:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build` (runs `prisma generate && next build`)
4. In **Project Settings > Environment Variables**, add:
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://vinayaka-temple.vercel.app`)
   - `DATABASE_URL` (Pooled Neon connection string)
   - `DIRECT_URL` (Direct Neon connection string)
   - `AUTH_SECRET` (32+ character random string)
   - `AUTH_URL` (Matches `NEXT_PUBLIC_SITE_URL`)
   - `AUTH_TRUST_HOST` = `"true"` (Mandatory for Auth.js behind Vercel reverse proxy)
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_MAPS_LINK` (Optional Google Maps link override)
   - `SMTP_*` variables (optional)
5. **Vercel Region:** Vercel functions are configured for Singapore (`sin1`) in [`vercel.json`](vercel.json) to minimize round-trip latency to Neon DB (`ap-southeast-1`) and devotees across India.
6. Deploy. To run database migrations against production:
   ```bash
   npx prisma migrate deploy
   ```

---

## 9. Permanent Free-Tier Limits Reference

| Service | Free-Tier Allowance | Usage Strategy & Guardrails |
| :--- | :--- | :--- |
| **Vercel Hobby** | 100 GB bandwidth/mo, 100 edge middleware invocations/day | Next.js ISR (`revalidate: 60`), optimized SVG placeholders, click-to-load maps |
| **Neon PostgreSQL** | 0.5 GiB storage, 190 compute hours/mo | Auto-suspends after 5 min idle; small relational records (`PoojaRequest`, `User`) |
| **Cloudinary** | 25 credits/mo (~25,000 transformations or 25 GB storage) | Automatic client canvas compression (<1600px, ~250KB) before upload |
| **Gmail SMTP** | 500 emails/day | Non-blocking alert queue only triggered on verified devotee pooja bookings |

---

## 10. Upgrade Path (When Budget is Approved)

1. **Custom Domain (`vinayakatemple.org`):**
   - Cost: ~₹800/year.
   - Action: Add domain in Vercel Dashboard > Domains. Update `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` in environment variables. No code changes required.
2. **Transactional Email Service (Resend / SendGrid):**
   - What it fixes: Avoids Gmail personal rate limits and provides delivery analytics.
   - Action: Swap provider in `src/lib/services/mailer/` adhering to the `IMailerService` interface. Zero UI or controller code changes.
3. **Always-On Neon Database Compute:**
   - What it fixes: Eliminates the 3-5 second cold-start delay when Neon compute wakes up after idle periods.
   - Action: Upgrade to Neon Launch plan ($19/mo) and disable auto-suspend.
4. **AWS S3 / Cloudflare R2 Storage:**
   - What it fixes: Unlimited photo storage without Cloudinary credit thresholds.
   - Action: Implement `IStorageService` in `src/lib/services/storage/r2.service.ts`.

---

## 11. Known Advisories

The following package advisories are tracked and deferred until post-launch maintenance:
- **`zod` (`<4.6.6`):** Advisory regarding memory exhaustion on oversized constrained collections. Upgrading requires a breaking major release (`zod@4.x`), which is currently incompatible with `@hookform/resolvers@3.10.0`. Mitigated in application code by enforcing strict `.max()` constraints on all form fields (name max 100, phone max 10, notes max 500).
- **`postcss` (`<=8.5.22`):** Transitive dependency bundled with Next.js. Remediating requires upgrading to Next.js 16 (`next@16.x`), which introduces breaking framework changes.
- **Action:** Revisit and upgrade both dependencies in a dedicated post-launch maintenance cycle once ecosystem support stabilizes.
