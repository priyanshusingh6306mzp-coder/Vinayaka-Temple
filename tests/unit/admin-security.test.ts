import { describe, it, expect, vi } from "vitest";
import { updatePoojaStatus, updatePoojaNotes } from "@/actions/pooja.actions";
import {
  saveGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
  updateGalleryImageDetails,
} from "@/actions/gallery.actions";

// Mock auth to return null (unauthenticated)
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

describe("Phase 5 Admin Defense-in-Depth Session Protection", () => {
  it("rejects updatePoojaStatus without valid admin session", async () => {
    await expect(
      updatePoojaStatus("00000000-0000-0000-0000-000000000000", "CONFIRMED")
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects updatePoojaNotes without valid admin session", async () => {
    await expect(
      updatePoojaNotes("00000000-0000-0000-0000-000000000000", "Priest note test")
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects saveGalleryImage without valid admin session", async () => {
    await expect(
      saveGalleryImage({
        imageUrl: "https://example.com/test.jpg",
        publicId: "temple/test",
        title: "Test Sanctum Photo",
        sortOrder: 0,
      })
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects deleteGalleryImage without valid admin session", async () => {
    await expect(
      deleteGalleryImage("00000000-0000-0000-0000-000000000000")
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects reorderGalleryImages without valid admin session", async () => {
    await expect(
      reorderGalleryImages([{ id: "00000000-0000-0000-0000-000000000000", sortOrder: 1 }])
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects updateGalleryImageDetails without valid admin session", async () => {
    await expect(
      updateGalleryImageDetails({
        id: "00000000-0000-0000-0000-000000000000",
        title: "New Title",
      })
    ).rejects.toThrow("Unauthorized");
  });
});
