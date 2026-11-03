import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDevoteePhone } from "@/lib/phone";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndianPhone(phone: string): string {
  return formatDevoteePhone(phone);
}
