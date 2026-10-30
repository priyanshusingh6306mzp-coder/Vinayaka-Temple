"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { PoojaStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rateLimiter } from "@/lib/services/ratelimit/postgres.service";
import { mailerService } from "@/lib/services/mailer/nodemailer.service";
import { getClientIp } from "@/lib/ip";
import {
  poojaRequestSchema,
  PoojaRequestFormState,
} from "@/schemas/poojaRequest.schema";
import { SITE_CONFIG } from "@/content/site";

// Helper to strip HTML tags to prevent XSS in stored text
function sanitizeText(str?: string | null): string {
  if (!str) return "";
  return str.replace(/<[^>]*>?/gm, "").trim();
}

export async function submitPoojaRequest(
  _prevState: PoojaRequestFormState | null,
  formData: FormData
): Promise<PoojaRequestFormState> {
  const headerList = await headers();
  const clientIp = getClientIp(headerList);

  // 1. IP Rate Limiting (5 requests per hour)
  const rateLimitKey = `pooja:ip:${clientIp}`;
  const rateLimitResult = await rateLimiter.limit(
    rateLimitKey,
    5,
    60 * 60 * 1000 // 1 hour window
  );

  if (!rateLimitResult.success) {
    return {
      success: false,
      rateLimited: true,
      message:
        "Submission limit reached (maximum 5 requests per hour from this connection). If urgent, please call the temple directly at 079820 48559.",
    };
  }

  // 2. Honeypot check: silent discard to mislead bots without saving to DB
  const honeypotVal = formData.get("honeypot")?.toString()?.trim();
  if (honeypotVal && honeypotVal.length > 0) {
    return {
      success: true,
      message:
        "Dhanyawad. Your pooja request has been received. The temple priest will contact you to confirm details.",
    };
  }

  // 3. Extract and parse data
  const rawData = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    poojaType: formData.get("poojaType"),
    dateRequested: formData.get("dateRequested"),
    notes: formData.get("notes") || "",
    honeypot: "",
    turnstileToken: formData.get("turnstileToken") || "",
  };

  const parsed = poojaRequestSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please correct the highlighted errors.",
    };
  }

  const { name, phone, email, poojaType, dateRequested, notes, turnstileToken } =
    parsed.data;

  // 4. Optional Cloudflare Turnstile Verification (off by default)
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    try {
      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(
            turnstileToken || ""
          )}&remoteip=${encodeURIComponent(clientIp)}`,
        }
      );
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return {
          success: false,
          message: "Bot protection check failed. Please refresh and try again.",
        };
      }
    } catch (e) {
      console.error("[Turnstile Check Error]", e);
    }
  }

  // 5. Save to Database using Prisma
  const cleanName = sanitizeText(name);
  const cleanNotes = sanitizeText(notes);
  const cleanEmail = email ? sanitizeText(email) : null;
  const requestedDateObj = new Date(dateRequested);

  try {
    await db.poojaRequest.create({
      data: {
        name: cleanName,
        phone,
        email: cleanEmail,
        poojaType,
        dateRequested: requestedDateObj,
        notes: cleanNotes || null,
        status: PoojaStatus.PENDING,
      },
    });

    // 6. Non-blocking email alert to the priest via mailer interface
    const priestEmail =
      process.env.NOTIFICATION_RECIPIENT_EMAIL || SITE_CONFIG.contact.email;

    mailerService
      .send({
        to: priestEmail,
        subject: `New Pooja Request: ${cleanName} (${poojaType})`,
        text: `Namaste,\n\nA new pooja request has been received on the website.\n\nDevotee: ${cleanName}\nPhone: ${phone}\nDate: ${dateRequested}\nPooja: ${poojaType}\nNotes: ${cleanNotes || "None"}\n\nPlease review it in the Temple Admin Portal.`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #16130f;">
            <h2 style="color: #9b2d20; margin-bottom: 8px;">ॐ Shri Vinayaka Temple</h2>
            <p><strong>New Pooja Request Received</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Devotee Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${cleanName}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone Number:</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${phone}">${phone}</a></td></tr>
              ${cleanEmail ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${cleanEmail}</td></tr>` : ""}
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Pooja Type:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${poojaType}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Preferred Date:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${dateRequested}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Notes / Sankalpa:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${cleanNotes || "None"}</td></tr>
            </table>
            <p style="margin-top: 20px; font-size: 13px; color: #635e59;">
              This notification was generated automatically by the Shri Vinayaka Temple website.
            </p>
          </div>
        `,
      })
      .catch((err) => {
        console.error("[Mailer Non-Blocking Catch]", err);
      });

    try {
      revalidatePath("/admin/requests");
    } catch {
      // In tests or background threads, revalidatePath is safe to ignore
    }

    return {
      success: true,
      message:
        "Dhanyawad. Your pooja request has been received. The temple priest will contact you to confirm details.",
    };
  } catch (dbError) {
    console.error("[Pooja DB Error]", dbError);
    return {
      success: false,
      message:
        "An unexpected error occurred while saving your request. Please try again or call the temple directly.",
    };
  }
}

// Admin Action: Update status of a pooja request
export async function updatePoojaStatus(id: string, newStatus: PoojaStatus) {
  const session = await auth();
  if (!session || !session.user || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updated = await db.poojaRequest.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath("/admin/requests");
  return { success: true, updated };
}
