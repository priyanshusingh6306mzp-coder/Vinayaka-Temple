import { z } from "zod";

export const galleryImageUpdateSchema = z.object({
  id: z.string().uuid("Invalid image ID"),
  caption: z.string().trim().max(200, "Caption cannot exceed 200 characters").optional().nullable(),
  eventId: z.string().uuid("Invalid event ID").optional().nullable().or(z.literal("")),
  featured: z.boolean().optional(),
});

export const galleryReorderSchema = z.object({
  imageId: z.string().uuid("Invalid image ID"),
  direction: z.enum(["up", "down"]),
  eventId: z.string().uuid("Invalid event ID").optional().nullable(),
});
