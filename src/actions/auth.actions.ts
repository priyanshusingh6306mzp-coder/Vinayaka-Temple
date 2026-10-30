"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { changePasswordSchema } from "@/schemas/auth.schema";

export type ChangePasswordResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function changeInitialPassword(
  formData: FormData
): Promise<ChangePasswordResult> {
  const session = await auth();
  if (!session || !session.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted errors.",
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return {
      success: false,
      errors: {
        currentPassword: ["Current password is incorrect."],
      },
      message: "Invalid current password.",
    };
  }

  // Hash new password securely
  const saltRounds = 12;
  const newHash = await bcrypt.hash(newPassword, saltRounds);

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  });

  return {
    success: true,
    message: "Password changed successfully! You now have full admin access.",
  };
}
