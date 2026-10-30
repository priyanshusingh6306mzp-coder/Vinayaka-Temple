import { describe, it, expect, vi } from "vitest";
import { POST as uploadSignaturePOST } from "@/app/api/admin/upload-signature/route";
import { GET as galleryGET, POST as galleryPOST, DELETE as galleryDELETE } from "@/app/api/admin/gallery/route";

// Mock auth to return null (unauthenticated)
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

describe("Phase 5 Admin API Route Authentication Rejection", () => {
  it("rejects /api/admin/upload-signature POST without valid admin session (401)", async () => {
    const res = await uploadSignaturePOST();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("rejects /api/admin/gallery GET without valid admin session (401)", async () => {
    const res = await galleryGET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("rejects /api/admin/gallery POST without valid admin session (401)", async () => {
    const req = new Request("http://localhost:3000/api/admin/gallery", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://example.com/test.jpg",
        publicId: "temple/test",
        title: "Test Image",
      }),
    });
    const res = await galleryPOST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("rejects /api/admin/gallery DELETE without valid admin session (401)", async () => {
    const req = new Request("http://localhost:3000/api/admin/gallery?id=test-id", {
      method: "DELETE",
    });
    const res = await galleryDELETE(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });
});
