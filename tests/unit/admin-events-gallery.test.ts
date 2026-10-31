import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { db } from "@/lib/db";
import {
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/actions/event.actions";
import {
  saveGalleryImage,
  updateGalleryImageDetails,
  toggleFeaturedImage,
  deleteGalleryImage,
  reorderGalleryImages,
  reorderFeaturedImages,
} from "@/actions/gallery.actions";
import {
  IStorageService,
  UploadSignature,
  DeleteImageResult,
} from "@/lib/interfaces/storage.interface";
import {
  setStorageService,
  getStorageService,
} from "@/lib/services/storage/cloudinary.service";

// In-Memory Fake Storage Service for deterministic testing without Cloudinary
class FakeStorageService implements IStorageService {
  public deletedPublicIds: string[] = [];

  async getUploadSignature(folder: string = "vinayaka_temple"): Promise<UploadSignature> {
    return {
      signature: "fake_sig_12345",
      timestamp: Math.round(Date.now() / 1000),
      apiKey: "fake_api_key",
      cloudName: "fake_cloud",
      folder,
    };
  }

  async deleteImage(publicId: string): Promise<DeleteImageResult> {
    this.deletedPublicIds.push(publicId);
    return { success: true };
  }

  getOptimizedUrl(publicId: string): string {
    return `https://fake.cdn/${publicId}`;
  }
}

// Variable to control mock session in tests
let mockAdminSession: any = null;

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(() => Promise.resolve(mockAdminSession)),
}));

