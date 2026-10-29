import { describe, it, expect } from "vitest";
import { formatIndianPhone, cn } from "@/lib/utils";

describe("Utils", () => {
  it("formats 10-digit Indian phone correctly", () => {
    expect(formatIndianPhone("7982048559")).toBe("+91 79820 48559");
  });

  it("merges tailwind class names properly", () => {
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
  });
});
