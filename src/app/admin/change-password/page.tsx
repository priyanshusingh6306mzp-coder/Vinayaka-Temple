"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { changeInitialPassword } from "@/actions/auth.actions";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { update } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await changeInitialPassword(formData);

    if (!result.success) {
      setError(result.message || "Failed to update password");
      setLoading(false);
      return;
    }

    setSuccess(result.message || "Password updated successfully!");
    // Refresh NextAuth JWT session to reflect mustChangePassword = false
    await update({ mustChangePassword: false });

    setTimeout(() => {
      router.push("/admin/requests");
      router.refresh();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-temple-ivory text-temple-charcoal">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-xl border border-temple-stoneBorder bg-white shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-temple-gold/15 flex items-center justify-center text-temple-gold">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Security Setup Required
          </h1>
          <p className="text-xs text-temple-warmGrey max-w-xs mx-auto">
            You must change your initial temporary password before accessing the administrative dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey">
              Current Temporary Password
            </label>
            <input
              name="currentPassword"
              type="password"
              required
              placeholder="••••••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-temple-stoneBorder text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey">
              New Password (Minimum 10 characters)
            </label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={10}
              placeholder="••••••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-temple-stoneBorder text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey">
              Confirm New Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={10}
              placeholder="••••••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-temple-stoneBorder text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !!success}
            className="w-full h-12 text-base font-semibold"
            variant="default"
          >
            {loading ? "Updating Security Credentials..." : "Update Password & Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
