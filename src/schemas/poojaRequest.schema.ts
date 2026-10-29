import { z } from "zod";

export const poojaRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  poojaType: z.string().min(1, "Please select a pooja type"),
  dateRequested: z.string().min(1, "Please select a preferred date"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  honeypot: z.string().max(0, "Bot detected").optional(),
});

export type PoojaRequestInput = z.infer<typeof poojaRequestSchema>;
