import { Header } from "@/components/public/Header";
import { PoojaRequestForm } from "@/components/public/PoojaRequestForm";
import { Footer } from "@/components/public/Footer";
import { StickyCallBar } from "@/components/public/StickyCallBar";

export const metadata = {
  title: "Request a Pooja | Shri Vinayaka Temple",
};

export default function PoojaPage() {
  return (
    <>
      <Header />
      {/* Added pt-20 to ensure it doesn't hide behind your fixed navbar */}
      <main className="flex-1 bg-temple-ivory text-temple-charcoal pt-20">
        <PoojaRequestForm />
      </main>
      <Footer />
      <StickyCallBar />
    </>
  );
}