import { describe, it, expect, vi } from "vitest";
import { POST as uploadSignaturePOST } from "@/app/api/admin/upload-signature/route";
import {
  GET as galleryGET,
  POST as galleryPOST,
  PUT as galleryPUT,
  DELETE as galleryDELETE,
} from "@/app/api/admin/gallery/route";

// Mock auth() to simulate how NextAuth handles unauthenticated / malformed requests
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockImplementation(async () => {
    // Under malformed Authorization headers with no valid session, auth() evaluates to null
    return null;
  }),
}));

describe("Auth Robustness Test Suite - Malformed Authorization Headers", () => {
  const malformedHeaders = [
    { name: "empty header", value: "" },
    { name: "single word Bearer", value: "Bearer" },
    { name: "Bearer with trailing space", value: "Bearer " },
    { name: "Bearer with invalid special chars", value: "Bearer !!!" },
    { name: "Bearer with malformed JWT tokens", value: "Bearer invalid.token.structure" },
    { name: "garbage string", value: "RandomGarbageNotBearer 12345" },
  ];

  for (const { name, value } of malformedHeaders) {
    describe(`Testing header: '${name}' ('${value}')`, () => {
      it("rejects /api/admin/upload-signature with 401 and never throws 500", async () => {
        const req = new Request("http://localhost:3000/api/admin/upload-signature", {
          method: "POST",
          headers: { Authorization: value },
        });

        const res = await uploadSignaturePOST();
        expect(res.status).toBe(401);
        expect(res.status).not.toBe(500);
        const body = await res.json();
        expect(body).toEqual({ error: "Unauthorized" });
      });

      it("rejects /api/admin/gallery GET with 401 and never grants access or 500", async () => {
        const res = await galleryGET();
        expect(res.status).toBe(401);
        expect(res.status).not.toBe(500);
        const body = await res.json();
        expect(body).toEqual({ error: "Unauthorized" });
      });

      it("rejects /api/admin/gallery POST with 401 and never throws 500", async () => {
        const req = new Request("http://localhost:3000/api/admin/gallery", {
          method: "POST",
          headers: { Authorization: value },
          body: JSON.stringify({
            imageUrl: "https://example.com/test.jpg",
            publicId: "temple/test",
            title: "Test Image",
          }),
        });

        const res = await galleryPOST(req);
        expect(res.status).toBe(401);
        expect(res.status).not.toBe(500);
        const body = await res.json();
        expect(body).toEqual({ error: "Unauthorized" });
      });

      it("rejects /api/admin/gallery PUT with 401 and never throws 500", async () => {
        const req = new Request("http://localhost:3000/api/admin/gallery", {
          method: "PUT",
          headers: { Authorization: value },
          body: JSON.stringify({
            id: "sample-id",
            title: "Test Title",
          }),
        });

        const res = await galleryPUT(req);
        expect(res.status).toBe(401);
        expect(res.status).not.toBe(500);
        const body = await res.json();
        expect(body).toEqual({ error: "Unauthorized" });
      });

      it("rejects /api/admin/gallery DELETE with 401 and never throws 500", async () => {
        const req = new Request("http://localhost:3000/api/admin/gallery?id=sample-id", {
          method: "DELETE",
          headers: { Authorization: value },
        });

        const res = await galleryDELETE(req);
        expect(res.status).toBe(401);
        expect(res.status).not.toBe(500);
        const body = await res.json();
        expect(body).toEqual({ error: "Unauthorized" });
      });
    });
  }
});
