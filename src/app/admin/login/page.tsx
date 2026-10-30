"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/requests";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res || res.error) {
        if (res?.error?.includes("Too many")) {
          setError("Too many failed attempts. Please try again in 15 minutes.");
        } else {
          setError("Invalid email or password. Please try again.");
        }
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 rounded-xl border border-temple-stoneBorder bg-white shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <span className="text-3xl text-temple-gold select-none">ॐ</span>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Temple Admin Portal
        </h1>
        <p className="text-xs text-temple-warmGrey">
          Sign in to manage pooja requests and photo gallery
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-temple-warmGrey" />
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priest@example.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-temple-stoneBorder text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-temple-warmGrey" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-temple-stoneBorder text-sm focus:outline-none focus:ring-2 focus:ring-temple-gold"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold"
          variant="default"
        >
          {loading ? "Authenticating..." : "Sign In to Portal"}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-temple-warmGrey">
        <Link href="/" className="hover:underline">
          ← Return to Temple Public Website
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-temple-ivory text-temple-charcoal">
      <Suspense fallback={<div className="p-8 text-center text-sm text-temple-warmGrey">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