describe("Admin Events & Gallery Upgraded Suite", () => {
  let fakeStorage: FakeStorageService;
  const originalStorage = getStorageService();

  beforeEach(() => {
    mockAdminSession = null;
    fakeStorage = new FakeStorageService();
    setStorageService(fakeStorage);
  });

  afterEach(() => {
    setStorageService(originalStorage);
  });

  describe("1. Authentication Protection (Mutations rejected without session)", () => {
    it("rejects createEvent without admin session", async () => {
      mockAdminSession = null;
      await expect(
        createEvent({
          title: "Test Sankashti",
          category: "SANKASHTI",
          eventDate: "2026-11-20",
          published: true,
        })
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects updateEvent without admin session", async () => {
      mockAdminSession = null;
      await expect(
        updateEvent("00000000-0000-0000-0000-000000000000", {
          title: "Test Sankashti",
          category: "SANKASHTI",
          eventDate: "2026-11-20",
          published: true,
        })
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects deleteEvent without admin session", async () => {
      mockAdminSession = null;
      await expect(
        deleteEvent("00000000-0000-0000-0000-000000000000", "keep_photos")
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects toggleFeaturedImage without admin session", async () => {
      mockAdminSession = null;
      await expect(
        toggleFeaturedImage("00000000-0000-0000-0000-000000000000", true)
      ).rejects.toThrow("Unauthorized");
    });

    it("rejects reorderFeaturedImages without admin session", async () => {
      mockAdminSession = null;
      await expect(
        reorderFeaturedImages([{ id: "00000000-0000-0000-0000-000000000000", featuredOrder: 1 }])
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("2. Server-side Input Validation", () => {
    beforeEach(() => {
      mockAdminSession = { user: { role: "ADMIN", email: "admin@vinayaka.example.com" } };
    });

    it("rejects invalid event title (too short)", async () => {
      const res = await createEvent({
        title: "A",
        category: "FESTIVAL",
        eventDate: "2026-11-20",
        published: true,
      });
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.title).toBeDefined();
    });

    it("rejects invalid category enum", async () => {
      const res = await createEvent({
        title: "Valid Festival",
        category: "INVALID_CAT" as any,
        eventDate: "2026-11-20",
        published: true,
      });
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.category).toBeDefined();
    });

    it("rejects invalid date format", async () => {
      const res = await createEvent({
        title: "Valid Festival",
        category: "FESTIVAL",
        eventDate: "20-11-2026", // Not YYYY-MM-DD
        published: true,
      });
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.eventDate).toBeDefined();
    });

    it("rejects description exceeding 500 characters", async () => {
      const res = await createEvent({
        title: "Valid Festival",
        category: "FESTIVAL",
        eventDate: "2026-11-20",
        description: "A".repeat(501),
        published: true,
      });
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.description).toBeDefined();
    });
  });

  describe("3. Feature Limiting, Event Lifecycle & Photo Management", () => {
    const createdEventIds: string[] = [];
    const createdImageIds: string[] = [];

    beforeEach(() => {
      mockAdminSession = { user: { role: "ADMIN", email: "admin@vinayaka.example.com" } };
    });

    afterEach(async () => {
      // Clean up test data
      if (createdImageIds.length > 0) {
        await db.galleryImage.deleteMany({ where: { id: { in: createdImageIds } } });
        createdImageIds.length = 0;
      }
      if (createdEventIds.length > 0) {
        await db.templeEvent.deleteMany({ where: { id: { in: createdEventIds } } });
        createdEventIds.length = 0;
      }
    });

    it("rejects a 5th featured image and enforces maximum 4 in transaction", async () => {
      // Create 5 temporary images
      const images: any[] = [];
      for (let i = 1; i <= 5; i++) {
        const img = await db.galleryImage.create({
          data: {
            imageUrl: `https://fake.cdn/photo_${i}.webp`,
            publicId: `test_img_${Date.now()}_${i}`,
            title: `Featured Test Image ${i}`,
            sortOrder: i,
            featured: false,
          },
        });
        createdImageIds.push(img.id);
        images.push(img);
      }

      // Feature the first 4 images
      for (let i = 0; i < 4; i++) {
        const res = await toggleFeaturedImage(images[i].id, true);
        expect(res.success).toBe(true);
        expect(res.updated?.featured).toBe(true);
      }

      // The 5th image must be rejected
      await expect(toggleFeaturedImage(images[4].id, true)).rejects.toThrow(
        "Maximum of 4 featured images allowed on the homepage"
      );

      // Unfeature 1 image, then 5th image should succeed
      await toggleFeaturedImage(images[0].id, false);
      const res5 = await toggleFeaturedImage(images[4].id, true);
      expect(res5.success).toBe(true);
      expect(res5.updated?.featured).toBe(true);
    });

    it("deletes event with Option 1 (keep_photos): keeps photos and clears eventId", async () => {
      // Create test event
      const evRes = await createEvent({
        title: "Event Option 1 Test",
        category: "SPECIAL_POOJA",
        eventDate: "2026-12-01",
        published: true,
      });
      const eventId = evRes.event!.id;
      createdEventIds.push(eventId);

      // Create test photo attached to this event
      const img = await db.galleryImage.create({
        data: {
          imageUrl: "https://fake.cdn/event1_photo.webp",
          publicId: `test_keep_${Date.now()}`,
          title: "Keep Photo Test",
          sortOrder: 0,
          eventId,
        },
      });
      createdImageIds.push(img.id);

      // Delete event with Option 1: "keep_photos"
      const delRes = await deleteEvent(eventId, "keep_photos");
      expect(delRes.success).toBe(true);
      expect(delRes.option).toBe("keep_photos");

      // Verify event is deleted from database
      const checkEv = await db.templeEvent.findUnique({ where: { id: eventId } });
      expect(checkEv).toBeNull();

      // Verify photo still exists with eventId = null
      const checkImg = await db.galleryImage.findUnique({ where: { id: img.id } });
      expect(checkImg).not.toBeNull();
      expect(checkImg?.eventId).toBeNull();

      // Verify storage service deleteImage was NOT called
      expect(fakeStorage.deletedPublicIds).not.toContain(img.publicId);
    });

    it("deletes event with Option 2 (delete_photos): deletes photos and removes storage assets", async () => {
      // Create test event
      const evRes = await createEvent({
        title: "Event Option 2 Test",
        category: "FESTIVAL",
        eventDate: "2026-12-05",
        published: true,
      });
      const eventId = evRes.event!.id;
      createdEventIds.push(eventId);

      // Create test photo attached to this event
      const publicId = `test_delete_${Date.now()}`;
      const img = await db.galleryImage.create({
        data: {
          imageUrl: "https://fake.cdn/event2_photo.webp",
          publicId,
          title: "Delete Photo Test",
          sortOrder: 0,
          eventId,
        },
      });

      // Delete event with Option 2: "delete_photos"
      const delRes = await deleteEvent(eventId, "delete_photos");
      expect(delRes.success).toBe(true);
      expect(delRes.option).toBe("delete_photos");

      // Verify event is deleted
      const checkEv = await db.templeEvent.findUnique({ where: { id: eventId } });
      expect(checkEv).toBeNull();

      // Verify photo row is deleted from database
      const checkImg = await db.galleryImage.findUnique({ where: { id: img.id } });
      expect(checkImg).toBeNull();

      // Verify storage service deleteImage WAS called
      expect(fakeStorage.deletedPublicIds).toContain(publicId);
    });

    it("moves a photo between events and to 'other photographs'", async () => {
      // Create Event A
      const evA = await createEvent({
        title: "Event A",
        category: "SPECIAL_POOJA",
        eventDate: "2026-12-10",
        published: true,
      });
      createdEventIds.push(evA.event!.id);

      // Create Event B
      const evB = await createEvent({
        title: "Event B",
        category: "FESTIVAL",
        eventDate: "2026-12-15",
        published: true,
      });
      createdEventIds.push(evB.event!.id);

      // Create photo in Event A
      const img = await db.galleryImage.create({
        data: {
          imageUrl: "https://fake.cdn/moving_photo.webp",
          publicId: `test_move_${Date.now()}`,
          title: "Moving Photo",
          eventId: evA.event!.id,
        },
      });
      createdImageIds.push(img.id);

      // Move photo from Event A to Event B
      const moveRes = await updateGalleryImageDetails({
        id: img.id,
        eventId: evB.event!.id,
      });
      expect(moveRes.success).toBe(true);
      expect(moveRes.updated?.eventId).toBe(evB.event!.id);

      // Move photo to 'other photographs' (null eventId)
      const moveOtherRes = await updateGalleryImageDetails({
        id: img.id,
        eventId: null,
      });
      expect(moveOtherRes.success).toBe(true);
      expect(moveOtherRes.updated?.eventId).toBeNull();
    });
  });
});
