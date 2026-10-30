import { z } from "zod";

export const poojaRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  poojaType: z
    .string()
    .trim()
    .min(1, "Please select a pooja type")
    .max(80, "Pooja type identifier too long"),
  dateRequested: z
    .string()
    .trim()
    .min(1, "Please select a preferred date")
    .refine((val) => {
      const selected = new Date(val);
      if (isNaN(selected.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, "Preferred date cannot be in the past"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  honeypot: z
    .string()
    .max(0, "Bot submission rejected")
    .optional()
    .or(z.literal("")),
  turnstileToken: z.string().optional(),
});

export type PoojaRequestInput = z.infer<typeof poojaRequestSchema>;

export type PoojaRequestFormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  rateLimited?: boolean;
};
