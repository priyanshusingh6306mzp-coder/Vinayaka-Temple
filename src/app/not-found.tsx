import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-temple-ivory text-temple-charcoal">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-temple-stoneBorder bg-white shadow-sm">
        <span className="text-4xl text-temple-gold select-none font-serif">ॐ</span>

        <div className="space-y-2">
          <h1 className="font-serif text-5xl font-bold text-temple-kumkum">404</h1>
          <h2 className="font-serif text-2xl font-bold text-temple-charcoal">
            Page Not Found
          </h2>
          <p className="text-sm text-temple-warmGrey leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2">
          <Button asChild variant="default" className="w-full h-12">
            <Link href="/" className="inline-flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Temple Homepage</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
