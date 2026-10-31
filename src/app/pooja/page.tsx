import { Metadata } from "next";
import { Header } from "@/components/public/Header";
import { PoojaRequestForm } from "@/components/public/PoojaRequestForm";
import { Footer } from "@/components/public/Footer";
import { StickyCallBar } from "@/components/public/StickyCallBar";

export const metadata: Metadata = {
  title: "Request a Sacred Pooja | Shri Vinayaka Temple",
  description:
    "Submit an online pooja request for Sankashti Ganapathi Homam, Sahasranama Archana, or Vahana Blessing at Shri Vinayaka Temple, Noida.",
};

export default function PoojaPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-temple-ivory text-temple-charcoal pt-4 sm:pt-8">
        <PoojaRequestForm isStandalonePage={true} />
      </main>
      <Footer />
      <StickyCallBar />
    </>
  );
}
