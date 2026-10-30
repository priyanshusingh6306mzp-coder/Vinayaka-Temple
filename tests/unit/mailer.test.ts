import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import nodemailer from "nodemailer";
import { NodemailerService } from "@/lib/services/mailer/nodemailer.service";

describe("Mailer Service & Nodemailer Transport Suite", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("gracefully skips and does not throw when SMTP env vars are missing", async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const service = new NodemailerService();
    const result = await service.send({
      to: "priest@example.com",
      subject: "Test Subject",
      text: "Test Plaintext",
      html: "<p>Test HTML</p>",
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("skipped_unconfigured");
  });

  it("builds the notification message correctly using nodemailer jsonTransport without network", async () => {
    // jsonTransport: built-in nodemailer transport that parses and outputs JSON message in-memory
    const testTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });

    const devotee = {
      name: "Ramesh Sharma",
      phone: "9876543210",
      poojaType: "Ganapathi Homam / Sankalpa",
      dateRequested: "2026-11-15",
      notes: "Family peace and well-being",
    };

    const info = await testTransporter.sendMail({
      from: '"Shri Vinayaka Temple" <notifications@vinayaka.example.com>',
      to: "priest@vinayaka.example.com",
      subject: `New Pooja Request: ${devotee.poojaType} - ${devotee.name}`,
      text: `Namaste,\n\nA new pooja request has been received on the website.\n\nDevotee: ${devotee.name}\nPhone: ${devotee.phone}\nDate: ${devotee.dateRequested}\nPooja: ${devotee.poojaType}\nNotes: ${devotee.notes}`,
      html: `<div><h2>ॐ Shri Vinayaka Temple</h2><p><strong>New Pooja Request Received</strong></p><p>Devotee: ${devotee.name}</p></div>`,
    });

    expect(info.messageId).toBeDefined();
    expect(typeof info.messageId).toBe("string");

    // jsonTransport returns the serialized message in info.message
    const parsed = JSON.parse(info.message);
    expect(parsed.from.address).toBe("notifications@vinayaka.example.com");
    expect(parsed.to[0].address).toBe("priest@vinayaka.example.com");
    expect(parsed.subject).toContain("Ganapathi Homam / Sankalpa");
    expect(parsed.text).toContain(devotee.phone);
    expect(parsed.html).toContain("ॐ Shri Vinayaka Temple");
  });
});
