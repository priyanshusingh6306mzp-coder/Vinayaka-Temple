"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Temple Application Error]", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-temple-ivory text-temple-charcoal">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-temple-stoneBorder bg-white shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-temple-charcoal">
            Something went wrong
          </h1>
          <p className="text-sm text-temple-warmGrey leading-relaxed">
            An unexpected error occurred while loading this page. Please try refreshing or contact the temple.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Button
            onClick={() => reset()}
            variant="default"
            className="w-full h-12 inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>

          <a
            href="tel:+917982048559"
            className="flex items-center justify-center gap-2 text-xs font-semibold text-temple-warmGrey hover:text-temple-charcoal py-2"
          >
            <Phone className="w-3.5 h-3.5 text-temple-kumkum" />
            <span>Call Temple: 079820 48559</span>
          </a>

          <div>
            <Link href="/" className="text-xs text-temple-gold underline">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
