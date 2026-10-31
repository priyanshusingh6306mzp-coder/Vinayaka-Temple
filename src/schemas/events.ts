import { z } from "zod";

export const EventCategoryEnum = z.enum([
  "SANKASHTI",
  "FESTIVAL",
  "SPECIAL_POOJA",
  "OTHER",
]);

export type EventCategoryType = z.infer<typeof EventCategoryEnum>;

export const EVENT_CATEGORY_LABELS: Record<EventCategoryType, string> = {
  SANKASHTI: "Sankashti Chaturthi",
  FESTIVAL: "Festival / Utsavam",
  SPECIAL_POOJA: "Special Pooja",
  OTHER: "Temple Event",
};

export const eventInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters"),
  category: EventCategoryEnum,
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format")
    .optional()
    .nullable()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  published: z.boolean().default(true),
});

export type EventInput = z.infer<typeof eventInputSchema>;
