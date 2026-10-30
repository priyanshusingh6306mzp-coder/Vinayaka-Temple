import { db } from "@/lib/db";
import { Header } from "@/components/public/Header";
import { HeroSection } from "@/components/public/HeroSection";
import { AboutSection } from "@/components/public/AboutSection";
import { InfoGridSection } from "@/components/public/InfoGridSection";
import { GallerySection } from "@/components/public/GallerySection";
import { PoojaRequestForm } from "@/components/public/PoojaRequestForm";
import { Footer } from "@/components/public/Footer";
import { StickyCallBar } from "@/components/public/StickyCallBar";
import { JsonLd } from "@/components/public/JsonLd";

import { GalleryPhoto } from "@/components/public/LightboxModal";

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export default async function HomePage() {
  let initialPhotos: GalleryPhoto[] = [];
  try {
    initialPhotos = await db.galleryImage.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        imageUrl: true,
        title: true,
        caption: true,
      },
    });
  } catch (err) {
    console.error("[Gallery Fetch Error]", err);
  }

  return (
    <>
      <JsonLd />
      <Header />
      <main className="flex-1 bg-temple-ivory text-temple-charcoal">
        <HeroSection />
        <AboutSection />
        <InfoGridSection />
        <GallerySection initialPhotos={initialPhotos} />
        <PoojaRequestForm />
      </main>
      <Footer />
      <StickyCallBar />
    </>
  );
}
